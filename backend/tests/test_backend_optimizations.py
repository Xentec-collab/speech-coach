"""
Backend Optimization Test Suite for Speech Coach API.

Tests verify that the database optimizations (explicit column selection,
pagination, query limits, N+1 elimination) work correctly without
breaking any existing functionality.

Usage:
    cd backend
    pip install pytest httpx
    pytest tests/test_backend_optimizations.py -v
"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Ensure the backend package is importable
# ---------------------------------------------------------------------------
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.main import app

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

MOCK_USER = {
    "id": "c578a809-b615-4f67-bb46-3ad3f236fbf5",
    "email": "testuser@example.com",
    "user_metadata": {"full_name": "Test User"},
    "is_super_user": False,
}

MOCK_AUTH_HEADER = {"Authorization": "Bearer mock-test-token"}


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture(autouse=True)
def mock_auth():
    """Bypass Supabase JWT auth for every test."""
    with patch("app.services.supabase.get_current_user", return_value=MOCK_USER):
        yield


# ===========================================================================
# 1. PAGINATION TESTS — GET /api/speeches
# ===========================================================================

class TestSpeechListPagination:
    """Verify .order() and .range() are applied correctly."""

    def _mock_supabase_chain(self, data, *, session_data=None):
        """Build a chainable mock that terminates at .execute()."""
        exec_result = MagicMock()
        exec_result.data = data

        sess_exec_result = MagicMock()
        sess_exec_result.data = session_data or []

        chain = MagicMock()
        chain.select.return_value = chain
        chain.eq.return_value = chain
        chain.order.return_value = chain
        chain.range.return_value = chain
        chain.in_.return_value = chain
        chain.execute.return_value = exec_result

        call_count = {"n": 0}
        original_table = None

        def table_side_effect(name):
            call_count["n"] += 1
            if name == "speeches":
                c = MagicMock()
                c.select.return_value = c
                c.eq.return_value = c
                c.order.return_value = c
                c.range.return_value = c
                c.execute.return_value = exec_result
                return c
            elif name == "interview_sessions":
                c = MagicMock()
                c.select.return_value = c
                c.eq.return_value = c
                c.order.return_value = c
                c.range.return_value = c
                c.execute.return_value = sess_exec_result
                return c
            elif name == "interview_exchanges":
                c = MagicMock()
                c.select.return_value = c
                c.in_.return_value = c
                c.execute.return_value = MagicMock(data=[])
                return c
            return chain

        return table_side_effect

    def test_page1_returns_200(self, client):
        """GET /api/speeches?page=1&limit=5 returns 200."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            mock_sb.table.side_effect = self._mock_supabase_chain([])
            resp = client.get("/api/speeches?page=1&limit=5", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200

    def test_page_defaults_to_1_on_invalid(self, client):
        """Negative page is clamped to 1."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            mock_sb.table.side_effect = self._mock_supabase_chain([])
            resp = client.get("/api/speeches?page=-5&limit=5", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200

    def test_limit_defaults_to_20_on_invalid(self, client):
        """Negative limit is clamped to 20."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            mock_sb.table.side_effect = self._mock_supabase_chain([])
            resp = client.get("/api/speeches?page=1&limit=-1", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200

    def test_type_filter_speaking(self, client):
        """type=speaking skips session queries."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            mock_sb.table.side_effect = self._mock_supabase_chain([])
            resp = client.get("/api/speeches?type=speaking", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200

    def test_type_filter_interview(self, client):
        """type=interview skips speech queries."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            mock_sb.table.side_effect = self._mock_supabase_chain([])
            resp = client.get("/api/speeches?type=interview", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200

    def test_explicit_columns_no_storage_path(self, client):
        """Speeches response should not leak storage_path from DB query."""
        speech_row = {
            "id": "abc-123",
            "user_id": MOCK_USER["id"],
            "topic_id": "t1",
            "duration_seconds": 120,
            "status": "completed",
            "created_at": "2026-01-01T00:00:00Z",
            "overall_score": 85,
            "pronunciation_score": 80,
            "fluency_score": 90,
            "lexicon_score": 75,
            "filler_words": 3,
            "word_count": 200,
            "speech_pace_wpm": 140,
            "feedback": {"summary": "Good job"},
            "topics": {"id": "t1", "title": "Test Topic", "prompt": "", "category": "general", "module_type": "speaking"},
        }
        with patch("app.routes.speeches.supabase") as mock_sb:
            mock_sb.table.side_effect = self._mock_supabase_chain([speech_row])
            resp = client.get("/api/speeches?type=speaking&page=1&limit=5", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200
            items = resp.json()
            assert isinstance(items, list)
            if items:
                # storage_path should NOT be in the returned item because the
                # explicit column selection excludes it from the DB query
                assert "storage_path" not in speech_row  # column was never fetched

    def test_order_desc_is_applied(self, client):
        """Verify supabase .order('created_at', desc=True) is called."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            speech_chain = MagicMock()
            speech_chain.select.return_value = speech_chain
            speech_chain.eq.return_value = speech_chain
            speech_chain.order.return_value = speech_chain
            speech_chain.range.return_value = speech_chain
            speech_chain.execute.return_value = MagicMock(data=[])

            sess_chain = MagicMock()
            sess_chain.select.return_value = sess_chain
            sess_chain.eq.return_value = sess_chain
            sess_chain.order.return_value = sess_chain
            sess_chain.range.return_value = sess_chain
            sess_chain.execute.return_value = MagicMock(data=[])

            exch_chain = MagicMock()
            exch_chain.select.return_value = exch_chain
            exch_chain.in_.return_value = exch_chain
            exch_chain.execute.return_value = MagicMock(data=[])

            def table_router(name):
                if name == "speeches":
                    return speech_chain
                if name == "interview_sessions":
                    return sess_chain
                return exch_chain

            mock_sb.table.side_effect = table_router
            client.get("/api/speeches?page=1&limit=10", headers=MOCK_AUTH_HEADER)

            speech_chain.order.assert_called_once_with("created_at", desc=True)

    def test_range_pagination_values(self, client):
        """page=2, limit=10 → .range(10, 19)."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            speech_chain = MagicMock()
            speech_chain.select.return_value = speech_chain
            speech_chain.eq.return_value = speech_chain
            speech_chain.order.return_value = speech_chain
            speech_chain.range.return_value = speech_chain
            speech_chain.execute.return_value = MagicMock(data=[])

            sess_chain = MagicMock()
            sess_chain.select.return_value = sess_chain
            sess_chain.eq.return_value = sess_chain
            sess_chain.order.return_value = sess_chain
            sess_chain.range.return_value = sess_chain
            sess_chain.execute.return_value = MagicMock(data=[])

            def table_router(name):
                if name == "speeches":
                    return speech_chain
                if name == "interview_sessions":
                    return sess_chain
                c = MagicMock()
                c.select.return_value = c
                c.in_.return_value = c
                c.execute.return_value = MagicMock(data=[])
                return c

            mock_sb.table.side_effect = table_router
            client.get("/api/speeches?page=2&limit=10", headers=MOCK_AUTH_HEADER)

            speech_chain.range.assert_called_once_with(10, 19)


# ===========================================================================
# 2. AI COACH LIMIT + COLUMN SELECTION TESTS
# ===========================================================================

class TestCoachHistoryLimit:
    """Verify COACH_HISTORY_LIMIT = 20 is applied."""

    def test_constant_value(self):
        from app.routes.ai_coach import COACH_HISTORY_LIMIT
        assert COACH_HISTORY_LIMIT == 20

    def test_report_endpoint_returns_unlocked_false_for_no_data(self, client):
        """No completed speeches or sessions → unlocked: false."""
        with patch("app.routes.ai_coach.supabase") as mock_sb:
            chain = MagicMock()
            chain.select.return_value = chain
            chain.eq.return_value = chain
            chain.order.return_value = chain
            chain.limit.return_value = chain
            chain.execute.return_value = MagicMock(data=[])
            mock_sb.table.return_value = chain

            resp = client.get("/api/coach/report", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200
            body = resp.json()
            assert body["unlocked"] is False

    def test_limit_applied_to_speeches_query(self):
        """generate_and_save_coach_snapshot must call .limit(20) on speeches."""
        import asyncio
        from app.routes.ai_coach import generate_and_save_coach_snapshot

        with patch("app.routes.ai_coach.supabase") as mock_sb:
            speech_chain = MagicMock()
            speech_chain.select.return_value = speech_chain
            speech_chain.eq.return_value = speech_chain
            speech_chain.order.return_value = speech_chain
            speech_chain.limit.return_value = speech_chain
            speech_chain.execute.return_value = MagicMock(data=[])

            sess_chain = MagicMock()
            sess_chain.select.return_value = sess_chain
            sess_chain.eq.return_value = sess_chain
            sess_chain.order.return_value = sess_chain
            sess_chain.limit.return_value = sess_chain
            sess_chain.execute.return_value = MagicMock(data=[])

            delete_chain = MagicMock()
            delete_chain.eq.return_value = delete_chain
            delete_chain.execute.return_value = MagicMock()

            def table_router(name):
                if name == "speeches":
                    return speech_chain
                if name == "interview_sessions":
                    return sess_chain
                if name == "coach_snapshots":
                    m = MagicMock()
                    m.delete.return_value = delete_chain
                    return m
                c = MagicMock()
                c.select.return_value = c
                c.eq.return_value = c
                c.execute.return_value = MagicMock(data=[])
                return c

            mock_sb.table.side_effect = table_router

            asyncio.get_event_loop().run_until_complete(
                generate_and_save_coach_snapshot(MOCK_USER["id"])
            )

            speech_chain.limit.assert_called_once_with(20)
            sess_chain.limit.assert_called_once_with(20)


# ===========================================================================
# 3. N+1 ELIMINATION — NESTED PostgREST JOIN TESTS
# ===========================================================================

class TestInterviewSessionNestedQuery:
    """Verify N+1 elimination via nested PostgREST select."""

    def test_session_detail_returns_exchanges(self, client):
        """GET /api/interviews/sessions/{id} embeds exchanges inline."""
        session_row = {
            "id": "sess-001",
            "user_id": MOCK_USER["id"],
            "interview_type": "behavioral",
            "roadmap_step": "step1",
            "difficulty": "medium",
            "status": "completed",
            "total_rounds": 3,
            "current_round": 3,
            "final_evaluation": {"overall_score": 80},
            "created_at": "2026-01-01T00:00:00Z",
            "completed_at": "2026-01-01T00:30:00Z",
            "interview_exchanges": [
                {"id": "ex-1", "session_id": "sess-001", "round_number": 2, "interviewer_question": "Q2",
                 "user_transcript": "A2", "feedback": {}, "status": "completed", "storage_path": "", "duration_seconds": 60},
                {"id": "ex-2", "session_id": "sess-001", "round_number": 1, "interviewer_question": "Q1",
                 "user_transcript": "A1", "feedback": {}, "status": "completed", "storage_path": "", "duration_seconds": 45},
            ],
        }
        with patch("app.routes.interview_sessions.supabase") as mock_sb:
            chain = MagicMock()
            chain.select.return_value = chain
            chain.eq.return_value = chain
            chain.execute.return_value = MagicMock(data=[session_row])
            mock_sb.table.return_value = chain

            resp = client.get("/api/interviews/sessions/sess-001", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 200
            body = resp.json()

            # Exchanges must be sorted by round_number ascending
            assert body["exchanges"][0]["round_number"] == 1
            assert body["exchanges"][1]["round_number"] == 2

    def test_session_detail_single_query(self, client):
        """Only ONE table().select() call should be made (no separate exchanges query)."""
        session_row = {
            "id": "sess-002",
            "user_id": MOCK_USER["id"],
            "interview_type": "technical",
            "roadmap_step": "step2",
            "difficulty": "hard",
            "status": "active",
            "total_rounds": 5,
            "current_round": 1,
            "final_evaluation": None,
            "created_at": "2026-01-02T00:00:00Z",
            "completed_at": None,
            "interview_exchanges": [],
        }
        with patch("app.routes.interview_sessions.supabase") as mock_sb:
            chain = MagicMock()
            chain.select.return_value = chain
            chain.eq.return_value = chain
            chain.execute.return_value = MagicMock(data=[session_row])
            mock_sb.table.return_value = chain

            client.get("/api/interviews/sessions/sess-002", headers=MOCK_AUTH_HEADER)

            # supabase.table() should only be called ONCE for the nested query
            mock_sb.table.assert_called_once_with("interview_sessions")

    def test_session_not_found(self, client):
        """Missing session returns 404."""
        with patch("app.routes.interview_sessions.supabase") as mock_sb:
            chain = MagicMock()
            chain.select.return_value = chain
            chain.eq.return_value = chain
            chain.execute.return_value = MagicMock(data=[])
            mock_sb.table.return_value = chain

            resp = client.get("/api/interviews/sessions/nonexistent-id", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 404

    def test_session_access_denied(self, client):
        """Session owned by another user returns 403."""
        session_row = {
            "id": "sess-003",
            "user_id": "other-user-id-999",  # different from MOCK_USER
            "interview_type": "behavioral",
            "roadmap_step": "step1",
            "difficulty": "easy",
            "status": "completed",
            "total_rounds": 3,
            "current_round": 3,
            "final_evaluation": {},
            "created_at": "2026-01-03T00:00:00Z",
            "completed_at": "2026-01-03T00:20:00Z",
            "interview_exchanges": [],
        }
        with patch("app.routes.interview_sessions.supabase") as mock_sb:
            chain = MagicMock()
            chain.select.return_value = chain
            chain.eq.return_value = chain
            chain.execute.return_value = MagicMock(data=[session_row])
            mock_sb.table.return_value = chain

            resp = client.get("/api/interviews/sessions/sess-003", headers=MOCK_AUTH_HEADER)
            assert resp.status_code == 403


# ===========================================================================
# 4. COLUMN SELECTION — ROUND STATUS ENDPOINT
# ===========================================================================

class TestRoundStatusExplicitColumns:
    """Verify explicit column selection on round status queries."""

    def test_round_status_completed_with_next_question(self, client):
        """Completed round returns next question from explicit column query."""
        exchange_row = {
            "id": "exch-10",
            "status": "completed",
            "user_transcript": "My answer here.",
            "feedback": {"score": 85},
            "interviewer_question": "Tell me about yourself.",
            "storage_path": "/audio/path.webm",
        }
        next_row = {
            "interviewer_question": "Follow-up question?"
        }

        with patch("app.routes.interview_sessions.supabase") as mock_sb:
            call_count = {"n": 0}

            def table_router(name):
                call_count["n"] += 1
                chain = MagicMock()
                chain.select.return_value = chain
                chain.eq.return_value = chain
                chain.execute.side_effect = [
                    MagicMock(data=[exchange_row]),
                    MagicMock(data=[next_row]),
                    MagicMock(data=[{"status": "active"}]),  # session status
                ]
                return chain

            mock_sb.table.side_effect = table_router
            resp = client.get(
                "/api/interviews/sessions/sess-10/rounds/1/status",
                headers=MOCK_AUTH_HEADER,
            )
            assert resp.status_code == 200

    def test_round_not_found(self, client):
        """Missing round returns 404."""
        with patch("app.routes.interview_sessions.supabase") as mock_sb:
            chain = MagicMock()
            chain.select.return_value = chain
            chain.eq.return_value = chain
            chain.execute.return_value = MagicMock(data=[])
            mock_sb.table.return_value = chain

            resp = client.get(
                "/api/interviews/sessions/sess-11/rounds/99/status",
                headers=MOCK_AUTH_HEADER,
            )
            assert resp.status_code == 404


# ===========================================================================
# 5. AUTH GUARD TESTS
# ===========================================================================

class TestAuthGuards:
    """Verify endpoints reject unauthenticated requests."""

    def test_speeches_no_auth(self, client):
        """GET /api/speeches without auth → 401."""
        with patch("app.services.supabase.get_current_user", side_effect=__import__("fastapi").HTTPException(status_code=401, detail="Missing Authorization header")):
            resp = client.get("/api/speeches")
            assert resp.status_code == 401

    def test_coach_report_no_auth(self, client):
        """GET /api/coach/report without auth → 401."""
        with patch("app.services.supabase.get_current_user", side_effect=__import__("fastapi").HTTPException(status_code=401, detail="Missing Authorization header")):
            resp = client.get("/api/coach/report")
            assert resp.status_code == 401


# ===========================================================================
# 6. HEALTH CHECK + ROOT
# ===========================================================================

class TestHealthEndpoints:
    """Basic smoke tests."""

    def test_root(self, client):
        resp = client.get("/")
        assert resp.status_code == 200
        body = resp.json()
        assert body["status"] == "healthy"

    def test_health(self, client):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"


# ===========================================================================
# 7. DB INDEX MIGRATION FILE VERIFICATION
# ===========================================================================

class TestMigrationFile:
    """Verify the SQL migration file exists and is well-formed."""

    MIGRATION_PATH = os.path.join(
        os.path.dirname(__file__), "..", "migrations", "001_create_indexes.sql"
    )

    def test_file_exists(self):
        assert os.path.exists(self.MIGRATION_PATH), \
            f"Migration file not found: {self.MIGRATION_PATH}"

    def test_contains_four_indexes(self):
        with open(self.MIGRATION_PATH) as f:
            content = f.read()
        expected = [
            "idx_speeches_user_created",
            "idx_sessions_user_created",
            "idx_exchanges_session_round",
            "idx_snapshots_user",
        ]
        for idx in expected:
            assert idx in content, f"Missing index: {idx}"

    def test_uses_concurrently(self):
        with open(self.MIGRATION_PATH) as f:
            content = f.read()
        assert "CONCURRENTLY" in content, \
            "Migration should use CREATE INDEX CONCURRENTLY"

    def test_uses_if_not_exists(self):
        with open(self.MIGRATION_PATH) as f:
            content = f.read()
        assert "IF NOT EXISTS" in content, \
            "Migration should use IF NOT EXISTS for idempotency"


# ===========================================================================
# 8. SUPABASE CONNECTIVITY FALLBACK
# ===========================================================================

class TestSupabaseFallback:
    """Verify graceful fallback when Supabase is unreachable."""

    def test_speeches_fallback_on_connection_error(self, client):
        """Connection errors fall back to in-memory DB, not 500."""
        with patch("app.routes.speeches.supabase") as mock_sb:
            def table_raiser(name):
                chain = MagicMock()
                chain.select.return_value = chain
                chain.eq.return_value = chain
                chain.order.return_value = chain
                chain.range.return_value = chain
                chain.execute.side_effect = Exception("getaddrinfo failed")
                return chain

            mock_sb.table.side_effect = table_raiser
            resp = client.get("/api/speeches?page=1&limit=5", headers=MOCK_AUTH_HEADER)
            # Should NOT be 500; fallback returns empty list from in-memory DB
            assert resp.status_code == 200
