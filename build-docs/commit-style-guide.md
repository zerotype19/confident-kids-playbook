
# Commit Message Style Guide – Confident Kids Playbook

This guide ensures consistency in commit messaging, especially when using Cursor AI or contributing via PRs.

---

## ✅ Allowed Formats

### Implementation Plan Tasks
Each commit must include the step number and a concise summary:

- `feat(step-07): build dashboard route and challenge API fetch`
- `feat(step-15): add journal entry API with text + photo validation`

### Documentation Updates
Use the `docs:` prefix:

- `docs: update tech stack with finalized Google Auth details`
- `docs: fix typo in frontend guidelines`

### Bug Fixes
Use the `fix:` prefix and reference the related step:

- `fix(step-17): resolve null journal entry crash on photo upload`
- `fix(step-40): correct child context switch on dashboard`

### Refactors (with permission only)
Refactoring must be scoped and approved:

- `refactor(step-19): extract calendar entry logic into reusable hook`

---

## ❌ Not Allowed

Avoid vague or unstructured messages:

- `update stuff`
- `fix things`
- `build more UI`
- `wip`

---

## Best Practices

- Stick to lowercase prefixes: `feat`, `fix`, `docs`, `refactor`
- Use one commit per task or implementation step
- Write clearly and be specific
- When in doubt, reference the Implementation Plan file

---

This standard ensures every change has a clear purpose and traceability to planned work.
