# Implementation Plan: Add Exercise Back (AI)

**Spec**: [spec.md](./spec.md)

## Constitution Check
- I Server-Only Secrets: Gemini key only read server-side in `src/lib/geminiExercise.ts`, called only from API routes; generic client errors. PASS
- II Origin-Locked API: `/api/add-exercise` wrapped in `withOriginValidation`; integration script checks it on a production build. PASS
- IV Simplicity: one new route, one pure lib, one shared server helper; the replace sheet is generalised instead of duplicated. No new dependencies. PASS
- VI Bilingual: keys in `en/workout.ts` and `pt/workout.ts`. PASS
- VII Security by Default (checked against SECURITY.md):
  - XSS: exercise name/description rendered as React text only; no HTML sinks. PASS
  - CSRF/origin: POST-only, `withOriginValidation`; integration script covers 403/405/400. PASS
  - Input validation: `isValidAddBody` + `sanitizeContext` bound lengths, array sizes and enums; unknown context fields dropped; unit tested. PASS
  - Prompt injection: user text is data; output strictly parsed as `{name, description}`; markdown/extra text rejected by the parser. PASS
  - Abuse: 45 s timeout and bounded input. Rate limiting is a known gap (SECURITY.md #2), not made worse. PARTIAL
  - Secrets/logging: key only in `geminiExercise.ts`, generic client errors, only `error.message` logged. PASS (key still sent as `?key=`, SECURITY.md #5)
- Workflow: Spec Kit docs + unit tests + integration checks. PASS

## Structure
```
src/pages/api/add-exercise.ts            # origin-validated route
src/lib/addExercise.ts                   # pure: prompt, body validation, preferences sanitising
src/lib/geminiExercise.ts                # server helper: call Gemini, parse one exercise (shared with replace-exercise)
src/lib/workoutEdit.ts                   # + removal tracking (_meta), addExercise, UTF-8 safe serialize
src/components/ExerciseRequestSheet.tsx  # generic bottom sheet (was ReplaceExerciseSheet), used by replace and add
src/app/workout/page.tsx                 # Add button + wiring
src/app/generate-workout/page.tsx        # use serializeWorkout (fixes btoa crash on non-Latin-1 text)
tests/*.test.ts, scripts/integration.sh
```

## Decisions
- **Where to track removals**: inside the plan under `_meta` (not a second localStorage key) so a new generation resets it atomically and there is one write per change. The workout page already only renders array-valued keys, so `_meta` is ignored by the UI.
- **Button placement**: inline at the end of the day's list (the floating pencil button is already used for "generate workout").
- **Context source**: the generate form already persists its data under `workoutPreferences`; the client reads and sanitises it and sends only whitelisted fields.
- **Serialisation**: `btoa(JSON.stringify(x))` throws for characters above U+00FF (Gemini output regularly has en dashes). Store plain JSON; keep reading base64.
