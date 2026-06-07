# Changelog

All notable project changes will be documented in this file.

## 2026-06-07

### Added
- **Git Identity & Initial Commit**: Configured local repository author identity (`Ayan Hussain`) and created the first commit containing the foundation scaffolds.
- **Supabase Auth Integration**:
  - Implemented Client-side `AuthContext` to manage auth session, user profile, and loading states.
  - Implemented error handling displaying a developer setup screen if Supabase variables are unconfigured.
  - Created Login page at `/login` with clean, responsive forms and credentials validation.
  - Created Register page at `/register` supporting custom full name, email, and password.
  - Created a protected Dashboard shell at `/dashboard` that redirects unauthorized users to `/login`.
  - Updated the landing page `/` to conditionally link to `/dashboard` or authentication pages.
- **Backend API JWT Verification**:
  - Setup Supabase Python SDK client in `backend/app/services/supabase.py`.
  - Implemented `get_current_user` dependency to parse the `Authorization` header and verify JWTs using `supabase.auth.get_user`.
  - Created `/api/auth/me` endpoint to test and retrieve current authenticated user details.
- **Documentation**: Updated `README.md` to detail environment variable files (`.env` and `.env.local`) and step-by-step Supabase Auth setup.

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
