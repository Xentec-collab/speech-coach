import asyncio
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.supabase import get_current_user, supabase

router = APIRouter()
COACH_HISTORY_LIMIT = 20

async def generate_and_save_coach_snapshot(user_id: str):
    """
    Retrieves user history, generates a structured AI Coach report, and saves it to coach_snapshots.
    """
    try:
        # 1. Fetch completed speeches
        speeches_cols = (
            "id, duration_seconds, status, created_at, overall_score, "
            "pronunciation_score, fluency_score, grammar_score, content_score, feedback, topics(*)"
        )
        speeches_res = supabase.table("speeches") \
            .select(speeches_cols) \
            .eq("user_id", user_id) \
            .eq("status", "completed") \
            .order("created_at", desc=True) \
            .limit(COACH_HISTORY_LIMIT) \
            .execute()
        speeches = speeches_res.data or []

        # 2. Fetch completed interview sessions
        sessions_cols = "id, interview_type, roadmap_step, difficulty, status, final_evaluation, created_at, completed_at"
        sessions_res = supabase.table("interview_sessions") \
            .select(sessions_cols) \
            .eq("user_id", user_id) \
            .eq("status", "completed") \
            .order("created_at", desc=True) \
            .limit(COACH_HISTORY_LIMIT) \
            .execute()
        sessions = sessions_res.data or []

        if not speeches and not sessions:
            # Delete any existing snapshot to stay in sync if all practices were deleted
            try:
                supabase.table("coach_snapshots").delete().eq("user_id", user_id).execute()
            except Exception:
                pass
            return None

        # 3. Fetch articles catalog
        art_cols = "id, title, track_slug, category_slug, summary, tags"
        art_res = supabase.table("knowledge_articles").select(art_cols).execute()
        articles = art_res.data or []

        # 4. Fetch article progress
        prog_res = supabase.table("article_progress") \
            .select("article_id") \
            .eq("user_id", user_id) \
            .eq("completed", True) \
            .execute()
        completed_ids = [p["article_id"] for p in (prog_res.data or [])]

        # 5. Generate report via Gemini
        from app.services.gemini import generate_coach_report
        report = generate_coach_report(
            speeches_history=speeches,
            sessions_history=sessions,
            articles_catalog=articles,
            read_articles_ids=completed_ids
        )

        payload = {
            "user_id": user_id,
            "report": report.model_dump(),
            "created_at": datetime.utcnow().isoformat()
        }

        # Select first to check if row exists, then insert/update to bypass missing unique constraints
        check_res = supabase.table("coach_snapshots").select("id").eq("user_id", user_id).execute()
        if check_res.data:
            snapshot_id = check_res.data[0]["id"]
            supabase.table("coach_snapshots").update({
                "report": payload["report"],
                "created_at": payload["created_at"]
            }).eq("id", snapshot_id).execute()
        else:
            supabase.table("coach_snapshots").insert(payload).execute()

        return payload["report"]
    except Exception as e:
        print(f"Error in generate_and_save_coach_snapshot: {e}")
        return None


@router.get("/report")
async def get_coach_report(current_user: dict = Depends(get_current_user)):
    """
    Returns the user's latest AI coach report snapshot, or generates the first one.
    """
    try:
        user_id = current_user["id"]
        
        # 1. Check if snapshot exists
        try:
            snap_res = supabase.table("coach_snapshots").select("*").eq("user_id", user_id).execute()
            if snap_res.data:
                return {
                    "unlocked": True,
                    "report": snap_res.data[0]["report"]
                }
        except Exception as db_err:
            # Handle case where database migration has not been run yet
            print(f"Warning: coach_snapshots table query failed: {db_err}")
        
        # 2. Check practice counts to see if unlocked
        speeches_check = supabase.table("speeches") \
            .select("id") \
            .eq("user_id", user_id) \
            .eq("status", "completed") \
            .limit(1) \
            .execute()
            
        sessions_check = supabase.table("interview_sessions") \
            .select("id") \
            .eq("user_id", user_id) \
            .eq("status", "completed") \
            .limit(1) \
            .execute()
            
        if not speeches_check.data and not sessions_check.data:
            return {
                "unlocked": False
            }

        # 3. First-time synchronous generation
        report_data = await generate_and_save_coach_snapshot(user_id)
        if report_data:
            return {
                "unlocked": True,
                "report": report_data
            }
        
        return {
            "unlocked": False
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch coach report: {str(e)}"
        )
