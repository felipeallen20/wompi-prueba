# AGENTS.md

Instructions for any AI coding agent (e.g. OpenCode) working on this
repository. Read this file — and `CONVENTIONS.md`, `ARCHITECTURE.md`,
`MASTER_PLAN.md`, `TASKS.md` — before making any change.

## Canary

Every response you generate while working on this project must start with the
literal word `Felipe:` (see `CONVENTIONS.md`, section 0). This confirms you
have this context loaded. If you cannot start a response that way, stop and
flag it instead of guessing.

## Reading order

1. `CONVENTIONS.md` — the non-negotiable rules for code, language, and Git.
2. `ARCHITECTURE.md` — the folder structure and layering you must respect.
3. `MASTER_PLAN.md` — the phases, constraints, and the rubric you're
   optimizing for.
4. `TASKS.md` — the current checklist; pick up the next unchecked item unless
   told otherwise.

## Confirmed technical stack

- **Frontend**: Vue 3 SPA with Vuex and Vite — mobile-first, responsive.
- **Backend**: Node.js/TypeScript with Nest.js — Hexagonal Architecture
  (Ports & Adapters), business logic outside controllers, Railway-Oriented
  Programming (ROP) using a simple `Result<T, E>` type.
- **Database**: PostgreSQL with Prisma ORM.
- **Tests**: Jest (>80% coverage on both frontend and backend).
- **Payments**: sandbox integration only; the backend is the single source of
  truth for prices, fees, totals, stock, and transaction status.
- **State resilience**: checkout progress persisted to `localStorage`; CVV and
  full card numbers are never persisted or logged.
- **Git hooks**: lint + test on pre-commit, secondary to the main
  implementation.
- **Cloud provider**: to be decided later.

## Operating rules

- Work one task from `TASKS.md` at a time. Check it off (edit the checkbox)
  once it's done and tested — don't batch unrelated tasks into one change.
- Never violate the layering in `ARCHITECTURE.md` to "save time." If a task
  seems to require crossing a boundary, flag it instead of doing it.
- Write the test alongside the implementation, not as an afterthought — see
  `CONVENTIONS.md` §2.7.
- Follow the English-only rule for everything you write into the repository:
  code, comments, docs, commit messages, UI strings. Only your direct
  conversation with Felipe may be in Spanish.
- Use Conventional Commits and open a PR per feature branch
  (`CONVENTIONS.md` §3).
- Never write the payment provider's name anywhere in the repository (code,
  README, comments, commit messages, branch names).
- Never commit secrets or `.env` files. Use `.env.example` to document
  required variables.
- If a requirement in `MASTER_PLAN.md` conflicts with something Felipe asks
  for in chat, point out the conflict explicitly rather than silently picking
  one.

## When you're unsure

- Prefer asking a short, specific question over guessing on
  architecture-level decisions (data model changes, new dependencies, layer
  violations).
- For small implementation details (naming within a function, exact wording
  of an error message) use your judgement, following `CONVENTIONS.md`.

## Definition of "done" for any task

- Code implemented, respecting the architecture layers.
- Unit test(s) written and passing.
- No magic numbers, no logic in controllers, functions kept small.
- Everything in English (except chat with Felipe).
- Corresponding `TASKS.md` item checked off.
