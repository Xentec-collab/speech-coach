from fastapi import APIRouter, Depends
from app.services.supabase import get_current_user
from app.core.config import settings

router = APIRouter()


@router.get("/profile")
def get_user_profile(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Returns user details (email, is_superuser, plan).
    Authentication is required.
    """
    super_email = settings.superuser_email.strip().lower()
    cute_email = settings.superuser_cute_email.strip().lower()
    user_email = current_user.get("email", "").strip().lower()

    is_superuser = (
        (bool(super_email) and user_email == super_email) or
        (bool(cute_email) and user_email == cute_email)
    )
    is_cute_mode = bool(cute_email) and user_email == cute_email
    plan = "superuser" if is_superuser else "free"

    return {
        "email": current_user.get("email"),
        "is_superuser": is_superuser,
        "plan": plan,
        "is_cute_mode": is_cute_mode
    }
