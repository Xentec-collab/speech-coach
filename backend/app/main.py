from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.auth import router as auth_router

app = FastAPI(
    title="AI Public Speaking Coach API",
    version="0.1.0",
    description="Backend API for the AI Public Speaking Coach SaaS.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

