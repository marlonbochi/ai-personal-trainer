# Tasks: Add Exercise Back (AI)

## Phase 1: Foundation
- [x] T001 `src/lib/workoutEdit.ts`: removal tracking in `_meta`, `addExercise`, `getRemovedCount`, UTF-8 safe `serializeWorkout`
- [x] T002 [P] `src/lib/addExercise.ts`: prompt, body validation, preferences sanitising
- [x] T003 [P] `src/lib/geminiExercise.ts`: shared Gemini call + parse; refactor `replace-exercise.ts` to use it
- [x] T004 `src/pages/api/add-exercise.ts` (origin-validated)
- [x] T005 Add en/pt i18n keys

## Phase 2: UI
- [x] T006 Generalise sheet to `ExerciseRequestSheet.tsx`; update replace flow
- [x] T007 Add button (only when removals tracked) + add flow in `src/app/workout/page.tsx`
- [x] T008 `src/app/generate-workout/page.tsx`: persist with `serializeWorkout`

## Phase 3: Tests & verify
- [x] T009 Unit tests: `tests/workoutEdit.test.ts` (extended), `tests/addExercise.test.ts`, `tests/addExerciseApi.test.ts`
- [x] T010 `scripts/integration.sh`: add-exercise origin/body checks
- [x] T011 `npm test`, `tsc`, production build, integration, browser check
