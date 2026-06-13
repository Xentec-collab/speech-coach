# Roadmap

## Phase 1: MVP

Goal: Prove the core user flow.

- Authentication.
- Dashboard.
- Topic generation.
- Browser recording.
- Speech transcript handling.
- Gemini feedback.
- Speech history.

Success criteria:

1. A user can register.
2. A user can log in.
3. A user can generate a topic.
4. A user can record a speech.
5. A user can receive Gemini feedback.
6. A user can view one analysis.
7. A user can view history.

## Phase 2: Product Quality

- Streaks.
- Daily challenges.
- Progress graphs.
- Improved UI polish.
- Better error handling and loading states.
- Basic usage analytics.

## Phase 3: Monetization

- Free plan.
- Pro plan.
- Razorpay integration.
- Free trial.
- Usage limits.
- Billing status checks.

## Phase 4: Expansion

- Interview practice.
- IELTS practice.
- Group practice.
- Leaderboards.
- Advanced feedback categories.

## Monetization Plan

Free plan:

- Limited analyses.
- Basic dashboard.
- **Data Retention**: Speech logs, transcripts, and analytics are only stored for **7 days**.

Pro plan:

- Unlimited analyses.
- Advanced feedback.
- **Feedback Customization**: Choose preferred coaching persona (e.g., Strict, Encouraging, Academic) and request highly detailed/descriptive feedback reports.
- Progress tracking.
- Interview mode.
- **Data Retention**: Speech logs, transcripts, and analytics are stored for **3 months (90 days)**.

The platform owner will provide the Gemini API key. Users will not provide their own API keys.

## Administrative Super Users
* Configure up to **2 administrative superuser accounts** (e.g., via emails or an `is_super_user` database flag).
* These accounts will bypass all plan limits, having **permanent unlimited analyses** and bypassing standard data retention cleanup.
