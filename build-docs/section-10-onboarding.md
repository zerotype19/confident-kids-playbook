# Section 10 – Onboarding Flow (Family + Child Creation) Instructions for Cursor

## ✅ Component(s): `<OnboardingFlow />`, `<CreateFamilyForm />`, `<CreateChildForm />`
### Routes: `/onboarding/family`, `/onboarding/child`

This flow runs once after user authentication and guides them through setting up their family and at least one child profile.

---

## 🧱 Required Features

### 1. Detect First-Time User
- On login, check if:
  - user has a family (`family_members` exists)
  - user has access to a child

Redirect to `/onboarding/family` if not set up.

---

### 2. Family Creation Form (`/onboarding/family`)
- Simple form: Family Name
- On submit:
```ts
POST /api/family/create
{
  user_id,
  name: string
}
```
- Auto-assign user to family as role = 'parent'

Redirect to `/onboarding/child`

---

### 3. Child Creation Form (`/onboarding/child`)
- Fields:
  - Name
  - Age Range (dropdown)
  - Avatar (optional URL)
- On submit:
```ts
POST /api/children/create
```
- Save `child_id` to global context

Redirect to `/dashboard`

---

### 4. Context Propagation
- After child is created, use `useChildContext()` throughout the app
- Set selected child in localStorage for continuity

---

## 🔒 Rules & Constraints
- DO NOT allow app access without family and child context
- DO NOT allow duplicate onboarding
- DO NOT store child state globally beyond `useChildContext`

---

## ✅ Completion Criteria
- [ ] Detects first-time user automatically
- [ ] Family creation form works and routes properly
- [ ] Child creation form works and saves child
- [ ] Redirects to dashboard on success
- [ ] Child context works app-wide after setup

This concludes core section build instructions.
