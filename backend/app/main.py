from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Trigger reload of env variables
from app.core.config import settings
from app.routes.auth import router as auth_router
from app.routes.topics import router as topics_router
from app.routes.speeches import router as speeches_router
from app.routes.monetization import router as monetization_router
from app.routes.user import router as user_router

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
app.include_router(topics_router, prefix="/api/topics", tags=["topics"])
app.include_router(speeches_router, prefix="/api/speeches", tags=["speeches"])
app.include_router(monetization_router, prefix="/api/monetization", tags=["monetization"])
app.include_router(user_router, prefix="/api/user", tags=["user"])



@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}

