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
        if topic_id:
            topic_res = supabase.table("topics").select("title", "prompt", "category").eq("id", topic_id).execute()
            if topic_res.data:
                topic_title = topic_res.data[0]["title"]
                topic_prompt = topic_res.data[0]["prompt"]
                topic_category = topic_res.data[0].get("category", "impromptu")

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
        eval_result = evaluate_speech_session(transcript, topic_title, topic_prompt, topic_category)

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
                "challenge_questions": eval_result.challenge_questions
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


@router.get("", status_code=status.HTTP_200_OK)
def list_user_speeches(
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    Lists all speech attempts for the current authenticated user with pagination.
    """
    if page < 1:
        page = 1
    if limit < 1:
        limit = 20
    
    start_range = (page - 1) * limit
    end_range = page * limit - 1
    
    try:
        res = supabase.table("speeches") \
            .select("*, topics(*)") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=True) \
            .range(start_range, end_range) \
            .execute()
        
        data = res.data if res.data else []
        for speech in data:
            if speech.get("lexicon_score") is None:
                feedback_obj = speech.get("feedback")
                if isinstance(feedback_obj, dict):
                    speech["lexicon_score"] = feedback_obj.get("lexicon_score")
        return data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve speech history: {str(e)}"
        )


@router.get("/stats", status_code=status.HTTP_200_OK)
def get_user_speech_stats(current_user: dict = Depends(get_current_user)):
    """
    Calculates totals, averages, best scores, improvement trends, and streaks
    for the authenticated user.
    """
    try:
        # Fetch all speeches for statistics calculation (sorted chronologically)
        # Select * to avoid Postgres failing if lexicon_score column doesn't exist yet
        res = supabase.table("speeches") \
            .select("*") \
            .eq("user_id", current_user["id"]) \
            .order("created_at", desc=False) \
            .execute()
        
        speeches = res.data if res.data else []
        
        total_speeches = len(speeches)
        completed_speeches = [s for s in speeches if s["status"] == "completed" and s["overall_score"] is not None]
        completed_count = len(completed_speeches)
        
        # Defaults
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
            scores = [s["overall_score"] for s in completed_speeches]
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
            lexicon_scores = []
            for s in completed_speeches:
                val = s.get("lexicon_score")
                if val is None:
                    feedback_obj = s.get("feedback")
                    if isinstance(feedback_obj, dict):
                        val = feedback_obj.get("lexicon_score")
                if val is not None:
                    lexicon_scores.append(val)
            
            if lexicon_scores:
                avg_lexicon = round(sum(lexicon_scores) / len(lexicon_scores))
                best_lexicon = max(lexicon_scores)
                latest_lexicon = lexicon_scores[-1]
                
        # Calculate Streaks based on created_at timestamps
        if total_speeches > 0:
            speech_dates = set()
            for s in speeches:
                # Standardize UTC timestamp to local date comparison
                # Speeches display UTC time formatted (e.g. 2026-06-07T12:00:00+00:00)
                try:
                    iso_str = s["created_at"].replace("Z", "+00:00")
                    dt = datetime.fromisoformat(iso_str)
                    speech_dates.add(dt.date())
                except Exception:
                    pass
            
            sorted_dates = sorted(list(speech_dates), reverse=True)
            
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
                            # Safeguard duplicate dates
                            streak_idx += 1
                        else:
                            break
                else:
                    current_streak = 0
                    
                # Calculate longest streak
                chron_dates = sorted(list(speech_dates))
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
        
        # Check if the user is the cute superuser
        is_cute_mode = False
        email = current_user.get("email", "").strip().lower() if current_user else ""
        cute_email = settings.superuser_cute_email.strip().lower()
        if cute_email and email == cute_email:
            is_cute_mode = True

        return {
            "total_speeches": total_speeches,
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
            "is_cute_mode": is_cute_mode
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
    Retrieves the speech record containing transcript, feedback, and scores.
    Enforces that the user can only fetch their own speech.
    """
    try:
        res = supabase.table("speeches").select("*, topics(*)").eq("id", speech_id).execute()
        if not res.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Speech record not found."
            )
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
                
        return speech
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve speech details: {str(e)}"
        )
