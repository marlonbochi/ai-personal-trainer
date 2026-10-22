# Implementation Plan: Test coverage audit and browser tests in CI

**Spec**: [spec.md](./spec.md)

## Constitution Check
- IV Simplicity: one new dev dependency (`@playwright/test`, pinned to the same version as the Docker image used locally); no production dependency. PASS
- VI Bilingual: parity is now enforced by a test. PASS
- VII Security: origin validation, CSP and security headers covered directly; the form -> API contract is checked against the server validator. PASS

## Structure
```
tests/validateOrigin.test.ts, tests/i18n.test.ts, tests/api.test.ts, tests/planPrompts.test.ts
playwright.config.ts         production server on :3100 (webServer), mobile + desktop projects, SW blocked by default
e2e/helpers.ts               seed localStorage, swipe a row, row-scoped action buttons
e2e/workout-edit.spec.ts     remove (confirm/cancel), Add visibility (versioned/legacy), add/replace with mocked Gemini
e2e/forms.spec.ts            exact request bodies + server validator, error message shown, plans rendered
e2e/security.spec.ts         headers on every page; no CSP violation or page error with the SW running
e2e/pwa.spec.ts              SW controls the page, visited pages offline, offline fallback page
.github/workflows/ci.yml     playwright install + test:e2e + report artifact on failure
```

## Decisions
- **E2E against the production build**: CSP, headers and the service worker only exist there (`next dev` skips them).
- **Service workers blocked by default** in E2E so `page.route` sees every API call; the security and PWA specs opt in (`serviceWorkers: 'allow'`), since that is the production situation.
- **Gemini mocked in the browser**, so tests are deterministic and free.
- **Contract test imports the server validator** (`isValidWorkoutBody`) into the browser test: if the form and the API drift apart, CI fails.

## Run locally
```bash
npm test
npm run build && npm run test:integration
npx playwright install chromium   # once
npm run test:e2e
```
Or without installing browsers: run inside `mcr.microsoft.com/playwright:v1.64.1-noble` with the repo mounted.
