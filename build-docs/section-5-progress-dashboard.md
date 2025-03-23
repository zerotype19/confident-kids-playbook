# Section 5 – `/progress/:child_id` Page (Progress Dashboard) Implementation Instructions for Cursor

## ✅ Component: `<ProgressDashboard />`
### Route: `/progress/:child_id`

This page shows a detailed view of the child's progress across all pillars, including daily streak, coin total, and earned badges.

---

## 🧱 Required Features

### 1. Load Progress Summary
- Fetch from:
```ts
GET /api/progress/summary?child_id={child_id}
```

Returns:
```ts
{
  child_id: string,
  streak_days: number,
  total_coins: number,
  pillar_progress: {
    1: number, // Independence
    2: number, // Growth
    3: number, // Social
    4: number, // Strength
    5: number  // Emotion
  },
  badges: string[] // (e.g. ["starter", "streak-3", "bravery"])
}
```

---

### 2. Display Summary Data
Render a top section with:
- 🔥 `streak_days`
- 🪙 `total_coins`
- Bar graph or emoji dots for `pillar_progress`
- Badge gallery (icons or emoji placeholders)

---

### 3. Premium Gating
Use `useAuth()` and `useFeatureFlags()` to unlock:
- Badge explanations
- Monthly breakdown or export
- Pillar comparison over time (future)

---

## 🔒 Rules & Constraints
- DO NOT fetch from multiple endpoints — use `summary` API only
- DO NOT change route naming
- DO NOT use graph/chart libraries unless explicitly approved
- Simple bar/dot styles using Tailwind only

---

## ✅ Completion Criteria
- [ ] Loads streak, coins, pillar activity, and badges from API
- [ ] Badge visuals rendered as emoji or basic styled icons
- [ ] Premium users see additional info
- [ ] Clean mobile and desktop layout

Next: Section 6 → Calendar Planner (`/calendar/:child_id`)
