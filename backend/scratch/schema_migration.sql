-- ── Phase 4B Migration: Question Bank & Topic Extensions ────────────────────

-- 1. Create Interview Question Bank Table
CREATE TABLE IF NOT EXISTS public.interview_question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interview_type TEXT NOT NULL,         -- e.g., 'cat_gdpi', 'upsc_interview', 'software_engineering'
    category TEXT NOT NULL,               -- e.g., 'Personal Introduction', 'Academics', 'DSA'
    difficulty TEXT NOT NULL,             -- 'easy', 'medium', 'hard'
    question TEXT NOT NULL,               -- The question prompt
    context TEXT NULL,                    -- Background or rationale
    expected_topics TEXT NULL,            -- Expected vocabulary / topics
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create Indexes for Faster Random Selection Queries
CREATE INDEX IF NOT EXISTS idx_iqb_lookup 
ON public.interview_question_bank (interview_type, difficulty, category);

-- 3. Extend the topics table to store Gemini-enriched metadata
ALTER TABLE public.topics
ADD COLUMN IF NOT EXISTS evaluation_criteria TEXT NULL,
ADD COLUMN IF NOT EXISTS follow_up_question TEXT NULL;
