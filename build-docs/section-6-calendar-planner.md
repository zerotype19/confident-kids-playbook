# Section 6 – `/calendar/:child_id` Page (Calendar Planner) Implementation Instructions for Cursor

## ✅ Component: `<CalendarPage />`
### Route: `/calendar/:child_id`

This page allows the parent to view past challenge activity and optionally schedule pillar focus areas for upcoming days (Premium only).

---

## 🧱 Required Features

### 1. Load Calendar View
- Fetch from:
```ts
GET /api/calendar/view?child_id={child_id}&month=YYYY-MM
```

Returns:
```ts
{
  child_id: string,
  days: {
    [YYYY-MM-DD]: {
      completed_challenge_id?: string,
      scheduled_pillar_id?: number
    }
  }
}
```

---

### 2. Render Calendar Grid
- Use a simple 7x5 grid for month view
- Each day shows:
  - ✅ if challenge was completed
  - 🔮 if a pillar is scheduled
  - Clickable for details (optional)

---

### 3. Plan Ahead (Premium)
- Only for premium users (use `useFeatureFlags()`)
- Show dropdown to “Schedule Pillar” on future days
- `POST /api/calendar/schedule`

```ts
{
  child_id,
  date: "YYYY-MM-DD",
  pillar_id: number
}
```

---

## 🔒 Rules & Constraints
- DO NOT use external calendar libraries
- Use basic Tailwind grid for layout
- DO NOT allow scheduling in the past
- DO NOT alter URL structure or naming

---

## ✅ Completion Criteria
- [ ] Loads monthly view with completed and scheduled days
- [ ] Renders calendar grid clearly
- [ ] Premium users can plan future focus days
- [ ] Posts scheduling correctly to API
- [ ] Mobile responsive

Next: Section 7 → Practice Modules (`/practice/:id`)
