# Architecture

## System Overview

AI Public Speaking Coach uses a split frontend/backend architecture.

```text
User Browser
  -> Next.js Frontend
  -> FastAPI Backend
  -> Gemini API
  -> Supabase PostgreSQL
```

## Frontend

Location: `frontend/`

Technology:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.

Responsibilities:

- User interface.
- Authentication screens and client-side auth state.
- Dashboard and practice experience.
- Browser audio recording.
- Calls to the FastAPI backend.

The frontend should not call Gemini directly. AI keys must remain server-side.

## Backend

Location: `backend/`

Technology:

- FastAPI.
- Python.
- Pydantic.
- Uvicorn.

Responsibilities:

- API routing.
- Request validation.
- Authentication verification.
- Supabase database access.
- Gemini API integration.
- Speech analysis orchestration.

The backend owns privileged secrets such as the Supabase service role key and Gemini API key.

## Database

Provider: Supabase PostgreSQL.

Initial planned tables:

- `users`: User profile records.
- `speeches`: Speech practice sessions and AI feedback.

Schema implementation is intentionally deferred until the authentication and speech persistence features are built.

## Authentication

Provider: Supabase Auth.

Planned flow:

1. User registers or logs in through the frontend.
2. Frontend receives a Supabase session.
3. Frontend sends authenticated requests to the backend.
4. Backend verifies the user before accessing protected resources.

## AI Analysis

Provider: Gemini API.

Planned flow:

1. User records speech in the frontend.
2. Speech is converted to transcript.
3. Backend sends transcript to Gemini.
4. Gemini returns structured JSON feedback.
5. Backend validates and stores the result.

## Security Principles

- Do not expose Gemini API keys to the browser.
- Do not expose Supabase service role keys to the browser.
- Validate backend inputs with Pydantic schemas.
- Use environment variables for secrets.
- Keep CORS restricted to trusted origins.
- Add rate limits before public launch.

## Deployment Targets

- Frontend: Vercel.
- Backend: Railway.
- Database and Auth: Supabase.
