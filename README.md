
# Confident Kids Playbook

A web-based parenting app to help parents raise confident, resilient children through guided daily challenges, journaling, and interactive practice modules.

---

## 🛠 Developer Setup

This repo uses a strict, AI-safe development structure to ensure quality, control, and repeatability.

All planning and implementation documentation lives in [`/build-docs/`](./build-docs/).

Before contributing:

- 📘 Read `/build-docs/cursor-instructions.md`  
- 📘 Read `/DEV_NOTE_README.md` (rules and expectations)
- 🛠 Follow one step at a time from `/build-docs/Confident-Kids-Implementation-Plan.md`
- ✅ Use commit messages per `/commit-style-guide.md`

---

## 💡 Stack Overview

| Layer     | Tooling |
|-----------|--------|
| Frontend  | Vite + React + Tailwind (Cloudflare Pages) |
| Backend   | Cloudflare Workers (`confidence-worker-api`) |
| Auth      | Google Identity Services |
| Database  | Cloudflare D1 (`confident-kids-playbook-db`) |
| Payments  | Stripe Subscriptions |
| Uploads   | Stored securely, tracked in `uploads` table |

---

## 📂 File Structure Highlights

```
.
├── build-docs/              # All planning, flow, and implementation files
│   ├── Confident-Kids-*.md  # Core documents
│   ├── cursor-instructions.md
│   ├── README.md            # Index to build-docs
│   └── sections/            # Optional detailed technical breakdowns
├── DEV_NOTE_README.md       # Core dev rules and boundaries
├── commit-style-guide.md    # Commit formatting rules
├── schema.sql               # Cloudflare D1 schema
├── .github/
│   └── workflows/
│       └── pr-doc-validator.yml  # PR checks and enforcement
```

---

## 🔐 Cursor AI & Contributor Flow

- Start every AI session by pasting the setup block from `cursor-commands.md`
- Cursor must **never alter** working code, schema, or structure
- Only implement one step from the Implementation Plan at a time
- Confirm completion before moving forward

---

## 📎 Helpful Files

- [`cursor-commands.md`](./build-docs/cursor-commands.md) – copy/paste prompts for AI
- [`pull_request_template.md`](./.github/pull_request_template.md) – standard PR format
