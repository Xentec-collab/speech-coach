import uuid
import asyncio
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, BackgroundTasks
from app.services.supabase import get_current_user, supabase
from app.services.gemini import transcribe_audio_bytes, evaluate_speech_session
from app.core.config import settings

router = APIRouter()

MAX_FILE_SIZE_BYTES = 30 * 1024 * 1024  # 30 MB
MIN_DURATION_SECONDS = 10
MAX_DURATION_SECONDS = 300  # 5 minutes
MAX_RETRIES = 3


async def run_speech_processing_pipeline(speech_id: str):
    """
    Isolated, reusable processing pipeline. Can easily be decorated/tasked
    by Celery or Dramatiq in the future.
    """
    try:
        # 1. Fetch speech record
        res = supabase.table("speeches").select("*").eq("id", speech_id).execute()
        if not res.data:
            return  # Speech row deleted, abort
        speech = res.data[0]
        storage_path = speech["storage_path"]
        mime_type = speech["mime_type"]
        topic_id = speech["topic_id"]

        # 2. Fetch topic prompt if associated
        topic_title = "Impromptu Speech"
        topic_prompt = "Speak on any impromptu theme of your choice."
        topic_category = "impromptu"
        topic_module_type = "public_speaking"
        topic_interview_type = None
        topic_interview_persona = "friendly"
        topic_evaluation_criteria = None
        if topic_id:
            topic_res = supabase.table("topics").select("title", "prompt", "category", "module_type", "interview_type", "interview_persona", "evaluation_criteria").eq("id", topic_id).execute()
            if topic_res.data:
                topic_title = topic_res.data[0]["title"]
                topic_prompt = topic_res.data[0]["prompt"]
                topic_category = topic_res.data[0].get("category", "impromptu")
                topic_module_type = topic_res.data[0].get("module_type", "public_speaking")
                topic_interview_type = topic_res.data[0].get("interview_type")
                topic_interview_persona = topic_res.data[0].get("interview_persona", "friendly")
                topic_evaluation_criteria = topic_res.data[0].get("evaluation_criteria")

        # 3. Update status to 'transcribing'
        supabase.table("speeches").update({"status": "transcribing"}).eq("id", speech_id).execute()

        # 4. Download file from private storage
        try:
            file_bytes = supabase.storage.from_("speeches").download(storage_path)
        except Exception as e:
            raise RuntimeError(f"Storage download failed: {str(e)}")

        # 5. Transcribe using Gemini
        transcript = transcribe_audio_bytes(file_bytes, mime_type)
        if not transcript:
            raise RuntimeError("Gemini failed to return any transcription.")

        # 6. Update transcript and transition status to 'analyzing'
        supabase.table("speeches").update({
            "transcript": transcript,
            "status": "analyzing"
        }).eq("id", speech_id).execute()

        # 7. Evaluate using Gemini (0-100 scale)
        eval_result = evaluate_speech_session(
            transcript=transcript,
            topic_title=topic_title,
            topic_prompt=topic_prompt,
            category=topic_category,
            module_type=topic_module_type,
            interview_type=topic_interview_type,
            interview_persona=topic_interview_persona,
            evaluation_criteria=topic_evaluation_criteria
        )

        # 8. Save scores and feedback, set status to 'completed'
        update_payload = {
            "overall_score": eval_result.overall_score,
            "pronunciation_score": eval_result.pronunciation_score,
            "fluency_score": eval_result.fluency_score,
            "grammar_score": eval_result.grammar_score,
            "content_score": eval_result.content_score,
            "feedback": {
                "written_feedback": eval_result.written_feedback,
                "lexicon_suggestions": [s.model_dump() for s in eval_result.lexicon_suggestions],
                "counter_argument": eval_result.counter_argument,
                "challenge_questions": eval_result.challenge_questions,
                "interview_metrics": eval_result.interview_metrics.model_dump() if eval_result.interview_metrics else None,
                "follow_up_question": eval_result.follow_up_question
            },
            "status": "completed"
        }
        try:
            supabase.table("speeches").update({
                **update_payload,
                "lexicon_score": eval_result.lexicon_score
            }).eq("id", speech_id).execute()
        except Exception as db_err:
            if "column" in str(db_err).lower() and "lexicon_score" in str(db_err).lower():
                update_payload["feedback"]["lexicon_score"] = eval_result.lexicon_score
                supabase.table("speeches").update(update_payload).eq("id", speech_id).execute()
            else:
                raise db_err

        # Trigger AI Coach Snapshot generation/regeneration
        try:
            from app.routes.ai_coach import generate_and_save_coach_snapshot
            await generate_and_save_coach_snapshot(speech["user_id"])
        except Exception as snap_err:
            print(f"Error updating coach snapshot on speech completion: {snap_err}")

        # 9. Clean up / delete temporary audio file from private storage
        try:
            supabase.storage.from_("speeches").remove([storage_path])
        except Exception:
            pass  # Non-blocking if delete fails, database record is completed

    except Exception as err:
        # Retrieve retry details
        try:
            res = supabase.table("speeches").select("retry_count").eq("id", speech_id).execute()
            current_retry = res.data[0]["retry_count"] if res.data else 0
        except Exception:
            current_retry = 0

        new_retry = current_retry + 1

        if new_retry < MAX_RETRIES:
            try:
                supabase.table("speeches").update({"retry_count": new_retry}).eq("id", speech_id).execute()
            except Exception:
                pass
            # Wait and retry with backoff (e.g. 5 seconds * retry count)
            await asyncio.sleep(5 * new_retry)
            await run_speech_processing_pipeline(speech_id)
        else:
            # Mark speech status as failed
            try:
                supabase.table("speeches").update({"status": "failed"}).eq("id", speech_id).execute()
            except Exception:
                pass


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_speech(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    topic_id: str = Form(...),
    duration_seconds: int = Form(...),
    current_user: dict = Depends(get_current_user),
):
    """
    Validates speech file constraints (size and duration), verifies the presence 
    of the private 'speeches' bucket, uploads the audio file, registers a 
    new speech record in the database, and schedules background evaluation.
    """
    # 1. Validate Duration
    if duration_seconds < MIN_DURATION_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Speech duration must be at least {MIN_DURATION_SECONDS} seconds.",
        )
    if duration_seconds > MAX_DURATION_SECONDS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Speech duration cannot exceed {MAX_DURATION_SECONDS // 60} minutes.",
        )

    # 2. Validate File Size
    file_bytes = await file.read()
    file_size = len(file_bytes)
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Audio file size exceeds the maximum limit of {MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.",
        )

    # 3. Verify Supabase Storage Bucket presence
    try:
        supabase.storage.get_bucket("speeches")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Supabase Storage bucket 'speeches' is missing or unconfigured. Please create a private bucket named 'speeches' in your Supabase console.",
        )

    # 4. Generate unique ID and upload path
    speech_id = str(uuid.uuid4())
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "webm"
    storage_path = f"{current_user['id']}/{speech_id}.{file_extension}"

    # 5. Upload file to private storage
    try:
        supabase.storage.from_("speeches").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file.content_type},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload audio file to Supabase Storage: {str(e)}",
        )

    # 6. Insert record into PostgreSQL database with default score fields and retry_count
    try:
        db_data = {
            "id": speech_id,
            "user_id": current_user["id"],
            "topic_id": topic_id if topic_id and topic_id != "null" else None,
            "storage_path": storage_path,
            "original_filename": file.filename,
            "mime_type": file.content_type or "audio/webm",
            "duration_seconds": duration_seconds,
            "status": "uploaded",
            "retry_count": 0,
        }
        
        response = supabase.table("speeches").insert(db_data).execute()
        
        if not response.data:
            # Cleanup storage if db insert fails to avoid dangling files
            try:
                supabase.storage.from_("speeches").remove([storage_path])
            except Exception:
                pass
            raise Exception("Empty database insert response data")
            
        # 7. Start the asynchronous background worker pipeline
        background_tasks.add_task(run_speech_processing_pipeline, speech_id)

        return response.data[0]
    except Exception as e:
        # Cleanup storage if db insert fails to avoid dangling files
        try:
            supabase.storage.from_("speeches").remove([storage_path])
        except Exception:
            pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to persist speech session record: {str(e)}",
        )


def get_display_name(interview_type: str) -> str:
    display_names = {
        "cat_gdpi": "CAT GDPI",
        "mba_admissions": "MBA Admissions",
        "university_admissions": "University Admissions",
        "scholarship_interview": "Scholarship Interview",
        "campus_placement": "Campus Placement",
        "hr_interview": "HR Interview",
        "software_engineering_interview": "Software Engineering Interview",
        "banking_interview": "Banking Interview",
        "upsc_interview": "UPSC Interview",
        "ssc_interview": "SSC Interview",
    }
    return display_names.get(interview_type, interview_type.replace("_", " ").title())


@router.get("", status_code=status.HTTP_200_OK)
def list_user_speeches(
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    Lists all speech attempts and completed/active interview sessions for the current authenticated user with pagination.
    """
    if page < 1:
        page = 1
    if limit < 1:
        limit = 20
    
    try:
        # 1. Fetch speeches
        speeches_res = supabase.table("speeches") \
            .select("*, topics(*)") \
            .eq("user_id", current_user["id"]) \
            .execute()
        speeches = speeches_res.data if speeches_res.data else []
        
        # 2. Fetch sessions
        sessions_res = supabase.table("interview_sessions") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .execute()
        sessions = sessions_res.data if sessions_res.data else []
        
        # 3. Format speeches
        formatted_items = []
        for speech in speeches:
            if speech.get("lexicon_score") is None:
                feedback_obj = speech.get("feedback")
                if isinstance(feedback_obj, dict):
                    speech["lexicon_score"] = feedback_obj.get("lexicon_score")
            speech["is_session"] = False
            formatted_items.append(speech)
            
        # 4. Format sessions
        for session in sessions:
            eval_data = session.get("final_evaluation") or {}
            display_title = get_display_name(session["interview_type"])
            
            duration = 0
            if session.get("completed_at"):
                try:
                    created_dt = datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))
                    completed_dt = datetime.fromisoformat(session["completed_at"].replace("Z", "+00:00"))
                    duration = max(0, int((completed_dt - created_dt).total_seconds()))
                except Exception:
                    pass
            
            formatted_session = {
                "id": session["id"],
                "user_id": session["user_id"],
                "topic_id": None,
                "storage_path": "",
                "original_filename": f"Interview Session ({session['interview_type']})",
                "mime_type": "",
                "duration_seconds": duration,
                "status": session["status"],
                "transcript": None,
                "feedback": None,
                "overall_score": eval_data.get("overall_score"),
                "pronunciation_score": None,
                "fluency_score": None,
                "grammar_score": None,
                "content_score": None,
                "lexicon_score": None,
                "created_at": session["created_at"],
                "is_session": True,
                "topics": {
                    "id": "",
                    "title": display_title,
                    "prompt": session.get("roadmap_step", ""),
                    "category": session.get("roadmap_step", ""),
                    "module_type": "interview_preparation",
                    "difficulty": session.get("difficulty", "medium"),
                    "interview_type": session["interview_type"],
                    "interview_persona": session["interview_persona"]
                }
            }
            formatted_items.append(formatted_session)
            
        # 5. Sort by created_at descending
        formatted_items.sort(key=lambda x: x["created_at"], reverse=True)
        
        # 6. Slice range
        start_range = (page - 1) * limit
        end_range = page * limit
        paginated_items = formatted_items[start_range:end_range]
        
        return paginated_items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve combined history: {str(e)}"
        )


@router.get("/stats", status_code=status.HTTP_200_OK)
def get_user_speech_stats(current_user: dict = Depends(get_current_user)):
    """
    Calculates totals, averages, best scores, improvement trends, and streaks
    for the authenticated user, split by public speaking and interview preparation.
    """
    try:
        # Fetch speeches
        speeches_res = supabase.table("speeches") \
            .select("*, topics(*)") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=False) \
            .execute()
        speeches = speeches_res.data if speeches_res.data else []
        
        # Fetch sessions
        sessions_res = supabase.table("interview_sessions") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=False) \
            .execute()
        sessions = sessions_res.data if sessions_res.data else []

        # Get all completed exchanges for the user's sessions to compute lexicon scores
        session_ids = [sess["id"] for sess in sessions]
        exchanges_by_session = {}
        if session_ids:
            exch_res = supabase.table("interview_exchanges") \
                .select("session_id, feedback, status") \
                .in_("session_id", session_ids) \
                .execute()
            
            for row in (exch_res.data or []):
                sess_id = row["session_id"]
                if sess_id not in exchanges_by_session:
                    exchanges_by_session[sess_id] = []
                exchanges_by_session[sess_id].append(row)

        # Map sessions for stats helper
        formatted_sessions = []
        for sess in sessions:
            eval_data = sess.get("final_evaluation") or {}
            sess_id = sess["id"]
            
            # Compute average lexicon score from completed exchanges
            lex_scores = []
            if sess_id in exchanges_by_session:
                for exch in exchanges_by_session[sess_id]:
                    if exch["status"] == "completed" and exch.get("feedback"):
                        val = exch["feedback"].get("lexicon_score")
                        if val is not None:
                            lex_scores.append(val)
            
            avg_lex = round(sum(lex_scores) / len(lex_scores)) if lex_scores else None
            
            formatted_sessions.append({
                "status": sess["status"],
                "overall_score": eval_data.get("overall_score"),
                "lexicon_score": avg_lex,
                "created_at": sess["created_at"]
            })

        # Check if the user is the cute superuser
        is_cute_mode = False
        email = current_user.get("email", "").strip().lower() if current_user else ""
        cute_email = settings.superuser_cute_email.strip().lower()
        if cute_email and email == cute_email:
            is_cute_mode = True

        # Split stats helper
        def compute_sub_stats(items_list: list) -> dict:
            completed_sub = [s for s in items_list if s["status"] == "completed" and s["overall_score"] is not None]
            count_sub = len(completed_sub)
            
            avg_score_sub = 0
            best_score_sub = 0
            latest_score_sub = 0
            avg_lexicon_sub = 0
            best_lexicon_sub = 0
            latest_lexicon_sub = 0
            delta_first_sub = 0
            delta_prev_sub = 0
            percent_improvement_sub = 0
            
            if count_sub > 0:
                scores_sub = [s["overall_score"] for s in completed_sub]
                avg_score_sub = round(sum(scores_sub) / count_sub)
                best_score_sub = max(scores_sub)
                latest_score_sub = scores_sub[-1]
                
                first_score_sub = scores_sub[0]
                delta_first_sub = latest_score_sub - first_score_sub
                
                if count_sub > 1:
                    prev_score_sub = scores_sub[-2]
                    delta_prev_sub = latest_score_sub - prev_score_sub
                else:
                    delta_prev_sub = 0
                    
                if first_score_sub > 0:
                    percent_improvement_sub = round((delta_first_sub / first_score_sub) * 100)
                    
                # Lexicon calculations
                lexicon_scores_sub = [s["lexicon_score"] for s in completed_sub if s.get("lexicon_score") is not None]
                        
                if lexicon_scores_sub:
                    avg_lexicon_sub = round(sum(lexicon_scores_sub) / len(lexicon_scores_sub))
                    best_lexicon_sub = max(lexicon_scores_sub)
                    latest_lexicon_sub = lexicon_scores_sub[-1]
                    
            return {
                "total_speeches": len(items_list),
                "completed_speeches": count_sub,
                "average_overall_score": avg_score_sub,
                "best_overall_score": best_score_sub,
                "latest_overall_score": latest_score_sub,
                "average_lexicon_score": avg_lexicon_sub,
                "best_lexicon_score": best_lexicon_sub,
                "latest_lexicon_score": latest_lexicon_sub,
                "score_delta_first": delta_first_sub,
                "score_delta_prev": delta_prev_sub,
                "percent_improvement": percent_improvement_sub
            }

        # Filter subsets
        pub_speeches_raw = [
            s for s in speeches 
            if not s.get("topics") or s["topics"].get("module_type", "public_speaking") == "public_speaking"
        ]
        # format pub speeches raw
        pub_speeches = []
        for s in pub_speeches_raw:
            lex_val = s.get("lexicon_score")
            if lex_val is None:
                feedback_obj = s.get("feedback")
                if isinstance(feedback_obj, dict):
                    lex_val = feedback_obj.get("lexicon_score")
            pub_speeches.append({
                "status": s["status"],
                "overall_score": s["overall_score"],
                "lexicon_score": lex_val,
                "created_at": s["created_at"]
            })

        # Calculate Overall Stats (combining public_speaking and interview_preparation)
        total_items = len(pub_speeches) + len(formatted_sessions)
        completed_pub = [s for s in pub_speeches if s["status"] == "completed" and s["overall_score"] is not None]
        completed_sess = [s for s in formatted_sessions if s["status"] == "completed" and s["overall_score"] is not None]
        completed_items = completed_pub + completed_sess
        completed_count = len(completed_items)

        avg_score = 0
        best_score = 0
        latest_score = 0
        avg_lexicon = 0
        best_lexicon = 0
        latest_lexicon = 0
        delta_first = 0
        delta_prev = 0
        percent_improvement = 0
        current_streak = 0
        longest_streak = 0

        if completed_count > 0:
            completed_items.sort(key=lambda x: x["created_at"])
            scores = [x["overall_score"] for x in completed_items]
            avg_score = round(sum(scores) / completed_count)
            best_score = max(scores)
            latest_score = scores[-1]
            
            first_score = scores[0]
            delta_first = latest_score - first_score
            
            if completed_count > 1:
                prev_score = scores[-2]
                delta_prev = latest_score - prev_score
            else:
                delta_prev = 0
                
            if first_score > 0:
                percent_improvement = round((delta_first / first_score) * 100)
            
            # Lexicon calculations
            lexicon_scores = [x["lexicon_score"] for x in completed_items if x["lexicon_score"] is not None]
            
            if lexicon_scores:
                avg_lexicon = round(sum(lexicon_scores) / len(lexicon_scores))
                best_lexicon = max(lexicon_scores)
                latest_lexicon = lexicon_scores[-1]

        # Calculate Combined Streak based on created_at timestamps
        all_attempts = pub_speeches + formatted_sessions
        if len(all_attempts) > 0:
            attempt_dates = set()
            for s in all_attempts:
                try:
                    iso_str = s["created_at"].replace("Z", "+00:00")
                    dt = datetime.fromisoformat(iso_str)
                    attempt_dates.add(dt.date())
                except Exception:
                    pass
            
            sorted_dates = sorted(list(attempt_dates), reverse=True)
            
            if len(sorted_dates) > 0:
                today = date.today()
                yesterday = today - timedelta(days=1)
                
                # Check if there was activity today or yesterday to consider current streak active
                if sorted_dates[0] == today or sorted_dates[0] == yesterday:
                    current_streak = 1
                    streak_idx = 0
                    while streak_idx < len(sorted_dates) - 1:
                        diff = sorted_dates[streak_idx] - sorted_dates[streak_idx + 1]
                        if diff.days == 1:
                            current_streak += 1
                            streak_idx += 1
                        elif diff.days == 0:
                            streak_idx += 1
                        else:
                            break
                else:
                    current_streak = 0
                    
                # Calculate longest streak
                chron_dates = sorted(list(attempt_dates))
                if len(chron_dates) > 0:
                    longest_streak = 1
                    temp_streak = 1
                    for idx in range(len(chron_dates) - 1):
                        diff = chron_dates[idx + 1] - chron_dates[idx]
                        if diff.days == 1:
                            temp_streak += 1
                            if temp_streak > longest_streak:
                                longest_streak = temp_streak
                        elif diff.days > 1:
                            temp_streak = 1
                else:
                    longest_streak = 0

        return {
            "total_speeches": total_items,
            "completed_speeches": completed_count,
            "average_overall_score": avg_score,
            "best_overall_score": best_score,
            "latest_overall_score": latest_score,
            
            "average_lexicon_score": avg_lexicon,
            "best_lexicon_score": best_lexicon,
            "latest_lexicon_score": latest_lexicon,
            
            "score_delta_first": delta_first,
            "score_delta_prev": delta_prev,
            "percent_improvement": percent_improvement,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "is_cute_mode": is_cute_mode,
            
            # Split stats
            "public_speaking": compute_sub_stats(pub_speeches),
            "interview_preparation": compute_sub_stats(formatted_sessions)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate statistics: {str(e)}"
        )


@router.get("/{speech_id}", status_code=status.HTTP_200_OK)
def get_speech_details(
    speech_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieves the speech record containing transcript, feedback, and scores, or interview session details.
    Enforces that the user can only fetch their own records.
    """
    try:
        # First check speeches
        res = supabase.table("speeches").select("*, topics(*)").eq("id", speech_id).execute()
        if res.data:
            speech = res.data[0]
            # Security authorization check
            if speech["user_id"] != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this speech record."
                )
            if speech.get("lexicon_score") is None:
                feedback_obj = speech.get("feedback")
                if isinstance(feedback_obj, dict):
                    speech["lexicon_score"] = feedback_obj.get("lexicon_score")
            speech["is_session"] = False
            return speech
            
        # Check interview_sessions
        session_res = supabase.table("interview_sessions").select("*").eq("id", speech_id).execute()
        if session_res.data:
            session = session_res.data[0]
            if session["user_id"] != current_user["id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this session record."
                )
            
            # Fetch exchanges
            exch_res = supabase.table("interview_exchanges") \
                .select("*") \
                .eq("session_id", speech_id) \
                .order("round_number", desc=False) \
                .execute()
            
            display_title = get_display_name(session["interview_type"])
            
            duration = 0
            if session.get("completed_at"):
                try:
                    created_dt = datetime.fromisoformat(session["created_at"].replace("Z", "+00:00"))
                    completed_dt = datetime.fromisoformat(session["completed_at"].replace("Z", "+00:00"))
                    duration = max(0, int((completed_dt - created_dt).total_seconds()))
                except Exception:
                    pass

            formatted = {
                **session,
                "is_session": True,
                "exchanges": exch_res.data or [],
                "duration_seconds": duration,
                "topics": {
                    "id": "",
                    "title": display_title,
                    "prompt": session.get("roadmap_step", ""),
                    "category": session.get("roadmap_step", ""),
                    "module_type": "interview_preparation",
                    "difficulty": session.get("difficulty", "medium"),
                    "interview_type": session["interview_type"],
                    "interview_persona": session["interview_persona"]
                }
            }
            if session.get("final_evaluation"):
                formatted["overall_score"] = session["final_evaluation"].get("overall_score")
            return formatted
            
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Speech or session record not found."
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve details: {str(e)}"
        )
