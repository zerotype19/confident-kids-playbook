# 🚀 Confident Kids Playbook – Cursor Kickoff Instructions

Welcome to the Confident Kids Playbook build. This document explains everything needed to begin development using Cursor and Cloudflare.

---

## ✅ Project Overview

- **Frontend**: Cloudflare Pages (React + Tailwind)
- **Backend**: Cloudflare Workers (`confidence-worker-api`)
- **Database**: Cloudflare D1
- **Auth**: Google/Apple OAuth
- **Billing**: Stripe subscriptions
- **Design**: Tailwind CSS ONLY – no Chakra, no Bootstrap

---

## 🟨 1. Setup Instructions

### 📦 Download & Unzip These Files

| File | Description | Destination |
|------|-------------|-------------|
| `build-docs.zip` | Section-by-section build instructions | `/build-docs/` (unzip entire folder) |
| `confidant-database-kit.zip` | Database schema, migration, and seed data | Unzip into project root `/` |

---

### 📁 GitHub Repository Layout
```
confident-kids-playbook/
├── build-docs/                 <-- unzip here
│   ├── section-1-dashboard.md
│   ├── ...
│   └── tailwind-ui-guidelines.md
├── schema.sql
├── 0001_init.sql
├── seed_data.sql
```

---

## 🛠️ 2. Cursor Instructions

> Begin with: `build-docs/README.md`

- Start with `section-1-dashboard.md`
- DO NOT move to another section until current is complete and approved
- DO NOT add external UI libraries
- DO NOT modify folder structure, database schema, or route naming

---

## 🧪 3. Wrangler Setup

Install Wrangler CLI:
```bash
npm install -g wrangler
```

Log in:
```bash
wrangler login
```

Run backend dev server:
```bash
cd src/backend
wrangler dev
```

Run frontend dev server:
```bash
cd src/frontend
npm install
npm run dev
```

---

## 🧬 4. Initialize the Database

Run schema:
```bash
wrangler d1 execute confident-kids-playbook-db --file=../../schema.sql
```

Run seed:
```bash
wrangler d1 execute confident-kids-playbook-db --file=../../seed_data.sql
```

---

## ✅ Next Steps

You are now ready to begin development. Start with section 1 and follow `README.md` and `developer-expectations.md` closely.

If anything is unclear: pause and ask.

Let's build a generation of confident kids 👏
