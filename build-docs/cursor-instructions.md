# cursor-instructions.md

## ⛔️ ABSOLUTE RESTRICTIONS (Do Not Modify)

Cursor MUST NOT modify any of the following files unless specifically requested:

- `index.html`
- Any files in `public/`
- Any files under `/auth/`, `/login/`, or related to Google OAuth
- Any files handling `token verification`, `session`, or `routing` logic
- Any `.env`, `secrets`, or `deployment` configuration files
- Any existing Tailwind config, auth config, or global state

---

## ✅ WHAT YOU CAN DO

Cursor may build new features as long as:
- They are **in self-contained folders**, like `onboarding/`, `child-profile/`, or `daily-challenges/`
- They **use the Tailwind styling system already in place**
- They **use `fetch()` to call backend Cloudflare Workers API** as documented in `API_STRUCTURE.md`
- They do not interfere with working login or routing behavior

---

## 📘 AUTH FLOW OVERVIEW

- Login via Google OAuth (handled in `index.html`)
- After auth, user is redirected to `/onboarding`
- Valid tokens are verified via the Worker API at `/verify-token`
- Once onboarding is complete, users land on `/dashboard`

---

## 🔄 API INTEGRATION

- Use fetch to call Cloudflare Worker routes (e.g. `POST /api/users`, `PUT /api/children`)
- Refer to `build-docs/api-spec.md` for current endpoints

---

## 🧠 HELPFUL RULES

- Use only Tailwind CSS. No external libraries.
- Do not create new layout or routing systems.
- Use `<Suspense>` and lazy load if routing is needed.
- Use environment variables like `STRIPE_SECRET_KEY`, not hardcoded keys.

