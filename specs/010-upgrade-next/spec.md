# Feature Specification: Upgrade Next.js to 16.4.2 (security)

**Feature Branch**: `upgrade-next`
**Status**: Implemented
**Input**: "Upgrade Next to the new version and check that everything works; if it passes your tests, merge into main."

## Context

On 2026-10-22 `npm audit --omit=dev` flagged `next` 16.0.0 - 16.4.0 as **critical**:

- GHSA-2464-fhr4-w9xw: unauthenticated RCE in the Image Optimization API when SVG files are used
- GHSA-673q-mjm6-r5xr: unauthenticated RCE in `use cache` functions returning typed arrays
- GHSA-p3m5-59mp-jv5r: DoS in the App Router via Server Actions

The CI audit step (`--audit-level=high`) therefore failed on `main`, and local `next build` stopped with `SecurityFatalError` until the upgrade.

## Requirements

- **FR-001**: Upgrade `next` to 16.4.2 (patch release; only `next`, `@next/env` and `@next/swc-*` change in the lockfile).
- **FR-002**: `npm audit --omit=dev` reports 0 advisories.
- **FR-003**: No behaviour change: unit, build, type check, integration and E2E pass in a clean CI-like container, plus a real browser check.

## Result

| Check | Result |
|---|---|
| `npm audit --omit=dev` | 0 (was 1 critical) |
| `npm audit` (incl. dev) | 7 (5 high, 2 moderate), all in the Tailwind 3 dev chain, accepted in SECURITY.md 1b |
| Unit (vitest) | 219 passed |
| Build, `tsc --noEmit` | ok (local build no longer blocked) |
| Integration (`scripts/integration.sh`) | 29 checks passed |
| E2E (Playwright, mobile + desktop) | 36 passed |
| Browser (dev server on 16.4.2) | nutrition and generate-workout render, no console errors |
