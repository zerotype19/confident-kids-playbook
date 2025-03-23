# Section 1 – `/dashboard` Page Implementation Instructions for Cursor

## ✅ Component: `<DashboardPage />`
### Route: `/dashboard`

This is the central home screen for the logged-in user. It displays the Daily Challenge, child's progress summary, and recent activity.

---

## 🧱 Required Features

### 1. Load Selected Child Context
- Use `useChildContext()` to get the active `child_id`
- Show the child's first name and avatar (optional) at top of screen

### 2. Daily Challenge Card
- Fetch data using:
```ts
GET /api/challenges/today?child_id={child_id}
```
- Render a `<ChallengeCard />` component with:
  - Challenge title
  - Pillar name or icon (e.g., Independence, Resilience)
  - Goal
  - Short description (1–2 lines)
  - CTA: **Start Challenge** → navigates to `/challenge/{challenge_id}`

### 3. Completed State
- If today’s challenge was already completed:
  - Replace CTA with a ✅ Completed message
  - Show submitted reflection (if available)

### 4. View All Challenges Button
- Button: **View All Challenges** → navigates to `/challenges`

### 5. Streak & Coin Summary
- Fetch via:
```ts
GET /api/progress/summary?child_id={child_id}
```
- Display:
  - Current streak in days (🔥 emoji okay)
  - Total coins earned (coin emoji okay)

### 6. Premium Gating (Use Feature Flags)
If the user has `plan = premium`, also show:
- Tip and Example Dialogue from daily challenge
- Pillar progress bar
- Unlocked badges

Use:
```ts
const flags = useFeatureFlags();
if (flags.includes('premium.dashboard_insights')) { ... }
```

---

## 💡 UI Component Breakdown
- `<DashboardPage />`
  - `<ChildSwitcher />` (dropdown to switch between children)
  - `<ChallengeCard />`
  - `<StreakTracker />`
  - `<ProgressSummary />`

---

## 🔒 Rules & Constraints
- DO NOT change file or folder structure
- DO NOT use any third-party components or UI libraries
- DO NOT change route path or naming
- Use Tailwind from global styles
- Stay within spec at `/src/Confidant-app-spec`

---

## ✅ Completion Criteria
- [ ] Page displays correctly for logged-in user with selected child
- [ ] Daily challenge loads and displays correctly
- [ ] Challenge can be marked completed
- [ ] View All Challenges button links correctly
- [ ] Progress summary loads correctly
- [ ] Premium gating logic works for tips/progress

Next: `/challenge/:id` → Challenge Viewer Flow
