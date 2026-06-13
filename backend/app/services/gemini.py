import json
import random
import google.generativeai as genai
from google.ai import generativelanguage as glm
from fastapi import HTTPException, status
from app.core.config import settings
from pydantic import BaseModel, Field


def call_generative_model(contents, generation_config=None, primary_model="gemini-2.5-flash", fallback_model="gemini-3.1-flash-lite"):
    """
    Calls the primary Gemini model, and falls back to a lite model if any error/quota exhaustion occurs.
    Supports load-balancing key rotation if multiple keys are provided as comma-separated values in settings.gemini_api_key.
    """
    keys_str = settings.gemini_api_key or ""
    keys = [k.strip() for k in keys_str.split(",") if k.strip()]

    if not keys:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your backend/.env file."
        )

    # Shuffle keys to distribute traffic randomly and avoid local congestion
    shuffled_keys = list(keys)
    random.shuffle(shuffled_keys)

    last_error = None

    # ── Try primary model with rotated keys ──────────────────────────────────
    for i, key in enumerate(shuffled_keys):
        try:
            client = glm.GenerativeServiceClient(client_options={'api_key': key})
            model = genai.GenerativeModel(primary_model)
            model._client = client
            return model.generate_content(contents, generation_config=generation_config)
        except Exception as e:
            last_error = e
            print(f"Error calling primary model {primary_model} with key index {i}: {e}. Trying next key...")
            continue

    # ── Fallback to lite model with rotated keys ──────────────────────────────
    print(f"All keys failed on primary model {primary_model}. Attempting fallback to {fallback_model}...")
    for i, key in enumerate(shuffled_keys):
        try:
            client = glm.GenerativeServiceClient(client_options={'api_key': key})
            model = genai.GenerativeModel(fallback_model)
            model._client = client
            return model.generate_content(contents, generation_config=generation_config)
        except Exception as e:
            last_error = e
            print(f"Error calling fallback model {fallback_model} with key index {i}: {e}. Trying next key...")
            continue

    # If all keys failed for both primary and fallback, raise the last encountered error
    raise last_error if last_error else RuntimeError("All Gemini API keys failed.")


class GeneratedTopic(BaseModel):
    title: str = Field(description="A short, engaging title for the speaking topic")
    prompt: str = Field(description="The primary question or prompt for the user to answer in their speech")
    context: str = Field(description="Brief background or situational context for the prompt")
    suggested_points: list[str] = Field(description="A list of 3 suggested talking points or questions the speaker can address")


class TopicListResponse(BaseModel):
    topics: list[GeneratedTopic]


def generate_speaking_topics(category: str, difficulty: str, count: int = 1, custom_topic: str = None) -> TopicListResponse:
    """
    Calls the Gemini API to generate public speaking prompts in a structured JSON schema.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your backend/.env file."
        )

    if custom_topic and custom_topic.strip():
        prompt_text = f"""
        You are a professional public speaking coach.
        The user has provided their own custom topic/theme: "{custom_topic.strip()}".
        
        You MUST generate a speaking prompt that is strictly about or directly based on their custom topic/theme. Do not generate a generic prompt.
        
        Tailor the prompt's style to the following parameters:
        - Category: {category} (If category is 'impromptu', structure it as an impromptu speaking prompt about their theme. If it is 'interview', structure it as a job interview question related to their theme. If it is 'persuasive', structure it as a persuasive argument prompt. If it is 'warmup', make it an icebreaker prompt).
        - Difficulty Level: {difficulty}
        
        You MUST return a JSON object with a "topics" array. Each topic object MUST contain ALL of these four fields — do not omit any:
        1. "title": A short, engaging title (string).
        2. "prompt": The primary question or prompt for the user to answer in their speech (string).
        3. "context": Brief background or situational context for the prompt (string).
        4. "suggested_points": A JSON array of exactly 3 suggested talking points (list of strings).
        
        Return exactly {count} topic(s) in the topics array.
        """
    else:
        prompt_text = f"""
        You are a professional public speaking coach.
        Generate a list containing exactly {count} public speaking topic(s).
        Category: {category}
        Difficulty Level: {difficulty}

        You MUST return a JSON object with a "topics" array. Each topic object MUST contain ALL of these four fields — do not omit any:
        1. "title": A short, engaging title (string).
        2. "prompt": The primary question or prompt for the user to answer in their speech (string).
        3. "context": Brief background or situational context for the prompt (string).
        4. "suggested_points": A JSON array of exactly 3 suggested talking points (list of strings).

        Ensure each topic prompt is engaging, creative, realistic, and matches the difficulty level.
        """

    try:
        response = call_generative_model(
            prompt_text,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": TopicListResponse,
            }
        )

        data = json.loads(response.text)

        # ── Defensive normalisation ───────────────────────────────────────────
        # Some models (especially the lite fallback) occasionally return topic
        # objects that are missing required fields. We fill in sensible defaults
        # so Pydantic validation never fails with a 500 error.
        raw_topics = data.get("topics", [data] if isinstance(data, dict) else [])
        cleaned_topics = []
        for t in raw_topics:
            if not isinstance(t, dict):
                continue
            title = t.get("title") or "Speaking Topic"
            cleaned_topics.append({
                "title": title,
                "prompt": t.get("prompt") or f"Share your thoughts on the topic: \"{title}\".",
                "context": t.get("context") or "Reflect on your personal experiences and perspectives related to this topic.",
                "suggested_points": t.get("suggested_points") or [
                    "Start with a brief personal anecdote or example.",
                    "Explain why this topic matters to you or your audience.",
                    "Conclude with a clear takeaway or call to action.",
                ],
            })

        if not cleaned_topics:
            raise ValueError("Gemini returned an empty topics list.")

        return TopicListResponse(topics=cleaned_topics)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini topic generation failed: {str(e)}",
        )


class LexiconSuggestion(BaseModel):
    original_word: str = Field(description="The word or short phrase used by the speaker that can be improved")
    suggested_replacement: str = Field(description="A stronger, higher-degree, or more precise vocabulary choice / synonym")
    explanation: str = Field(description="Brief explanation of why the replacement is better or how it elevates the speech")


class SpeechEvaluation(BaseModel):
    overall_score: int = Field(description="Overall rating between 0 and 100")
    pronunciation_score: int = Field(description="Pronunciation clarity and articulation between 0 and 100")
    fluency_score: int = Field(description="Pacing, pausing, and overall speech flow between 0 and 100")
    grammar_score: int = Field(description="Grammatical accuracy between 0 and 100")
    content_score: int = Field(description="Relevance to prompt and structure of argument between 0 and 100")
    lexicon_score: int = Field(description="Lexical richness, vocabulary variety, and word choice appropriateness between 0 and 100")
    written_feedback: str = Field(description="Detailed constructive written coaching feedback listing strengths and points for improvement")
    lexicon_suggestions: list[LexiconSuggestion] = Field(description="List of specific vocabulary suggestions to upgrade common words used in the speech to higher-degree/stronger synonyms")
    counter_argument: str | None = Field(description="Only populate if the topic category is 'debate'. Provide a professional, constructive counter-argument to the speaker's stance. If not debate mode, return an empty string.")
    challenge_questions: list[str] = Field(description="Only populate if the topic category is 'debate'. Provide 2-3 specific challenge questions directly addressing the speaker's position. If not debate mode, return an empty list.")


def transcribe_audio_bytes(audio_bytes: bytes, mime_type: str) -> str:
    """
    Transcribes speech audio bytes using Gemini 1.5 Flash.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured."
        )
    
    try:
        # Clean optional parameters like audio/webm;codecs=opus to get standard mime type
        clean_mime = mime_type.split(";")[0].strip()
        
        audio_part = {
            "mime_type": clean_mime,
            "data": audio_bytes
        }
        
        prompt = (
            "Transcribe the following speech recording audio into clear text exactly as spoken. "
            "Do not summarize, do not translate, and do not add any comments or notes. "
            "Ensure you capture all words, including filler words (like 'um', 'ah', 'like', 'so') and any grammatical slips.\n\n"
            "CRITICAL AUDITORY INSTRUCTION FOR PACING AND BREAKS:\n"
            "You must analyze the pauses, silence duration, and pacing of the speaker's audio:\n"
            "1. Identify appropriate places where the speaker took a correct pause for pacing/breathing, or where they SHOULD have paused to improve pacing. Insert the exact tag '[suggest break]' (including brackets) at these locations in the text.\n"
            "2. Identify awkward, disjointed pauses where the speaker hesitated or stopped speaking in the middle of a continuous phrase or grammatical unit. Insert the exact tag '[do not break]' (including brackets) at these locations in the text.\n"
            "Keep all other words verbatim. Do not add any other notes or markdown styling."
        )
        
        response = call_generative_model([audio_part, prompt])
        return response.text.strip()
    except Exception as e:
        raise Exception(f"Gemini transcription failed: {str(e)}")


def evaluate_speech_session(transcript: str, topic_title: str, topic_prompt: str, category: str = None) -> SpeechEvaluation:
    """
    Evaluates a speech transcript against the selected topic details using Gemini 1.5 Flash.
    Returns structured scores and feedback.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured."
        )
    
    prompt = f"""
    You are a professional public speaking coach.
    Analyze the following speech transcript and evaluate it against the practice topic details.
    
    Topic Title: "{topic_title}"
    Topic Prompt: "{topic_prompt}"
    Topic Category: "{category or 'impromptu'}"
    
    Speech Transcript:
    "{transcript}"
    
    Evaluate the speech on a scale of 0 to 100 for each of the following categories:
    1. Overall Score: Your total assessment of the speech's effectiveness.
    2. Pronunciation: Articulation, speech clarity, and how easy it was to understand.
    3. Fluency: Speech pacing, natural pausing, and flow of speaking (look for filler words or disjointed phrasing in the text).
    4. Grammar: Sentence structure and grammatical correctness.
    5. Content: Prompt relevance, organization of ideas, and relevance to the topic.
    6. Lexicon: Lexical richness, vocabulary variety, and word choice appropriateness. Rate this on how effectively the speaker uses precise, high-degree words rather than repetitive, basic vocabulary.
    
    CRITICAL SCORING RULES FOR ACCURACY AND GRANULARITY:
    - Do NOT round scores to multiples of 5 or 10. Grade dynamically using the entire 0-100 range of integers (e.g., 73, 84, 69) based on the specific criteria.
    - Two speeches of slightly different quality must receive different, non-rounded scores.
    - Standard Rubric Guidelines:
      * Fluency Score: Start at 100. Deduct 2 points for every filler word detected in the transcript (e.g. "um", "ah", "like", "so", "well" when used as hesitations). Deduct 5 points for disjointed phrasing or repetitive words.
      * Grammar Score: Start at 100. Deduct 4 points for each grammatical error, tense inconsistency, or subject-verb disagreement.
      * Lexicon Score: Evaluate the ratio of unique, precise, and high-degree vocabulary to basic repetitive words. Low diversity or repetitive use of simple words (e.g. "good", "nice", "very") must result in a lower score (e.g., below 70).
    
    Lexicon Suggestions:
    Provide a list of specific vocabulary suggestions (lexicon_suggestions) to upgrade common, basic, or repetitive words used by the speaker in the transcript to stronger, more precise, or more engaging synonyms that sound natural and eloquent in spoken public speaking.
    
    CRITICAL INSTRUCTION FOR VOCABULARY UPGRADES:
    - ONLY suggest upgrades when a basic, weak, or repetitive word (e.g. "very", "good", "nice", "bad", "stuff", "thing", "really", "huge") is used and an upgrade makes the speech clearly better. Do NOT force suggestions for normal, appropriate conversational words. If no upgrades are needed, return an empty list.
    - DO NOT suggest words or phrases that are overly formal, academic, archaic, pretentious, or robotic (e.g., do NOT suggest upgrading "favorite person" to "cherished individual", "makes me happy" to "brings me profound contentment", or "talk to" to "converse with").
    - The suggestions must feel natural, conversational, authentic, and engaging when spoken aloud in a speech, rather than sounding like someone reading a thesaurus.
    - Examples of GOOD upgrades: "good" -> "impactful" or "valuable"; "very bad" -> "detrimental"; "big problem" -> "significant challenge"; "think" -> "believe" or "assert"; "stuff" -> "aspects" or "elements".
    - Each suggestion must include a brief explanation showing how it elevates the speech without making it sound forced.
    
    Debate Mode Stance (Only if Topic Category is "debate"):
    - Analyze the stance and argument the speaker took in the transcript.
    - Generate a professional, compelling, and constructive counter-argument (counter_argument) challenging the speaker's position.
    - IMPORTANT: You MUST format the counter_argument as a clean, brief bulleted list (using clear markdown bullets like "- Point 1\n- Point 2") containing 2-3 distinct counter-arguments, using simple and clear language so it is easy to understand. Do not return a single long paragraph.
    - Generate 2-3 specific challenge questions (challenge_questions) directly addressing their arguments to prompt deeper critical thinking and self-reflection on alternative viewpoints.
    - If the category is NOT "debate", leave counter_argument as null and challenge_questions as an empty list.

    Provide the written coaching feedback (written_feedback) as a clean, structured list of brief bullet points.
    You MUST format the string with explicit newlines ("\n") between the section headings and between each bullet point to ensure proper spacing.
    Example of the exact string format you should return:
    "• **Strengths:**\n- [Concise strength point, 1-2 sentences]\n- [Another concise strength, 1-2 sentences]\n\n• **Areas to Improve:**\n- [Concise actionable tip, 1-2 sentences]\n- [Another concise actionable tip, 1-2 sentences]"
    
    Keep the feedback encouraging, professional, and concise. Do not write a long paragraph introduction or conclusion.
    """
    
    try:
        response = call_generative_model(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": SpeechEvaluation,
            }
        )
        
        data = json.loads(response.text)
        return SpeechEvaluation(**data)
    except Exception as e:
        raise Exception(f"Gemini evaluation failed: {str(e)}")
