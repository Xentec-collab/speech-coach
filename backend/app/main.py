from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# Trigger reload of env variables
from app.core.config import settings
from app.routes.auth import router as auth_router
from app.routes.topics import router as topics_router
from app.routes.speeches import router as speeches_router
from app.routes.monetization import router as monetization_router
from app.routes.user import router as user_router
from app.routes.interview_bank import router as interviews_router
from app.routes.interview_sessions import router as sessions_router
from app.routes.knowledge import router as knowledge_router
from app.routes.ai_coach import router as ai_coach_router

app = FastAPI(
    title="AI Public Speaking Coach API",
    version="0.1.0",
    description="Backend API for the AI Public Speaking Coach SaaS.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(topics_router, prefix="/api/topics", tags=["topics"])
app.include_router(speeches_router, prefix="/api/speeches", tags=["speeches"])
app.include_router(monetization_router, prefix="/api/monetization", tags=["monetization"])
app.include_router(user_router, prefix="/api/user", tags=["user"])
app.include_router(interviews_router, prefix="/api/interviews", tags=["interviews"])
app.include_router(sessions_router, prefix="/api/interviews/sessions", tags=["sessions"])
app.include_router(knowledge_router, prefix="/api/knowledge", tags=["knowledge"])
app.include_router(ai_coach_router, prefix="/api/coach", tags=["coach"])


@app.get("/")
def read_root():
    return {"status": "healthy", "service": "AI Public Speaking Coach API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
