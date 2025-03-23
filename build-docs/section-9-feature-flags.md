# Section 9 – Feature Flag System (Frontend + Backend) Instructions for Cursor

## ✅ Feature: Feature Flag System (Premium Gating)

The feature flag system allows selective feature exposure based on the user’s subscription plan (`free` or `premium`).

---

## 🧱 Required Features

### 1. Backend API
Create endpoint:
```ts
GET /api/flags
```

Returns:
```ts
{
  flags: string[] // e.g. ["premium.practice_modules", "premium.journal_export"]
}
```

Logic:
- Lookup user’s `plan` from `subscriptions` table
- Return all flags from `feature_flags` where `enabled_for_plan = user.plan`

---

### 2. Frontend Hook
Create `useFeatureFlags()` hook:
- Loads once per session
- Caches in context
- Returns list of available flags as `string[]`

Usage:
```ts
const flags = useFeatureFlags();
if (flags.includes("premium.dashboard_insights")) {
  // render advanced dashboard features
}
```

---

### 3. Flag Definitions
Flags to include:
- `premium.practice_modules`
- `premium.dashboard_insights`
- `premium.journal_export`
- `premium.calendar_schedule`
- `premium.badge_details`

---

## 🔒 Rules & Constraints
- DO NOT fetch flags on every render
- DO NOT hardcode flags in components — use the hook
- DO NOT expose which features are missing — hide instead

---

## ✅ Completion Criteria
- [ ] Backend API returns correct flags by user plan
- [ ] Frontend hook available app-wide
- [ ] Pages and components respect flag presence
- [ ] No premium features visible to free users

Next: Section 10 → Onboarding (Family + Child Creation)
