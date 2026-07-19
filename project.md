# SpeakAI Coach — Complete Project Documentation

> **Auto-generated project reference** — Every component, button, click handler, API route, database table, auth flow, and service documented exhaustively.

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Frontend — Pages](#3-frontend--pages)
4. [Frontend — Dashboard (Full Breakdown)](#4-frontend--dashboard-full-breakdown)
5. [Frontend — UI Components](#5-frontend--ui-components)
6. [Frontend — Context Providers](#6-frontend--context-providers)
7. [Frontend — Library / Utilities](#7-frontend--library--utilities)
8. [Frontend — Styling & Theming](#8-frontend--styling--theming)
9. [Backend — Overview](#9-backend--overview)
10. [Backend — Authentication & Authorization](#10-backend--authentication--authorization)
11. [Backend — API Routes (Complete)](#11-backend--api-routes-complete)
12. [Backend — Services](#12-backend--services)
13. [Database — Full Schema](#13-database--full-schema)
14. [Backend — Models & Schemas (Pydantic)](#14-backend--models--schemas-pydantic)
15. [Configuration & Environment Variables](#15-configuration--environment-variables)
16. [Deployment & Dev Ops](#16-deployment--dev-ops)
17. [Monetization Plan](#17-monetization-plan)
18. [File Tree](#18-file-tree)

---

## 1. High-Level Architecture

```text
┌───────────────────┐     ┌───────────────────┐     ┌───────────────────┐
│   User Browser    │────▶│  Next.js Frontend │────▶│  FastAPI Backend  │
│   (React Client)  │◀────│  (Vercel)         │◀────│  (Railway)        │
└───────────────────┘     └───────────────────┘     └────────┬──────────┘
                                                             │
                                    ┌────────────────────────┼────────────────────────┐
                                    ▼                        ▼                        ▼
                          ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
                          │  Supabase Auth   │    │ Supabase Postgres│    │   Gemini API     │
                          │  (JWT Provider)  │    │ (Database + RLS) │    │ (AI Analysis)    │
                          └──────────────────┘    └──────────────────┘    └──────────────────┘
```

**Request flow**: Browser → Next.js (client-side) → FastAPI (server) → Gemini API / Supabase DB → Response back through the chain.

---

## 2. Tech Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, `"use client"` pages) |
| Language | TypeScript |
| UI Library | Shadcn UI (via `@base-ui/react`) + `class-variance-authority` |
| Styling | Tailwind CSS v3 + `tailwindcss-animate` plugin + CSS variables for theming |
| Auth Client | Supabase JS (`@supabase/supabase-js` v2) |
| Icons | Lucide React + custom inline SVGs |
| Fonts | Inter (Google Fonts) |
| State | React Context (`AuthContext`) + local component state (`useState`) |

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | FastAPI 0.115.0 |
| Language | Python 3.11+ |
| Server | Uvicorn 0.30.6 (ASGI) |
| Validation | Pydantic + pydantic-settings |
| Database Client | Supabase Python SDK 2.8.1 |
| AI Service | Google Generative AI SDK 0.8.3 (Gemini) |
| File Uploads | python-multipart |

### External Services
| Service | Purpose |
|---------|---------|
| Supabase Auth | User registration, login, JWT issuance |
| Supabase PostgreSQL | All persistent data (speeches, topics, sessions, knowledge) |
| Supabase Storage | Temporary audio file storage (deleted after processing) |
| Gemini API (`gemini-2.5-flash`) | Topic generation, transcription, speech evaluation, interview coaching, coach reports |
| Free Dictionary API | Client-side dictionary lookups on double-click |

---

## 3. Frontend — Pages

### 3.1 Root Layout (`app/layout.tsx`)
- **Route**: Wraps all pages
- **Purpose**: Provides global `AuthProvider` context, loads Inter font, sets `<html lang="en">`
- **Metadata**: Title = "AI Public Speaking Coach", Description about AI coaching
- **Children**: Wrapped in `<AuthProvider>` → `{children}`

---

### 3.2 Landing Page (`app/page.tsx`)
- **Route**: `/`
- **State**: `{ user, loading }` from `useAuth()`

#### UI Sections

| Section | Elements | Interactions |
|---------|----------|-------------|
| **Navbar** (sticky top) | Logo "SpeakAI Coach" | — |
| | If `loading` | Shows "Checking session..." |
| | If `user` exists | **"Go to Dashboard"** button → navigates to `/dashboard` |
| | If no user | **"Log In"** button → `/login`, **"Sign Up Free"** button → `/register` |
| **Hero Section** | Headline, subtext | — |
| | If `user` | **"Go to Dashboard"** button → `/dashboard` |
| | If no user | **"Start Practicing Free"** → `/register`, **"Sign In"** → `/login` |
| **Feature Cards** (×3) | Practice Terminal, Structure-First Feedback, Cohesive Dashboard | Informational only, no clicks |
| **Footer** | Copyright with dynamic year | — |

---

### 3.3 Login Page (`app/login/page.tsx`)
- **Route**: `/login`
- **State**: `email`, `password`, `loading`, `errorMsg`
- **Auto-redirect**: If user already logged in → `router.push("/dashboard")`

#### UI Elements

| Element | Type | Action |
|---------|------|--------|
| **Email Input** | `type="email"`, required | `onChange` → `setEmail` |
| **Password Input** | `type="password"`, required | `onChange` → `setPassword` |
| **"Log In" Button** | `type="submit"`, disabled when `loading` | Calls `supabase.auth.signInWithPassword({ email, password })` → on success: `router.push("/dashboard")` → on error: sets `errorMsg` |
| **"Sign up" Link** | Text link | Navigates to `/register` |
| **Error Banner** | Conditional red alert | Displays `errorMsg` |

---

### 3.4 Register Page (`app/register/page.tsx`)
- **Route**: `/register`
- **State**: `name`, `email`, `password`, `loading`, `errorMsg`, `successMsg`
- **Auto-redirect**: If user logged in → redirect to `/dashboard`

#### UI Elements

| Element | Type | Action |
|---------|------|--------|
| **Full Name Input** | `type="text"`, required | `onChange` → `setName` |
| **Email Input** | required | `onChange` → `setEmail` |
| **Password Input** | required, `minLength={6}` | `onChange` → `setPassword` |
| **"Sign Up" Button** | `type="submit"`, disabled when loading | Calls `supabase.auth.signUp({ email, password, options: { data: { full_name: name } } })` → if user created but no session: shows success about email verification → if session: `router.push("/dashboard")` → on error: sets `errorMsg` |
| **"Log in" Link** | Text link | Navigates to `/login` |
| **Success Banner** | Conditional green alert | "Check your email to confirm your account" |
| **Error Banner** | Conditional red alert | Displays `errorMsg` |

---

## 4. Frontend — Dashboard (Full Breakdown)

**File**: `app/dashboard/page.tsx` — **4039 lines, 226KB**  
**Route**: `/dashboard`  
This is the core application experience. A single massive `"use client"` component.

### 4.1 TypeScript Interfaces

| Interface | Fields |
|-----------|--------|
| `GeneratedTopic` | `id?, title, prompt, context, suggested_points[], module_type?, interview_type?, interview_persona?` |
| `LexiconSuggestion` | `original_word, suggested_replacement, explanation` |
| `SpeechFeedback` | `written_feedback, lexicon_suggestions?, counter_argument?, challenge_questions?, interview_metrics?, follow_up_question?` |
| `SpeechHistoryItem` | Full speech record: scores, status, transcript, feedback, `is_session`, `exchanges[]` |
| `SpeechStatistics` | Aggregated stats: totals, averages, streaks, `is_cute_mode`, per-module breakdowns |

### 4.2 Constants

| Constant | Description |
|----------|-------------|
| `FILLERS` | Array of filler words (`"um"`, `"uh"`, `"like"`, etc.) for transcript highlighting |
| `INTERVIEW_TYPES` (10) | CAT GDPI, MBA, UPSC, SSC CGL, Banking, Company HR, Sales & Marketing, Teaching, Government, Software Engineering |
| `INTERVIEW_PERSONAS` (6) | Friendly, Strict, Corporate, Government Panel, Ivy League, MBA Panel |
| `TRACKS_METADATA` (3 tracks) | CAT GDPI (7 stages), UPSC Interview (7 stages), Software Engineering (6 stages) — each stage has `id`, `label`, `difficulty`, `category` |

### 4.3 Helper Functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `ft(seconds)` | `number → string` | Formats as `MM:SS` |
| `fd(seconds)` | `number → string` | Human readable like `3m 20s` |
| `fShort(date)` | `string → string` | `"Jul 13"` |
| `fLong(date)` | `string → string` | `"Jul 13, 2026"` |
| `fTime(date)` | `string → string` | `"9:12 PM"` |
| `scoreLabel(score)` | `number → string` | `"Excellent"` / `"Good"` / `"Developing"` / `"Needs Work"` |
| `highlightTranscript(text)` | `string → JSX` | Highlights fillers (red), `[suggest break]` (green), `[do not break]` (amber) |
| `parseCoachFeedback(text)` | `string → Card[]` | Parses markdown-like coach feedback into `{ title, body, type }` cards |
| `renderMarkdown(content)` | `string → JSX` | Custom markdown renderer: headings, lists, bold, code, alerts, blockquotes, separators |

### 4.4 State Variables (~55 total)

#### Topic Generation
| Variable | Type | Purpose |
|----------|------|---------|
| `category` | string | Speech category ("impromptu", "interview", etc.) |
| `moduleType` | `"public_speaking" \| "interview_preparation"` | Module selector |
| `interviewType` | string | Selected interview type |
| `interviewPersona` | string | Selected persona |
| `difficulty` | string | `"easy"` / `"medium"` / `"hard"` |
| `customTopic` | string | User-typed custom topic |
| `topics` | `GeneratedTopic[]` | Generated topics list |
| `topicLoading` | boolean | Topic generation spinner |
| `topicError` | `string \| null` | Topic generation error |
| `copied` | boolean | Clipboard copy feedback |

#### Audio Recording
| Variable | Type | Purpose |
|----------|------|---------|
| `recordingState` | `"idle" \| "recording" \| "paused" \| "stopped"` | Recorder state machine |
| `audioBlob` | `Blob \| null` | Recorded audio data |
| `audioUrl` | `string \| null` | Object URL for `<audio>` playback |
| `recordSeconds` | number | Recording timer in seconds |

#### Upload & Processing
| Variable | Type | Purpose |
|----------|------|---------|
| `isUploading` | boolean | Upload spinner |
| `uploadError` | `string \| null` | Upload error message |
| `uploadSuccess` | boolean | Upload success flag |
| `polledSpeechId` | `string \| null` | Speech ID being polled for processing status |
| `polledSpeechDetails` | `SpeechHistoryItem \| null` | Current speech details from polling |

#### History & Stats
| Variable | Type | Purpose |
|----------|------|---------|
| `historyList` | `SpeechHistoryItem[]` | Speech history entries |
| `historyLoading` | boolean | History fetch loading |
| `historyError` | string | History fetch error |
| `historyPage` | number | Pagination page number |
| `hasMoreHistory` | boolean | More pages available |
| `historyFilter` | `"all" \| "speaking" \| "interview"` | Sidebar filter |
| `stats` | `SpeechStatistics \| null` | Aggregated user statistics |

#### Interview Sessions
| Variable | Type | Purpose |
|----------|------|---------|
| `activeTrack` | `string \| null` | Selected interview track ID |
| `trackStats` | any | Track-specific progress stats |
| `activeSession` | any | Currently active interview session |
| `expandedReplayRound` | `number \| null` | Expanded round in session replay |

#### Navigation & UI
| Variable | Type | Purpose |
|----------|------|---------|
| `activeTab` | `"console" \| "tracks" \| "library" \| "coach"` | Main content tab |
| `rightTab` | `"feedback" \| "vocab" \| "progress"` | Right sidebar panel tab |
| `showDrawer` | boolean | Practice drawer visibility |
| `showWelcomeOverlay` | boolean | Welcome overlay for cute mode |
| `logoutLoading` | boolean | Logout spinner |

#### Theming
| Variable | Type | Purpose |
|----------|------|---------|
| `cachedIsCute` | boolean | Cute mode cache |
| `normalTheme` | string | Theme variant (`"default"`, `"crimson"`, `"clay"`) |

#### Knowledge Library
| Variable | Type | Purpose |
|----------|------|---------|
| `libraryArticles` | any[] | Knowledge base articles |
| `libraryRecommendations` | any[] | AI-recommended articles |
| `selectedArticle` | `any \| null` | Currently viewing article |
| `libraryTrack` / `libraryCategory` / `librarySearch` | strings | Library filters |
| `libraryLoading` | boolean | Library loading state |
| `tracksList` / `categoriesList` | string[] | Filter dropdown options |

#### AI Coach
| Variable | Type | Purpose |
|----------|------|---------|
| `coachReport` | any | AI coach analysis report |
| `coachLoading` | boolean | Coach report loading |

#### Dictionary Popover
| Variable | Type | Purpose |
|----------|------|---------|
| `selectedWord` | `string \| null` | Word for dictionary lookup |
| `definition` | `string \| null` | Dictionary definition text |
| `isDefLoading` | boolean | Definition loading |
| `popoverPos` | `{ x, y } \| null` | Popover screen position |

### 4.5 Refs

| Ref | Purpose |
|-----|---------|
| `mediaRecorderRef` | MediaRecorder instance |
| `audioChunksRef` | `Blob[]` audio data chunks |
| `timerRef` | Recording timer interval ID |
| `pollingRef` | Speech status polling interval ID |
| `streamRef` | MediaStream from microphone |
| `drawerBodyRef` | Drawer scroll container for UX |

### 4.6 All API Calls

| Function | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| `handleGenerateTopic` | `/api/topics/generate?module_type=...&difficulty=...` | GET | Generate AI speech topic |
| `handleGenerateTrackQuestion` | `/api/topics/generate?module_type=interview...` | GET | Generate track-specific interview question |
| `handleSubmitSpeech` | `/api/speeches/upload` | POST (FormData) | Upload recorded speech audio |
| `startPollingSpeech` | `/api/speeches/{id}` | GET (polling every 3s) | Poll speech processing status |
| `fetchHistory` | `/api/speeches?page=X&limit=10` | GET | Fetch paginated speech history |
| `fetchStats` | `/api/speeches/stats` | GET | Fetch user statistics |
| `fetchTrackStats` | `/api/interviews/question-bank-stats` | GET | Fetch interview track progress |
| `handleStartInterviewSession` | `/api/interviews/sessions` | POST | Start new mock interview session |
| `handleSubmitRoundAnswer` | `/api/interviews/sessions/{id}/rounds/{n}/answer` | POST (FormData) | Submit interview round audio |
| `startPollingRound` | `/api/interviews/sessions/{id}/rounds/{n}/status` | GET (polling 3s) | Poll round processing status |
| `fetchCompletedSessionDetails` | `/api/speeches/{id}` | GET | Fetch completed session details |
| `handleEndInterviewEarly` | `/api/interviews/sessions/{id}/end` | POST | End interview session early |
| `fetchLibraryTracks` | `/api/knowledge/tracks` | GET | Get knowledge library tracks |
| `fetchLibraryCategories` | `/api/knowledge/categories` | GET | Get library categories |
| `fetchLibraryArticles` | `/api/knowledge/articles` | GET | Get library articles |
| `fetchLibraryRecommendations` | `/api/knowledge/recommendations` | GET | AI article recommendations |
| `handleMarkArticleCompleted` | `/api/knowledge/articles/{id}/complete` | POST | Mark article as completed |
| `fetchCoachReport` | `/api/coach/report` | GET | Get AI coach analysis report |
| `handleTextDoubleClick` | `https://api.dictionaryapi.dev/api/v2/entries/en/{word}` | GET (external) | Dictionary word lookup |

### 4.7 All Buttons & Click Handlers

#### Topic Generation & Practice Flow

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **"Generate Topic"** | `handleGenerateTopic` | Calls topic API with category/difficulty/module, sets `topics[]` |
| **Category selector** (Select dropdown) | `setCategory` | Changes speaking category |
| **Module type toggle** (Public Speaking / Interview) | `setModuleType` | Switches module, resets category |
| **Interview type selector** | `setInterviewType` | Changes interview type |
| **Persona selector** | `setInterviewPersona` | Changes interview persona |
| **Difficulty selector** | `setDifficulty` | Changes difficulty level |
| **Custom topic textarea** | `setCustomTopic` | Sets custom topic text |

#### Audio Recording

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **"Start Recording"** | `startRecording` | Gets mic access via `navigator.mediaDevices.getUserMedia()`, creates `MediaRecorder`, starts interval timer. Max 300 seconds auto-stop |
| **"Pause"** | `pauseRecording` | Pauses `MediaRecorder` and timer |
| **"Resume"** | `resumeRecording` | Resumes `MediaRecorder` and timer |
| **"Stop"** | `stopStream` | Stops recording, assembles `Blob` from chunks, creates object URL for playback |
| **"Submit for Evaluation"** | `handleSubmitSpeech` | Validates (≥10s duration, ≤30MB size), creates `FormData` with audio + topic_id + duration, POSTs to `/api/speeches/upload`, starts polling |
| **"Discard"** | `discardRecording` | Clears `audioBlob`, revokes object URL, resets timer |

#### Navigation & State Management

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **"Practice Again"** | `setShowDrawer(true)` | Opens practice drawer |
| **"New Topic"** | Clears topics + opens drawer | `setTopics([]); setShowDrawer(true)` |
| **"Back to Practice"** | Resets upload state | Resets `uploadSuccess`, `polledSpeechId/Details` |
| **"Practice Another Topic"** | Full reset | `discardSpeechAndReset(); setShowDrawer(true)` |
| **"Retry Recording" (on failure)** | Reset + open drawer | `discardSpeechAndReset(); setShowDrawer(true)` |
| **Tab switchers** (Console / Tracks / Library / Coach) | `setActiveTab` | Switches main content area |
| **Right panel tabs** (Feedback / Vocab / Progress) | `setRightTab` | Switches right sidebar |

#### Interview Sessions

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **"Start" / "Retake" (track stage)** | `handleStartInterviewSession` | POSTs to create new session, sets `activeSession` |
| **"Submit Answer" (interview round)** | `handleSubmitRoundAnswer` | Uploads round audio via FormData, starts round polling |
| **"End Interview Early"** | `handleEndInterviewEarly` | POSTs to end session, fetches completed details |
| **"Open Pathway →" (track card)** | `setActiveTrack(id)` | Opens track detail view with stages |
| **Round selector buttons (replay)** | `setExpandedReplayRound` | Expands/collapses round details in session replay |

#### History Sidebar

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **History item click** | Sets polled speech | `setUploadSuccess(true); setPolledSpeechId(item.id); setPolledSpeechDetails(item)` |
| **Filter pills** (All / Speaking / Interview) | `setHistoryFilter` | Filters sidebar history list |
| **Load more (pagination)** | `fetchHistory(nextPage)` | Appends next page to `historyList` |

#### Knowledge Library

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **Article card click** | `setSelectedArticle(art)` | Opens article viewer |
| **"Mark as Completed"** | `handleMarkArticleCompleted` | POSTs completion, updates local `is_completed` flag |
| **Library search input** | `setLibrarySearch` | Filters articles client-side |
| **Track/category filter pills** | `setLibraryTrack/Category` | Re-fetches filtered articles from API |
| **"Clear search query"** | `setLibrarySearch("")` | Clears search |

#### AI Coach

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **Recommended article click** | `handleArticleClick` | Fetches article if needed, opens in library view |
| **"Start Practice →" (recommended track)** | Sets module + tab + track | Navigates to interview track tab |

#### Misc UI

| Button / Action | Handler | What Happens |
|----------------|---------|-------------|
| **"Sign out"** | `handleLogout` | `supabase.auth.signOut(); router.replace("/login")` |
| **Theme selector dropdown** | `setNormalTheme` + `localStorage` | Changes theme (Default / Crimson / Clay) |
| **"Copy" transcript** | Clipboard API | Copies clean transcript text |
| **Double-click on transcript word** | `handleTextDoubleClick` | Fetches definition from dictionaryapi.dev, opens popover at click position |
| **Close popover (×)** | `setSelectedWord(null)` | Closes dictionary definition popover |
| **"Try Answering This" (debate)** | `handleTryAnsweringDebate` | Creates counter-response topic, resets state, opens drawer |
| **Drawer close (× button)** | `setShowDrawer(false)` | Closes practice drawer |
| **Drawer backdrop click** | `setShowDrawer(false)` | Closes practice drawer |
| **Welcome overlay dismiss** | `setShowWelcomeOverlay(false)` | Closes cute mode welcome overlay |

### 4.8 Layout Structure

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Top Navbar: Logo | Theme Selector (non-cute) | Sign Out            │
├─────────────┬───────────────────────────────────┬───────────────────┤
│ Left Sidebar│ Main Content Area                 │ Right Panel       │
│ (260px)     │ (flex-1)                          │ (280px, cond.)    │
│             │                                   │                   │
│ Filter Pills│ Tab: Console                      │ Tab: Feedback     │
│ (All/       │   → Topic Generator               │   → Scores radar  │
│  Speaking/  │   → Audio Recorder                │   → Written review│
│  Interview) │   → Processing Status             │ Tab: Vocab        │
│             │   → Evaluation Results             │   → Lexicon cards │
│ History List│                                   │ Tab: Progress     │
│ (grouped:   │ Tab: Tracks                       │   → Score chart   │
│  Today/     │   → Interview Pathways            │   → Stats grid    │
│  Yesterday/ │   → Stage Progress                │                   │
│  This Week/ │                                   │ (Cute mode:       │
│  Older)     │ Tab: Library                      │  Garden Stats)    │
│             │   → Knowledge Articles            │                   │
│ Pagination  │   → Search/Filter/Read            │                   │
│             │                                   │                   │
│             │ Tab: Coach                        │                   │
│             │   → AI Coach Report               │                   │
│             │   → Recommendations               │                   │
├─────────────┴───────────────────────────────────┴───────────────────┤
│ Practice Drawer (460px slide-in from right)                        │
│   → Topic Generator Form + Audio Recorder                         │
│   → Living garden backdrop (cute mode)                             │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.9 Dashboard Redesign (`app/dashboard/page_redesign.tsx`)

An earlier/alternate version of the dashboard (1111 lines). **Not actively routed** (unused file).

- Uses raw HTML/inline styles instead of Tailwind+Shadcn
- Tabs: "practice" | "analytics" | "history"
- Has: ScoreDial SVG, SkillBar, Waveform visualizer, StatCard, custom chart renderer
- Same core flow: topic generation → recording → upload → polling → results
- **Missing**: Interview sessions, knowledge library, AI coach, tracks

---

## 5. Frontend — UI Components

All located in `frontend/src/components/`.

### 5.1 AdBanner (`components/AdBanner.tsx`)
- **Props**: `placement: "sidebar" | "analytics-footer"`, `hidden?: boolean`
- **Auth**: Uses `{ profile, adConfig }` from `useAuth()`
- **Visibility Logic**: Returns null if:
  - `hidden` is true, or profile/adConfig missing
  - User is superuser
  - User is on `"pro"` or `"pro_plus"` plan
  - Ads globally disabled
  - Placement not in active placements list
- **Theme**: Reads `localStorage.getItem("is_cute_mode")` for cute styling variant
- **Renders**: Placeholder ad container with "Sponsored" badge, title, description
- **No interactive elements** — purely display

### 5.2 RewardedAd (`components/RewardedAd.tsx`)
- **Props**: `onAdWatched: () => void`, `onAdFailed?: (err: string) => void`
- **State**: `loading: boolean`
- **Button**: **"Watch Video (+1 Session)"**
  - `onClick` → `handleWatchAd()`: Simulates 2.5s delay (placeholder), then calls `onAdWatched()`
  - `disabled` when loading, shows "Loading Video..."

### 5.3 Shadcn UI Primitives (`components/ui/`)

| Component | File | Exports | Props/Variants |
|-----------|------|---------|---------------|
| **Avatar** | `avatar.tsx` | `Avatar`, `AvatarImage`, `AvatarFallback`, `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount` | `size?: "default" \| "sm" \| "lg"` |
| **Badge** | `badge.tsx` | `Badge`, `badgeVariants` | Variants: default, secondary, destructive, outline, ghost, link |
| **Button** | `button.tsx` | `Button`, `buttonVariants` | Variants: default, outline, secondary, ghost, destructive, link. Sizes: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg |
| **Card** | `card.tsx` | `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardAction`, `CardDescription`, `CardContent` | `size?: "default" \| "sm"` |
| **DropdownMenu** | `dropdown-menu.tsx` | Full dropdown system: Root, Trigger, Content, Group, Label, Item, CheckboxItem, RadioGroup, RadioItem, Separator, Shortcut, Sub, SubTrigger, SubContent | Built on `@base-ui/react/menu` |
| **Input** | `input.tsx` | `Input` | Wraps `@base-ui/react/input`, forwards all `<input>` props |
| **Label** | `label.tsx` | `Label` | Simple `<label>` with accessibility styling |
| **Progress** | `progress.tsx` | `Progress`, `ProgressTrack`, `ProgressIndicator`, `ProgressLabel`, `ProgressValue` | Built on `@base-ui/react/progress` |
| **ScrollArea** | `scroll-area.tsx` | `ScrollArea`, `ScrollBar` | Built on `@base-ui/react/scroll-area` |
| **Select** | `select.tsx` | `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue` | `size?: "sm" \| "default"` |
| **Separator** | `separator.tsx` | `Separator` | `orientation?: "horizontal" \| "vertical"` |
| **Textarea** | `textarea.tsx` | `Textarea` | Standard `<textarea>` wrapper |

---

## 6. Frontend — Context Providers

### AuthContext (`context/AuthContext.tsx`)

#### Exported Interfaces

```typescript
interface UserProfile {
  email: string;
  is_superuser: boolean;
  plan: string;           // "free", "superuser", "pro", "pro_plus"
  is_cute_mode: boolean;
}

interface AdConfig {
  ads_enabled: boolean;
  provider: string;
  placements: string[];
  is_superuser?: boolean;
  plan?: string;
}
```

#### State Managed (8 variables)

| State | Type | Purpose |
|-------|------|---------|
| `supabase` | `SupabaseClient \| null` | Supabase client instance |
| `user` | `User \| null` | Current authenticated user |
| `session` | `Session \| null` | Current session with access token |
| `loading` | boolean | Auth + profile + ad config loading |
| `error` | `string \| null` | Configuration errors |
| `profile` | `UserProfile \| null` | User profile from backend |
| `adConfig` | `AdConfig \| null` | Ad configuration from backend |
| `profileLoading` / `adConfigLoading` | boolean | Individual loading states |

#### Functions Exposed via `useAuth()`

| Function | API Call | Purpose |
|----------|----------|---------|
| `refreshProfile()` | `GET /api/user/profile` (bearer token) | Re-fetches user profile |
| `refreshAdConfig()` | `GET /api/monetization/config` | Re-fetches ad configuration |

#### Auth Lifecycle

1. **Mount**: Creates Supabase client, gets initial session, subscribes to auth state changes
2. **Session change**: Fetches profile + ad config in parallel
3. **Session clear**: Nulls profile, still fetches ad config (unauthenticated defaults)
4. **Error**: If Supabase env vars missing → renders full-page error card with setup instructions

#### Hook

```typescript
const { user, session, loading, supabase, error, profile, adConfig, refreshProfile, refreshAdConfig } = useAuth();
```

---

## 7. Frontend — Library / Utilities

### `lib/api.ts`
```typescript
export function getApiBaseUrl(): string
// Returns process.env.NEXT_PUBLIC_API_BASE_URL or "http://localhost:8000"
```

### `lib/supabase.ts`
```typescript
export function createSupabaseBrowserClient(): SupabaseClient
// Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// Throws error if either is missing
// Returns createClient(url, anonKey)
```

### `lib/utils.ts`
```typescript
export function cn(...inputs: ClassValue[]): string
// Combines clsx + tailwind-merge for conditional class name merging
```

---

## 8. Frontend — Styling & Theming

### 4 Theme Variants

| Theme | CSS Class | Background | Text | Accent |
|-------|-----------|-----------|------|--------|
| **Default** | `.theme-default` / `:root` | Dark indigo `#121113` | Light lavender `#D0D2F1` | Indigo `#6366f1` |
| **Cute** | `.theme-cute` | Warm ivory `#FFFDF8` | Dark green `#1e3016` | Pink `#EC4899` |
| **Crimson** | `.theme-crimson` | Near-black `#090809` | Salmon `#F4998D` | Red `#F40000` |
| **Clay** | `.theme-clay` | Sandy `#DFD5A5` | Dark brown `#3e3025` | Steel blue `#628395` |

### Theme Switching

- Non-cute users: Theme selector dropdown in navbar → saves to `localStorage`, applies CSS class to `<html>`
- Cute mode: Determined by `is_cute_mode` flag from `GET /api/user/profile` → sets `data-theme="cute"` on document root

### Cute Mode Special Features

- Animated background: blobs, grassy hills, floating daffodil petals, leaves, paw prints
- Glassmorphism cards: 45% white opacity, 20px blur
- Streak display as growing daffodil garden (seed → sprout → bud → bloom)
- Garden Growth progress bar with leaf/flower decorations
- Hexagonal milestone badges (Sprout, Budding Speaker, Daffodil Master)
- Puppy companion card with speech bubble and friendship hearts
- Bouncy button animations, glow borders

### CSS Animations (8 custom)

`recPulse`, `fadeUp`, `scaleIn`, `float-paw`, `float-leaf`, `float-flower`, `blob`, `pulseGlow`, `bloomScale`, `sparkleGlow`

### Scrollbar Styling

4px width, rounded, transparent track — minimal and unobtrusive

---

## 9. Backend — Overview

- **Framework**: FastAPI 0.115.0, served via Uvicorn 0.30.6
- **Entry Point**: `app.main:app` (FastAPI instance in `backend/app/main.py`)
- **Title**: "AI Public Speaking Coach API", version 0.1.0
- **Deployment**: Procfile → `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` (Railway)
- **CORS**: `CORSMiddleware` with origins from `settings.allowed_origins`, credentials allowed, all methods/headers
- **Health Check**: `GET /health` → `{"status": "ok"}` (no auth)

### Router Mount Table

| Prefix | Router Module | Tags |
|--------|--------------|------|
| `/api/auth` | `routes.auth` | auth |
| `/api/topics` | `routes.topics` | topics |
| `/api/speeches` | `routes.speeches` | speeches |
| `/api/monetization` | `routes.monetization` | monetization |
| `/api/user` | `routes.user` | user |
| `/api/interviews` | `routes.interview_bank` | interviews |
| `/api/interviews/sessions` | `routes.interview_sessions` | sessions |
| `/api/knowledge` | `routes.knowledge` | knowledge |
| `/api/coach` | `routes.ai_coach` | coach |

---

## 10. Backend — Authentication & Authorization

### Auth Provider
**Supabase Auth** (JWT-based)

### Supabase Client (`services/supabase.py`)
- Validates `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on module import (raises `ValueError` if missing)
- Creates singleton `supabase: Client` using **service role key** (admin-level, bypasses RLS)

### `get_current_user()` — FastAPI Dependency

```python
async def get_current_user(authorization: str = Header(None)) -> dict:
```

1. Checks `Authorization` header exists → **401** if missing
2. Validates format is `Bearer <token>` → **401** if malformed
3. Calls `supabase.auth.get_user(token)` to verify JWT with Supabase
4. If no user → **401** "Invalid or expired access token"
5. Checks if `user.email.lower()` is in `settings.super_users` → sets `is_super_user` flag
6. Returns: `{ id, email, user_metadata, is_super_user }`

### `get_optional_current_user()` — Optional Dependency

Same logic but returns `None` instead of raising exceptions. Used for endpoints that work with or without auth (e.g., monetization config).

### Auth Flow

```text
1. Frontend → Supabase Auth SDK → signInWithPassword() → Gets JWT
2. Frontend → Backend API (Authorization: Bearer <JWT>)
3. Backend → supabase.auth.get_user(jwt) → Validates with Supabase Auth server
4. Backend → Returns user dict { id, email, user_metadata, is_super_user } or 401
```

### Superuser Detection (2 mechanisms)

1. **`settings.super_users`**: Comma-separated list of emails from env var `SUPER_USERS`. Checked in `get_current_user` → `is_super_user` flag
2. **`settings.superuser_email` / `settings.superuser_cute_email`**: Individual env vars checked in `user.py`, `monetization.py`, `speeches.py` for plan/ad/theme logic

---

## 11. Backend — API Routes (Complete)

### 11.1 Auth Routes (`/api/auth`)

#### `GET /api/auth/me`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Returns authenticated user details from JWT validation |
| Request | None (JWT in header) |
| Response | `{ id, email, user_metadata, is_super_user }` |
| Errors | 401 missing/invalid token |

---

### 11.2 User Routes (`/api/user`)

#### `GET /api/user/profile`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Returns user profile with superuser/plan/cute mode status |
| Response | `{ email, is_superuser, plan, is_cute_mode }` |
| Logic | `is_superuser`: true if email matches `SUPERUSER_EMAIL` or `SUPERUSER_CUTE_EMAIL`. `plan`: `"superuser"` or `"free"`. `is_cute_mode`: true only if email = `SUPERUSER_CUTE_EMAIL` |

---

### 11.3 Topics Routes (`/api/topics`)

#### `GET /api/topics/generate`
| Field | Value |
|-------|-------|
| Auth | Required |
| Response Model | `DbTopicListResponse` (Pydantic) |
| Query Params | `module_type` (default `"public_speaking"`), `category`, `interview_type` (default `"cat_gdpi"`), `interview_persona` (default `"friendly"`), `difficulty` (default `"medium"`), `custom_topic` (optional) |
| Logic | 1. For `interview_preparation` without custom topic: queries `interview_question_bank` for curated question. 2. Calls `generate_speaking_topics()` Gemini service. 3. Inserts into `topics` table. 4. Returns topic list |
| Response | `{ topics: [{ id, title, prompt, context, suggested_points, evaluation_criteria, follow_up_question }] }` |
| Errors | 500 if generation or DB insert fails |

---

### 11.4 Speeches Routes (`/api/speeches`)

#### `POST /api/speeches/upload` (201)
| Field | Value |
|-------|-------|
| Auth | Required |
| Content-Type | `multipart/form-data` |
| Form Fields | `file` (audio), `topic_id` (string, or "null"), `duration_seconds` (integer) |
| Constraints | Duration: 10s–300s. File size: ≤30MB |
| Logic | 1. Validates duration and file size. 2. Uploads to Supabase Storage `{user_id}/{speech_id}.{ext}`. 3. Inserts DB record with `status:"uploaded"`. 4. Schedules background processing pipeline. 5. Returns record |
| Background Pipeline | `status→"transcribing"` → download audio → Gemini transcription → `status→"analyzing"` → Gemini evaluation (scores + feedback) → `status→"completed"` → triggers AI Coach snapshot → deletes audio file |
| Retry Logic | Up to 3 retries with exponential backoff (5s × retry count). Final failure → `status:"failed"` |

#### `GET /api/speeches`
| Field | Value |
|-------|-------|
| Auth | Required |
| Query Params | `page` (default 1), `limit` (default 20) |
| Description | Lists ALL speech attempts AND interview sessions merged, sorted by `created_at` desc |
| Logic | Fetches `speeches` (with joined `topics`), fetches `interview_sessions`, formats both into unified objects, merges, sorts, paginates |
| Response | Array of speech/session objects with `is_session` flag |

#### `GET /api/speeches/stats`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Comprehensive stats aggregation across public speaking + interview preparation |
| Response | `{ total_speeches, completed_speeches, average/best/latest_overall_score, average/best/latest_lexicon_score, score_delta_first, score_delta_prev, percent_improvement, current_streak, longest_streak, is_cute_mode, public_speaking: {...}, interview_preparation: {...} }` |
| Streak Logic | Current streak: must have activity today or yesterday. Longest streak: max consecutive calendar days with activity |

#### `GET /api/speeches/{speech_id}`
| Field | Value |
|-------|-------|
| Auth | Required (ownership check) |
| Description | Full details of a speech OR interview session by ID |
| Logic | Checks `speeches` table first → falls back to `interview_sessions` table. Verifies `user_id` ownership |
| Errors | 403 wrong user, 404 not found |

---

### 11.5 Interview Bank Routes (`/api/interviews`)

#### `GET /api/interviews/types`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Returns all interview types with roadmap definitions |
| Response | `ROADMAPS` dict: `cat_gdpi` (7 stages), `upsc_interview` (7 stages), `software_engineering` (6 stages). Each stage: `{ id, label, difficulty, category }` |

#### `GET /api/interviews/categories`
| Field | Value |
|-------|-------|
| Auth | Required |
| Query Params | `interview_type` (required) |
| Response | Predefined categories from ROADMAPS, fallback to DB query on `interview_question_bank` |

#### `GET /api/interviews/random-question`
| Field | Value |
|-------|-------|
| Auth | Required |
| Query Params | `interview_type` (required), `difficulty` (optional), `category` (optional) |
| Response | Random question from `interview_question_bank` |
| Fallback | Retries without difficulty filter. 404 if no questions found |

#### `GET /api/interviews/question-bank-stats`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Per-track progress, avg scores, weak areas, roadmap stage completion |
| Response | Map by `track_id` → `{ questions_practiced, average_score, best_score, weak_areas, stage_completion: { stage_id: { completed, score, speech_id } } }` |
| Weak Areas | Scores < 75 in: confidence, professionalism, readiness, structure, relevance |

---

### 11.6 Interview Sessions Routes (`/api/interviews/sessions`)

#### `POST /api/interviews/sessions` (201)
| Field | Value |
|-------|-------|
| Auth | Required |
| Body | `{ interview_type, difficulty, roadmap_step, interview_persona?, custom_topic? }` |
| Description | Creates new multi-round (5 rounds max) interview session |
| Logic | Gets question (custom → question bank → Gemini → fallback). Inserts `interview_sessions` + first `interview_exchanges` row |
| Response | `{ session_id, interview_type, difficulty, roadmap_step, interview_persona, current_round:1, max_rounds:5, interviewer_question, status:"active" }` |

#### `GET /api/interviews/sessions/{session_id}`
| Field | Value |
|-------|-------|
| Auth | Required (ownership check) |
| Response | Session details + all exchanges ordered by round_number |

#### `POST /api/interviews/sessions/{session_id}/rounds/{round_number}/answer`
| Field | Value |
|-------|-------|
| Auth | Required (ownership check) |
| Content-Type | `multipart/form-data` |
| Form Fields | `file` (audio), `duration_seconds` |
| Validations | Session must be `"active"`, exchange must be `"pending"` |
| Background Pipeline | Download audio → transcribe → evaluate round → save feedback → if not final round: generate follow-up question + insert next exchange → if final round: run final evaluation pipeline |
| Final Evaluation | Aggregates all rounds → `generate_final_interview_evaluation()` → updates session with `final_evaluation`, `session_summary`, `status:"completed"` → triggers AI Coach |

#### `GET /api/interviews/sessions/{session_id}/rounds/{round_number}/status`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Polls round processing status |
| Response | `{ round_number, status, user_transcript, feedback, next_question, session_status }` |

#### `POST /api/interviews/sessions/{session_id}/end`
| Field | Value |
|-------|-------|
| Auth | Required (ownership check) |
| Description | Ends active session early |
| Logic | Deletes pending exchanges, sets `status:"completed"`, triggers final evaluation as background task |

---

### 11.7 Knowledge Routes (`/api/knowledge`)

**Seed Data**: On module import, inserts 8 articles if table is empty (3× CAT GDPI, 3× Software Engineering, 2× UPSC Interview)

#### `GET /api/knowledge/tracks`
| Field | Value |
|-------|-------|
| Auth | Required |
| Response | Sorted list of distinct track names |

#### `GET /api/knowledge/categories`
| Field | Value |
|-------|-------|
| Auth | Required |
| Query Params | `track` (optional) |
| Response | Sorted distinct category list |

#### `GET /api/knowledge/articles`
| Field | Value |
|-------|-------|
| Auth | Required |
| Query Params | `track`, `category`, `difficulty` (all optional) |
| Response | Articles array with `is_completed` boolean per article |

#### `GET /api/knowledge/articles/{article_id}`
| Field | Value |
|-------|-------|
| Auth | Required |
| Response | Full article + `is_completed` status |

#### `POST /api/knowledge/articles/{article_id}/complete`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Marks article as completed |
| Logic | Verifies article exists, upserts `article_progress` |
| Response | `{ status: "success" }` |

#### `GET /api/knowledge/recommendations`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | AI-powered article recommendations based on user weaknesses |
| Logic | Extracts weakness keywords from latest session + latest 3 speeches → scores articles by keyword matches in title (×3), category (×5), tags (×4) → returns top 4 |

---

### 11.8 AI Coach Routes (`/api/coach`)

#### `GET /api/coach/report`
| Field | Value |
|-------|-------|
| Auth | Required |
| Description | Returns or generates AI coach snapshot |
| Logic | 1. Check `coach_snapshots` → return if found. 2. Check for completed practices → `{ unlocked: false }` if none. 3. Generate first-time snapshot synchronously |
| Response | `{ unlocked: bool, report?: CoachReport }` |
| Regeneration | Called automatically after every speech completion and session completion |

---

### 11.9 Monetization Routes (`/api/monetization`)

#### `GET /api/monetization/config`
| Field | Value |
|-------|-------|
| Auth | Optional |
| Response (unauth) | `{ ads_enabled: true, provider: "placeholder", placements: ["sidebar", "analytics-footer"] }` |
| Response (auth) | Adds `is_superuser`, `plan`. Superusers get `ads_enabled: false` |

---

## 12. Backend — Services

### 12.1 Supabase Service (`services/supabase.py`)

- **`supabase` client**: Singleton `Client` with service role key (admin-level, bypasses RLS)
- **`get_current_user()`**: JWT validation dependency (see Auth section)
- **`get_optional_current_user()`**: Optional JWT validation dependency

### 12.2 Gemini Service (`services/gemini.py`)

#### Model Configuration

| Setting | Value |
|---------|-------|
| Primary model | `gemini-2.5-flash` |
| Fallback model | `gemini-3.1-flash-lite` |
| Key rotation | Multiple comma-separated API keys in `GEMINI_API_KEY`, shuffled randomly |
| Retry strategy | All keys with primary → all keys with fallback → raise error |

#### Service Functions

| Function | Input | Output | Purpose |
|----------|-------|--------|---------|
| `call_generative_model()` | contents, config, models | GenerateContentResponse | Core Gemini API caller with key rotation and model fallback |
| `generate_speaking_topics()` | category, difficulty, count, custom_topic, module_type, interview_type, persona, curated_question | `TopicListResponse` | Generates structured speaking/interview topics |
| `transcribe_audio_bytes()` | audio_bytes, mime_type | `str` | Verbatim transcription with filler words + pacing tags (`[suggest break]`, `[do not break]`) |
| `evaluate_speech_session()` | transcript, topic, category, module_type, etc. | `SpeechEvaluation` | Scores (0-100): overall, pronunciation, fluency, grammar, content, lexicon + written feedback + lexicon suggestions + counter_argument + challenge_questions + interview_metrics |
| `generate_follow_up_question()` | interview_type, difficulty, persona, history | `str` | Generates contextual follow-up question based on all previous Q&A rounds |
| `evaluate_round_response()` | question, transcript, type, difficulty, persona | `RoundEvaluation` | Evaluates single interview round with per-dimension scores |
| `generate_final_interview_evaluation()` | interview_type, difficulty, persona, history | `FinalInterviewEvaluation` | Aggregated multi-round analysis: verdict, strengths, weaknesses, readiness |
| `generate_coach_report()` | speeches, sessions, articles, read_ids | `CoachReport` | Comprehensive AI coaching report: skills, trends, recommendations |

#### Scoring Rubrics

- **Fluency**: Starts at 100, −2 per filler word detected
- **Grammar**: Starts at 100, −4 per grammar error
- **Readiness levels**: Early Preparation (<2 sessions), Needs More Practice (avg <70), Mostly Ready (70–85), Interview Ready (>85)

---

## 13. Database — Full Schema

**Provider**: Supabase PostgreSQL

### Table: `topics`

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK, `gen_random_uuid()` |
| `user_id` | UUID | FK → `auth.users(id)` ON DELETE CASCADE |
| `category` | TEXT | NOT NULL |
| `difficulty` | TEXT | NOT NULL |
| `title` | TEXT | NOT NULL |
| `prompt` | TEXT | NOT NULL |
| `context` | TEXT | NOT NULL |
| `suggested_points` | JSONB | NOT NULL, default `'[]'` |
| `module_type` | TEXT | NOT NULL, default `'public_speaking'` |
| `interview_type` | TEXT | Nullable |
| `interview_persona` | TEXT | Nullable |
| `evaluation_criteria` | TEXT | Nullable |
| `follow_up_question` | TEXT | Nullable |
| `created_at` | TIMESTAMPTZ | NOT NULL, auto |

**RLS**: SELECT/INSERT where `auth.uid() = user_id`

---

### Table: `speeches`

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK, `gen_random_uuid()` |
| `user_id` | UUID | FK → `auth.users(id)` ON DELETE CASCADE |
| `topic_id` | UUID | FK → `topics(id)` ON DELETE SET NULL |
| `storage_path` | TEXT | NOT NULL |
| `original_filename` | TEXT | NOT NULL |
| `mime_type` | TEXT | NOT NULL |
| `duration_seconds` | INTEGER | NOT NULL |
| `status` | TEXT | NOT NULL, default `'uploaded'`, CHECK IN (`uploaded`, `transcribing`, `analyzing`, `completed`, `failed`) |
| `transcript` | TEXT | Nullable |
| `feedback` | JSONB | Stores: `written_feedback`, `lexicon_suggestions`, `counter_argument`, `challenge_questions`, `interview_metrics`, `follow_up_question` |
| `overall_score` | INTEGER | CHECK 0–100 |
| `pronunciation_score` | INTEGER | CHECK 0–100 |
| `fluency_score` | INTEGER | CHECK 0–100 |
| `grammar_score` | INTEGER | CHECK 0–100 |
| `content_score` | INTEGER | CHECK 0–100 |
| `lexicon_score` | INTEGER | CHECK 0–100 |
| `retry_count` | INTEGER | NOT NULL, default 0 |
| `created_at` | TIMESTAMPTZ | NOT NULL, auto |

**RLS**: SELECT/INSERT where `auth.uid() = user_id`

---

### Table: `interview_sessions`

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `auth.users(id)` |
| `interview_type` | TEXT | e.g., `"cat_gdpi"` |
| `difficulty` | TEXT | |
| `roadmap_step` | TEXT | Category/stage label |
| `interview_persona` | TEXT | |
| `status` | TEXT | `"active"` or `"completed"` |
| `current_round` | INTEGER | |
| `max_rounds` | INTEGER | Always 5 |
| `final_evaluation` | JSONB | Overall scores, verdict, strengths, weaknesses |
| `session_summary` | JSONB | Behavioral/communication patterns, recommended tracks |
| `completed_at` | TIMESTAMPTZ | Nullable |
| `created_at` | TIMESTAMPTZ | Auto |

---

### Table: `interview_exchanges`

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `session_id` | UUID | FK → `interview_sessions(id)` |
| `round_number` | INTEGER | 1-based |
| `interviewer_question` | TEXT | |
| `user_transcript` | TEXT | Nullable |
| `storage_path` | TEXT | Nullable |
| `status` | TEXT | `"pending"`, `"processing"`, `"completed"`, `"failed"` |
| `feedback` | JSONB | Per-round scores + written feedback + lexicon suggestions |
| `created_at` | TIMESTAMPTZ | Auto |

---

### Table: `interview_question_bank`

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `interview_type` | TEXT | e.g., `"cat_gdpi"`, `"upsc_interview"` |
| `category` | TEXT | e.g., `"Personal Introduction"` |
| `difficulty` | TEXT | `"easy"`, `"medium"`, `"hard"` |
| `question` | TEXT | |
| `context` | TEXT | Nullable |
| `expected_topics` | TEXT | Nullable |

---

### Table: `knowledge_articles`

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `track` | TEXT | e.g., `"cat_gdpi"`, `"software_engineering"` |
| `category` | TEXT | |
| `title` | TEXT | |
| `content` | TEXT | Markdown content |
| `difficulty` | TEXT | |
| `tags` | JSONB/Array | Array of strings |

---

### Table: `article_progress`

| Column | Type | Constraints |
|--------|------|------------|
| `user_id` | UUID | Composite unique with `article_id` |
| `article_id` | UUID | FK → `knowledge_articles(id)` |
| `completed` | BOOLEAN | |
| `completed_at` | TIMESTAMPTZ | |

**Unique constraint**: `(user_id, article_id)` — used for upsert on conflict

---

### Table: `coach_snapshots`

| Column | Type | Constraints |
|--------|------|------------|
| `id` | UUID | PK |
| `user_id` | UUID | |
| `report` | JSONB | Full `CoachReport` data |
| `created_at` | TIMESTAMPTZ | |

---

### Storage Bucket: `speeches` (Private)

| Path Pattern | Usage |
|-------------|-------|
| `{user_id}/{speech_id}.{ext}` | Individual speech recordings |
| `{user_id}/sessions/{session_id}/{round_number}.{ext}` | Interview round recordings |

> **Privacy**: Audio files are deleted from storage after processing completes.

---

## 14. Backend — Models & Schemas (Pydantic)

### Gemini Service Models (`services/gemini.py`)

| Model | Key Fields |
|-------|-----------|
| `GeneratedTopic` | `title`, `prompt`, `context`, `suggested_points: list[str]`, `evaluation_criteria?`, `follow_up_question?` |
| `TopicListResponse` | `topics: list[GeneratedTopic]` |
| `LexiconSuggestion` | `original_word`, `suggested_replacement`, `explanation` |
| `InterviewMetrics` | `confidence`, `professionalism`, `readiness`, `structure`, `relevance` (all `int`) |
| `SpeechEvaluation` | All 6 scores (0–100), `written_feedback`, `lexicon_suggestions`, `counter_argument?`, `challenge_questions`, `interview_metrics?`, `follow_up_question?` |
| `RoundEvaluation` | `round_score`, `confidence`, `relevance`, `structure`, all 5 scores, `written_feedback`, `lexicon_suggestions` |
| `FinalSessionSummary` | `strengths`, `weaknesses`, `behavioral_patterns`, `communication_patterns`, `recommended_tracks` |
| `FinalInterviewEvaluation` | `overall_score`, `confidence`, `professionalism`, `communication`, `relevance`, `structure`, `readiness_score`, `readiness_rating`, `verdict`, `strengths`, `weaknesses`, `recommended_improvements`, `session_summary` |
| `TrendMetric` | `skill: str`, `change_percentage: int` |
| `RecommendedArticle` | `article_id`, `title`, `category`, `reason` |
| `CoachReport` | `strongest_skill`, `weakest_skill`, `most_improved_skill`, `recommended_focus`, `readiness_level`, `readiness_description`, `strengths`, `weaknesses`, `trend_metrics`, `recommended_tracks`, `recommended_articles` |

### Route Models

| Model | Location | Fields |
|-------|----------|--------|
| `StartSessionRequest` | `interview_sessions.py` | `interview_type`, `difficulty`, `roadmap_step`, `interview_persona` (default `"friendly"`), `custom_topic?` |
| `DbGeneratedTopic` | `topics.py` | `id`, `title`, `prompt`, `context`, `suggested_points`, `evaluation_criteria?`, `follow_up_question?` |
| `DbTopicListResponse` | `topics.py` | `topics: list[DbGeneratedTopic]` |

### Placeholder Modules

- `models/__init__.py`: "Database model definitions will be added with persistence features."
- `schemas/__init__.py`: "Pydantic request and response schemas will be added with API features."

---

## 15. Configuration & Environment Variables

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public API key |
| `NEXT_PUBLIC_API_BASE_URL` | No | Backend URL (default: `http://localhost:8000`) |

### Backend (`backend/.env`)

| Variable | Env Var | Type | Default | Description |
|----------|---------|------|---------|-------------|
| `supabase_url` | `SUPABASE_URL` | str | `""` | Supabase project URL |
| `supabase_service_role_key` | `SUPABASE_SERVICE_ROLE_KEY` | str | `""` | Supabase service role secret (never expose to frontend) |
| `gemini_api_key` | `GEMINI_API_KEY` | str | `""` | Gemini API key(s), comma-separated for multi-key rotation |
| `superuser_email` | `SUPERUSER_EMAIL` | str | `""` | Primary superuser email |
| `superuser_cute_email` | `SUPERUSER_CUTE_EMAIL` | str | `""` | Second superuser email (enables cute mode theme) |
| `allowed_origins` | `ALLOWED_ORIGINS` | list | `["http://localhost:3000"]` | CORS origins (JSON array or comma-separated) |
| `super_users` | `SUPER_USERS` | list | `[]` | Comma-separated superuser emails |

### Field Validators
- `parse_super_users`: Splits comma-separated string → list of lowercased emails
- `parse_allowed_origins`: Tries JSON parse first, falls back to comma-separated split

---

## 16. Deployment & Dev Ops

### Local Development

```bash
# Start both services with one command:
run.bat

# Or individually:
# Frontend (Terminal 1):
cd frontend && npm run dev          # → http://localhost:3000

# Backend (Terminal 2):
cd backend && .venv\Scripts\activate && uvicorn app.main:app --reload  # → http://localhost:8000
```

### Production Deployment

| Component | Platform | Config |
|-----------|----------|--------|
| Frontend | Vercel | Auto-deployed from Git |
| Backend | Railway | Procfile: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Database & Auth | Supabase | Managed PostgreSQL + Auth service |

### Prerequisites

- Node.js 20+, npm 10+
- Python 3.11+
- Git
- Supabase project credentials
- Gemini API key

### Dependencies

**Frontend** (`package.json`): Next.js 14, React 18, Supabase JS, Shadcn/base-ui 4.11, Lucide React, tailwindcss-animate

**Backend** (`requirements.txt`):

| Package | Version | Purpose |
|---------|---------|---------|
| fastapi | 0.115.0 | Web framework |
| uvicorn[standard] | 0.30.6 | ASGI server |
| pydantic-settings | 2.5.2 | Settings management |
| python-dotenv | 1.0.1 | .env file loading |
| supabase | 2.8.1 | Supabase Python client |
| google-generativeai | 0.8.3 | Gemini API SDK |
| python-multipart | latest | File upload support |

---

## 17. Monetization Plan

### Free Plan
- Limited analyses
- Basic dashboard
- **Data Retention**: 7 days
- Ads shown (sidebar + analytics-footer placements)

### Pro Plan
- Unlimited analyses
- Advanced feedback + coaching persona selection
- Progress tracking + interview mode
- **Data Retention**: 90 days (3 months)
- No ads

### Superusers (up to 2)
- Permanent unlimited analyses
- Bypass data retention cleanup
- No ads
- Configured via `SUPERUSER_EMAIL` and `SUPERUSER_CUTE_EMAIL` env vars

### Payment Processing
- **Planned**: Razorpay/Stripe integration (not yet implemented)

---

## 18. File Tree

```text
speech-coach/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              ← Root layout + AuthProvider
│   │   │   ├── page.tsx                ← Landing page (/)
│   │   │   ├── globals.css             ← 4 theme variants + animations
│   │   │   ├── login/
│   │   │   │   └── page.tsx            ← Login page (/login)
│   │   │   ├── register/
│   │   │   │   └── page.tsx            ← Register page (/register)
│   │   │   └── dashboard/
│   │   │       ├── page.tsx            ← Main dashboard (/dashboard) — 4039 lines
│   │   │       ├── page_redesign.tsx   ← Alternate dashboard (unused)
│   │   │       └── page_structure.py   ← Structure reference
│   │   ├── components/
│   │   │   ├── AdBanner.tsx            ← Ad placement component
│   │   │   ├── RewardedAd.tsx          ← Rewarded video ad button
│   │   │   └── ui/                     ← 12 Shadcn UI primitives
│   │   │       ├── avatar.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dropdown-menu.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── progress.tsx
│   │   │       ├── scroll-area.tsx
│   │   │       ├── select.tsx
│   │   │       ├── separator.tsx
│   │   │       └── textarea.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx          ← Auth state + profile + ad config
│   │   └── lib/
│   │       ├── api.ts                  ← API base URL helper
│   │       ├── supabase.ts             ← Supabase browser client
│   │       └── utils.ts                ← cn() class merger
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── .env.local                      ← Frontend env vars
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     ← FastAPI entry point + CORS + routers
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   └── config.py              ← Settings class (pydantic-settings)
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                ← GET /api/auth/me
│   │   │   ├── user.py                ← GET /api/user/profile
│   │   │   ├── topics.py             ← GET /api/topics/generate
│   │   │   ├── speeches.py           ← POST upload, GET list/stats/detail
│   │   │   ├── interview_bank.py     ← GET types/categories/random-question/stats
│   │   │   ├── interview_sessions.py ← POST create, POST answer, POST end, GET status
│   │   │   ├── knowledge.py          ← GET tracks/categories/articles/recommendations, POST complete
│   │   │   ├── ai_coach.py           ← GET /api/coach/report
│   │   │   └── monetization.py       ← GET /api/monetization/config
│   │   ├── models/
│   │   │   └── __init__.py            ← Placeholder
│   │   ├── schemas/
│   │   │   └── __init__.py            ← Placeholder
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── supabase.py            ← Supabase client + auth dependencies
│   │       └── gemini.py              ← All AI functions (topics, transcription, evaluation, coach)
│   ├── requirements.txt
│   ├── Procfile                        ← Railway deployment
│   ├── .env                            ← Backend env vars
│   └── .env.example
│
├── docs/
│   └── README.md
│
├── run.bat                             ← Launch both services
├── README.md                           ← Project overview + setup guide
├── ARCHITECTURE.md                     ← Technical architecture
├── DESIGN_SYSTEM.md                    ← Visual design guidelines
├── PROJECT_STATUS.md                   ← Current implementation status
├── ROADMAP.md                          ← Product phases + monetization plan
├── CHANGELOG.md                        ← History of changes
├── MODULE_MAP.md                       ← Detailed module mapping
├── TASKS.md                            ← Active task list
├── RE_DESIGN.md                        ← Redesign notes
└── .gitignore
```

---

> **Last generated**: July 13, 2026
