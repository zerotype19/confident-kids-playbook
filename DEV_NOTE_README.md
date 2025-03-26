
# DEV_NOTE_README.md

## Confident Kids Playbook – Cursor AI Execution Rules

This file is for developers (or AI tools like Cursor) working on this project. It defines the boundaries, workflow rules, and core architecture.

---

### CORE RULES

- ❌ DO NOT change working code
- ❌ DO NOT modify file structure
- ❌ DO NOT touch `schema.sql` or any migration files
- ✅ ONLY work on the *next* open task from the Implementation Plan
- ✅ Follow commit conventions in `commit-style-guide.md`
- ✅ Load and follow `cursor-instructions.md` in every new Cursor AI session

---

### ENVIRONMENT

- Frontend: `confident-kids-playbook` (Cloudflare Pages)
- Backend: `confidence-worker-api` (Cloudflare Worker)
- Database: `confident-kids-playbook-db` (D1 ID: d0b2d163-3e3b-4193-a091-387e49b7fdb6)
- Auth: Google Identity Services via `@react-oauth/google`
- Styling: Tailwind CSS
- Payments: Stripe Subscriptions
- Uploads: R2 (or similar), logged in `uploads` table

---

### DATA MODEL SUMMARY

- Users are linked to Families via `family_members`
- Families own Children
- Daily challenge completions are stored in `challenge_logs`
- Journal reflections go in `journal_entries`
- Gated features controlled by `feature_flags` and `subscriptions`

---

### RESET CHECKLIST

If you are starting fresh or reloading after a context loss:

1. Read all `/build-docs/` files:
   - `Confident-Kids-PRD.md`
   - `App Flow.md`
   - `Tech Stack.md`
   - `Backend Structure.md`
   - `Implementation Plan.md`
   - `cursor-instructions.md`
2. Confirm last completed step with a human
3. Resume with the next Implementation Plan item ONLY

---

### SAFE FILE ZONES

You MAY edit:
- Files related to the **current feature task**
- Any utility/helper file **created in this session**

You MAY NOT:
- Edit auth, routing, config, or data models unless explicitly instructed

---

### REFERENCES

- `/build-docs/cursor-instructions.md`: strict Cursor rules
- `/build-docs/Confident-Kids-Implementation-Plan.md`: what to build next
- `/commit-style-guide.md`: how to write commits

---

Always confirm current task status before you start. Cursor AI should only act on explicit instructions tied to a known step.
