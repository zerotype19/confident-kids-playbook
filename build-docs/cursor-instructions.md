
# cursor-instructions.md

## DO NOT:
- Do NOT hardcode or commit Stripe keys
- Always use environment variables like `STRIPE_SECRET_KEY`

---

## Stripe API Key Rule

Stripe keys (`sk_...`) must be passed via environment variables only.  
Cursor may NEVER hardcode these values in source code.
