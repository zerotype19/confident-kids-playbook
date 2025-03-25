# Onboarding Flow Instructions for Authenticated Users

This document defines the **first-time onboarding flow** for new authenticated users of the **Confident Kids Playbook** web app. It includes UI, backend, API, data requirements, and table references based on the current [SQL schema](https://github.com/zerotype19/confident-kids-playbook/blob/main/schema.sql).

---

## 🔐 Authentication & Access Control

- All onboarding features are **only accessible to authenticated users** who have logged in via **Google OAuth**.
- Users are redirected to `/onboarding` immediately after login.
- Once onboarding is complete, users will not see this flow again.
- Access to onboarding is **gated via a new field** in the `users` table:

```sql
ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;
```

- The backend must check and gate access:
  - If `has_completed_onboarding = false` → continue onboarding.
  - If `has_completed_onboarding = true` → redirect to `/home`.

---

## 🌱 Onboarding Flow Overview

This is a **multi-step guided onboarding** with responsive UI, soft-tailored to mobile users using **Tailwind CSS** only.

### Step 1: Welcome Screen
- Message: “Welcome to Confidant! Let’s set up your family so we can personalize your experience.”
- Button: `Get Started →`

### Step 2: Confirm Parent Details
- Pre-fill `name` and `email` from OAuth (Google Profile).
- Form:
  - Display `name` (non-editable).
  - Display `email` (non-editable).
- DB: Data already saved in `users` table.

### Step 3: Create Family and Child Profiles
- **Create a `family`** for this user if none exists.
- User must create **at least 1 child profile** to proceed.
- Form:
  - `child.name` (text, required)
  - `child.birthdate` or `age_range` (optional, for future tailoring)
  - `child.gender` (optional)
- Backend:
  - Create a row in `families`, linked to `users.family_id`.
  - Create rows in `children` table, each linked to `family_id`.

**DB Relationships:**
- `users.family_id` → `families.id`
- `children.family_id` → `families.id`

```sql
INSERT INTO families DEFAULT VALUES RETURNING id;
UPDATE users SET family_id = <new_family_id> WHERE id = <user_id>;

INSERT INTO children (family_id, name, birthdate, gender)
VALUES (<family_id>, 'Charlie', '2018-05-01', 'female');
```

### Step 4 (Optional): Select Child Preferences
- UI shows the 5 Pillars of Confidant (from the `pillars` table).
- For each child, allow selection of up to 3 pillars they want to grow in.
- Use `child_pillar_preferences` join table:

```sql
INSERT INTO child_pillar_preferences (child_id, pillar_id)
VALUES (<child_id>, <pillar_id>);
```

---

## ✅ Final Step: Completion

- Message: “All set! We’re ready to help your family thrive.”
- Button: `Start My Journey →`
- Backend:
  - Mark user as `has_completed_onboarding = true`.
  - Redirect to `/home`.

```sql
UPDATE users SET has_completed_onboarding = TRUE WHERE id = <user_id>;
```

---

## 🧠 Backend API Requirements

### Authenticated API
All onboarding API endpoints must:
- Validate and verify Google ID token.
- Extract `user_id` and associate all writes to the correct user.

### Required Endpoints

#### 1. `GET /api/onboarding/state`
Returns:
- Whether onboarding is complete
- Existing children (if any)
- Family info

#### 2. `POST /api/families`
- Creates a family if one doesn’t exist.
- Links it to `users.family_id`.

#### 3. `POST /api/children`
- Creates one or more children.
- Payload: `[{ name, birthdate?, gender? }]`
- Associates with the user's family.

#### 4. `POST /api/children/:childId/pillars`
- Sets `pillar_id` preferences for a child.

#### 5. `POST /api/onboarding/complete`
- Marks `has_completed_onboarding = true`.

---

## 🎨 Frontend Instructions

- UI must be **mobile responsive** using **Tailwind CSS** only.
- Each onboarding step = a dedicated component/page.
- Form validation:
  - At least 1 child required.
  - No duplicate child names.
  - Max 3 pillar preferences per child.
- Save data after each step via backend API.
- Track multi-step progress in client state (e.g., in memory or localStorage).

---

## 🔁 Redirect & Flow Logic

- After Google login:
  - Call `/api/onboarding/state`.
  - If `has_completed_onboarding = false`, go to `/onboarding`.
  - If `true`, go to `/home`.

- After onboarding complete:
  - Set `has_completed_onboarding = true`.
  - Redirect to `/home`.

---

## ✨ Optional Enhancements

- 🎉 **“You’re all set” screen** with animation or confetti after onboarding.
- 🪪 Pre-fill parent name/email from Google.
- 🧪 Track onboarding steps in app analytics (optional).
- ⛔ Onboarding is **not skippable**.
- 💬 Future child profiles can be added post-onboarding via `/profile` section.

---

## 🗂 Tables Involved

| Table                     | Purpose                                      |
|---------------------------|----------------------------------------------|
| `users`                   | Stores logged-in user info. Add `has_completed_onboarding`. |
| `families`                | Stores family group. One per user.           |
| `children`                | Stores child profiles linked to families.    |
| `pillars`                 | Predefined pillars for child development.    |
| `child_pillar_preferences`| Join table between `children` and `pillars`. |

---

## ✅ Completion Criteria for Cursor

- [ ] Onboarding only shows for authenticated users who haven’t completed it.
- [ ] All backend endpoints validate token and use user ID.
- [ ] Family and at least 1 child created and saved to DB.
- [ ] Optional: Pillar preferences captured.
- [ ] User is marked as having completed onboarding.
- [ ] User is redirected to `/home` upon completion.
