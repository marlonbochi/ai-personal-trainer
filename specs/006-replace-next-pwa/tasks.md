# Tasks: Replace next-pwa with Serwist

- [x] T001 Probe Serwist in isolation: 0 advisories, no `braces`
- [x] T002 Swap dependencies; `next.config.mjs` with `withSerwistInit`
- [x] T003 `src/sw.ts` (precache, defaultCache, skipWaiting/clientsClaim, offline fallback)
- [x] T004 `.gitignore` for generated files
- [x] T005 Unit tests (121), build, tsc, integration (+4 PWA checks)
- [x] T006 Real Chromium offline check: before (next-pwa) vs after (Serwist)
- [x] T007 SECURITY.md row 1a
- [x] T008 Upgrade path: browser profile that used the next-pwa build, then the Serwist build on the same origin -> registered, controlling on first visit, offline OK
- [x] T009 SECURITY.md row 1b: Tailwind 3 kept by decision (dev-only advisories)
