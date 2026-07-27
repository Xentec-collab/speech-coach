from fastapi import APIRouter, Depends
from app.services.supabase import get_optional_current_user
from app.core.config import settings

router = APIRouter()


@router.get("/config")
def get_monetization_config(current_user: dict = Depends(get_optional_current_user)) -> dict:
    """
    Returns the monetization and ad configuration.
    Supports optional authenticated access to customize/personalize configurations.
    """
    default_config = {
        "ads_enabled": True,
        "provider": "placeholder",
        "placements": ["sidebar", "analytics-footer"]
    }

    if current_user:
        super_email = settings.superuser_email.strip().lower()
        cute_email = settings.superuser_cute_email.strip().lower()
        user_email = current_user.get("email", "").strip().lower()
        
        is_superuser = (
            (bool(super_email) and user_email == super_email) or
            (bool(cute_email) and user_email == cute_email)
        )
        plan = "superuser" if is_superuser else "free"
        
        # Superusers never receive ads
        ads_enabled = not is_superuser
        
        return {
            "ads_enabled": ads_enabled,
            "provider": "placeholder",
            "placements": ["sidebar", "analytics-footer"],
            "is_superuser": is_superuser,
            "plan": plan
        }

    return default_config
