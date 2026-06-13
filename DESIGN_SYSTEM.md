# DESIGN_SYSTEM.md - Premium Design System Specification

This document defines the core visual guidelines, spacing tokens, typography, priority rules, and the theme switcher architecture for the AI Public Speaking Coach.

---

## 1. Core Design Philosophy
This product is not a generic AI dashboard. It is a premium skill-development platform designed to build speaker confidence, track structured progress, and highlight personal growth.
- **Aesthetic Tone**: Minimalist, information-dense, clean, and professional.
- **Primary Design References**: Linear, Notion, GitHub, and Stripe Dashboard.
- **Secondary References**: Duolingo progress systems, modern journaling applications, high-end planner layouts.
- **Avoid**: Glassmorphism, neon, futuristic AI highlights, dark cyberpunk layouts, excessive drop-shadows, and generic SaaS hero sections.

---

## 2. Design Priority Allocation

Visual refinements and implementation detail are prioritized in the following order:
1.  **AI Coaching Evaluation Dashboard** (The Flagship Experience - must feel significantly more valuable and premium than the recording step).
2.  **Analytics Dashboard** (Communicating progress, improvement, consistency, and vocabulary growth).
3.  **History & Progress Experience** (Interactive sidebar and log lists).
4.  **Topic Generator** (Constraints forms and generated prompt details card).
5.  **Practice Terminal** (Microphone controls, audio wave elements, and timer).
6.  **Landing Page** (Clean product overview).
7.  **Authentication Screens** (Sign-in, registration, password recovery).

---

## 3. Theme Architecture Specification

The theme system is a **pure visual skin**. Switching themes affects only color properties, backgrounds, borders, dividers, illustrations, and empty states. It does not alter the layout, navigation, component hierarchy, user flows, screen structure, or information architecture.

### Theme Selection Mechanism
- The backend returns an `is_cute_mode` flag in the user profile/statistics payload.
- The frontend loads this flag and sets a `data-theme` attribute on the root document element:
  ```typescript
  document.documentElement.setAttribute("data-theme", isCute ? "cute" : "default");
  ```

---

## 4. Visual Tokens & Theme Specifications

| Token | Default Theme | Cute Theme (Personalized Premium Skin) |
| :--- | :--- | :--- |
| **Philosophy** | Clean developer-centric tool dashboard | Premium, elegant, cozy, and warm planner aesthetic |
| **Visual Ref.** | GitHub, Linear, Stripe | Mofusand, Sanrio stationery, Korean productivity apps |
| **Primary Color** | Slate-950 (`#090d16`) | Soft Pastel Pink (`#fbcfe8` / `#f472b6`) |
| **Secondary Color**| Indigo-600 (`#4f46e5`) | Daffodil Yellow (`#fef08a` / `#facc15`) |
| **Background** | Slate-50 (`#f8fafc`) | Warm Ivory & Cream White (`#fdfbf7` / `#fffdfa`) |
| **Card BG** | White (`#ffffff`) | Cozy Soft Cream (`#ffffff`) |
| **Card Border** | Slate-200 (`#e2e8f0`) | Delicate Rose Border (`#fecdd3`) |
| **Dividers** | Thin Solid Gray Line | Paw-print decorative border accents |
| **Typography** | Bold Slate Headings | Warm Rose-950 (`#4c0519`) Headings |
| **Animations** | Fast transitions (`150ms`) | Gentle, soft micro-animations |
| **Empty States** | Minimal gray text & line icon | Elegant hand-drawn dog-inspired illustrations |

### Critical Constraints for the Cute Theme:
- **No Emoji Overload**: Emojis must **NOT** be placed inside navigation labels, dashboard metrics, analytics cards, form labels, or action buttons. Emojis must be avoided in core data readouts to prevent the interface from looking childish or toy-like.
- **Sticker-like Achievements**: Custom soft badges indicating user progress streaks must look like high-end premium stationery stickers rather than standard bright emojis.
