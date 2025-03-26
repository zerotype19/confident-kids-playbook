
# Confident Kids Playbook – Project Requirements Document (PRD)

## 1. App Overview

The Confident Kids Playbook is a web-based app designed to help parents raise confident, resilient children through a structured system of daily challenges, guided journaling, and skill-building exercises. The app is modeled after the "Raising Confident Kids" playbook and delivers practical tools grounded in five core pillars: Independence, Growth Mindset, Social Confidence, Purpose Discovery, and Managing Fear & Anxiety.

It is optimized for mobile and built with a clean, informal design aesthetic. The MVP will be web-first (Cloudflare Pages + Workers), with plans to support multi-parent collaboration, premium feature gating via Stripe, and progressive content delivery.

## 2. User Flows

Users land on the homepage and are prompted to sign in via Google OAuth. Once authenticated, onboarding begins by asking the user to create a child profile. Each authenticated user becomes part of a family group. Families can have multiple children and multiple parent users.

From there, the primary experience is:
- **Daily Challenge Delivery**: The app presents a confidence-building challenge per day.
- **Response & Reflection**: Parents mark completion and optionally journal thoughts or upload a related photo/note.
- **Progress Tracking**: Users see streaks, history, and stats in a dashboard.
- **Access to Practice Modules**: Deeper training modules are unlocked to reinforce key parenting themes.
- **Calendar/Planner**: Users can look ahead or reflect back on previous challenges.

Users on a free tier see limited challenge history and modules. Premium users unlock full journaling, all practice modules, and historical data.

## 3. Tech Stack & APIs

**Frontend:**
- Vite + TypeScript deployed to Cloudflare Pages under project: `confident-kids-playbook`
- Tailwind CSS for styling
- OAuth via Google Identity Services
- Uploads via API Worker
- Responsive web-first UX, no third-party component libraries

**Backend:**
- Cloudflare Worker named `confidence-worker-api`
- Cloudflare D1 database named `confident-kids-playbook-db` (ID: `d0b2d163-3e3b-4193-a091-387e49b7fdb6`)
- Stripe for subscription billing
- Feature flag logic for free vs premium
- GitHub-triggered auto-deploy to Cloudflare
- Cursor AI used for GitHub commits only

**Auth & APIs:**
- Google Identity Services
- Stripe API for billing
- No PII stored directly; uploads scoped securely

## 4. Core Features

- Google OAuth Sign-in
- Multi-child Profiles
- Daily Challenge Engine
- Journaling (text + media upload)
- Progress Tracker (streaks, calendar view)
- Practice Modules (unlockable content)
- Free vs Premium Tiers (feature flags)
- Stripe Integration for Premium Subscription
- Photo Upload + Storage
- Admin Tools (later)

## 5. In-Scope vs Out-of-Scope

**In-Scope (MVP):**
- Core user onboarding (OAuth + profile creation)
- Daily challenges and journaling
- Child profile management
- Feature flag logic for premium
- Stripe integration for billing
- Secure file upload with journaling
- D1-backed backend via Workers

**Out-of-Scope (MVP):**
- Native mobile apps
- Real-time collaboration between parents
- Push notifications
- In-app chat or social features
- In-depth analytics for parents
- Gamification (badges, points system)
