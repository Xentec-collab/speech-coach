import json
import google.generativeai as genai
from fastapi import HTTPException, status
from app.core.config import settings
from pydantic import BaseModel, Field


class GeneratedTopic(BaseModel):
    title: str = Field(description="A short, engaging title for the speaking topic")
    prompt: str = Field(description="The primary question or prompt for the user to answer in their speech")
    context: str = Field(description="Brief background or situational context for the prompt")
    suggested_points: list[str] = Field(description="A list of 3 suggested talking points or questions the speaker can address")


class TopicListResponse(BaseModel):
    topics: list[GeneratedTopic]


def generate_speaking_topics(category: str, difficulty: str, count: int = 1) -> TopicListResponse:
    """
    Calls the Gemini API to generate public speaking prompts in a structured JSON schema.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your backend/.env file."
        )

    # Configure Google Generative AI
    genai.configure(api_key=settings.gemini_api_key)

    prompt_text = f"""
    You are a professional public speaking coach.
    Generate a list containing exactly {count} public speaking topic(s).
    Category: {category}
    Difficulty Level: {difficulty}

    Ensure each topic prompt is engaging, creative, realistic, and matches the difficulty level.
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(
            prompt_text,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": TopicListResponse,
            }
        )

        data = json.loads(response.text)
        return TopicListResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini topic generation failed: {str(e)}",
        )
