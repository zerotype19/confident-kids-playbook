# 🚀 Confident Kids Playbook

Welcome to the development repository for **Confident Kids Playbook** — a web-based SaaS app designed to help parents build confidence in their children using guided challenges, journaling, and progress tracking.

This app is deployed using:
- **Cloudflare Pages** (`confident-kids-playbook`)
- **Cloudflare Worker API** (`confidence-worker-api`)
- **Cloudflare D1 Database** (schema included)

---

## 📦 Project Structure

```
confident-kids-playbook/
├── src/
│   ├── backend/              # Cloudflare Worker backend API
│   ├── frontend/             # React (Vite) frontend
│   ├── components/           # Shared UI
│   ├── pages/                # Page routes
│   └── worker/               # API logic
├── build-docs/               # 📁 Development instructions for Cursor
├── schema.sql                # Full D1 database schema
├── 0001_init.sql             # Initial migration
├── seed_data.sql             # Sample user + child + challenge data
├── wrangler.toml             # Cloudflare configuration
```

---

## 🛠️ Developer Guidelines (Cursor, Read This First)

1. **All implementation instructions live in `/build-docs/`**
2. You MUST follow each section in order (start with `section-1-dashboard.md`)
3. DO NOT change folder structure, routes, database schemas, or install new libraries
4. Use the files below as your build manual:

| File                                 | Purpose                             |
|--------------------------------------|-------------------------------------|
| `Cursor-README.md`                   | Rules and constraints               |
| `Confidant-app-spec.md`              | Complete product spec               |
| `Build-Task-Checklist.md`            | Build order by section              |
| `sections/section-*.md`              | One file per UI section             |
| `testing-guidelines.md`              | Testing rules                       |
| `copy-guidelines.md`                 | UX writing style + labels           |
| `developer-expectations.md`          | Cursor behavior expectations        |
| `error-handling.md`                  | HTTP and UI error responses         |

---

## ✅ To Get Started

1. Start with `section-1-dashboard.md`
2. Confirm it meets requirements and commit your code
3. Move to `section-2-challenge-viewer.md`
4. Use types from `/src/backend/types.ts` and `/src/types.ts`
5. Use D1 schema from `/schema.sql` and `/seed_data.sql`

Do not build or change anything not explicitly listed in your current section.

Let’s build this app one solid piece at a time 💪


---

## 🎨 UI Design Framework

This project uses **Tailwind CSS only** for all layout and UI styles.  
You MUST follow the rules defined in `build-docs/tailwind-ui-guidelines.md`.  
- No Chakra, Material UI, or Bootstrap
- All components must be mobile responsive
