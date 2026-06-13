import json
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    gemini_api_key: str = ""
    superuser_email: str = ""
    superuser_cute_email: str = ""
    allowed_origins: str | list[str] = ["http://localhost:3000"]
    super_users: str | list[str] = []

    @field_validator("super_users", mode="before")
    @classmethod
    def parse_super_users(cls, v: any) -> list[str]:
        if isinstance(v, str):
            cleaned = v.strip()
            if not cleaned:
                return []
            return [item.strip().lower() for item in cleaned.split(",") if item.strip()]
        if isinstance(v, list):
            return [str(item).strip().lower() for item in v]
        return v

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: any) -> list[str]:
        if isinstance(v, str):
            cleaned_v = v.strip()
            try:
                parsed = json.loads(cleaned_v)
                if isinstance(parsed, list):
                    return [str(item) for item in parsed]
            except json.JSONDecodeError:
                pass
            
            if cleaned_v.startswith("[") and cleaned_v.endswith("]"):
                cleaned_v = cleaned_v[1:-1].strip()
                
            return [item.strip() for item in cleaned_v.split(",") if item.strip()]
        if isinstance(v, list):
            return [str(item) for item in v]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()

