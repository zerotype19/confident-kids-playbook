
# Backend Structure – Confident Kids Playbook

## Platform

- **Cloudflare Workers**: API is deployed as `confidence-worker-api`
- **Cloudflare Pages**: Frontend is deployed as `confident-kids-playbook`
- **Cloudflare D1 Database**: Named `confident-kids-playbook-db`, with ID: `d0b2d163-3e3b-4193-a091-387e49b7fdb6`
- **Wrangler**: Used for deploying Workers and configuring bindings for Pages/D1

## Authentication

- **Google Identity Services (Google Auth Platform)** is used for sign-in
- The frontend uses `@react-oauth/google` to generate the token
- Token is verified in the Worker (`confidence-worker-api`) against Google’s public keys
- The backend extracts the user's `sub` (Google ID) and email to identify users
- Authenticated requests must include a bearer token
- Sessions are stateless; no session store or cookie-based auth

## Database Schema (D1)

> **NOTE:** Cursor AI is not permitted to modify schema. Schema is maintained via SQL in `schema.sql` and seeded via `seed_data.sql`.

Core tables include:
- `users`: One row per Google-authenticated parent (`sub`, `email`)
- `children`: Linked to `users`, represents each child profile
- `challenges`: Static master list of daily challenges
- `challenge_logs`: Tracks challenge completion per child, per day
- `journal_entries`: Stores text reflections + links to uploaded photos
- `practice_modules`: Gated learning modules
- `subscriptions`: Stores Stripe metadata and premium access flags
- `uploads`: Stores file URLs and metadata for journal attachments

## Storage

- File uploads are sent via frontend to the Worker API (`confidence-worker-api`)
- Uploaded files will be stored (R2 or other secure storage, TBD)
- Uploads are linked to journal entries via the `uploads` table
- Upload access is restricted to owner via user ID checks

## Feature Flags

- Defined in the `subscriptions` table
- Workers check premium access flag before showing gated features
- Stripe webhook will update this flag after checkout

## API Endpoints (planned and active)

- `POST /api/login`: Token verification + user bootstrap
- `POST /api/children`: Create or update child profile
- `GET /api/challenges/today`: Retrieve today’s challenge
- `POST /api/challenge-entry`: Mark challenge as completed
- `POST /api/journal-entry`: Add reflection (text/photo)
- `GET /api/history`: View calendar of `challenge_logs` (challenge completions)
- `GET /api/modules`: View unlocked practice modules
- `POST /api/subscribe`: Create Stripe session
- `POST /api/upload`: Upload a journal photo

## Error Handling

- All endpoints return JSON:
  ```json
  {
    "success": true,
    "data": {},
    "error": null
  }
  ```
- Auth errors return `401`
- Validation errors return `400` with descriptive messages
- `zod` is used for request body validation

## Security Notes

- All write endpoints require token validation
- Users can only access their own child and journal data
- Uploads are scoped by user ID to prevent cross-access
- No full PII is stored in the database
