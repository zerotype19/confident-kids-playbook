# Section 3 – `/challenges` Page (Challenge Archive) Implementation Instructions for Cursor

## ✅ Component: `<ChallengeArchivePage />`
### Route: `/challenges`

This page displays a searchable, filterable archive of all available challenges. It lets parents explore other activities beyond the daily recommendation and track what’s already been completed.

---

## 🧱 Required Features

### 1. Load All Challenges
- Fetch from:
```ts
GET /api/challenges/all?child_id={child_id}
```

Returns:
```ts
[
  {
    id,
    title,
    goal,
    pillar_id,
    age_range,
    difficulty_level,
    is_completed (boolean),
    completed_at (timestamp | null)
  },
  ...
]
```

### 2. Filter and Search UI
- Filters:
  - Pillar (dropdown or tabs)
  - Difficulty (1–3)
  - Completed / Incomplete toggle
- Search:
  - By challenge title (fuzzy match or prefix)

Use Tailwind for layout — no UI libraries.

---

### 3. Challenge Cards
- For each result, show:
  - Title
  - Pillar name or badge
  - Completed checkmark if applicable
  - Button: **View** → `/challenge/{id}`

Style with Tailwind. Grid or stacked list view is fine.

---

### 4. Child Context
- Use `useChildContext()` for selected child
- If no child exists, show “Please create a child profile first” state

---

## 🔒 Rules & Constraints
- DO NOT use external table, filter, or UI libraries
- DO NOT change URL or route path
- DO NOT hardcode challenge data — must be fetched
- Do not implement challenge creation — this is a read-only view

---

## ✅ Completion Criteria
- [ ] Loads challenges and renders them with filters
- [ ] Respects selected child context
- [ ] Can filter by pillar, difficulty, and completion
- [ ] Search bar works on title
- [ ] Navigates to `/challenge/{id}` when clicked

Next: Section 4 → Journal Page (`/journal/:child_id`)
