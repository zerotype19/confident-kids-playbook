# 🔒 Build Guidelines for Cursor

> These guidelines apply to all development work, including onboarding flow and beyond. Please read carefully before making any changes.

## ☑️ DO:
- Follow the specs defined in the corresponding `.md` files in the `/build-docs` folder.
- Reference existing SQL schemas without altering them unless explicitly instructed.
- Build new frontend and backend code assuming existing schema compatibility.
- Use Tailwind CSS only for frontend UI work.
- Respect authenticated state as defined.
- Use Cloudflare Workers for backend API and D1 for the database.

## ⛔️ DO NOT:
- Modify any existing database tables or schema without **explicit permission**.
- Introduce new libraries or frameworks beyond what is already defined (e.g., no Bootstrap, Chakra, etc.).
- Change login/authentication flows.
- Introduce new UI/UX paradigms without guidance (e.g., modal frameworks, stepper libraries).
- Make onboarding flow visible to returning users.

---

# Onboarding Flow Instructions for Authenticated Users

This document defines the **first-time onboarding flow** for new authenticated users of the **Confident Kids Playbook** web app. It includes UI, backend, API, data requirements, and table references based on the current [SQL schema](https://github.com/zerotype19/confident-kids-playbook/blob/main/schema.sql).

---

## 👩‍💻 Implementation Guidelines (Cursor-Specific)

### ✅ Frontend Location
- Please implement the onboarding flow as a new page under:
  ```
  src/pages/onboarding.tsx
  ```
- This ensures it’s registered with the routing system.
- All supporting components can go into:
  ```
  src/components/onboarding/
  ```

### ✅ Backend / API Logic
- Backend endpoints should be implemented in the existing API Worker, within a logical structure like:
  ```
  /api/onboarding/
  ```

### ✅ Schema Review
- Yes, please review the [`schema.sql`](https://github.com/zerotype19/confident-kids-playbook/blob/main/schema.sql) file to understand table relationships and usage. Key tables for onboarding include:
  - `users` (add `has_completed_onboarding`)
  - `families`
  - `children`
  - `pillars`
  - `child_pillar_preferences`

### ✅ Onboarding Guidelines File Access
- Use this file (`onboarding-with-guidelines.md`) as the **source of truth**.
- No need to fetch from GitHub – all content is here and loaded into Cursor memory.

### ✅ Authentication Integration
- The onboarding flow **must only show after successful Google OAuth login**.
- The frontend already redirects to `/onboarding` post-login.
- Backend endpoints must:
  - Verify the Google ID token.
  - Extract the `user_id`.
  - Use `users.has_completed_onboarding` to determine whether to proceed with onboarding or not.

---

## 🔐 Authentication & Access Control

- Users are redirected to `/onboarding` immediately after login.
- Once onboarding is complete, users will not see this flow again.
- Access to onboarding is **gated via a new field** in the `users` table:

```sql
ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;
```

- The backend must check and gate access:
  - If `has_completed_onboarding = false` → continue onboarding.
  - If `has_completed_onboarding = true` → redirect to `/home`.

...

# [Remaining onboarding content unchanged from previous version — truncated here for brevity]

(Keep all remaining content from previous `onboarding.md` version here, unmodified)
