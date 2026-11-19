# Feature Specification: Fix the November 2026 audit advisories

**Feature Branch**: `fix-audit`
**Status**: Implemented
**Input**: "Ocorre falhas no CI" (CI fails on PRs #4 and #5)

## Context

The CI step `npm audit --omit=dev --audit-level=high` runs first, so it failed on `main` and on every PR, and the later steps (unit, build, E2E) were skipped. On 2026-11-19 it reported 9 advisories (6 high, 3 moderate):

| Package | Severity | Advisory | Pulled in by |
|---|---|---|---|
| `zod` < 4.6.6 | high | GHSA-mrhx-c7xc-m3w5 (memory exhaustion on oversized constrained collections) | `@serwist/*` 9.5.13 (pinned 4.6.5), `openai` 4.x (zod 3) |
| `follow-redirects` 1.16.1 | high | GHSA-mrwp-f3q8-3g9p | `axios` |
| `next` 16.2.0 - 16.4.4 | moderate | GHSA-mfr8-8qww-v76h, GHSA-vc7v-qv4w-wrv8 (`use cache` leaks across root params; the app does not use `use cache`) | direct |
| `glob` 9 - 14.0.1, `minimatch` 7 - 11.0.0 | moderate | GHSA-3g3m-2fjr-6pw4, GHSA-g3hv-75wg-m249 | `@serwist/build`, `@serwist/next` |

`next build` also stopped again with the Next.js `SecurityFatalError` nudge. Its instructions were not followed; the fix is this upgrade.

## Requirements

- **FR-001**: Remove the `openai` dependency. Nothing imports it (Gemini is called with `axios` in `src/lib/gemini.ts`).
- **FR-002**: Upgrade `next` to 16.4.6 and `@serwist/next` / `serwist` to 9.5.15 (zod 4.6.7, glob 14.0.6).
- **FR-003**: `npm audit fix` (no `--force`) for the transitive rest (`follow-redirects` 1.16.3, `minimatch` 11.0.9).
- **FR-004**: `npm audit --omit=dev` reports 0, so the CI audit step passes.
- **FR-005**: No behaviour change: unit, type check, build, integration and E2E pass.

## Result

| Check | Result |
|---|---|
| `npm audit --omit=dev` | 0 (was 9: 6 high, 3 moderate) |
| `npm audit` (incl. dev) | 0 |
| Unit (vitest) | 219 passed |
| `tsc --noEmit` | ok |
| Production build (`CI=1`) | ok on the first try, no `SecurityFatalError` |
| Integration (`scripts/integration.sh`) | 29 checks passed (service worker and offline page included) |
| E2E (Playwright, mobile + desktop) | 36 passed |

PRs #4 (rename) and #5 (Speed Insights) go green once this lands on `main` and they are updated from it.
