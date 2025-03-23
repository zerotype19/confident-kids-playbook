# Section 7 – `/practice/:id` Page (Practice Module Viewer) Implementation Instructions for Cursor

## ✅ Component: `<PracticeModuleViewer />`
### Route: `/practice/:id`

This page presents an interactive, multi-step practice scenario to build parent-child confidence skills through guided decisions and branching feedback.

---

## 🧱 Required Features

### 1. Load Practice Module
- Route param: `id = module_id`
- Fetch with:
```ts
GET /api/practice-module/:id
```

Returns:
```ts
{
  id: string,
  title: string,
  steps: [
    {
      prompt: string,
      choices: [
        { label: string, feedback: string, score: number }
      ]
    },
    ...
  ]
}
```

---

### 2. Step-by-Step UI
- Render one step at a time
- Show prompt
- Render all choices as buttons
- On selection:
  - Show feedback
  - Track score
  - “Next” button to move forward

Use local component state — no Redux or external state libraries.

---

### 3. Completion Summary
At the end, show:
- Final score
- Optional recommendations or unlocked message
- CTA: “Back to Dashboard”

---

### 4. Premium Feature Gate
- Only premium users can access modules
- Gated in routing and via `useFeatureFlags()`:
```ts
if (!flags.includes('premium.practice_modules')) redirectTo('/dashboard');
```

---

## 🔒 Rules & Constraints
- DO NOT use third-party UI libraries
- DO NOT store state globally
- Use Tailwind for layout
- Keep button interaction smooth and accessible

---

## ✅ Completion Criteria
- [ ] Module loads correctly by ID
- [ ] Step-by-step flow works with feedback
- [ ] Score tallies correctly
- [ ] Access restricted to premium users
- [ ] Clean mobile-friendly layout

This completes all core app sections.
Next: Generate `schema.sql` for Cloudflare D1
