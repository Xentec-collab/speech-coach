# Module Map: AI Public Speaking Coach

This document details the functional modules, architecture, user journeys, navigation structure, and component inventory of the AI Public Speaking Coach application.

---

## Functional Modules Map

### 1. User Authentication & Session Management
* **Purpose**: Manages user registration, secure login, authentication state persistence, session cleanup (logout), and secure communication with the backend API using bearer tokens.
* **User Actions**:
  - Register new account (Email & Password).
  - Log in to existing account.
  - Log out / terminate session.
  - Automatically redirect unauthenticated users away from protected routes.
* **Inputs**:
  - Email address (string)
  - Password (string)
* **Outputs**:
  - JWT Access Token (persisted in client memory/cookies)
  - Logged-in user state (`user` object in React Context)
* **Data Sources**: Supabase Auth
* **API Endpoints**:
  - `POST /api/auth/me` (represented as `GET /api/auth/me` to retrieve authenticated user data using Bearer token verification)
* **Database Tables Used**: `auth.users` (managed by Supabase Auth)
* **Priority**: Core

### 2. AI Speaking Topic Generator
* **Purpose**: Allows users to select custom constraints (difficulty, category) and optionally provide a custom theme/prompt, invoking the Gemini API to produce a structured speaking prompt.
* **User Actions**:
  - Enter optional custom topic or theme (e.g. "benefits of remote work").
  - Select difficulty level (Easy, Medium, Hard).
  - Select category (Impromptu, Job Interview, Persuasive, Icebreaker & Warmup, Debate).
  - Submit generator form to fetch a new prompt.
  - View suggested talking points and contextual scenario guidelines.
* **Inputs**:
  - `category` (string, query param)
  - `difficulty` (string, query param)
  - `custom_topic` (string, query param, optional)
* **Outputs**:
  - Structured prompt details: Title, prompt text, context, suggested talking points.
* **Data Sources**: Gemini API (`gemini-2.5-flash` with fallback to `gemini-3.1-flash-lite`), Supabase database
* **API Endpoints**:
  - `GET /api/topics/generate`
* **Database Tables Used**: `public.topics`
* **Priority**: Core

### 3. Speech Recording & Audio Upload
* **Purpose**: Captures user microphone audio directly in the web browser, checks audio file constraints, uploads the recording to a private storage bucket, and creates a database reference.
* **User Actions**:
  - Grant microphone access permissions.
  - Click "Record" to begin speech capture.
  - Pause and resume recording.
  - Click "Stop" to finish recording.
  - Click "Discard" to reset recorder and erase active clip.
  - Click "Submit" to upload audio for AI coaching evaluation.
* **Inputs**:
  - Raw audio stream from user microphone (captured as `webm` audio blobs).
  - Associated `topic_id` (string).
  - Duration in seconds (integer).
* **Outputs**:
  - Uploaded speech object (contains primary key `id`, `storage_path`, etc.).
  - Background task worker triggered.
* **Data Sources**: Browser MediaRecorder API, Supabase Storage
* **API Endpoints**:
  - `POST /api/speeches/upload`
* **Database Tables Used**: `public.speeches`
* **Priority**: Core

### 4. Asynchronous Speech-to-Text & Evaluation Pipeline
* **Purpose**: A backend background worker pipeline that downloads audio from private storage, transcribes it via Gemini (retaining filler words), evaluates speaking metrics, logs detailed results, and deletes the audio file for user privacy.
* **User Actions**: None (triggered automatically in the background post-upload).
* **Inputs**:
  - `speech_id` (string)
* **Outputs**:
  - Complete transcript.
  - Generated scores (Overall, Pronunciation, Fluency, Grammar, Content, Lexicon) graded on a 0-100 scale (non-rounded).
  - Structured coaching feedback, vocabulary upgrades, counter-arguments, and challenge questions.
  - Deletion of the storage file.
* **Data Sources**: Supabase Storage, Gemini API (`gemini-2.5-flash` with fallback to `gemini-3.1-flash-lite`), Supabase database
* **API Endpoints**: (Invoked as background task during `/upload` processing)
* **Database Tables Used**: `public.speeches`, `public.topics`
* **Priority**: Core

### 5. AI Coaching Evaluation Dashboard
* **Purpose**: Polls backend speech status and displays the comprehensive analysis scorecard when completed, highlighting metric percentages, spoken transcripts, and written upgrades.
* **User Actions**:
  - View real-time processing status (transcribing, analyzing, completed).
  - View overall score and individual skill bar levels.
  - Read full spoken transcript.
  - Read detailed written advice and vocabulary suggestions.
  - Click "AI Counter-Argument" to view debate challenges (in Debate Mode).
  - Click "Practice Another Topic" to clear scorecard state and restart the practice loop.
* **Inputs**:
  - `speech_id` (string)
* **Outputs**:
  - Structured evaluation dashboard view.
* **Data Sources**: Supabase database
* **API Endpoints**:
  - `GET /api/speeches/{speech_id}`
* **Database Tables Used**: `public.speeches`
* **Priority**: Core

### 6. Practice History Logs (Sidebar)
* **Purpose**: Displays a sidebar lists of all past practice sessions, allowing users to scroll, paginate, and click records to immediately view their evaluation dashboards.
* **User Actions**:
  - View summary cards of past speech attempts (Title, date, duration, score).
  - Click pagination buttons ("Next", "Previous") to browse logs.
  - Click any log record to load its transcript, scores, and coaching metrics.
* **Inputs**:
  - `page` (integer, default 1)
  - `limit` (integer, default 20)
* **Outputs**:
  - Paginated list of user speeches with nested topic data.
* **Data Sources**: Supabase database
* **API Endpoints**:
  - `GET /api/speeches`
* **Database Tables Used**: `public.speeches`, `public.topics`
* **Priority**: Core

### 7. Performance Analytics & Trends
* **Purpose**: Compiles all completed attempts to track averages, maximum values, streaks, and chronological improvement trendlines.
* **User Actions**:
  - View aggregated stats panel (Average Score, Best Score, Latest Score, Daily Streak, Longest Streak).
  - View Lexicon Statistics panel (Average, Best, and Latest lexicon scores).
  - View interactive SVG score progression line chart.
  - Read positive improvement updates (e.g. "+15% overall change since first speech").
* **Inputs**: Authenticated user session
* **Outputs**:
  - Computed stats payload (aggregates, streaks, and list of scores).
* **Data Sources**: Supabase database
* **API Endpoints**:
  - `GET /api/speeches/stats`
* **Database Tables Used**: `public.speeches`
* **Priority**: Secondary

### 8. Superuser / Theme Personalization
* **Purpose**: Identifies configured superuser emails on backend routes and toggles a personalized UI theme layout in the frontend (such as the pink-styled, dog-themed "Cute Theme" for the second superuser).
* **User Actions**:
  - Log in with superuser email credentials.
  - Automatically view customized styling variants (e.g. pink layouts, dog emojis, adjusted terminology like "Latest Score 🐾", "Vocabulary Upgrade Cards 🦴") while keeping features aligned.
* **Inputs**: User email
* **Outputs**:
  - `is_cute_mode` boolean inside stats payload.
* **Data Sources**: Backend environment configuration (`super_users`), Supabase database
* **API Endpoints**:
  - `GET /api/speeches/stats`
* **Database Tables Used**: None (computed dynamically based on env and session data)
* **Priority**: Secondary

---

## 1. Complete User Journey

1. **Discovery & Onboarding**:
   - The user visits the Landing Page (`/`), reads about the features (transcription, scoring, metrics tracking), and clicks "Create Account" or "Log In".
   - The user fills out the form on `/register` to register or `/login` to sign in. The frontend secures their session token.
2. **Dashboard Initialization**:
   - The user is redirected to `/dashboard`.
   - Since they have no completed speeches, the Analytics Panel is locked and displays a placeholder explaining that streak trackers and charts will unlock once they record their first speech.
3. **Speaking Topic Selection**:
   - The user views the "AI Speaking Topic Generator" form.
   - They click the `?` icon to read the category definitions (Impromptu, Interview, Persuasive, Warmup, Debate) and difficulty levels.
   - They select "Persuasive Argument", "Medium" difficulty, type an optional theme ("benefits of electric vehicles"), and click "Generate speaking prompt".
   - The card updates to display their custom topic, context description, and bulleted talking points.
4. **Speech Practice & Capture**:
   - The "Speech Practice Terminal" card unlocks, displaying the active topic.
   - The user clicks the microphone button, grants browser mic permissions, and begins speaking.
   - The timer counts up. Once they speak past 10 seconds (minimum duration), the submit button becomes active.
   - The user clicks "Stop" to preview their speech or clicks "Submit Speech for Review".
5. **Background Processing & Polling**:
   - The terminal transitions to a loading state showing progress statuses.
   - The frontend polls the status of the speech attempt:
     - `uploaded` (Audio uploaded to storage bucket).
     - `transcribing` (Gemini is writing down audio words).
     - `analyzing` (Gemini is running evaluation metrics).
6. **Detailed Evaluation Analysis**:
   - Once the status transitions to `completed`, the page renders the **AI Coaching Evaluation Dashboard**.
   - The user reads their overall score, inspects individual sub-skill progress bars, reads the written feedback, and checks vocabulary upgrades.
   - (If in Debate Mode) The user reviews the AI Counter-Argument challenge card to think about controversial debate responses.
7. **Progress Tracking**:
   - The Analytics card unlocks at the top, rendering their first score, a streak of 1 day, and a single point on the trendline SVG chart.
   - The sidebar logs insert the speech, allowing them to paginate and re-open this scorecard at any time.

---

## 2. Complete Admin/Superuser Journey

1. **Authentication**:
   - A user signs in using an email configured in the backend environment's `super_users` setting (e.g. `alistigga@gmail.com`).
2. **Dashboard Render**:
   - The frontend calls `GET /api/speeches/stats` upon dashboard loading.
   - The backend checks if the logged-in user is the second user listed in the `super_users` list. It flags `"is_cute_mode": true`.
3. **Personalized Cute Theme Experience**:
   - The frontend reads `isCute` from the stats response.
   - The entire dashboard adopts a vibrant pink styling theme (`bg-rose-50`, `border-pink-200`, `fill-pink-600`) with custom micro-animations and dog emojis (🐾, 🦴, 🐶, 🐕, 🐩).
   - The user notices that feature names remain standard (e.g., "AI Speaking Topic Generator", "Speech Practice Terminal", "Practice History Logs", "Current Streak") to avoid functional confusion, while terms are subtly augmented with cute tags (e.g. "Average Rating 🦴", "Impromptu Speech 🐶", "Vocabulary Upgrade Cards 🦴").
4. **Superuser Reviewing Activities**:
   - The superuser generates topics, records practice speeches, and views their paginated walk logs (Practice History) with standard feature layout, customized in the visual pink aesthetic.

---

## 3. Navigation Structure

```text
Root /
 ├── Login /login
 ├── Register /register
 └── Dashboard /dashboard [Protected client-side; redirects unauthenticated users back to /login]
```

---

## 4. Screen Inventory

### 1. Landing Page (`/`)
* Purpose: Pitch the AI Speaking Coach SaaS to visitors.
* Core Elements: Feature bulletpoints, Call-to-Action buttons (Log In, Register, Go to Dashboard).

### 2. Login Page (`/login`)
* Purpose: Secure user login.
* Core Elements: Email/Password inputs, login submit button, error messages, routing link to registration.

### 3. Register Page (`/register`)
* Purpose: New user sign-up.
* Core Elements: Email/Password inputs, register submit button, validation messages, routing link to login.

### 4. Protected Dashboard (`/dashboard`)
* State A: **Empty / Fresh User State**
  - Lock placeholder over analytics panel.
  - Locked placeholder over Speech Practice Terminal (prompting topic generation first).
  - Empty History Sidebar showing "No speech attempts recorded yet."
* State B: **Active Practice State**
  - Topic details displayed (Title, prompt, talking points).
  - Practice terminal active with MediaRecorder buttons (Record, stop, pause, discard).
* State C: **Background Processing State**
  - Pulsing status tracker in terminal (transcribing, analyzing).
* State D: **Completed Scorecard State**
  - Scoring gauges, skill breakdown sliders, scrollable spoken transcripts, vocabulary upgrade cards, AI debate counters.
  - SVG progress trendlines populated.
  - History sidebar loaded with paginated past runs.

---

## 5. Component Inventory

### 1. Layout & Shell Components
* `Navbar`: Includes logo branding, active email marker, cute mode logo adjustments (SC vs 🐶), and Log Out action button.
* `User Profile Card`: Renders user ID, email, and created/join date with standard/cute mode text conditionals.

### 2. Analytics Components
* `AI Practice Analytics Panel`: Grid card layout showing Average Rating, Best Score, Latest Score, Current Streak, Longest Streak, and Lexicon averages.
* `SVG Line Chart`: Renders chronological score trendlines, adaptive point spacing, customized gridlines, and grid color themes (rose pink vs indigo blue).
* `Streak Tracker Badge`: Pulsing flame/dog streak badge showing active consecutive days.

### 3. Speaking Topic Components
* `AI Speaking Topic Generator Form`: Inputs for custom themes, categories, and difficulty levels with helper guides.
* `Speaking Prompt Details Card`: Displays generated title, prompt text, context scenario details, and bulleted talking points.

### 4. Speech Recording Components
* `Speech Practice Terminal`: Displays active topic, timer state, and controller handlers.
* `Audio Recording Controls`: Reusable buttons for starting, pausing, resuming, stopping, and discarding speech recordings.
* `Audio Playback Previewer`: HTML5 audio player overlay for checking captured speech clips before submission.

### 5. Evaluation & Feedback Components
* `AI Coaching Scorecard`: Overall score badge, skill metric breakdown (Pronunciation, Fluency, Grammar, Content, Lexicon) with colored progress sliders.
* `Written Feedback Card`: Scrollable markdown parser rendering structured coach advice.
* `Debate Challenge Card`: Interactive AI counter-argument panel with challenge questions.
* `Vocabulary Upgrade Cards Grid`: Double-column flex list displaying original speech words, suggested upgrades, and contextual usage explanations.
* `Spoken Transcript Box`: Scrollable box showing text transcript captured by Gemini.

### 6. Historical Navigation Components
* `Practice History Logs Sidebar`: List of past speech buttons mapping metadata.
* `Pagination Footer`: Back/Next navigation triggers with active page numbers.
