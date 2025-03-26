
# Tech Stack Document – Confident Kids Playbook

## Frontend

- **Framework:** Vite + TypeScript
- **Styling:** Tailwind CSS (custom soft, neutral palette – no Bootstrap or third-party UI libraries)
- **Authentication:** Google Identity Services (Google Auth Platform) using `@react-oauth/google`
- **Routing & State:** Native React hooks and routing logic (no Redux or external state libraries)
- **Design Approach:** Mobile-first, fully responsive design using Tailwind utility classes
- **Media Handling:** Users can upload text and photos through forms for journaling; uploads stored securely via API
- **UI Principles:** Clean, minimalist, informal style suitable for modern parenting tools

## Backend

- **Platform:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite-compatible)
- **API:** Serverless functions (Workers) handle auth, journaling, child profile creation, and premium access checks
- **Deployment:** GitHub commit triggers auto-deploy via Cloudflare Pages
- **AI Build Management:** Cursor AI used for committing new features, but restricted from editing schema or working code
- **Environment Management:** Wrangler for configuring environments, bindings, and D1 access

## Auth

- **Provider:** Google Identity Services (Google Auth Platform)
- **Implementation:** Using the `@react-oauth/google` package for client-side sign-in; the returned token is verified server-side by your Worker
- **Security:** Backend verifies the ID token against Google’s public keys and extracts user identity from the token payload
- **User Handling:** Each Google account maps to a unique parent account; one parent can manage multiple child profiles
- **Best Practice:** No sensitive user data (e.g. full PII) is stored directly in the D1 database; only necessary metadata

## Payments

- **Provider:** Stripe
- **Functionality:** Subscription model (Free vs Premium) to gate features like journaling history and advanced modules
- **Status:** Stripe integration is planned but not yet implemented

## Feature Flags

- **Logic:** Controlled via user tier (Free or Premium)
- **Usage:** Gating access to Practice Modules, journaling history, uploads, and advanced features

## Packages & Dependencies (partial list)

- `vite`
- `react`, `react-dom`
- `@react-oauth/google`
- `tailwindcss`
- `wrangler`
- `zod` (for schema validation)
- `uuid` (for ID generation)
- `stripe` (for upcoming payment handling)
- `dotenv` (for managing secrets)

## 3rd-Party APIs & Docs

- [Google Identity Services](https://developers.google.com/identity/gsi/web)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/)
