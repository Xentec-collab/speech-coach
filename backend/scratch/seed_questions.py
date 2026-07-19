import os
import sys

# Add backend directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.supabase import supabase

def seed():
    questions = [
        # ── CAT GDPI ──────────────────────────────────────────────────────────
        {
            "interview_type": "cat_gdpi",
            "category": "Personal Introduction",
            "difficulty": "easy",
            "question": "Tell me about yourself. Walk me through your resume, highlighting key milestones.",
            "context": "Typical icebreaker in management interviews to judge communication and coherence.",
            "expected_topics": "background, education, work experience, achievements, aspirations"
        },
        {
            "interview_type": "cat_gdpi",
            "category": "Academics",
            "difficulty": "easy",
            "question": "Why did you choose your undergraduate major, and how do you think it prepares you for a career in management?",
            "context": "Testing the alignment of past academic choices with business management.",
            "expected_topics": "analytical skills, domain knowledge, practical application, cross-disciplinary skills"
        },
        {
            "interview_type": "cat_gdpi",
            "category": "Work Experience",
            "difficulty": "medium",
            "question": "Describe your role in your previous job. What was your most significant contribution or project, and what business impact did it have?",
            "context": "Probing professional competence and value addition in a corporate setting.",
            "expected_topics": "STAR method, quantifiable results, business value, teamwork, problem-solving"
        },
        {
            "interview_type": "cat_gdpi",
            "category": "Current Affairs",
            "difficulty": "medium",
            "question": "What is your perspective on the recent changes in the country's digital privacy laws and their impact on digital startups?",
            "context": "Gauging awareness of political/economic environments and analytical reasoning.",
            "expected_topics": "data protection, start-up ecosystem, regulatory compliance, consumer rights, trade-offs"
        },
        {
            "interview_type": "cat_gdpi",
            "category": "Leadership",
            "difficulty": "medium",
            "question": "Describe a situation where you had to lead a team through a difficult period of conflict or tight deadlines. How did you manage the team dynamic?",
            "context": "Assessing interpersonal skills, emotional intelligence, and leadership style.",
            "expected_topics": "conflict resolution, empathy, motivation, delegation, clear communication"
        },
        {
            "interview_type": "cat_gdpi",
            "category": "Why MBA",
            "difficulty": "easy",
            "question": "Why do you want to pursue an MBA at this point in your career? What specific skills or network do you hope to acquire?",
            "context": "Evaluating clarity of career goals, motivation, and fit for the program.",
            "expected_topics": "career acceleration, skill gap, leadership training, networking, short/long-term goals"
        },
        {
            "interview_type": "cat_gdpi",
            "category": "Mock Interview",
            "difficulty": "hard",
            "question": "Defend an unpopular business or economic opinion you hold. Why do you believe in it despite the counter-arguments?",
            "context": "Stress-testing argumentative conviction, logical structure, and poise under pressure.",
            "expected_topics": "unpopular opinion, data-backed reasoning, acknowledging counter-arguments, conviction"
        },
        {
            "interview_type": "cat_gdpi",
            "category": "Mock Interview",
            "difficulty": "hard",
            "question": "Walk me through a significant business or personal failure. What were the root causes, how did you handle the aftermath, and what did you learn?",
            "context": "Testing resilience, self-reflection, and continuous learning.",
            "expected_topics": "failure analysis, accountability, pivot, key lessons, positive growth"
        },

        # ── UPSC ──────────────────────────────────────────────────────────────
        {
            "interview_type": "upsc_interview",
            "category": "Personal Background",
            "difficulty": "easy",
            "question": "Introduce yourself to the board, focusing on your upbringing, interests, and why you wish to join civil services.",
            "context": "Evaluating basic profile, sincerity, and presence of mind.",
            "expected_topics": "sincerity, patriotism, public service motivation, background summary"
        },
        {
            "interview_type": "upsc_interview",
            "category": "Graduation Subject",
            "difficulty": "easy",
            "question": "How can your academic degree be leveraged to solve the challenges of primary healthcare and sanitation in rural districts?",
            "context": "Connecting specialized academic background to public administration.",
            "expected_topics": "innovation, administrative application, resource allocation, rural development"
        },
        {
            "interview_type": "upsc_interview",
            "category": "State Knowledge",
            "difficulty": "medium",
            "question": "What are the three most critical socio-economic problems facing your home state, and what policy interventions would you propose as an administrator?",
            "context": "Gauging local awareness, regional pride, and practical policy design.",
            "expected_topics": "regional issues, demographic challenges, agricultural/industrial reforms, actionable solutions"
        },
        {
            "interview_type": "upsc_interview",
            "category": "Current Affairs",
            "difficulty": "medium",
            "question": "How do you evaluate India's active participation in bilateral and multilateral forums in the context of global energy security?",
            "context": "Testing macro understanding of geopolitics and national strategic interest.",
            "expected_topics": "foreign policy, diplomatic balance, energy transition, strategic reserves, trade partnerships"
        },
        {
            "interview_type": "upsc_interview",
            "category": "Ethics",
            "difficulty": "medium",
            "question": "Suppose you are a District Magistrate and a local minister pressures you to ignore regulatory violations for a commercial project that promises immediate local employment. How would you proceed?",
            "context": "Ethical dilemma testing administrative integrity, rule of law, and public interest balance.",
            "expected_topics": "integrity, legal compliance, balance, stakeholder discussion, constructive alternative"
        },
        {
            "interview_type": "upsc_interview",
            "category": "Governance",
            "difficulty": "hard",
            "question": "What structural and technological reforms are needed in the public distribution system to eliminate leakages and reach the last mile?",
            "context": "Probing understanding of public administration bottleneck and technological interventions.",
            "expected_topics": "direct benefit transfer, biometric verification, decentralized storage, transparency, social audit"
        },
        {
            "interview_type": "upsc_interview",
            "category": "Mock Board",
            "difficulty": "hard",
            "question": "In a democracy, where does the boundary lie between policy implementation and political neutrality for a bureaucrat? Under what conditions is dissent justified?",
            "context": "Testing high-level constitutional awareness, civil service values, and professional neutrality.",
            "expected_topics": "neutrality, constitutional values, civil service code, constructive dissent, institutional integrity"
        },

        # ── Software Engineering ──────────────────────────────────────────────
        {
            "interview_type": "software_engineering",
            "category": "Behavioral",
            "difficulty": "easy",
            "question": "Tell me about a time you had to work with a teammate who had a very different work style or personality. How did you ensure collaboration?",
            "context": "Testing teamwork, adaptability, and emotional maturity.",
            "expected_topics": "conflict resolution, empathy, communication, compromise, shared goal"
        },
        {
            "interview_type": "software_engineering",
            "category": "Internships / Work Experience",
            "difficulty": "easy",
            "question": "Walk me through your contributions in your previous engineering role or internship. What tech stack did you use, and what was the impact?",
            "context": "Testing technical communication and familiarity with engineering workflows.",
            "expected_topics": "tech stack, engineering contribution, impact, metrics, tools"
        },
        {
            "interview_type": "software_engineering",
            "category": "Projects",
            "difficulty": "medium",
            "question": "Describe the most complex software project you have worked on. What were the key architectural trade-offs you had to make?",
            "context": "Probing systems thinking, depth of engineering expertise, and decision making.",
            "expected_topics": "architecture, tradeoffs, database selection, performance, scalability"
        },
        {
            "interview_type": "software_engineering",
            "category": "DSA",
            "difficulty": "medium",
            "question": "Explain the difference in time and space complexity between Breadth-First Search (BFS) and Depth-First Search (DFS) for graph traversal. In what real-world scenarios would you choose one over the other?",
            "context": "Testing core computer science fundamentals and algorithmic application.",
            "expected_topics": "queue vs stack, short paths, topological sort, memory consumption"
        },
        {
            "interview_type": "software_engineering",
            "category": "System Design",
            "difficulty": "hard",
            "question": "How would you design a distributed, fault-tolerant rate limiting system to protect a set of public APIs that receive 100k requests per second?",
            "context": "Testing software design at scale, database scaling, caching, and resiliency.",
            "expected_topics": "Redis, Token Bucket/Leaky Bucket, sliding window, synchronization, latency, fault tolerance"
        },
        {
            "interview_type": "software_engineering",
            "category": "Mock Interview",
            "difficulty": "hard",
            "question": "Tell me about a significant production outage or a critical bug you caused or had to debug. What was the root cause, how did you mitigate it, and what post-mortem actions were taken?",
            "context": "Assessing diagnostic skills, systems reliability, ownership, and post-outage processes.",
            "expected_topics": "root cause analysis, logging/monitoring, mitigation, blameless post-mortem, prevention"
        }
    ]

    print(f"Seeding {len(questions)} questions into interview_question_bank...")
    success_count = 0
    for q in questions:
        try:
            # Query if question already exists to prevent duplicate seeding
            exists = supabase.table("interview_question_bank") \
                .select("id") \
                .eq("interview_type", q["interview_type"]) \
                .eq("question", q["question"]) \
                .execute()
            
            if exists.data:
                print(f"Skipping (already exists): [{q['interview_type']}] {q['question'][:40]}...")
                continue
            
            res = supabase.table("interview_question_bank").insert(q).execute()
            if res.data:
                success_count += 1
                print(f"Seeded successfully: [{q['interview_type']}] {q['question'][:40]}...")
        except Exception as e:
            print(f"Error seeding question: {e}")

    print(f"Seeding complete! Successfully seeded {success_count} new questions.")

if __name__ == "__main__":
    seed()
