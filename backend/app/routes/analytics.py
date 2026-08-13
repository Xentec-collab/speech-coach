from datetime import datetime, timedelta, date
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from app.services.supabase import get_current_user, get_optional_current_user, supabase

router = APIRouter()

# ── Pydantic Request Models ───────────────────────────────────────────────────

class AnalyticsEventItem(BaseModel):
    event_type: str = Field(..., description="Type of event: page_view, tab_switch, feature_use, action, session_end")
    event_name: str = Field(..., description="Name of event or feature: console, tracks, library, coach, speech_upload, etc.")
    session_id: str = Field(..., description="Client session UUID/ID")
    page_path: Optional[str] = None
    referrer: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

class BatchEventsRequest(BaseModel):
    events: List[AnalyticsEventItem]

class SessionEndRequest(BaseModel):
    session_id: str
    exit_page: Optional[str] = None
    exit_feature: Optional[str] = None
    total_duration_s: Optional[int] = 0
    page_count: Optional[int] = 1


# ── Helper: 1-Year Retention Cleanup (Non-blocking) ───────────────────────────

def cleanup_old_analytics_records():
    """Purge analytics events older than 365 days to respect the 1-year retention policy."""
    try:
        one_year_ago = (datetime.utcnow() - timedelta(days=365)).isoformat()
        supabase.table("analytics_events").delete().lt("created_at", one_year_ago).execute()
    except Exception as e:
        print(f"Analytics retention cleanup warning: {e}")


# ── Ingestion Endpoints ───────────────────────────────────────────────────────

@router.post("/events", status_code=status.HTTP_200_OK)
async def ingest_batch_events(
    payload: BatchEventsRequest,
    current_user: Optional[dict] = Depends(get_optional_current_user)
):
    """
    Ingests batched client analytics events (every 5 seconds).
    Updates session aggregations and daily active tracking.
    """
    if not payload.events:
        return {"status": "ok", "inserted": 0}

    user_id = current_user["id"] if current_user else None
    
    # Fallback to anonymous placeholder if unauthenticated landing visitor
    resolved_user_id = user_id or "00000000-0000-0000-0000-000000000000"
    now_iso = datetime.utcnow().isoformat()
    today_str = date.today().isoformat()

    db_rows = []
    session_updates = {}

    for ev in payload.events:
        db_rows.append({
            "user_id": resolved_user_id,
            "session_id": ev.session_id,
            "event_type": ev.event_type,
            "event_name": ev.event_name,
            "page_path": ev.page_path or "/dashboard",
            "referrer": ev.referrer or "",
            "metadata": ev.metadata or {},
            "created_at": ev.timestamp or now_iso
        })

        # Track latest page/feature for the session
        session_updates[ev.session_id] = {
            "user_id": resolved_user_id,
            "last_page": ev.page_path or "/dashboard",
            "last_feature": ev.event_name
        }

    # 1. Insert events into analytics_events
    try:
        supabase.table("analytics_events").insert(db_rows).execute()
    except Exception as e:
        print(f"Error inserting analytics events: {e}")

    # 2. Upsert session row into analytics_sessions
    for s_id, s_info in session_updates.items():
        try:
            sess_check = supabase.table("analytics_sessions").select("id, page_count").eq("session_id", s_id).execute()
            if sess_check.data:
                supabase.table("analytics_sessions").update({
                    "exit_page": s_info["last_page"],
                    "exit_feature": s_info["last_feature"],
                    "page_count": (sess_check.data[0].get("page_count") or 1) + 1
                }).eq("session_id", s_id).execute()
            else:
                supabase.table("analytics_sessions").insert({
                    "user_id": s_info["user_id"],
                    "session_id": s_id,
                    "started_at": now_iso,
                    "exit_page": s_info["last_page"],
                    "exit_feature": s_info["last_feature"],
                    "page_count": 1
                }).execute()
        except Exception as sess_err:
            print(f"Session upsert error: {sess_err}")

    # 3. Track daily active user
    if user_id and user_id != "00000000-0000-0000-0000-000000000000":
        try:
            da_check = supabase.table("analytics_daily_active") \
                .select("id, event_count") \
                .eq("user_id", user_id) \
                .eq("active_date", today_str) \
                .execute()
            
            if da_check.data:
                current_count = da_check.data[0].get("event_count") or 1
                supabase.table("analytics_daily_active").update({
                    "event_count": current_count + len(payload.events)
                }).eq("id", da_check.data[0]["id"]).execute()
            else:
                supabase.table("analytics_daily_active").insert({
                    "user_id": user_id,
                    "active_date": today_str,
                    "event_count": len(payload.events)
                }).execute()
        except Exception as da_err:
            print(f"Daily active upsert error: {da_err}")

    return {"status": "ok", "inserted": len(db_rows)}


@router.post("/session-end", status_code=status.HTTP_200_OK)
async def record_session_end(payload: SessionEndRequest):
    """
    Receives beacon when user closes browser tab to record exit page and total duration.
    """
    now_iso = datetime.utcnow().isoformat()
    try:
        sess_check = supabase.table("analytics_sessions").select("id").eq("session_id", payload.session_id).execute()
        if sess_check.data:
            supabase.table("analytics_sessions").update({
                "ended_at": now_iso,
                "exit_page": payload.exit_page,
                "exit_feature": payload.exit_feature,
                "total_duration_s": payload.total_duration_s or 0
            }).eq("session_id", payload.session_id).execute()
        else:
            supabase.table("analytics_sessions").insert({
                "user_id": "00000000-0000-0000-0000-000000000000",
                "session_id": payload.session_id,
                "started_at": now_iso,
                "ended_at": now_iso,
                "exit_page": payload.exit_page,
                "exit_feature": payload.exit_feature,
                "total_duration_s": payload.total_duration_s or 0,
                "page_count": payload.page_count or 1
            }).execute()
    except Exception as e:
        print(f"Session end error: {e}")

    return {"status": "ok"}


# ── Superuser Admin Analytics Endpoints ───────────────────────────────────────

def require_superuser(current_user: dict = Depends(get_current_user)):
    """Enforces access restriction exclusively to configured superusers."""
    if not current_user.get("is_super_user"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Analytics is reserved exclusively for superusers."
        )
    return current_user


@router.get("/overview", status_code=status.HTTP_200_OK)
def get_analytics_overview(admin_user: dict = Depends(require_superuser)):
    """
    Returns high-level KPI metrics: Total users, New users (7d), Returning users, Lost/Churned users (14d+ inactive).
    """
    try:
        today = date.today()
        seven_days_ago = (today - timedelta(days=7)).isoformat()
        fourteen_days_ago = (today - timedelta(days=14)).isoformat()

        # 1. Fetch all distinct active users with dates from analytics_daily_active
        da_res = supabase.table("analytics_daily_active").select("user_id, active_date").execute()
        da_rows = da_res.data or []

        user_activity_map = {}
        for r in da_rows:
            uid = r["user_id"]
            d = r["active_date"]
            if uid not in user_activity_map:
                user_activity_map[uid] = []
            user_activity_map[uid].append(d)

        total_users = len(user_activity_map)
        new_users_7d = 0
        returning_users = 0
        lost_users_14d = 0

        for uid, dates in user_activity_map.items():
            min_date = min(dates)
            max_date = max(dates)

            has_recent = any(d >= seven_days_ago for d in dates)
            has_prior = any(d < seven_days_ago for d in dates)

            # New user: First active within the last 7 days
            if min_date >= seven_days_ago:
                new_users_7d += 1

            # Returning user: Active recently AND active prior to the last 7 days
            if has_recent and has_prior:
                returning_users += 1

            # Lost user: Active before 14 days ago, but NOT active in the last 14 days
            if max_date < fourteen_days_ago:
                lost_users_14d += 1

        # 2. Total Sessions & Total Events
        sess_res = supabase.table("analytics_sessions").select("id").execute()
        total_sessions = len(sess_res.data or [])

        ev_res = supabase.table("analytics_events").select("id").limit(5000).execute()
        total_events_sample = len(ev_res.data or [])

        return {
            "total_users": max(total_users, 1),
            "new_users_7d": new_users_7d,
            "returning_users": returning_users,
            "lost_users_14d": lost_users_14d,
            "total_sessions": total_sessions,
            "total_events": total_events_sample
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics overview: {str(e)}")


@router.get("/features", status_code=status.HTTP_200_OK)
def get_feature_usage_analytics(admin_user: dict = Depends(require_superuser)):
    """
    Returns feature usage rankings and average time spent per feature.
    """
    try:
        # Fetch events for feature tracking
        ev_res = supabase.table("analytics_events") \
            .select("event_type, event_name, metadata") \
            .in_("event_type", ["tab_switch", "feature_use", "action"]) \
            .limit(2000) \
            .execute()
        
        events = ev_res.data or []
        feature_stats = {}

        for ev in events:
            fname = ev.get("event_name") or "other"
            # Friendly formatting
            if fname not in feature_stats:
                feature_stats[fname] = {
                    "feature_name": fname,
                    "usage_count": 0,
                    "total_duration_ms": 0,
                    "duration_samples": 0
                }
            
            feature_stats[fname]["usage_count"] += 1
            
            meta = ev.get("metadata") or {}
            duration_ms = meta.get("duration_ms")
            if isinstance(duration_ms, (int, float)) and duration_ms > 0:
                feature_stats[fname]["total_duration_ms"] += duration_ms
                feature_stats[fname]["duration_samples"] += 1

        # Calculate averages and format list
        results = []
        total_uses = sum(f["usage_count"] for f in feature_stats.values()) or 1

        for f in feature_stats.values():
            avg_sec = round((f["total_duration_ms"] / (f["duration_samples"] * 1000)), 1) if f["duration_samples"] > 0 else 0
            results.append({
                "feature": f["feature_name"],
                "usage_count": f["usage_count"],
                "percentage": round((f["usage_count"] / total_uses) * 100, 1),
                "avg_time_spent_seconds": avg_sec
            })

        results.sort(key=lambda x: x["usage_count"], reverse=True)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feature usage: {str(e)}")


@router.get("/exit-pages", status_code=status.HTTP_200_OK)
def get_exit_pages_analytics(admin_user: dict = Depends(require_superuser)):
    """
    Returns the most common pages and features where users exit the web app.
    """
    try:
        sess_res = supabase.table("analytics_sessions") \
            .select("exit_page, exit_feature, total_duration_s") \
            .order("created_at", desc=True) \
            .limit(500) \
            .execute()
        
        sessions = sess_res.data or []
        exit_counts = {}

        for s in sessions:
            page = s.get("exit_page") or "/dashboard"
            feature = s.get("exit_feature") or "console"
            key = f"{page} ({feature})"
            
            if key not in exit_counts:
                exit_counts[key] = {
                    "exit_key": key,
                    "page": page,
                    "feature": feature,
                    "count": 0,
                    "total_duration": 0
                }
            exit_counts[key]["count"] += 1
            exit_counts[key]["total_duration"] += (s.get("total_duration_s") or 0)

        total_sessions = len(sessions) or 1
        results = []
        for item in exit_counts.values():
            results.append({
                "page": item["page"],
                "feature": item["feature"],
                "exit_count": item["count"],
                "exit_rate_percentage": round((item["count"] / total_sessions) * 100, 1),
                "avg_session_seconds": round(item["total_duration"] / max(item["count"], 1), 1)
            })

        results.sort(key=lambda x: x["exit_count"], reverse=True)
        return results[:15]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch exit pages: {str(e)}")


@router.get("/daily-active", status_code=status.HTTP_200_OK)
def get_daily_active_trends(admin_user: dict = Depends(require_superuser)):
    """
    Returns DAU trend data for the last 30 days.
    """
    try:
        thirty_days_ago = (date.today() - timedelta(days=30)).isoformat()
        da_res = supabase.table("analytics_daily_active") \
            .select("user_id, active_date, event_count") \
            .gte("active_date", thirty_days_ago) \
            .order("active_date", desc=False) \
            .execute()
        
        rows = da_res.data or []
        daily_map = {}

        # Initialize all 30 days
        for i in range(30, -1, -1):
            d_str = (date.today() - timedelta(days=i)).isoformat()
            daily_map[d_str] = {"date": d_str, "active_users": set(), "events": 0}

        for r in rows:
            d = r["active_date"]
            if d in daily_map:
                daily_map[d]["active_users"].add(r["user_id"])
                daily_map[d]["events"] += (r.get("event_count") or 1)

        result = [
            {
                "date": d,
                "active_users": len(v["active_users"]),
                "events": v["events"]
            }
            for d, v in sorted(daily_map.items())
        ]
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch daily active trends: {str(e)}")


@router.get("/users", status_code=status.HTTP_200_OK)
def get_tracked_users_list(admin_user: dict = Depends(require_superuser)):
    """
    Returns list of users with interaction summaries for the user journey timeline selector.
    """
    try:
        ev_res = supabase.table("analytics_events") \
            .select("user_id, created_at, event_name") \
            .order("created_at", desc=True) \
            .limit(1000) \
            .execute()
        
        events = ev_res.data or []
        users_map = {}

        for ev in events:
            uid = ev["user_id"]
            if uid == "00000000-0000-0000-0000-000000000000":
                continue
            if uid not in users_map:
                users_map[uid] = {
                    "user_id": uid,
                    "event_count": 0,
                    "last_active": ev["created_at"],
                    "first_active": ev["created_at"],
                    "last_feature": ev.get("event_name", "console")
                }
            users_map[uid]["event_count"] += 1
            users_map[uid]["first_active"] = ev["created_at"]

        return list(users_map.values())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tracked users: {str(e)}")


@router.get("/user-journey/{user_id}", status_code=status.HTTP_200_OK)
def get_user_journey_timeline(user_id: str, admin_user: dict = Depends(require_superuser)):
    """
    Returns the chronological event log (journey timeline) for a specific user.
    """
    try:
        ev_res = supabase.table("analytics_events") \
            .select("id, event_type, event_name, page_path, metadata, created_at") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(150) \
            .execute()
        
        return ev_res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user journey: {str(e)}")
