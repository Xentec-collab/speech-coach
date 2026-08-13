-- Migration 002: Analytics and Telemetry Schema
-- Target Database: Supabase PostgreSQL
-- Description: Creates analytics tables for feature usage, session tracking, exit detection, and user cohort metrics.

-- 1. Core event log: every tracked interaction
CREATE TABLE IF NOT EXISTS analytics_events (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL,
    session_id  TEXT NOT NULL,
    event_type  TEXT NOT NULL,             -- 'page_view', 'tab_switch', 'feature_use', 'action', 'session_end'
    event_name  TEXT NOT NULL,             -- 'console', 'tracks', 'library', 'coach', 'speech_upload', etc.
    metadata    JSONB DEFAULT '{}'::jsonb, -- duration_ms, topic_id, score, etc.
    page_path   TEXT,                      -- '/dashboard', '/login', '/'
    referrer    TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Session-level tracking: one row per browser session
CREATE TABLE IF NOT EXISTS analytics_sessions (
    id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID NOT NULL,
    session_id       TEXT NOT NULL UNIQUE,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at         TIMESTAMPTZ,
    exit_page        TEXT,
    exit_feature     TEXT,
    total_duration_s INTEGER DEFAULT 0,
    page_count       INTEGER DEFAULT 1,
    created_at       TIMESTAMPTZ DEFAULT now()
);

-- 3. Daily user activity tracking for user cohort calculations (new / returning / lost)
CREATE TABLE IF NOT EXISTS analytics_daily_active (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL,
    active_date DATE NOT NULL DEFAULT CURRENT_DATE,
    event_count INTEGER DEFAULT 1,
    UNIQUE(user_id, active_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON analytics_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_active_date ON analytics_daily_active(active_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_active_user ON analytics_daily_active(user_id, active_date DESC);
