---
name: new-feature
description: "Start any new feature for this project the Spec Kit way: create the branch, write specs/NNN-name/{spec,plan,tasks}.md, implement, add tests, verify. Use whenever the user asks for a new feature, screen, endpoint or behavior change."
user-invocable: true
disable-model-invocation: false
---

## User Input

```text
$ARGUMENTS
```

Follow this flow for every new feature. The user should never have to ask for it.

1. **Branch**: create `<feature-name>` from `main` (`git checkout -b <name> main`). Check `git ls-remote --heads origin` first for a name clash.
2. **Spec**: create `specs/<NNN>-<feature-name>/` (NNN = next sequential number). Use `.specify/templates/spec-template.md`, `plan-template.md`, `tasks-template.md` as the shape. `spec.md` = user stories + acceptance scenarios + FRs; `plan.md` = Constitution Check against `.specify/memory/constitution.md` + file structure + decisions; `tasks.md` = checklist by phase/user story. See `specs/001-edit-workout/` as the reference example. If the `speckit-*` skills are available, prefer them (`/speckit-specify`, `/speckit-plan`, `/speckit-tasks`, `/speckit-implement`).
3. **Implement** following the tasks, ticking boxes as they complete. Keep pure logic in `src/lib` so it is unit-testable.
4. **Tests**: add vitest tests under `tests/` (`npm test`). Cover pure helpers and API handlers.
5. **Security**: walk the checklist in `SECURITY.md` and Principle VII (XSS, CSRF/origin, server-side validation + bounds, prompt injection, secrets, abuse/timeouts, dependencies, least data). Put the answers in `plan.md`'s Constitution Check, add tests for validation/error shapes, and update `SECURITY.md` if protections or gaps change.
6. **Verify**: `npm test`, `npx tsc --noEmit`, a production build, and a real browser check (Docker on `localhost:3001`). Security-relevant changes must be verified against a production build.
7. **Do NOT commit** unless the user explicitly asks in that turn. Leave changes in the working tree for review.
8. New UI strings go in both `en` and `pt` locale files.
