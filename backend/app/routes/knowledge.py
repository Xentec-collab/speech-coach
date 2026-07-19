import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from app.services.supabase import get_current_user, supabase

router = APIRouter()

# ── Seed Data ─────────────────────────────────────────────────────────────────
SEED_ARTICLES = [
    {
        "track": "cat_gdpi",
        "category": "Personal Introduction",
        "title": "How to Answer: 'Tell Me About Yourself'",
        "content": """# Mastering the 'Tell Me About Yourself' Question

This is the most common opening question in MBA interviews. Your answer sets the tone for the rest of the interview.

## The Present-Past-Future Framework

A structured way to answer is the **Present-Past-Future** model:

1. **Present (30 seconds)**: Talk about your current role, key responsibilities, and recent achievements.
2. **Past (45 seconds)**: Briefly detail your academic background and previous relevant work projects or internship experiences.
3. **Future (45 seconds)**: Transition into why you are pursuing an MBA now, and how it aligns with your future career goals.

---

## Example Structure
* **Introduction**: "I am a software engineer with 2 years of experience at TechCorp..."
* **Academic/Professional Highlights**: "During my time at TechCorp, I led a database migration project that reduced load times by 20%..."
* **Transition**: "While I enjoy the technical aspects, I want to pivot into product management, which is why I am looking to join an MBA program..."

> [!TIP]
> Keep your answer under 2 minutes. Focus on achievements rather than listing your resume bullets.
""",
        "difficulty": "easy",
        "tags": ["introduction", "personal", "mba"]
    },
    {
        "track": "cat_gdpi",
        "category": "Why MBA",
        "title": "Structuring Your 'Why MBA' Narrative",
        "content": """# Crafting Your 'Why MBA' Answer

Every business school interviewer wants to know why you need an MBA and why you need it *now*.

## Key Elements of a Strong Answer

1. **Identify the Skill Gap**: Explain the business, leadership, or analytical skills you currently lack to reach your long-term goals.
2. **Course Fit**: Mention specific electives, clubs, and b-school opportunities that will fill this gap.
3. **Pacing**: Connect your past progression to show that this is the logical next step in your career.

---

## Common Pitfalls to Avoid
* **Too Generic**: Saying "I want to network and get a higher salary" is a red flag. Be specific about your aspirations.
* **Bad Pacing**: If you cannot explain why you need an MBA *now* instead of in 2 years, you will struggle to convince the panel.

> [!IMPORTANT]
> Research the school's curriculum and reference 1-2 specific courses or professors in your response.
""",
        "difficulty": "medium",
        "tags": ["why_mba", "career_goals", "personal"]
    },
    {
        "track": "cat_gdpi",
        "category": "Leadership",
        "title": "Leadership Stories for MBA Interviews",
        "content": """# How to Tell Leadership Stories

MBA programs look for future leaders. You must demonstrate leadership potential through concrete stories.

## The STAR Method
Always structure your behavioral answers using the STAR method:

* **Situation**: Set the context. What was the project or conflict?
* **Task**: What was your responsibility? What goal did you need to meet?
* **Action**: What did *you* specifically do? Highlight your soft skills and decisions.
* **Result**: What was the outcome? Use quantifiable metrics if possible (e.g., "completed 2 weeks early").

---

## Leadership Competencies to Highlight
* **Influence without Authority**: Getting peers to agree to a plan.
* **Conflict Resolution**: How you resolved a disagreement constructively.
* **Initiative**: Identifying a problem and building a solution without being asked.
""",
        "difficulty": "medium",
        "tags": ["leadership", "behavioral", "star_method"]
    },
    {
        "track": "software_engineering",
        "category": "DSA",
        "title": "DSA Preparation: Patterns over Problems",
        "content": """# Mastering DSA: Patterns over Problems

Instead of memorizing hundreds of LeetCode questions, focus on mastering foundational patterns.

## Essential Patterns

1. **Two Pointers**: Used for sorted arrays/lists to find pairs or scan elements from both ends.
2. **Sliding Window**: Ideal for subarrays/substring problems where you need to track a sub-range.
3. **Fast and Slow Pointers**: Useful for linked lists (cycle detection).
4. **BFS / DFS**: Tree and graph traversals. BFS is best for shortest path, DFS for deep search/backtracking.

---

## How to Prepare
* Spend 70% of your time understanding *why* a pattern fits a problem.
* Practice writing clean, readable code. In real interviews, code structure and variable naming matter as much as time complexity.
""",
        "difficulty": "medium",
        "tags": ["dsa", "algorithms", "technical"]
    },
    {
        "track": "software_engineering",
        "category": "System Design",
        "title": "System Design Fundamentals: Scaling 101",
        "content": """# System Design scaling Fundamentals

Scale is at the core of all system design interviews. Here are the building blocks:

## Vertical vs Horizontal Scaling
* **Vertical (Scale Up)**: Adding more power (CPU, RAM) to an existing server. Simple, but has a hard physical limit.
* **Horizontal (Scale Out)**: Adding more servers to the resource pool. Unlimited scale, but introduces complexity (network, sync).

---

## Key Concepts
1. **Load Balancers**: Distribute incoming network traffic across multiple servers.
2. **Caching**: Storing hot data in memory (Redis, Memcached) to reduce database load.
3. **Database Sharding**: Splitting database tables horizontally across multiple databases.
4. **Asynchronous Processing**: Using message queues (RabbitMQ, Kafka) for slow tasks.
""",
        "difficulty": "hard",
        "tags": ["system_design", "scaling", "architecture"]
    },
    {
        "track": "software_engineering",
        "category": "Behavioral",
        "title": "Mastering Behavioral Rounds: STAR Technique",
        "content": """# Technical Behavioral Interviews

Companies like Amazon, Google, and Meta place heavy emphasis on behavioral traits.

## Core Behavioral Themes

* **Handling Conflict**: "Tell me about a time you disagreed with a manager."
* **Failure and Resilience**: "Describe a technical project that failed and what you learned."
* **Dealing with Ambiguity**: "Tell me about a time you had to build something with unclear requirements."

---

## Actionable Strategy
* Prepare 4-5 versatile stories from your past internships or projects.
* Ensure you focus on *your* actions, not just what the team did.
* Always end with a strong **Reflection/Lesson Learned** section.
""",
        "difficulty": "easy",
        "tags": ["behavioral", "star_method", "hr"]
    },
    {
        "track": "upsc_interview",
        "category": "Ethics",
        "title": "Ethics and Integrity in Civil Services",
        "content": """# Addressing Ethical Scenarios in UPSC

The Personality Test evaluates your moral compass, integrity, and adherence to constitutional values.

## Key Principles of Public Administration

* **Objectivity**: Making decisions based on merit and evidence rather than personal bias.
* **Empathy**: Sensitivity towards the weaker and marginalized sections of society.
* **Impartiality**: Serving the public interest without partisan political alignment.

---

## Analytical Framework for Situational Questions
1. **Identify the stakeholders**: Who is affected by your decision?
2. **Weigh the options**: What are the legal, moral, and administrative implications of each option?
3. **State your course of action**: Defend a balanced, legal, and humane solution.
""",
        "difficulty": "hard",
        "tags": ["ethics", "governance", "upsc"]
    },
    {
        "track": "upsc_interview",
        "category": "Current Affairs",
        "title": "Analyzing Current Affairs for UPSC Interview",
        "content": """# Preparing Current Affairs for the Board

The UPSC board expects you to be aware of national and international developments, but more importantly, to have a balanced perspective.

## Guidelines for Opinion Formation

1. **Be Constructive**: Avoid outright, aggressive criticism. If criticizing a policy, suggest constructive alternatives.
2. **Constitution First**: Align your opinions with the Directive Principles and Constitutional Values.
3. **Acknowledge Complexity**: Real-world issues are rarely black and white. Frame answers with "On one hand... but on the other hand..."

---

## Recommended Practice
* Read editorial sections of Hindu or Indian Express daily.
* Focus on policy rationale rather than political controversy.
""",
        "difficulty": "medium",
        "tags": ["current_affairs", "governance", "upsc"]
    }
]

# Run dynamic seed check
def seed_knowledge_articles():
    try:
        # Check if table has any data
        res = supabase.table("knowledge_articles").select("id").limit(1).execute()
        if not res.data:
            print("Seeding default knowledge articles...")
            supabase.table("knowledge_articles").insert(SEED_ARTICLES).execute()
            print("Successfully seeded knowledge articles.")
    except Exception as e:
        print(f"Error seeding knowledge articles: {e}")

# Seed on import
seed_knowledge_articles()


# ── API Endpoints ─────────────────────────────────────────────────────────────

@router.get("/tracks")
def get_knowledge_tracks(current_user: dict = Depends(get_current_user)):
    """
    Returns a distinct list of tracks available in the knowledge articles database.
    """
    try:
        res = supabase.table("knowledge_articles").select("track").execute()
        if not res.data:
            return []
        tracks = sorted(list(set([row["track"] for row in res.data])))
        return tracks
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch tracks: {str(e)}"
        )


@router.get("/categories")
def get_knowledge_categories(
    track: str = Query(None, description="Optional track filter"),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns a distinct list of categories, optionally filtered by track.
    """
    try:
        query = supabase.table("knowledge_articles").select("category")
        if track:
            query = query.eq("track", track)
        res = query.execute()
        if not res.data:
            return []
        categories = sorted(list(set([row["category"] for row in res.data])))
        return categories
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch categories: {str(e)}"
        )


@router.get("/articles")
def list_knowledge_articles(
    track: str = Query(None, description="Filter by track"),
    category: str = Query(None, description="Filter by category"),
    difficulty: str = Query(None, description="Filter by difficulty"),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns a list of knowledge articles matching filters, enriched with completion progress.
    """
    try:
        # 1. Fetch articles
        query = supabase.table("knowledge_articles").select("*")
        if track:
            query = query.eq("track", track)
        if category:
            query = query.eq("category", category)
        if difficulty:
            query = query.eq("difficulty", difficulty.lower())
        
        art_res = query.execute()
        articles = art_res.data or []

        # 2. Fetch completion progress
        prog_res = supabase.table("article_progress") \
            .select("article_id, completed") \
            .eq("user_id", current_user["id"]) \
            .execute()
        
        completed_set = set([
            p["article_id"] for p in (prog_res.data or []) if p["completed"]
        ])

        # 3. Enrich
        for art in articles:
            art["is_completed"] = art["id"] in completed_set

        return articles
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list articles: {str(e)}"
        )


@router.get("/articles/{article_id}")
def get_article_details(article_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieves full details of a specific knowledge article and its completion status.
    """
    try:
        # Fetch article
        res = supabase.table("knowledge_articles").select("*").eq("id", article_id).execute()
        if not res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")
        
        article = res.data[0]

        # Fetch progress
        prog_res = supabase.table("article_progress") \
            .select("completed") \
            .eq("user_id", current_user["id"]) \
            .eq("article_id", article_id) \
            .execute()
        
        article["is_completed"] = prog_res.data[0]["completed"] if prog_res.data else False
        return article
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve article details: {str(e)}"
        )


@router.post("/articles/{article_id}/complete")
def mark_article_completed(article_id: str, current_user: dict = Depends(get_current_user)):
    """
    Marks the given article as completed for the authenticated user.
    """
    try:
        # Verify article exists
        check_res = supabase.table("knowledge_articles").select("id").eq("id", article_id).execute()
        if not check_res.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Article not found.")

        progress_payload = {
            "user_id": current_user["id"],
            "article_id": article_id,
            "completed": True,
            "completed_at": datetime.utcnow().isoformat()
        }

        # Upsert progress status
        supabase.table("article_progress").upsert(
            progress_payload,
            on_conflict="user_id,article_id"
        ).execute()

        return {"status": "success", "message": "Article marked as completed."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update article completion: {str(e)}"
        )


@router.get("/recommendations")
def get_learning_recommendations(current_user: dict = Depends(get_current_user)):
    """
    Returns AI recommendations based on identified weaknesses in the user's latest evaluations.
    """
    try:
        weakness_keywords = []

        # 1. Fetch user's latest completed interview session
        sess_res = supabase.table("interview_sessions") \
            .select("final_evaluation") \
            .eq("user_id", current_user["id"]) \
            .eq("status", "completed") \
            .order("completed_at", desc=True) \
            .limit(1) \
            .execute()
        
        if sess_res.data:
            sess = sess_res.data[0]
            eval_data = sess.get("final_evaluation") or {}
            weaknesses = eval_data.get("weaknesses") or []
            for w in weaknesses:
                weakness_keywords.extend(w.lower().split())

        # 2. Fetch user's latest completed speech attempts
        speech_res = supabase.table("speeches") \
            .select("feedback") \
            .eq("user_id", current_user["id"]) \
            .eq("status", "completed") \
            .order("created_at", desc=True) \
            .limit(3) \
            .execute()
        
        for s in (speech_res.data or []):
            feedback = s.get("feedback") or {}
            written = feedback.get("written_feedback") or ""
            weakness_keywords.extend(written.lower().split())

        # 3. Clean up keywords
        # Keep words containing alphabets, ignore short words, prepositions, etc.
        ignore_words = {"with", "that", "this", "their", "them", "then", "your", "from", "have", "been"}
        clean_keywords = set([
            w.strip(".,?!;:()\"'") for w in weakness_keywords 
            if len(w) > 3 and w not in ignore_words
        ])

        # 4. Fetch all articles
        all_res = supabase.table("knowledge_articles").select("*").execute()
        all_articles = all_res.data or []

        recommendations = []
        for art in all_articles:
            score = 0
            title_lower = art["title"].lower()
            category_lower = art["category"].lower()
            tags_lower = [t.lower() for t in (art.get("tags") or [])]

            # Exact keyword hits
            for word in clean_keywords:
                if word in title_lower:
                    score += 3
                if word in category_lower:
                    score += 5
                if word in tags_lower:
                    score += 4

            if score > 0:
                recommendations.append((score, art))

        # Sort recommendations by hit score
        recommendations.sort(key=lambda x: x[0], reverse=True)
        recommended_articles = [r[1] for r in recommendations[:4]]

        # Fallback if no matching weaknesses: return general articles
        if not recommended_articles and all_articles:
            recommended_articles = all_articles[:4]

        # 5. Enrich with completion status
        prog_res = supabase.table("article_progress") \
            .select("article_id, completed") \
            .eq("user_id", current_user["id"]) \
            .execute()
        
        completed_set = set([
            p["article_id"] for p in (prog_res.data or []) if p["completed"]
        ])

        for art in recommended_articles:
            art["is_completed"] = art["id"] in completed_set

        return recommended_articles
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve recommendations: {str(e)}"
        )
