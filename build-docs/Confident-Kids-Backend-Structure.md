
# Confident-Kids-Backend-Structure.md

## Worker API Overview

- Handles login, onboarding, child profile creation, challenge queries, journal entry submission, Stripe checkout, etc.
- Connected to Cloudflare D1 using prepared statements
- Every authenticated request passes Google token for verification

---

## Stripe Integration Notes

- Stripe checkout session is created in `POST /api/subscribe`
- `STRIPE_SECRET_KEY` must be injected securely as an environment variable
- Subscription updates are reflected in the `subscriptions` table
- Premium access is unlocked via `feature_flags`
