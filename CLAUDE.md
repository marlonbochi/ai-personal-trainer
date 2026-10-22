# AI Personal Trainer

- Governing rules: `.specify/memory/constitution.md` (read before changing anything).
- **Every new feature follows Spec Kit**: use the `new-feature` skill (`.claude/skills/new-feature/SKILL.md`). Docs live in `specs/NNN-feature-name/` (`spec.md`, `plan.md`, `tasks.md`); `specs/001-edit-workout/` is the reference example.
- **Security is mandatory in every change**: follow Principle VII of the constitution and the checklist in [SECURITY.md](SECURITY.md) (XSS, CSRF/origin, server-side input validation, prompt injection, secrets, abuse/rate limits, dependencies). Update SECURITY.md when protections or known gaps change.
- Tests: `npm test` (vitest, `tests/`) for pure logic and API handlers; `npm run test:e2e` (Playwright, `e2e/`, needs `npm run build`) for UI flows, form→API contracts, CSP and offline. Any UI or form change needs an E2E spec. All of it runs in CI.
- Local run: `docker compose up` (dev server on http://localhost:3001).
- Never commit unless the user explicitly asks in that turn.
