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

## Environment Variables & Supabase Auth Setup

To run the authentication feature, you must configure the following local configuration files. If these variables are not configured, the applications will show a configuration error on startup or render.

### Where to find credentials in Supabase:
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard) and open your project.
2. Click on the **Project Settings** icon (gear icon in the bottom of the left sidebar).
3. Select the **API** settings tab under the "Configuration" menu.
4. Locate the keys:
   - **Project URL**: Look for the input field in the **Project URL** section. Copy this URL. This maps to `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`.
   - **Anon Public Key**: Look under **Project API Keys** for the key labeled `anon` / `public`. Copy this string. This maps to `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - **Service Role Secret Key**: Look under **Project API Keys** for the key labeled `service_role` / `secret`. Click **Reveal** and copy it. This maps to `SUPABASE_SERVICE_ROLE_KEY`. *Do not expose this key to the frontend client.*

---

### 1. Frontend Configuration

Create/update a file named `frontend/.env.local` containing:

```env
# Project Settings > API > Project URL
NEXT_PUBLIC_SUPABASE_URL=

# Project Settings > API > Project API Keys (anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Base URL of the local FastAPI backend service
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. Backend Configuration

Create/update a file named `backend/.env` containing:

```env
# Project Settings > API > Project URL
SUPABASE_URL=

# Project Settings > API > Project API Keys (service_role secret)
SUPABASE_SERVICE_ROLE_KEY=

# Allowed origins for CORS (Next.js client)
ALLOWED_ORIGINS=http://localhost:3000
```

Never commit these files or publish real secrets to version control.

---

## Current Scope

Phase 1 development is in progress:

- **Implemented**: Project structure, database services, user registration UI (`/register`), user login UI (`/login`), user logout flow, protected dashboard UI shell (`/dashboard`), and backend JWT Bearer token verification (`/api/auth/me`).
- **Pending Implementation**: Topic generation, browser recording, speech-to-text, Gemini AI feedback analysis, and speeches history metrics.

