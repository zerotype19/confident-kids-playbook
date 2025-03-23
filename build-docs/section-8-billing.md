# Section 8 – `/settings/billing` Page (Billing & Subscription Settings) Instructions for Cursor

## ✅ Component: `<BillingSettingsPage />`
### Route: `/settings/billing`

This page allows the user to view their current plan, manage billing via Stripe, and upgrade to Premium.

---

## 🧱 Required Features

### 1. Load Current Plan
- Fetch plan status with:
```ts
GET /api/subscription/status
```

Returns:
```ts
{
  user_id: string,
  plan: 'free' | 'premium',
  stripe_customer_id: string | null
}
```

Display:
- Plan name
- Benefits of current plan
- Upgrade CTA if `plan = free`

---

### 2. Upgrade Button
For free users:
- Button: “Upgrade to Premium”
- On click, call:
```ts
POST /api/subscription/create-portal-session
```

Redirect to returned URL:
```ts
{ url: "https://billing.stripe.com/..." }
```

---

### 3. Stripe Webhook Support
- Webhook path: `POST /api/subscription/webhook`
- Parses Stripe events and updates `subscriptions` table

> Stub implementation for webhook already defined in API stub doc.

---

## 🔒 Rules & Constraints
- DO NOT change route path or file names
- DO NOT allow downgrade or cancel via UI (Stripe only)
- DO NOT show billing info for non-authenticated users

---

## ✅ Completion Criteria
- [ ] Correctly loads user’s subscription plan
- [ ] Displays upgrade option only when `plan = free`
- [ ] Upgrade CTA launches Stripe portal session
- [ ] Premium confirmation works on return visit

Next: Section 9 → Feature Flag Handling
