# Tasks: Translate the nutrition plan screen

- [x] T001 Audit untranslated text on `/nutrition`
- [x] T002 Unit tests for `weekdayId` / `mealId` (RED)
- [x] T003 `src/lib/nutritionLabels.ts` (GREEN)
- [x] T004 Locale keys (en + pt) and key types
- [x] T005 E2E `e2e/nutrition.spec.ts` for pt and en (RED against the current page)
- [x] T006 Wire the page (US1 macros, US2 meals, US3 days) (GREEN)
- [x] T007 Mutation check: unit 8/8, E2E 5/5 caught
- [x] T008 Verify: unit, tsc, build, E2E, real browser (pt and en)
- [x] T009 Drop CSS `capitalize` on the day heading (turned 'Segunda-feira' into 'Segunda-Feira')
- [x] T010 US4 E2E: non-Latin-1 plan saved and shown, corrupt values show empty state (RED: stayed on /generate-nutrition; page crashed)
- [x] T011 `src/lib/storedPlan.ts` shared parser, plain JSON on save, `days` check on read (GREEN)
- [x] T012 Mutation check: back to btoa, no legacy base64, no `days` check: 3/3 caught
