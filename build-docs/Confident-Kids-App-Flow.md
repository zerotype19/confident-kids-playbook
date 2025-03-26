
# App Flow Document – Confident Kids Playbook

When a user visits the app hosted at `confident-kids-playbook` via Cloudflare Pages, they land on the homepage. If they are not signed in, they see a welcoming screen prompting them to log in using Google. Upon clicking the login button, the user is redirected through Google Identity Services. Once authenticated, they are redirected back to the app and dropped into the onboarding flow.

The onboarding flow begins by asking the parent to create their first child profile. This includes the child’s first name, age, and optionally a profile picture. Once the child profile is submitted, the parent is taken to the home dashboard.

The dashboard presents the user with today’s challenge. The challenge content is retrieved via the API Worker (`confidence-worker-api`). If it’s the user’s first time using the app, they see an introductory message explaining how daily challenges work. Each challenge has an explanation, action prompt, and optional media.

After viewing the challenge, the user can mark it as completed and optionally journal thoughts or upload a photo or note. This information is submitted to the backend via the `confidence-worker-api` and stored in the D1 database (`confident-kids-playbook-db`).

From the dashboard, users can navigate to a calendar view populated using `challenge_logs` data queried from the API Worker. Each day shows whether a challenge was completed. Clicking a day reveals the corresponding journal entry.

Users may also access the Practice Modules section, which pulls from the D1 database. Premium modules are gated via feature flags checked at the API level. If the user is on the free tier, the UI prompts them to upgrade.

Navigation allows users to manage child profiles, toggle between them, and view challenge history per child. Profile creation and switching are handled through Worker API calls.

If the user upgrades via Stripe, the `confidence-worker-api` updates their subscription status in the D1 `subscriptions` table. Feature flags are refreshed accordingly.

All user data flows through `confidence-worker-api`, and database access is managed by `confident-kids-playbook-db`. Token-based authentication is required for all write actions.

