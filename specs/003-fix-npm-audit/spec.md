# Feature Specification: Fix npm audit findings

**Feature Branch**: `fix-npm-audit`
**Status**: Implemented (pending user review)
**Input**: "Fix the npm audit problems and test."

## Context

`npm audit --omit=dev` (2026-10-10) reported 30 advisories in production dependencies (1 critical, 23 high), plus 2 more critical in dev tooling (vitest/tinypool). `next` 16.1.1 itself was flagged (RCE, DoS, middleware bypass, SSRF).

## Requirements

- **FR-001**: Upgrade `next`, `axios` and `postcss` to patched versions and apply the non-breaking `npm audit fix`.
- **FR-002**: Resolve advisories in the PWA build chain without replacing `next-pwa` when a safe override exists (`serialize-javascript`).
- **FR-003**: Upgrade the test runner (`vitest`) to clear the critical dev advisories.
- **FR-004**: No behaviour change: unit tests, production build, type check, integration checks and a real browser flow MUST still pass.
- **FR-005**: Guard against regressions: CI MUST fail on critical advisories in production dependencies.
- **FR-006**: Document what could NOT be fixed and why (SECURITY.md).

## Result

| Scope | Before | After |
|---|---|---|
| `npm audit --omit=dev` | 30 (1 critical, 23 high, 4 moderate, 2 low) | 5 (all high, no critical) |
| `npm audit` (incl. dev) | 37 (3 critical, 25 high, 7 moderate, 2 low) | 9 (7 high, 2 moderate, no critical) |

Remaining (documented, accepted for now):
- **`braces`** (high, DoS by stack exhaustion on deeply nested glob patterns): the advisory covers the latest published version (3.0.3), so **no patched version exists**. It reaches production only through `next-pwa` -> `globby` -> `fast-glob` -> `micromatch`, i.e. build-time glob handling of developer-controlled patterns, never request data. Clears only by replacing `next-pwa` (e.g. Serwist) or when `braces` publishes a fix.
- **`tailwindcss` 3.x chain** (`chokidar`, `postcss-selector-parser`, `postcss-nested`; dev only, build time): the advisory fix is a major upgrade to Tailwind 4, which needs a CSS/config migration; tracked separately.
