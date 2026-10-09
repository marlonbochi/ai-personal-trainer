# Implementation Plan: Edit Workout Exercise

**Spec**: [spec.md](./spec.md)

## Constitution Check
- I Server-Only Secrets: key only read in `src/pages/api/replace-exercise.ts`; generic client errors. PASS
- II Origin-Locked API: new route wrapped in `withOriginValidation`. PASS
- IV Simplicity: pure helpers in `src/lib`, one component, one route. No new runtime deps. Dev dep `vitest` added because the repo had no test runner. PASS
- VI Bilingual: keys added to `en/workout.ts` and `pt/workout.ts`. PASS

## Structure
```
src/pages/api/replace-exercise.ts        # Gemini call, origin-validated
src/lib/workoutEdit.ts                   # pure: parse/serialize stored plan, remove/replace exercise
src/lib/replaceExercise.ts               # pure: build prompt, parse Gemini reply
src/components/SwipeableExercise.tsx     # swipe row (pointer events) with edit/delete actions
src/components/ReplaceExerciseSheet.tsx  # bottom sheet: reason + confirm + error state
src/components/ConfirmDeleteDialog.tsx   # confirm modal before removing an exercise
src/app/workout/page.tsx                 # wiring
tests/*.test.ts                          # vitest unit tests
scripts/integration.sh                   # production-build checks (origin validation, routes)
.github/workflows/ci.yml                 # CI: unit tests, build, tsc, integration
```

## Decisions
- Pointer Events (not touch-only) so the same gesture works with mouse.
- Exercises are addressed by `(dayKey, index)`; no ids are added to the stored format.
- Gemini returns `{ "name", "description" }`; the parser tolerates code fences and rejects anything else.
