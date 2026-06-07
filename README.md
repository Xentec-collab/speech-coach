# AI Public Speaking Coach SaaS

AI Public Speaking Coach is a commercial SaaS project for helping users practice speeches, receive AI-powered feedback, and track improvement over time.

This repository is being built incrementally. The current milestone is the project foundation only. Product features will be implemented one at a time after approval.

## Product Goal

Build a web application where a user can:

1. Register or log in.
2. Open a dashboard.
3. Generate a speaking topic.
4. Record a speech in the browser.
5. Convert speech to text.
6. Receive Gemini-powered coaching feedback.
7. View previous sessions and progress.

## Architecture Summary

The product is split into two deployable applications:

- `frontend/`: Next.js, TypeScript, Tailwind CSS application deployed to Vercel.
- `backend/`: FastAPI service deployed to Railway.

External services:

- Supabase Auth for authentication.
- Supabase PostgreSQL for user and speech session data.
- Gemini API for speech transcript analysis.
- Razorpay for future subscription billing.

High-level request flow:

```text
Next.js Frontend
  -> FastAPI Backend
  -> Gemini API
  -> Supabase PostgreSQL
```

## Folder Overview

- `frontend/`: Browser application, pages, UI components, API client, and Supabase client.
- `backend/`: API service, routing, schemas, service integrations, and backend configuration.
- `docs/`: Supporting project documentation.
- `README.md`: Main project overview and setup guide.
- `PROJECT_STATUS.md`: Current state of the project.
- `TASKS.md`: Active and upcoming implementation tasks.
- `ARCHITECTURE.md`: Technical architecture decisions and boundaries.
- `ROADMAP.md`: Product roadmap and monetization plan.
- `CHANGELOG.md`: Chronological record of completed work.
- `.gitignore`: Files and directories excluded from version control.

## Installation

Prerequisites:

- Node.js 20 or later.
- npm 10 or later.
- Python 3.11 or later.
- Git.
- Supabase project credentials, when authentication and database work begins.
- Gemini API key, when AI analysis work begins.

Install frontend dependencies:

```bash
cd speech-coach/frontend
npm install
```

Create and prepare the backend virtual environment:

```bash
cd speech-coach/backend
python -m venv .venv
```

Activate the backend virtual environment on Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Activate the backend virtual environment on macOS or Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

## Local Development

Run the frontend:

```bash
cd speech-coach/frontend
npm run dev
```

Run the backend:

```bash
cd speech-coach/backend
uvicorn app.main:app --reload
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend health check: `http://localhost:8000/health`

## Environment Variables

Frontend variables will be stored in `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Backend variables will be stored in `backend/.env`:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
ALLOWED_ORIGINS=http://localhost:3000
```

Do not commit real secrets.

## Current Scope

Foundation setup only:

- Project structure.
- Documentation.
- Frontend configuration.
- Backend configuration.
- Minimal health route.

No authentication, recording, Gemini analysis, dashboard, history, or payment features are implemented yet.
