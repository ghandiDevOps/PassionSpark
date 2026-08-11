---
description: Autonomous work session — triage + implement one task, open draft PR
---

# Auto-work session

You are running autonomously while the user is away. Do **one** unit of useful work, then stop.

## Step 1 — Sync context

Read in parallel:
- `../LAST_SESSION.md` (task queue — "Prochaine tâche" section)
- `../ROADMAP.md` (stage priorities)
- `git status`, `git log -10 --oneline`, `git branch -a`

## Step 2 — Triage (scenario C)

Compare `LAST_SESSION.md`'s "Prochaine tâche" list against actual repo state:
- If a listed task is already done in the code (e.g., file exists, tests pass), mark it `[done]` and skip
- If new critical work appeared (failing tests, broken build, security issue), promote it to top
- Update the "Prochaine tâche" section if reordering is needed, commit that update to a `chore/auto-triage-<date>` branch, push, done. No PR needed for triage-only.

## Step 3 — Pick top task

Take the highest-priority undone task. If none exist, write "Nothing to do — backlog empty" and stop.

## Step 4 — Implement (scenario A)

1. Create branch `auto/<kebab-slug-of-task>` from `dev`
2. Implement the task following the project's `CLAUDE.md` conventions
3. Run `npm run build` and `npm run lint` (and `npm test` if it exists) — do NOT proceed to PR if build fails
4. Commit with a Conventional Commits message
5. Push the branch
6. Open a **draft PR** against `dev` with: what/why, files changed, test status, any concerns for human review
7. Update `../LAST_SESSION.md`: mark task done, add link to PR

## Hard guardrails — STOP and open an issue instead if violated

Never commit directly to `dev` or `master`. Never merge any PR. Never force-push. Never delete non-`auto/*` branches.

Never modify without human review — stop and note it in the PR body:
- `src/lib/stripe.ts` (commission logic)
- `prisma/schema.prisma` (DB migrations)
- `.env*` files
- `src/middleware.ts` (auth)
- `src/app/api/webhooks/**` (webhook signature handling)

Never run: `prisma migrate deploy`, `stripe` CLI in live mode, `vercel deploy --prod`, `npm publish`.

If tests fail after your changes: open the PR anyway with title prefix `⚠️ tests failing —` so it's obvious in the PR list.

If you don't understand the task or it needs product decisions: skip it, note why in `LAST_SESSION.md` under a "Blocked — needs human" section.

## Budget

Max 1 task per invocation. Stop after opening the PR (or after triage-only commit). The `/loop` wrapper will re-invoke you later.
