# Tasks: Edit Workout Exercise

## Phase 1: Setup
- [x] T001 Add `vitest` + `npm test` script, `vitest.config.ts` (alias `@`)
- [x] T002 Add en/pt i18n keys in `src/lib/i18n/locales/{en,pt}/workout.ts`

## Phase 2: Foundation
- [x] T003 [P] `src/lib/workoutEdit.ts` pure helpers + `tests/workoutEdit.test.ts`
- [x] T004 [P] `src/lib/replaceExercise.ts` prompt/parse + `tests/replaceExercise.test.ts`
- [x] T005 `src/pages/api/replace-exercise.ts` (origin-validated) + `tests/replaceExerciseApi.test.ts`

## Phase 3: US1 Remove / US3 Swipe (P1/P2)
- [x] T006 `src/components/SwipeableExercise.tsx`
- [x] T007 Wire delete in `src/app/workout/page.tsx`, persist to localStorage
- [x] T007b `src/components/ConfirmDeleteDialog.tsx`: confirm before deleting

## Phase 4: US2 Replace (P1)
- [x] T008 `src/components/ExerciseRequestSheet.tsx` (renamed from ReplaceExerciseSheet in 002)
- [x] T009 Wire replace flow, error + retry state

## Phase 5: Verify
- [x] T010 `npm test`, `tsc --noEmit`, production build, manual browser check
