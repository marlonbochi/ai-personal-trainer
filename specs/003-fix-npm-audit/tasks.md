# Tasks: Fix npm audit findings

- [x] T001 Upgrade `next`, `axios`, `postcss`; run `npm audit fix`
- [x] T002 Add `overrides.serialize-javascript ^7.1.2`; confirm service worker still generated
- [x] T003 Upgrade `vitest` to 5.x and `@types/node` to 22.x
- [x] T004 CI: fail on critical advisories in production deps
- [x] T005 Unit tests (23 on main; 54 with add-workout code) pass
- [x] T006 Production build passes; `public/sw.js` + workbox generated
- [x] T007 `tsc --noEmit` passes
- [x] T008 Integration script passes (7 on main; 11 with add-workout code)
- [x] T009 Real browser flow on a production server: remove -> confirm -> add via live Gemini (axios 1.20, next 16.4)
- [x] T010 Compare SW registration code with the pre-upgrade build (identical: no regression)
- [ ] T011 (follow-up, own spec) Replace `next-pwa` to clear the `braces` chain; migrate Tailwind 3 -> 4
