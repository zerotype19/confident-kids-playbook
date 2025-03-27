# App Structure Guide

## Authentication Flow
- Login via index.html using Google OAuth
- Backend verifies token via Cloudflare Worker route `/verify-token`
- Redirects to `/onboarding` upon success

## App Pages
- `/onboarding` – onboarding flow (should be implemented in `onboarding/`)
- `/dashboard` – main app screen after onboarding
- `/child/:id` – child-specific profile

## Backend
- Worker API endpoints live in `confidence-worker-api`
- Data is stored in Cloudflare D1
- All communication is via REST using fetch

## Design System
- Tailwind CSS only
- Responsive, mobile-first
- Do not introduce any UI libraries

## Cursor-Specific Notes
- Only build inside `/onboarding`, `/dashboard`, or new self-contained folders
- Never touch `index.html`, `auth`, or `login` code
