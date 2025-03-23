# Section 2 – `/challenge/:id` Page (Challenge Viewer) Implementation Instructions for Cursor

## ✅ Component: `<ChallengeViewer />`
### Route: `/challenge/:id`

This page displays the full challenge experience for the selected child. It is where a parent reads the challenge content and marks it as completed.

---

## 🧱 Required Features

### 1. Load Challenge Data
- Route param: `id = challenge_id`
- Fetch challenge with:
```ts
GET /api/challenges/:id
```
- Challenge object includes:
  - title
  - description
  - goal
  - steps (array)
  - example_dialogue
  - tip
  - pillar_id

### 2. Load Child Context
- Use `useChildContext()` to include `child_id` in all actions
- Load avatar or first name in page header

---

### 3. Challenge Presentation
Render each of the following sections:

- **Goal**: short one-liner
- **Steps**: render steps as an ordered list (`<ol>`)
- **Example Dialogue**: blockquote with optional emoji
- **Pro Tip**: only if `plan = premium` via `useAuth()` and `useFeatureFlags()`

Style with Tailwind using your global base; no extra libraries or icons.

---

### 4. Completion Flow
- At bottom, show:
  - **Reflection Textarea**: `"What happened during this challenge?"`
  - **Mood Emoji Picker**: 1–5 scale
  - **Complete Challenge** button

**On click:**
```ts
POST /api/challenges/complete
{
  child_id,
  challenge_id,
  reflection: "...",
  mood_rating: 4
}
```

Redirect to `/dashboard` with success toast.

---

## 🔒 Rules & Constraints
- DO NOT change route naming or URL structure
- DO NOT introduce form libraries
- Use Tailwind + native inputs
- DO NOT hardcode challenge data — always fetch from API

---

## ✅ Completion Criteria
- [ ] Loads the challenge content from API
- [ ] Renders all content correctly (goal, steps, tip, etc.)
- [ ] Submits completion state with reflection + mood
- [ ] Respects premium gating rules
- [ ] Returns to dashboard cleanly after complete

Next: Section 3 → Challenge Archive (`/challenges`)
