# Section 4 – `/journal/:child_id` Page (Journal Entry + View) Implementation Instructions for Cursor

## ✅ Component: `<JournalPage />`
### Route: `/journal/:child_id`

This page allows parents to view and add journal entries for the selected child. Entries may be tied to completed challenges or added independently.

---

## 🧱 Required Features

### 1. Load Journal Entries
- Fetch entries with:
```ts
GET /api/journal/list?child_id={child_id}
```

Returns:
```ts
[
  {
    id,
    child_id,
    entry_text,
    mood_rating, // 1–5
    tags: string[],
    created_at: timestamp
  }
]
```

---

### 2. Add New Entry
At the top of the page, show a form with:

- **Textarea** (`placeholder="What happened today?"`)
- **Mood selector** (1–5, emoji-based or stars)
- **Optional tags input** (comma-separated or checkbox)
- Submit → `POST /api/journal/create`

```ts
POST /api/journal/create
{
  child_id,
  entry_text,
  mood_rating,
  tags: ["mistake", "confidence"]
}
```

After submit, reload list below.

---

### 3. Entry List
Render in reverse-chronological order:

- Mood (emoji or score)
- Entry text
- Tags
- Timestamp (friendly format)

---

### 4. Premium Gating (Optional)
Use `useFeatureFlags()` to show premium-only features:
- Export to PDF
- Filter by mood or tags
- Weekly summary view

---

## 🔒 Rules & Constraints
- DO NOT use form libraries or table libraries
- DO NOT hardcode entries — use API only
- DO NOT store data in local state only — persist all submissions
- DO NOT alter route path structure

---

## ✅ Completion Criteria
- [ ] Loads journal entries for child from API
- [ ] Adds new entry with mood + optional tags
- [ ] Premium features hidden unless plan = premium
- [ ] Form clears after submit
- [ ] Entry list updates in-place

Next: Section 5 → Progress Dashboard (`/progress/:child_id`)
