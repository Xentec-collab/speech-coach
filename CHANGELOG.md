# Changelog

All notable project changes will be documented in this file.

## 2026-06-08

### Added
- **Debate Mode (AI Counter-Argument & Challenge Questions)**:
  - Added new `"debate"` category to the topic generator dropdown.
  - Evaluates user stance and generates a constructive, professional `counter_argument` challenging their position.
  - Generates 2-3 specific `challenge_questions` directly addressing their arguments to encourage deeper self-reflection.
- **Lexicon Judging Parameter**:
  - Added dedicated database column `lexicon_score` (INTEGER, 0-100) to the speeches table.
  - Integrated "Vocabulary Upgrade Cards" on the frontend displaying common words used in the transcript, recommended synonyms, and explanation.
  - Updated dashboard statistics to compute and display average, best, and latest lexicon scores.

## 2026-06-07

### Added
- **Private Super User Security & Personalization**:
  - Implemented backend config parsed from local `.env` variable `SUPER_USERS` keeping credentials private to the developer.
  - Configured JWT authentication route handler to append `is_super_user` verification flags dynamically (supporting up to 2 superuser bypasses).
  - Built a personalized, playful dog-themed pink dashboard ("BarkleyCoach 🐶🐾") conditional for the second superuser email. Includes custom pink gradients, cute active wags/bone labels, custom dog polling status notifications, and rose-tinted dynamic progress curves.

### Fixed
- Fixed `NameError: name 'settings' is not defined` inside `backend/app/routes/speeches.py` by importing `settings` from `app.core.config`, which resolves 500 Internal Server Errors when loading statistics and allows the cute dog-themed interface to load correctly for superusers.
- **Task 7: Speeches History Logs & Analytics**:
  - Implemented pagination parameters (`page`, `limit`) on list endpoint `GET /api/speeches` (defaulting to page 1, limit 20) with backend-level SQL range bounding (`.range()`) to prevent high bandwidth/unlimited queries.
  - Added statistics route `GET /api/speeches/stats` computing aggregated metrics (total attempts, completed counts, overall average ratings, best rating, and latest rating).
  - Built streak calculations for both `current_streak` and `longest_streak` based on chronological calendar dates to encourage daily user engagement.
  - Calculated improvement analytics including percentage improvement (latest score vs first score) and point delta variances from both the first attempt and the immediately preceding attempt.
  - Integrated TypeScript interfaces (`SpeechFeedback`, `SpeechHistoryItem`, and `SpeechStatistics`) for dashboard safety.
  - Integrated a client-side SVG graphing generator that dynamically draws score coordinates over time.
  - Replaced the dashboard sidebar placeholder with a live paginated, clickable history panel allowing users to toggle past attempts and load corresponding feedback logs instantly.

- **Tasks 5 & 6: Speech-to-Text & AI Feedback (Gemini Multimodal Integration)**:
  - Designed an asynchronous speech processing pipeline using FastAPI `BackgroundTasks`, structured for seamless future Celery/Dramatiq migration.
  - Enabled direct audio transcription from raw bytes via the Gemini 1.5 Flash multimodal API.
  - Implemented structured AI coaching evaluations generating integer ratings (overall, pronunciation, fluency, grammar, content) on a 0-100 scale, plus detailed written coaching notes.
  - Persisted transcripts, scores, and coaching notes in individual table columns to enable future progress graph analytics.
  - Added fault-tolerance retry capability inside the background task loop tracking `retry_count` (up to 3 attempts with exponential backoff).
  - Enforced a secure temporary audio retention policy, deleting the uploaded file from the private Supabase Storage bucket immediately after successful database save.
  - Built frontend progress-tracker polling states (`uploaded` ➡️ `transcribing` ➡️ `analyzing` ➡️ `completed` or `failed`) refreshing every 3 seconds.
  - Designed a premium AI Coaching scorecard display with percentage ratings, skill bars, and written advice.

- **Task 4: Browser Speech Recording**:
  - Implemented the client-side audio practice terminal using the browser's native `MediaRecorder` API.
  - Implemented controls for Recording: Start, Pause, Resume, Stop, and Discard, with a visual timer.
  - Embedded a native browser `<audio>` controller for listening to the recorded audio prior to submission.
  - Added strict client-side constraints validating duration (10s to 5 mins) and file size (max 30MB).
  - Built FastAPI route `POST /api/speeches/upload` receiving speech files, verifying length and size, and asserting the existence of the private `"speeches"` Supabase bucket.
  - Persisted validated speech entries in the `speeches` table.
  - Created policies enabling authenticated users to insert and select their own speech records.

- **Task 3: Topic Generation (Gemini Integration)**:
  - Created Gemini service in `backend/app/services/gemini.py` that interfaces with the `google-generativeai` SDK.
  - Implemented structured output mapping using Pydantic models (`TopicListResponse` and `GeneratedTopic`).
  - Created protected API endpoint `GET /api/topics/generate` verifying user JWTs.
  - Integrated the `topics` Supabase PostgreSQL table.
  - Designed the dashboard Topic Generator UI.

- **Git Identity & Initial Commit**: Configured local repository author identity (`Ayan Hussain`) and created the first commit.

- **Supabase Auth Integration**:
  - Implemented Client-side `AuthContext`.
  - Created Login, Register, and protected Dashboard routes.
  - Implemented Backend JWT verification dependency (`get_current_user`).

## 2026-06-06

### Added
- Created initial project foundation.
- Added required project memory documentation.
- Added frontend scaffold for Next.js, TypeScript, and Tailwind CSS.
- Added backend scaffold for FastAPI.
- Added `.gitignore`.
- Added backend health endpoint.
- Installed frontend dependencies.
- Created backend Python virtual environment and installed backend dependencies.
- Moved active project folder to `C:\Users\Ayan Hussain\Desktop\speech-coach`.
- Initialized Git repository.
