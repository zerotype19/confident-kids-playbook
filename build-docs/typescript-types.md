# 📐 TypeScript Types – Usage Rules for Cursor

## 🧱 Central Type File

All shared types must be stored in:

- Backend: `src/backend/types.ts`
- Frontend: `src/types.ts` (or import from backend/types)

## 🧬 Usage Rules

- DO NOT redeclare shared objects (e.g., Challenge, JournalEntry)
- Keep challenge shape consistent with `challenges` table
- Use interfaces or types for API payloads

Example:
```ts
export interface Challenge {
  id: string;
  title: string;
  goal: string;
  steps: string[];
  ...
}
```

