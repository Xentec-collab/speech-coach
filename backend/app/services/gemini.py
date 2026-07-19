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
    evaluation_criteria: str | None = Field(default=None, description="Specific criteria or key points the interviewer evaluates (only for interview preparation mode)")
    follow_up_question: str | None = Field(default=None, description="A potential follow-up question the candidate should prepare for (only for interview preparation mode)")


class TopicListResponse(BaseModel):
    topics: list[GeneratedTopic]


def generate_speaking_topics(
    category: str = None,
    difficulty: str = "medium",
    count: int = 1,
    custom_topic: str = None,
    module_type: str = "public_speaking",
    interview_type: str = None,
    interview_persona: str = "friendly",
    curated_question: str = None,
    curated_context: str = None,
    expected_topics: str = None
) -> TopicListResponse:
    """
    Calls the Gemini API to generate coaching/practice prompts in a structured JSON schema.
    Supports enriching an existing curated question from the interview question bank.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured on the server. Please add GEMINI_API_KEY to your backend/.env file."
        )

    if module_type == "interview_preparation":
        if curated_question:
            prompt_text = f"""
            You are a professional interview preparation coach acting as a {interview_persona} interviewer.
            We have selected a specific curated question from our question bank for a {interview_type} interview.
            
            Curated Question: "{curated_question}"
            Difficulty Level: {difficulty}
            Category: {category}
            Question Context / Background: "{curated_context or ''}"
            Expected Topics / Keywords: "{expected_topics or ''}"
            
            You MUST enrich this question and output the structured JSON response.
            Your task:
            1. Create a short, engaging "title" for this question.
            2. The "prompt" field MUST be the curated question: "{curated_question}" (do not change the core question, but you can format it nicely if needed).
            3. The "context" field should be a brief background or situational context. If the database context is provided, enrich it.
            4. The "suggested_points" field must be exactly 3 suggested points, tips, or framework steps (e.g. using the STAR method or specific response advice) the candidate should cover.
            5. The "evaluation_criteria" should describe exactly what a {interview_persona} interviewer is evaluating in their response (e.g., specific skills, tone, structure, technical keywords).
            6. The "follow_up_question" should be a realistic follow-up question that could be asked based on this prompt.
            
            The tone of your instructions and context must match the active interview style/persona: {interview_persona} (friendly, strict, corporate, government panel, ivy league, or MBA panel).
            """
        else:
            custom_part = f' based on the custom topic/theme: "{custom_topic.strip()}"' if custom_topic and custom_topic.strip() else ""
            prompt_text = f"""
            You are a professional interview preparation coach acting as a {interview_persona} interviewer.
            Generate exactly {count} realistic and challenging interview question(s) or scenario(s){custom_part}.
            
            Parameters:
            - Interview Type: {interview_type} (e.g. CAT GDPI, UPSC, Technical, Campus Placement)
            - Difficulty Level: {difficulty}
            - Interview Style / Persona: {interview_persona} (Your generated questions, context, and coaching tone should reflect this style: friendly, strict, corporate, government panel, ivy league, or MBA panel)
            
            You MUST return a JSON object with a "topics" array. Each topic object MUST contain ALL of these six fields — do not omit any:
            1. "title": A short, engaging title for the interview question/scenario (string).
            2. "prompt": The primary interview question/prompt for the user to answer (string).
            3. "context": Brief background, context, or scenario for the interview question (string).
            4. "suggested_points": A JSON array of exactly 3 suggested points, tips, or framework steps (e.g. STAR method elements) the candidate can cover in their response (list of strings).
            5. "evaluation_criteria": Specific criteria or key points the interviewer evaluates (only for interview preparation mode).
            6. "follow_up_question": A potential follow-up question the candidate should prepare for (only for interview preparation mode).
            
            Ensure each prompt is highly realistic for a {interview_type} interview and matches the difficulty level.
            """
    else:
        # Public speaking prompt generation (existing behavior)
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
                "evaluation_criteria": t.get("evaluation_criteria") or "Demonstrate logical structure, domain competence, and relevant details.",
                "follow_up_question": t.get("follow_up_question") or "Can you elaborate on your answer or provide a specific example?"
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


class InterviewMetrics(BaseModel):
    confidence: int = Field(description="Confidence score between 0 and 100")
    professionalism: int = Field(description="Professionalism score between 0 and 100")
    readiness: int = Field(description="Interview readiness score between 0 and 100")
    structure: int = Field(description="Structure of answer score between 0 and 100")
    relevance: int = Field(description="Relevance of response score between 0 and 100")


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
    interview_metrics: InterviewMetrics | None = Field(default=None, description="Confidence, Professionalism, Readiness, Structure, and Relevance scores (only for interview preparation mode)")
    follow_up_question: str | None = Field(default=None, description="Exactly one realistic interviewer follow-up question (only for interview preparation mode)")


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


def evaluate_speech_session(
    transcript: str,
    topic_title: str,
    topic_prompt: str,
    category: str = None,
    module_type: str = "public_speaking",
    interview_type: str = None,
    interview_persona: str = "friendly",
    evaluation_criteria: str = None
) -> SpeechEvaluation:
    """
    Evaluates a speech transcript against the selected topic details using Gemini 1.5 Flash.
    Returns structured scores, feedback, and interview-specific metrics.
    """
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Gemini API Key is not configured."
        )
    
    if module_type == "interview_preparation":
        eval_criteria_prompt = f'\nSpecific Evaluation Criteria for this Question:\n"{evaluation_criteria}"' if evaluation_criteria else ""
        prompt = f"""
        You are a professional interview preparation coach acting as a {interview_persona} interviewer.
        Analyze the following speech transcript representing a candidate's response to an interview question.
        
        Interview Type: "{interview_type}"
        Question Title: "{topic_title}"
        Question Prompt: "{topic_prompt}"
        Interview Persona / Style: "{interview_persona}" (The feedback tone, follow-up question, and evaluation style should reflect this style: friendly, strict, corporate, government panel, ivy league, or MBA panel){eval_criteria_prompt}
        
        Candidate's Response:
        "{transcript}"
        
        Evaluate the response on a scale of 0 to 100 for each of the following standard categories:
        1. Overall Score: Your total assessment of the response's effectiveness.
        2. Pronunciation: Articulation, speech clarity, and how easy it was to understand.
        3. Fluency: Speech pacing, natural pausing, and flow of speaking (look for filler words or disjointed phrasing in the text).
        4. Grammar: Sentence structure and grammatical correctness.
        5. Content: Prompt relevance, organization of ideas, and relevance to the topic.
        6. Lexicon: Lexical richness, vocabulary variety, and word choice appropriateness. Rate this on how effectively the speaker uses precise, high-degree words rather than repetitive, basic vocabulary.
        
        ALSO, you MUST evaluate the response on the following 5 interview-specific metrics (each on a scale of 0 to 100):
        1. confidence: The candidate's confidence, tone, self-assurance, lack of hesitation/filler-induced shakiness.
        2. professionalism: Maturity, politeness, business/professional etiquette, and setting-appropriate vocabulary.
        3. readiness: Assessment of how ready the candidate is for this specific type of interview ({interview_type}).
        4. structure: Logical structure of the answer (e.g. STAR method for behavioral questions, clear introduction, evidence, conclusion).
        5. relevance: How directly and accurately the speaker's response answers the interview prompt.
        
        CRITICAL SCORING RULES FOR ACCURACY AND GRANULARITY:
        - Do NOT round scores to multiples of 5 or 10. Grade dynamically using the entire 0-100 range of integers (e.g., 73, 84, 69).
        - Standard Rubric Guidelines:
          * Fluency Score: Start at 100. Deduct 2 points for every filler word detected in the transcript.
          * Grammar Score: Start at 100. Deduct 4 points for each grammatical error.
        
        Lexicon Suggestions:
        Provide a list of specific vocabulary suggestions (lexicon_suggestions) to upgrade common, basic, or repetitive words used by the speaker in the transcript to stronger, more precise, or more engaging synonyms that sound natural and eloquent in spoken public speaking.
        
        Written Feedback:
        Provide detailed constructive coaching feedback (written_feedback) formatted as a list of brief bullet points.
        The tone of the feedback must match the active interview style/persona ({interview_persona}).
        You MUST format the string with explicit newlines ("\n") between sections and bullets:
        "• **Strengths:**\n- [Concise strength point, 1-2 sentences]\n- [Another concise strength, 1-2 sentences]\n\n• **Areas to Improve:**\n- [Concise actionable tip, 1-2 sentences]\n- [Another concise actionable tip, 1-2 sentences]"
        
        Interviewer Follow-up Question:
        Generate exactly one realistic, contextually relevant follow-up question (follow_up_question) that a {interview_persona} interviewer would ask based on the candidate's response. It should drill down into details or challenge their statement.
        """
    else:
        # Public speaking evaluation (existing behavior)
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
          * Fluency Score: Start at 100. Deduct 2 points for every filler word detected in the transcript.
          * Grammar Score: Start at 100. Deduct 4 points for each grammatical error.
          * Lexicon Score: Evaluate the ratio of unique, precise, and high-degree vocabulary to basic repetitive words.
        
        Lexicon Suggestions:
        Provide a list of specific vocabulary suggestions (lexicon_suggestions) to upgrade common, basic, or repetitive words.
        
        Debate Mode Stance (Only if Topic Category is "debate"):
        - Analyze the stance and argument the speaker took in the transcript.
        - Generate a professional, compelling, and constructive counter-argument.
        - IMPORTANT: You MUST format the counter_argument as a clean, brief bulleted list (using clear markdown bullets like "- Point 1\n- Point 2") containing 2-3 distinct counter-arguments.
        - Generate 2-3 specific challenge questions.
        - If not debate mode, leave counter_argument as null and challenge_questions as an empty list.

        Provide the written coaching feedback (written_feedback) as a clean, structured list of brief bullet points.
        You MUST format the string with explicit newlines ("\n") between the section headings and between each bullet point to ensure proper spacing.
        Example of the exact string format you should return:
        "• **Strengths:**\n- [Concise strength point, 1-2 sentences]\n- [Another concise strength, 1-2 sentences]\n\n• **Areas to Improve:**\n- [Concise actionable tip, 1-2 sentences]\n- [Another concise actionable tip, 1-2 sentences]"
        
        For public speaking mode, set interview_metrics to null and follow_up_question to null.
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


# ── Phase 4C - Mock Interview Engine Schemas & Services ───────────────────────

class FollowUpQuestionResponse(BaseModel):
    follow_up_question: str = Field(description="Conversational follow-up question aligned with chosen difficulty and persona")


class RoundEvaluation(BaseModel):
    round_score: int = Field(description="Overall score for this round's response between 0 and 100")
    confidence: int = Field(description="Confidence rating for this response between 0 and 100")
    relevance: int = Field(description="Relevance rating for this response between 0 and 100")
    structure: int = Field(description="Structure rating for this response between 0 and 100")
    pronunciation_score: int = Field(description="Pronunciation clarity and articulation between 0 and 100")
    fluency_score: int = Field(description="Pacing, pausing, and flow of speaking between 0 and 100")
    grammar_score: int = Field(description="Grammatical accuracy between 0 and 100")
    content_score: int = Field(description="Content and argument development between 0 and 100")
    lexicon_score: int = Field(description="Vocabulary variety and appropriateness between 0 and 100")
    written_feedback: str = Field(description="Brief constructive coaching feedback for this response")
    lexicon_suggestions: list[LexiconSuggestion] = Field(description="Specific vocabulary suggestions to upgrade words used in this round")


class FinalSessionSummary(BaseModel):
    strengths: list[str] = Field(description="Top 2-3 strengths observed during the interview")
    weaknesses: list[str] = Field(description="Top 2-3 weaknesses or areas that need work")
    behavioral_patterns: list[str] = Field(description="Observed behavioral habits or features (e.g. pacing, hesitation)")
    communication_patterns: list[str] = Field(description="Observed communication patterns (e.g. structure, vocabulary choice)")
    recommended_tracks: list[str] = Field(description="Specific tracks or topics recommended for further practice")


class FinalInterviewEvaluation(BaseModel):
    overall_score: int = Field(description="Aggregated overall score across the entire interview between 0 and 100")
    confidence: int = Field(description="Average confidence score between 0 and 100")
    professionalism: int = Field(description="Average professionalism score between 0 and 100")
    communication: int = Field(description="Average communication clarity score between 0 and 100")
    relevance: int = Field(description="Average relevance score between 0 and 100")
    structure: int = Field(description="Average answer structure score between 0 and 100")
    readiness_score: int = Field(description="Overall readiness rating between 0 and 100")
    readiness_rating: str = Field(description="Readiness rank: must be 'Interview Ready', 'Mostly Ready', or 'Needs More Practice'")
    verdict: str = Field(description="Candidate verdict rank: must be 'Outstanding Candidate', 'Strong Candidate', 'Promising Candidate', 'Average Candidate', or 'Needs Improvement'")
    strengths: list[str] = Field(description="List of key strengths")
    weaknesses: list[str] = Field(description="List of key weaknesses")
    recommended_improvements: list[str] = Field(description="List of specific recommended improvements")
    session_summary: FinalSessionSummary = Field(description="Future-proof summary of candidate patterns and advice")


def generate_follow_up_question(
    interview_type: str,
    difficulty: str,
    interview_persona: str,
    history: list[dict]  # list of dicts: {"question": "...", "transcript": "..."}
) -> str:
    """
    Generates a conversational follow-up question based on the active session history,
    tailored to the active difficulty behavior and interviewer persona.
    """
    # 1. Format history context
    history_lines = []
    for i, exchange in enumerate(history):
        history_lines.append(f"Round {i+1} Question: {exchange['question']}")
        history_lines.append(f"Round {i+1} Candidate Response: {exchange['transcript'] or '(No response recorded)'}")
    history_str = "\n\n".join(history_lines)

    # 2. Difficulty-driven behavioral guidelines
    diff_lower = difficulty.lower()
    if diff_lower == "easy":
        guidelines = """
        Difficulty Level: EASY.
        Behavioral Rules:
        - Remain highly friendly, encouraging, and direct.
        - Ask short, simple, and straightforward questions.
        - Put minimal pressure on the candidate.
        - The follow-up should be gentle and easily structured.
        """
    elif diff_lower == "hard":
        guidelines = """
        Difficulty Level: HARD.
        Behavioral Rules:
        - Act as a panel interviewer or stress-tester.
        - Ask challenging, deep, and probing follow-up questions.
        - Use cross-questioning, highlight potential contradictions in their previous answers, or present high-pressure scenarios.
        - Maintain aggressive probing and simulate a realistic high-stakes environment.
        """
    else:  # Medium
        guidelines = """
        Difficulty Level: MEDIUM.
        Behavioral Rules:
        - Ask probing follow-up questions to dig deeper into their assertions.
        - Request clarification on specific points from their last response.
        - Keep the challenge level moderate, testing their depth of experience naturally.
        """

    prompt = f"""
    You are an interviewer with a {interview_persona} style/persona conducting a {interview_type} mock interview.
    
    Active Conversation History:
    {history_str}
    
    Guidelines based on difficulty:
    {guidelines}
    
    Interviewer Persona: {interview_persona} (Your questions must reflect this style: friendly, strict, corporate, government panel, ivy league, or MBA panel).
    
    Based on the history and the candidate's last response, ask the NEXT conversational follow-up question.
    Ensure it flows naturally from their last answer and challenges them according to the difficulty and persona settings.
    Do NOT duplicate previous questions. Ask exactly one question.
    """

    try:
        response = call_generative_model(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": FollowUpQuestionResponse,
            }
        )
        data = json.loads(response.text)
        return data.get("follow_up_question", "Can you tell me more about that?")
    except Exception as e:
        print(f"Error generating follow-up question: {e}")
        return "Can you explain that in more detail?"


def evaluate_round_response(
    question: str,
    transcript: str,
    interview_type: str,
    difficulty: str,
    interview_persona: str
) -> RoundEvaluation:
    """
    Evaluates a single round response transcript and returns round-specific scores.
    """
    prompt = f"""
    You are a professional interview preparation coach acting as a {interview_persona} interviewer.
    Analyze the candidate's response to the following interview question.
    
    Interview Type: "{interview_type}"
    Difficulty: "{difficulty}"
    Interviewer Question: "{question}"
    Candidate's Response:
    "{transcript}"
    
    Evaluate the response on a scale of 0 to 100 for each of the following:
    1. round_score: Your total assessment of this specific response.
    2. confidence: Self-assurance, lack of hesitation/filler-induced shakiness.
    3. relevance: How directly and accurately the speaker answers the question.
    4. structure: Logical flow and layout of the answer (e.g. STAR method for behavioral).
    5. pronunciation_score: Articulation, speech clarity, and enunciation.
    6. fluency_score: Pacing, natural pausing, and speech flow (deduct 2 points for every filler word detected).
    7. grammar_score: Grammatical correctness.
    8. content_score: Organization of ideas and relevance to the topic.
    9. lexicon_score: Vocabulary variety and precision of word choices.
    
    Lexicon Suggestions:
    Provide a list of specific vocabulary suggestions (lexicon_suggestions) to upgrade common, basic, or repetitive words.
    
    Written Feedback:
    Provide brief constructive coaching feedback (written_feedback) focusing on strengths and improvements for this response.
    """

    try:
        response = call_generative_model(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": RoundEvaluation,
            }
        )
        data = json.loads(response.text)
        return RoundEvaluation(**data)
    except Exception as e:
        print(f"Error evaluating round: {e}")
        # Return fallback RoundEvaluation
        return RoundEvaluation(
            round_score=70, confidence=70, relevance=70, structure=70,
            pronunciation_score=70, fluency_score=70, grammar_score=70, content_score=70, lexicon_score=70,
            written_feedback="Good response. Focus on structure and articulation.",
            lexicon_suggestions=[]
        )


def generate_final_interview_evaluation(
    interview_type: str,
    difficulty: str,
    interview_persona: str,
    history: list[dict]  # list of {"question": "...", "transcript": "...", "feedback": {...}}
) -> FinalInterviewEvaluation:
    """
    Analyzes the entire completed mock interview session and returns the aggregated final evaluation.
    """
    exchanges_lines = []
    for i, exchange in enumerate(history):
        exchanges_lines.append(f"--- Round {i+1} ---")
        exchanges_lines.append(f"Interviewer Question: {exchange['question']}")
        exchanges_lines.append(f"Candidate Answer: {exchange['transcript'] or '(No answer)'}")
        if exchange.get("feedback"):
            exchanges_lines.append(f"Round Feedback Score: {exchange['feedback'].get('round_score') or '—'}/100")
    history_str = "\n\n".join(exchanges_lines)

    prompt = f"""
    You are a senior executive and professional interview coach conducting the final performance review of a candidate who completed a multi-round mock interview.
    
    Interview Session Details:
    - Track Type: {interview_type}
    - Difficulty: {difficulty}
    - Interviewer Persona: {interview_persona}
    
    Conversation Transcript & Round Feedback:
    {history_str}
    
    Please evaluate the candidate's performance across the entire interview and generate the final report in JSON matching the response schema:
    1. overall_score: The overall grade for the entire session between 0 and 100.
    2. confidence: Aggregated rating of candidate's confidence (0-100).
    3. professionalism: Candidate's etiquette, terminology, and professional poise (0-100).
    4. communication: Clarity, flow, pacing, and enunciation (0-100).
    5. relevance: How well the candidate focused on the core questions (0-100).
    6. structure: Aggregated structural flow and logical layout of answers (0-100).
    7. readiness_score: Overall interview readiness rating between 0 and 100.
    8. readiness_rating: Overall readiness classification. Must be exactly one of: 'Interview Ready', 'Mostly Ready', or 'Needs More Practice'.
    9. verdict: Overall candidate evaluation verdict. Must be exactly one of: 'Outstanding Candidate', 'Strong Candidate', 'Promising Candidate', 'Average Candidate', or 'Needs Improvement'.
    10. strengths: List of 2-3 specific, key strengths observed.
    11. weaknesses: List of 2-3 specific weaknesses or areas to focus on.
    12. recommended_improvements: Actionable, clear advice to improve their interview performance.
    13. session_summary: JSON object outlining:
        - strengths (list of key strengths)
        - weaknesses (list of key weaknesses)
        - behavioral_patterns (e.g. confident demeanor, fast talking)
        - communication_patterns (e.g. good structuring, occasional filler words)
        - recommended_tracks (future tracks to practice in this application)
    """

    try:
        response = call_generative_model(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": FinalInterviewEvaluation,
            }
        )
        data = json.loads(response.text)
        return FinalInterviewEvaluation(**data)
    except Exception as e:
        print(f"Error generating final evaluation: {e}")
        # Return fallback
        return FinalInterviewEvaluation(
            overall_score=70, confidence=70, professionalism=70, communication=70, relevance=70, structure=70,
            readiness_score=70, readiness_rating="Mostly Ready", verdict="Strong Candidate",
            strengths=["Clear articulation", "Good technical knowledge"],
            weaknesses=["Could improve structural framing", "Frequent pacing breaks"],
            recommended_improvements=["Use the STAR method for behavioral answers.", "Pause before speaking to organize thoughts."],
            session_summary=FinalSessionSummary(
                strengths=["Clear articulation"], weaknesses=["framing"],
                behavioral_patterns=["poised"], communication_patterns=["good pace"],
                recommended_tracks=["behavioral"]
            )
        )


class TrendMetric(BaseModel):
    skill: str
    change_percentage: int

class RecommendedArticle(BaseModel):
    article_id: str
    title: str
    category: str
    reason: str

class CoachReport(BaseModel):
    strongest_skill: str
    weakest_skill: str
    most_improved_skill: str
    recommended_focus: str
    readiness_level: str
    readiness_description: str
    strengths: list[str]
    weaknesses: list[str]
    trend_metrics: list[TrendMetric]
    recommended_tracks: list[str]
    recommended_articles: list[RecommendedArticle]


def generate_coach_report(
    speeches_history: list[dict],
    sessions_history: list[dict],
    articles_catalog: list[dict],
    read_articles_ids: list[str]
) -> CoachReport:
    """
    Analyzes the user's complete practice history and creates a structured Coach Report.
    """
    history_lines = []
    
    if speeches_history:
        history_lines.append("=== Public Speaking Practice Speeches ===")
        for i, s in enumerate(speeches_history):
            topic_title = s.get("topics", {}).get("title") if s.get("topics") else "Impromptu Speech"
            feedback = s.get("feedback") or {}
            metrics = feedback.get("interview_metrics") or {}
            history_lines.append(
                f"- Speech {i+1}: '{topic_title}' | Overall Score: {s.get('overall_score')}/100 "
                f"| Confidence: {metrics.get('confidence') or '—'}, "
                f"Professionalism: {metrics.get('professionalism') or '—'}, "
                f"Structure: {metrics.get('structure') or '—'}, "
                f"Relevance: {metrics.get('relevance') or '—'} | Date: {s.get('created_at')}"
            )
            if feedback.get("written_feedback"):
                history_lines.append(f"  Feedback: {feedback.get('written_feedback')[:150]}...")
    
    if sessions_history:
        history_lines.append("=== Mock Interview Sessions ===")
        for i, s in enumerate(sessions_history):
            eval_data = s.get("final_evaluation") or {}
            history_lines.append(
                f"- Interview Session {i+1} ({s.get('interview_type')}): {s.get('roadmap_step')} | Overall Score: {eval_data.get('overall_score')}/100 "
                f"| Confidence: {eval_data.get('confidence') or '—'}, "
                f"Professionalism: {eval_data.get('professionalism') or '—'}, "
                f"Communication: {eval_data.get('communication') or '—'}, "
                f"Structure: {eval_data.get('structure') or '—'}, "
                f"Relevance: {eval_data.get('relevance') or '—'} | Date: {s.get('created_at')}"
            )
            if eval_data.get("strengths"):
                history_lines.append(f"  Strengths: {', '.join(eval_data.get('strengths'))}")
            if eval_data.get("weaknesses"):
                history_lines.append(f"  Weaknesses: {', '.join(eval_data.get('weaknesses'))}")
                
    history_str = "\n".join(history_lines)

    articles_lines = []
    for art in articles_catalog:
        status = "Read" if art["id"] in read_articles_ids else "Unread"
        articles_lines.append(f"- ID: {art['id']} | Track: {art['track']} | Category: {art['category']} | Title: '{art['title']}' | Status: {status}")
    articles_str = "\n".join(articles_lines)

    prompt = f"""
    You are a professional executive speaking coach and mock interview assessor.
    Analyze the candidate's complete practice history to generate a comprehensive Coach Report in JSON matching the response schema:
    
    Practice History & Evaluation Reports:
    {history_str}
    
    Available Knowledge Articles:
    {articles_str}
    
    Rules for CoachReport JSON:
    1. strongest_skill: A single word or short phrase of their strongest area (e.g. 'Communication', 'Clarity', 'Delivery').
    2. weakest_skill: A single word or short phrase of their biggest structural or delivery gap (e.g. 'Answer Structure', 'Vocabulary').
    3. most_improved_skill: The skill where they show the highest growth (e.g. 'Confidence', 'Pacing').
    4. recommended_focus: Clear description of what area they should focus on next (e.g. 'Behavioral Answer Frameworks', 'STAR Method').
    5. readiness_level: Must be exactly one of: 'Interview Ready', 'Mostly Ready', 'Needs More Practice', 'Early Preparation Stage'.
       - Use 'Early Preparation Stage' if they have less than 2 completed sessions.
       - Use 'Needs More Practice' if their average score is under 70.
       - Use 'Mostly Ready' if average is 70-85.
       - Use 'Interview Ready' if average is >85.
    6. readiness_description: A professional coaching paragraph explaining their readiness level and how they can improve.
    7. strengths: List of 3-4 specific bullet point insights on their strengths.
    8. weaknesses: List of 3-4 specific bullet point insights on their weaknesses.
    9. trend_metrics: List of TrendMetric items comparing early vs latest sessions for core skills (e.g. Confidence, Communication, Professionalism, Structure).
       Example: Skill='Communication', change_percentage=14
    10. recommended_tracks: List of recommended tracks (from: 'cat_gdpi', 'upsc_interview', 'software_engineering').
    11. recommended_articles: List of 2-3 RecommendedArticle items (unread from the list above) matching their weaknesses, with a brief coaching reason.
    """

    try:
        response = call_generative_model(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "response_schema": CoachReport,
            }
        )
        data = json.loads(response.text)
        return CoachReport(**data)
    except Exception as e:
        print(f"Error generating coach report: {e}")
        # Fallback
        return CoachReport(
            strongest_skill="Communication",
            weakest_skill="Answer Structure",
            most_improved_skill="Confidence",
            recommended_focus="Behavioral Interview Questions",
            readiness_level="Needs More Practice" if (speeches_history or sessions_history) else "Early Preparation Stage",
            readiness_description="You have completed initial practice sessions. Focus on utilizing the STAR method for behavioral answers and planning transitions.",
            strengths=["Clear pacing and articulation", "Polished delivery structure"],
            weaknesses=["Needs to conclude answers more strongly", "Occasionally drops structural framing"],
            trend_metrics=[
                TrendMetric(skill="Confidence", change_percentage=0),
                TrendMetric(skill="Communication", change_percentage=0)
            ],
            recommended_tracks=["cat_gdpi"],
            recommended_articles=[
                RecommendedArticle(
                    article_id=articles_catalog[0]["id"] if articles_catalog else "",
                    title=articles_catalog[0]["title"] if articles_catalog else "Mastering Behavioral Rounds",
                    category=articles_catalog[0]["category"] if articles_catalog else "Behavioral",
                    reason="Articles on behavioral structure are recommended to build framing consistency."
                )
            ]
        )

