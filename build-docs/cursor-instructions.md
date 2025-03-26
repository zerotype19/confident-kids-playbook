
# Cursor AI Operating Instructions – Confident Kids Playbook

This file must be referenced in every new Cursor AI session. It prevents unintended changes and ensures consistent, safe progress.

---

## DO NOT:
- Do **NOT** alter any existing code that is already working
- Do **NOT** modify the project file structure
- Do **NOT** edit the database schema or `schema.sql`
- Do **NOT** overwrite prior implementations or refactor finished features

---

## YOU MAY:
- Only build **net-new functionality** as defined in the Implementation Plan
- Only edit or create files **directly associated** with the current task
- Ask the developer for clarification before changing anything structural

---

## Tech Stack Summary

- **Frontend:** Vite + React + TypeScript
- **Backend:** Cloudflare Worker (`confidence-worker-api`)
- **Hosting:** Cloudflare Pages (`confident-kids-playbook`)
- **Database:** Cloudflare D1  
  - Name: `confident-kids-playbook-db`  
  - ID: `d0b2d163-3e3b-4193-a091-387e49b7fdb6`
- **Authentication:** Google Identity Services via `@react-oauth/google`
- **Styling:** Tailwind CSS (no component libraries)
- **Media Uploads:** Handled securely, stored via API and tracked in `uploads` table
- **Payments:** Stripe integration
- **Feature Access:** Controlled by `feature_flags`

---

## Core Data Model

- Each **user** belongs to a **family**
- **Children** are linked to **families**, not users
- Daily challenge progress is tracked in `challenge_logs`
- Journal reflections stored in `journal_entries`, optional media in `uploads`
- Premium access managed by `subscriptions` + `feature_flags`

---

## Resuming After Context Reset

**STOP and follow this checklist:**

1. Do not assume prior memory.
2. Open and read the `/build-docs/` folder:
   - Start with the PRD and App Flow
   - Then check Tech Stack and Backend Docs
   - Only execute the **next** step in the Implementation Plan
3. Confirm the last implemented feature with the developer before proceeding.
4. If unsure, ask for guidance — do not guess.

---

## Source of Truth

- `/build-docs/`
  - Project Requirements Doc (PRD)
  - App Flow Doc
  - Tech Stack Doc
  - Frontend Guidelines
  - Backend Structure
  - Implementation Plan

- `/schema.sql`: Authoritative source of database schema

---

This document should be referenced **anytime a new Cursor session begins** or when recovering from bugs, restarts, or long pauses in development.
