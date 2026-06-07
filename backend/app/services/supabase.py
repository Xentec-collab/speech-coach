from supabase import create_client, Client
from fastapi import Header, HTTPException, status
from app.core.config import settings

# Validate presence of Supabase configurations on startup
if not settings.supabase_url or not settings.supabase_service_role_key:
    raise ValueError(
        "CRITICAL ERROR: Supabase environment variables are missing or empty in backend/.env. "
        "Please specify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    )

try:
    supabase: Client = create_client(settings.supabase_url, settings.supabase_service_role_key)
except Exception as e:
    raise RuntimeError(f"Failed to initialize Supabase client: {str(e)}")


def get_current_user(authorization: str = Header(None)) -> dict:
    """
    Dependency to verify client requests using the Supabase JWT.
    Expects header 'Authorization: Bearer <token>'
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header must be formatted as 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = parts[1]

    try:
        # Ask Supabase auth server to retrieve the user for the given JWT
        response = supabase.auth.get_user(token)
        if not response or not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired access token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = response.user
        return {
            "id": user.id,
            "email": user.email,
            "user_metadata": user.user_metadata,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
