
# Implementation Plan – Confident Kids Playbook

> This plan assumes:
- Google Auth is working
- Database schema is fixed
- File structure is locked
- Cursor must not alter existing, working code

## Step-by-Step Build Tasks

### User Onboarding & Family Setup
1. Create `POST /api/login` endpoint to verify Google ID token
2. Store or update user in `users` table (`sub`, email)
3. If user is new, create a new `families` record
4. Insert user as a `family_member` (linked to family)
5. Redirect user to onboarding flow

### Child Profile Creation
6. Build `/onboarding` route to collect child name, age, photo (optional)
7. Create `POST /api/children` to insert into `children` table (linked to `families`)
8. Redirect to dashboard on success

### Dashboard & Daily Challenge Engine
9. Build `/dashboard` route
10. Create `GET /api/challenges/today` endpoint
11. Query `challenges` table to find current challenge (based on date logic)
12. Display challenge title, prompt, tip, and steps

### Journal Entry Feature
13. Add journal input (text area)
14. Add photo upload input (file)
15. Build `POST /api/journal-entry` endpoint
16. Validate text + photo upload (one or both)
17. Save journal to `journal_entries` table (includes `mood_rating`, `tags`)
18. If photo exists, store file via upload endpoint and insert into `uploads`
19. Confirm with success message

### Challenge Completion Tracking
20. Create `challenge_logs` record when journal or “complete” is submitted
21. Include challenge_id, child_id, completion_time
22. Prevent duplicate logs for the same day/child

### Calendar View
23. Build `/calendar` route
24. Create `GET /api/history` endpoint to return child’s `challenge_logs`
25. Use logs to populate calendar UI (not `calendar_schedule`)
26. Clicking a day loads journal via journal API

### Practice Modules
27. Build `/modules` route
28. Create `GET /api/modules` endpoint to return unlocked `practice_modules`
29. Render locked vs unlocked states
30. Gated modules display “Upgrade to Premium” CTA

### Stripe Integration
31. Build `/settings` or `/account` route
32. Add “Upgrade to Premium” button
33. Create `POST /api/subscribe` to launch Stripe checkout
34. On success, insert/update `subscriptions` table
35. Webhook updates subscription status
36. Enable `feature_flags` for premium users

### Feature Flag Logic
37. Load user’s active `feature_flags` on login
38. Check for:
   - `can_upload_media`
   - `can_access_modules`
   - `can_see_history`
39. Gated features respect flags in UI and API

### Multi-Child & Multi-Parent Support
40. Add child selector to nav
41. `GET /api/children` lists children per family
42. Update context when parent switches child
43. Use `families` and `family_members` for access control

### Upload Handling
44. Create `POST /api/upload` endpoint
45. Accept media file, validate type/size
46. Store in R2 (or stub)
47. Save in `uploads` with `journal_entry_id` + `child_id`

### Error Handling & States
48. Handle 401/403 gracefully
49. Handle onboarding-required state
50. Handle empty dashboards and retry logic
51. Validate all input with `zod`

### UI Polish
52. Use Tailwind for layout, spacing, buttons
53. Use Heroicons only
54. Animate with `transition-opacity`, `duration-200`
55. Ensure full responsiveness on mobile

