# Feature Specification: Migrate to Tailwind CSS 4

**Feature Branch**: `tailwind-4`
**Status**: Parked - verified but NOT merged. Decision 2026-10-14: keep Tailwind 3 for now (its advisories are dev/build time only) and revisit in a future update.
**Input**: "Clear the Tailwind 3 dependency advisories without breaking anything."

## Context

`tailwindcss` 3.x pulled `chokidar`/`braces`/`postcss-selector-parser`/`postcss-nested`, flagged high/moderate (ReDoS and quadratic CSS parsing). They are dev/build-time only (never shipped to users), and the only fix is Tailwind 4.

## Requirements

- **FR-001**: Upgrade to `tailwindcss` 4 + `@tailwindcss/postcss` with the official upgrade tool (config -> CSS `@theme`, class renames, PostCSS config).
- **FR-002**: The UI MUST look the same: every screen and dialog, mobile and desktop, pixel-compared against `main`.
- **FR-003**: Behaviour that v4 changed by default MUST be kept: pointer cursor on buttons, gray-400 placeholders, v3 border colour, form-control sizing.
- **FR-004**: Remove dead config (`postcss.config.mjs` duplicate).

## Result

| | Before | After |
|---|---|---|
| Tailwind chain advisories (full audit) | 4 packages (high/moderate) | 0 |
| Visual diff vs `main` (18 screenshots) | - | **0.00 % on all 18** |
| Radio/checkbox size, cursor (enabled/disabled), button cursor | 20 px, pointer / not-allowed, pointer | same |

## Trade-off to accept before merging

Tailwind 4 generates CSS that needs **Safari/iOS 16.4+, Chrome 111+, Firefox 128+** (cascade layers, `@property`, `color-mix`, `oklch`). On older browsers (e.g. iPhones stuck on iOS 15 and below) the styling breaks. Tailwind 3 supported them. If those users matter, keep Tailwind 3: its advisories are build-time only.

## Before reviving this branch
- It is based on `main` at `ae826db`, before the Serwist migration (`replace-next-pwa`). Merge `main` into it first: `package.json`/`package-lock.json` will conflict; resolve by taking `main`'s files and re-running the upgrade's dependency changes (`npm install -D tailwindcss@4 @tailwindcss/postcss && npm uninstall autoprefixer`), then re-run the visual diff (`scripts/visual-*.mjs`) against the new `main`.
- Accept the browser support trade-off above.
- Strike SECURITY.md row 1b after merging.
