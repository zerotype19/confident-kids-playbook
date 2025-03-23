# 🧪 Confident Kids Playbook – Testing Guidelines for Cursor

## ✅ Purpose
Define expectations for unit, integration, and E2E testing throughout the app and backend routes.

---

## 1. API Route Testing

- Use Workers playground or Cloudflare test harness
- Test:
  - Unauthorized access (401)
  - Invalid params (400)
  - Valid request (200)
- Example:
```ts
test("GET /api/challenges/today returns 401 without token", ...)
```

---

## 2. Frontend Component Testing

- Use React Testing Library
- Test:
  - Inputs and buttons
  - State changes and conditional rendering
  - API call simulation using mock fetch

---

## 3. Page Rendering

- Minimal snapshot test coverage
- Conditional content (e.g. free vs premium)

---

## 4. Manual E2E (Optional)

- Bonus: Setup Playwright or Cypress to click through app as parent user
- Required only for:
  - Onboarding flow
  - Stripe upgrade
  - Journal entry + dashboard update

---

## 5. Rules

- Place frontend tests in: `/frontend/src/__tests__/` or next to components
- Place backend tests in: `/backend/tests/`
- DO NOT test unscaffolded features
- Use seed data for repeatable state

