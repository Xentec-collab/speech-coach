from fastapi import APIRouter, Depends
from app.services.supabase import get_current_user

router = APIRouter()


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Returns user details if the client provides a valid Supabase JWT.
    """
    return current_user
