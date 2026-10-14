# Feature Specification: Replace next-pwa with Serwist

**Feature Branch**: `replace-next-pwa`
**Status**: Implemented (pending user review)
**Input**: "Clear the remaining production advisories (the `braces` chain via next-pwa) without breaking anything."

## Context

After spec 003, `npm audit --omit=dev` still reported 5 high advisories, all from `braces`, which has no patched release and reached production only through `next-pwa` (unmaintained since 2022) -> `globby` -> `micromatch`.

While testing, a real Chromium run showed that **the next-pwa service worker no longer worked on Next 16**: the page was never controlled, no cache was created, and every page failed offline. So the swap also restores the PWA.

## Requirements

- **FR-001**: Replace `next-pwa` with `@serwist/next` + `serwist` (0 advisories at install time).
- **FR-002**: Keep the previous behaviour: precache of build and `public/` assets, the standard Next.js runtime caching set, `skipWaiting` + `clientsClaim`, auto-registration, disabled in development, no reload when the connection comes back.
- **FR-003**: Pages never visited while online show `public/offline.html` instead of a browser error (the file existed but was never wired).
- **FR-004**: CSP and security headers unchanged (`worker-src 'self'` covers `/sw.js`).
- **FR-005**: Integration checks for `/sw.js` and `/offline.html`; a real-browser offline check script for pre-merge verification.

## Result

| | Before (next-pwa) | After (Serwist) |
|---|---|---|
| `npm audit --omit=dev` | 5 high | **0** |
| Page controlled by the SW (real Chromium) | no | yes |
| Precache | none created | 55 entries |
| `/workout` offline, after a visit | connection refused | served from SW, plan visible |
| Never-visited page offline | connection refused | `offline.html` |
| Existing user after the deploy (same browser profile) | no service worker at all | Serwist registered and controlling on the first visit; offline works |
