# Feature Specification: Test coverage audit and browser tests in CI

**Feature Branch**: `test-coverage`
**Status**: Implemented (pending user review)
**Input**: "Check the app's tests, create them where they don't exist, and implement the ones that can run in CI."

## Audit (before)

| Area | Before |
|---|---|
| Pure logic of the new features, Gemini helper, rate limit, validation | unit tests |
| `validateOrigin` (CSRF guard) | only indirect (route tests, integration script) |
| i18n: en/pt parity, language detection | none |
| `fetchWithValidation` (client HTTP) | none |
| Prompt construction (training vs rest days, form preferences) | none |
| UI flows (swipe, dialogs, add/replace), form -> API contract, CSP in a browser, offline | none, and nothing browser-based in CI |

## What was added

- Unit (vitest): `tests/validateOrigin.test.ts` (15), `tests/i18n.test.ts` (9), `tests/api.test.ts` (9), `tests/planPrompts.test.ts` (12).
- E2E (Playwright, real Chromium against the production build, mobile + desktop): `e2e/workout-edit.spec.ts`, `e2e/forms.spec.ts`, `e2e/security.spec.ts`, `e2e/pwa.spec.ts` (13 tests x 2 viewports). Gemini is mocked in the browser with `page.route`; CI never calls it.
- CI: Playwright browser install + `npm run test:e2e`; the HTML report and traces are uploaded when it fails.

## Bugs found by the new tests (each: failing test first, then the fix)

| Test | Bug | Fix |
|---|---|---|
| i18n parity | `nav.about` had no Portuguese translation | added `'nav.about': 'Sobre'` |
| `fetchWithValidation` surfaces server errors | the client read `message`, but every route answers `{ error }`, so users always saw "API request failed" (e.g. a 429 never said "Too many requests") | read `error`, then `message` |
| prompt: accented day names | the validator accepts `terça-feira`, the route only knew `terca-feira`; that day became both a training day and a rest day in the prompt | normalise accents before mapping |
| CI replica (integration, then E2E) | `scripts/integration.sh` killed only the `npx` wrapper; the real `next-server` child kept port 3100, so the next CI step could not start | stop the whole process tree on exit and wait for the port to be free (a failing check still exits 1) |
| nutrition page shows dish names | the prompt asks for each meal's `name`, but the page only rendered it for snack lists; breakfast/lunch/dinner names never appeared | render `name` for single meals too |

## Proof that the tests can fail (mutation check)

Each mutation was applied to a disposable copy, never to the working tree.

- Unit: 16/16 caught. Includes: allowing a missing Referer, prefix-matching the Referer, ignoring Sec-Fetch-Site or NEXT_PUBLIC_APP_URL, not splitting `pt-BR`, ignoring or not persisting the saved language, `credentials: 'include'`, app headers on cross-origin calls, parsing 204 bodies, inverted rest days, missing pt day mapping, missing Monday fallback, dropped injuries/allergies, swapped currency.
- E2E: 8/8 caught. Includes: Add button always shown, delete without confirmation, add without form context, replace appending instead of replacing, **the original form bug** (`duration` renamed to `workoutDuration`), service worker disabled, CSP header removed, CSP too strict for Next.js inline scripts.
