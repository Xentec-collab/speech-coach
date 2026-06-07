# Changelog

All notable project changes will be documented in this file.

## 2026-06-07

### Added
- **Task 3: Topic Generation (Gemini Integration)**:
  - Created Gemini service in `backend/app/services/gemini.py` that interfaces with the `google-generativeai` SDK.
  - Implemented structured output mapping using Pydantic models (`TopicListResponse` and `GeneratedTopic`) to ensure type safety and allow future multiple-topic scaling.
  - Created protected API endpoint `GET /api/topics/generate` verifying user JWTs.
  - Integrated the `topics` Supabase PostgreSQL table with a foreign key referencing `auth.users(id)` and strict Row Level Security (RLS) policies.
  - Automatically save generated topic logs to the database on success.
  - Designed the dashboard Topic Generator UI with category/difficulty controls, loading indicators, error reporting, and prompt cards.
- **Git Identity & Initial Commit**: Configured local repository author identity (`Ayan Hussain`) and created the first commit containing the foundation scaffolds.
- **Supabase Auth Integration**:
  - Implemented Client-side `AuthContext` to manage auth session, user profile, and loading states.
  - Created Login, Register, and protected Dashboard routes.
  - Implemented Backend JWT verification dependency (`get_current_user`) and test endpoint (`/api/auth/me`).

## 2026-06-06

### Added
- Created initial project foundation.
- Added required project memory documentation.
- Added frontend scaffold for Next.js, TypeScript, and Tailwind CSS.
- Added backend scaffold for FastAPI.
- Added `.gitignore`.
- Added backend health endpoint.
- Installed frontend dependencies and generated `package-lock.json`.
- Created backend Python virtual environment and installed backend dependencies.
- Moved active project folder to `C:\Users\Ayan Hussain\Desktop\speech-coach`.
- Initialized Git repository.
