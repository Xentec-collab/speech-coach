# RE_DESIGN.md - Premium Redesign Specifications

This document outlines the screen specifications (ordered by design priority), component library details, and implementation guidelines for the Default and Cute themes.

---

## 1. Screen Specifications (Prioritized Order)

### Priority 1: AI Coaching Evaluation Dashboard (Flagship Experience)
*   **Purpose**: The central report page showing speech analysis results. It must feel highly valuable, giving the user immediate, actionable growth insights.
*   **Layout Structure**:
    - **Header**: Topic title, category badge, and evaluation date.
    - **Score Section**: Top left. A large, stylized score card containing the overall score.
    - **Skill Breakdown Section**: Center left. Horizontal metric bars displaying individual scores for Pronunciation, Fluency, Grammar, Content, and Lexicon.
    - **Spoken Transcript Section**: Bottom left. Scrollable text container showing the transcribed speech.
    - **Written Feedback Section**: Top right. Structured sections outlining *Key Strengths*, *Areas for Improvement*, and *Delivery Pacing*.
    - **Vocabulary Upgrade Cards**: Center right. A 2x2 card grid showing original word vs. advanced upgrade with context explanations.
    - **AI Counter-Argument Card**: Bottom right. (Available in Debate Mode) Displays the AI's debate counter-arguments and challenge questions.
*   **Theme Specifications**:
    - **Default**: Slate-50 background, white card bodies, slate border lines, deep indigo highlights. Overall score is displayed as `86 / 100`.
    - **Cute (Premium Skin)**: Warm ivory background (`#fdfbf7`), soft rose borders (`#fecdd3`). Overall score is styled inside a warm-tinted card with a soft sticker-like badge, labeled `Score: 86 / 100` (no emojis in headings/labels). Upgrades are rendered in soft pink and daffodil yellow container cards.

### Priority 2: Analytics Dashboard
*   **Purpose**: Shows user progress, daily practice streaks, and improvement trends.
*   **Layout Structure**:
    - **Metrics Row**: 5-column dashboard panel tracking Average Rating, Best Score, Latest Score, Current Streak, and Longest Streak.
    - **Trend Chart**: Wide line chart SVG plotting attempt scores over time.
*   **Theme Specifications**:
    - **Default**: Bold, clean numbers. Chart has a sharp indigo line (`#4f46e5`) with a transparent blue gradient fill.
    - **Cute (Premium Skin)**: Soft pastel pink line (`#f472b6`) with cream-yellow accents. Streaks are represented by custom premium hand-drawn sticker badges (no standard emojis inside the metric cards).

### Priority 3: History & Progress Experience
*   **Purpose**: sidebar listing past attempts to navigate between past evaluations.
*   **Layout Structure**:
    - Vertical list of card items containing topic title, date, duration, and score badge.
*   **Theme Specifications**:
    - **Default**: White buttons with gray border lines; active item has a light blue-gray background.
    - **Cute (Premium Skin)**: Cozy soft cream buttons with thin rose borders; active item has a soft pastel pink border highlight. Uses custom themed status icons (e.g. soft paw indicators) next to history list items.

### Priority 4: Topic Generator Screen
*   **Purpose**: Generates speaking prompts under constraints.
*   **Layout Structure**:
    - Card container containing custom theme text inputs, category selections, difficulty settings, and prompt display blocks.
*   **Theme Specifications**:
    - **Default**: Standard dropdown elements, sharp borders, indigo action buttons.
    - **Cute (Premium Skin)**: Pastel pink button skin, warm ivory inputs, custom themed category select buttons (no emojis on labels or form inputs).

### Priority 5: Practice Terminal
*   **Purpose**: Microphone audio capture interface.
*   **Layout Structure**:
    - Card showing active prompt, record buttons, monospace time count, and audio playbacks.
*   **Theme Specifications**:
    - **Default**: Gray slate interface, sharp recording buttons.
    - **Cute (Premium Skin)**: Ivory background card with rose accents, soft record mic icon, micro-animations on timer state.

### Priority 6: Landing Page
*   **Purpose**: Main visitor landing.
*   **Theme Specifications**:
    - **Default**: Premium typography, clean product features list.
    - **Cute (Premium Skin)**: Personalized cozy landing elements.

### Priority 7: Authentication Screens
*   **Purpose**: Log in, signup, and password recovery pages.
*   **Theme Specifications**:
    - **Default**: Centered cards, minimal borders.
    - **Cute (Premium Skin)**: Warm cream white backgrounds and soft pink details.

---

## 2. Component Specifications

### 1. Overall Score Dial
*   **Default**: High-contrast dark circular dial.
*   **Cute**: Cozy cream circle with soft rose border strokes. Labeled `Score`.

### 2. Rating Sliders / Progress Tracks
*   **Default**: Gray track, indigo progress bar.
*   **Cute**: Light pink track, soft rose progress bar.

### 3. Vocabulary Upgrade Cards
*   **Default**: Dual-row card: original term marked red, replacement green.
*   **Cute**: Cream white cards with soft pink and daffodil yellow divider accents.

### 4. Paw-Print Divider Component
*   **Default**: Standard thin horizontal rule (`<hr className="border-slate-200" />`).
*   **Cute**: Decorative soft hand-drawn paw prints divider line to separate sections elegantly.

---

## 3. Theme Implementation (Frontend Integration)

The frontend applies theme visual styling classes based on `stats.is_cute_mode` metadata:

```tsx
const isCute = stats?.is_cute_mode;

return (
  <div className={isCute ? "theme-cute" : "theme-default"}>
    {/* Page components are styled strictly using custom CSS variables or class mappings */}
  </div>
);
```

### CSS Variables (Tailwind Theme Extensions)
```css
.theme-default {
  --bg-primary: #f8fafc;
  --bg-card: #ffffff;
  --border-color: #e2e8f0;
  --text-main: #0f172a;
  --text-sub: #64748b;
  --accent-color: #4f46e5;
}

.theme-cute {
  --bg-primary: #fdfbf7;
  --bg-card: #ffffff;
  --border-color: #fecdd3;
  --text-main: #4c0519;
  --text-sub: #f43f5e;
  --accent-color: #f472b6;
}
```
*No emojis are used inside form labels, metrics, dashboard analytics cards, action buttons, or navigation labels.*
