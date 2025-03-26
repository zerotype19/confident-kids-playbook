
# Build Docs Index – Confident Kids Playbook

This folder contains all foundational planning and implementation documentation for the Confident Kids Playbook project.

These files define the app’s architecture, flow, rules, and development plan. They are required reading before making any changes or adding new features.

---

## Included Docs

### 1. `Confident-Kids-PRD.md`
**Project Requirements Document**  
Overview of the product vision, core features, tech stack, and in-scope vs out-of-scope work.

### 2. `Confident-Kids-App-Flow.md`
**App Flow Doc**  
Explains the exact sequence of how users move through the app, what they see, and how data is handled.

### 3. `Confident-Kids-Tech-Stack.md`
**Tech Stack Summary**  
All tools, APIs, packages, and third-party integrations. This prevents tech sprawl or duplication.

### 4. `Confident-Kids-Frontend-Guidelines.md`
**Frontend Style Guide**  
Defines fonts, color palette, spacing, icon use, and Tailwind CSS principles for consistent UI.

### 5. `Confident-Kids-Backend-Structure.md`
**Backend Architecture**  
Explains Worker + D1 setup, schema model, API endpoints, and feature flag enforcement.

### 6. `Confident-Kids-Implementation-Plan.md`
**Task-Level Build Plan**  
Breaks down the app into 50+ specific tasks. Cursor AI should only follow one task at a time from this doc.

### 7. `cursor-instructions.md`
**Cursor AI Instruction File**  
Defines strict rules for AI sessions (do not alter schema, structure, or working code).

---

## How to Use This Folder

- Start with the PRD to understand the product
- Follow the Implementation Plan step-by-step
- Always load `cursor-instructions.md` into Cursor on new sessions
- Ask a human before modifying anything structural

This system keeps AI contributors focused, safe, and efficient.
