from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.services.supabase import get_current_user, supabase

router = APIRouter()

ROADMAPS = {
    "cat_gdpi": {
        "label": "CAT GDPI & MBA",
        "description": "Preparation pathway for Top Business School admissions and Group Discussions.",
        "stages": [
            {"id": "intro", "label": "Personal Introduction", "difficulty": "easy", "category": "Personal Introduction"},
            {"id": "academics", "label": "Academics", "difficulty": "easy", "category": "Academics"},
            {"id": "work_exp", "label": "Work Experience", "difficulty": "medium", "category": "Work Experience"},
            {"id": "current_affairs", "label": "Current Affairs", "difficulty": "medium", "category": "Current Affairs"},
            {"id": "leadership", "label": "Leadership", "difficulty": "medium", "category": "Leadership"},
            {"id": "why_mba", "label": "Why MBA", "difficulty": "easy", "category": "Why MBA"},
            {"id": "mock", "label": "Mock Interview", "difficulty": "hard", "category": "Mock Interview"}
        ]
    },
    "upsc_interview": {
        "label": "UPSC Civil Services",
        "description": "Preparation pathway for the Civil Services Personality Test.",
        "stages": [
            {"id": "personal", "label": "Personal Background", "difficulty": "easy", "category": "Personal Background"},
            {"id": "subject", "label": "Graduation Subject", "difficulty": "easy", "category": "Graduation Subject"},
            {"id": "state", "label": "State Knowledge", "difficulty": "medium", "category": "State Knowledge"},
            {"id": "current_affairs", "label": "Current Affairs", "difficulty": "medium", "category": "Current Affairs"},
            {"id": "ethics", "label": "Ethics", "difficulty": "medium", "category": "Ethics"},
            {"id": "governance", "label": "Governance", "difficulty": "hard", "category": "Governance"},
            {"id": "mock", "label": "Mock Board", "difficulty": "hard", "category": "Mock Board"}
        ]
    },
    "software_engineering": {
        "label": "Software Engineering",
        "description": "Technical and behavioral pathway for Software Developer and Engineer roles.",
        "stages": [
            {"id": "behavioral", "label": "Behavioral", "difficulty": "easy", "category": "Behavioral"},
            {"id": "internship", "label": "Internships / Experience", "difficulty": "easy", "category": "Internships / Work Experience"},
            {"id": "projects", "label": "Projects", "difficulty": "medium", "category": "Projects"},
            {"id": "dsa", "label": "DSA & Algorithms", "difficulty": "medium", "category": "DSA"},
            {"id": "system_design", "label": "System Design", "difficulty": "hard", "category": "System Design"},
            {"id": "mock", "label": "Mock Technical Interview", "difficulty": "hard", "category": "Mock Interview"}
        ]
    }
}

@router.get("/types")
def get_interview_types(current_user: dict = Depends(get_current_user)):
    """
    Returns supported interview types, descriptions, and predefined roadmaps.
    """
    return ROADMAPS

@router.get("/categories")
def get_interview_categories(
    interview_type: str = Query(..., description="Interview type, e.g. cat_gdpi, upsc_interview"),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns available categories for a given interview type in the question bank.
    """
    if interview_type in ROADMAPS:
        return [stage["category"] for stage in ROADMAPS[interview_type]["stages"]]
    
    # Fallback to distinct query if type is custom or not in predefined list
    try:
        res = supabase.table("interview_question_bank") \
            .select("category") \
            .eq("interview_type", interview_type) \
            .execute()
        categories = list(set([row["category"] for row in res.data])) if res.data else []
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        )

@router.get("/random-question")
def get_random_question(
    interview_type: str = Query(..., description="Interview type"),
    difficulty: str = Query(None, description="Difficulty level (easy, medium, hard)"),
    category: str = Query(None, description="Roadmap category"),
    current_user: dict = Depends(get_current_user)
):
    """
    Retrieves a random question from the question bank matching the filters.
    """
    try:
        query = supabase.table("interview_question_bank").select("*").eq("interview_type", interview_type)
        if difficulty:
            query = query.eq("difficulty", difficulty.lower())
        if category:
            query = query.eq("category", category)
            
        res = query.execute()
        questions = res.data if res.data else []
        
        if not questions:
            # Fallback: ignore difficulty if no questions found matching difficulty
            if difficulty:
                query_fallback = supabase.table("interview_question_bank").select("*").eq("interview_type", interview_type)
                if category:
                    query_fallback = query_fallback.eq("category", category)
                res_fallback = query_fallback.execute()
                questions = res_fallback.data if res_fallback.data else []
                
        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No questions found for interview type '{interview_type}' and category '{category}'"
            )
            
        import random
        return random.choice(questions)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving random question: {str(e)}"
        )

@router.get("/question-bank-stats")
def get_interview_question_bank_stats(current_user: dict = Depends(get_current_user)):
    """
    Compiles track-specific progress, average scores, and weak areas.
    """
    try:
        # 1. Fetch user speeches with joined topics
        res = supabase.table("speeches") \
            .select("*, topics(*)") \
            .eq("user_id", current_user["id"]) \
            .eq("status", "completed") \
            .execute()
        
        speeches = res.data if res.data else []
        
        # 2. Compute stats per interview type
        stats_map = {}
        for track_id, config in ROADMAPS.items():
            # Filter speeches for this track
            track_speeches = [
                s for s in speeches 
                if s.get("topics") 
                and s["topics"].get("module_type") == "interview_preparation"
                and s["topics"].get("interview_type") == track_id
            ]
            
            # Calculate stats
            completed_count = len(track_speeches)
            avg_score = 0
            best_score = 0
            weak_areas = []
            
            if completed_count > 0:
                scores = [s["overall_score"] for s in track_speeches if s["overall_score"] is not None]
                if scores:
                    avg_score = round(sum(scores) / len(scores))
                    best_score = max(scores)
                    
                # Weak areas calculation: look at low sub-scores in feedback
                # confidence, professionalism, readiness, structure, relevance
                subscore_sums = {"confidence": 0, "professionalism": 0, "readiness": 0, "structure": 0, "relevance": 0}
                subscore_counts = {"confidence": 0, "professionalism": 0, "readiness": 0, "structure": 0, "relevance": 0}
                
                for s in track_speeches:
                    fb = s.get("feedback")
                    if isinstance(fb, dict) and "interview_metrics" in fb:
                        metrics = fb["interview_metrics"]
                        if isinstance(metrics, dict):
                            for k in subscore_sums.keys():
                                val = metrics.get(k)
                                if val is not None:
                                    subscore_sums[k] += val
                                    subscore_counts[k] += 1
                                    
                # Average subscores
                subscore_avgs = {}
                for k in subscore_sums.keys():
                    if subscore_counts[k] > 0:
                        subscore_avgs[k] = subscore_sums[k] / subscore_counts[k]
                        
                # Identify weak areas (subscores under 75 or lowest scores)
                sorted_subs = sorted(subscore_avgs.items(), key=lambda x: x[1])
                weak_areas = [item[0].capitalize() for item in sorted_subs if item[1] < 75][:2]
                if not weak_areas and sorted_subs:
                    weak_areas = [sorted_subs[0][0].capitalize()]
                    
            # Find which roadmap stages are completed
            stage_completion = {}
            for stage in config["stages"]:
                # Check if there is a completed speech matching this category
                stage_speeches = [
                    s for s in track_speeches 
                    if s["topics"].get("category") == stage["category"]
                ]
                if stage_speeches:
                    latest_speech = max(stage_speeches, key=lambda x: x["created_at"])
                    stage_completion[stage["id"]] = {
                        "completed": True,
                        "score": latest_speech["overall_score"],
                        "speech_id": latest_speech["id"]
                    }
                else:
                    stage_completion[stage["id"]] = {
                        "completed": False,
                        "score": None,
                        "speech_id": None
                    }
                    
            stats_map[track_id] = {
                "questions_practiced": completed_count,
                "average_score": avg_score,
                "best_score": best_score,
                "weak_areas": weak_areas,
                "stage_completion": stage_completion
            }
            
        return stats_map
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to compile stats: {str(e)}"
        )
