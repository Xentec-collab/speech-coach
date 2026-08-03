-- Migration 001: Database Indexes for Speech Coach App
-- Target Database: Supabase PostgreSQL
-- Description: Creates B-tree indexes to optimize filtering, sorting, and joins.

-- 1. Index on speeches by user and creation date for fast paginated history queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_speeches_user_created 
ON speeches(user_id, created_at DESC);

-- 2. Index on interview_sessions by user and creation date for fast session listing
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_user_created 
ON interview_sessions(user_id, created_at DESC);

-- 3. Index on interview_exchanges by session and round for fast exchange ordering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_exchanges_session_round 
ON interview_exchanges(session_id, round_number);

-- 4. Index on coach_snapshots by user_id for instant AI Coach report lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_snapshots_user 
ON coach_snapshots(user_id);
