
# Confident-Kids-Tech-Stack.md

## Core Technologies

- **Frontend**: React + Vite + Tailwind CSS (Cloudflare Pages)
- **Backend**: Cloudflare Worker (`confidence-worker-api`)
- **Auth**: Google Identity Services via `@react-oauth/google`
- **Database**: Cloudflare D1 (`confident-kids-playbook-db`)
- **Storage**: R2-compatible media upload handling
- **Payments**: Stripe Subscriptions
- **CI/CD**: GitHub Actions, Cloudflare auto-deploy on main push

---

## 🔐 Stripe Key Handling

Stripe is used for subscriptions and feature access. Keys should **never be hardcoded**.

Use environment variables:

- `STRIPE_PUBLISHABLE_KEY`: Exposed to frontend
- `STRIPE_SECRET_KEY`: Used in backend Worker only

> Store them securely in `.env.local` (never commit them to GitHub).
