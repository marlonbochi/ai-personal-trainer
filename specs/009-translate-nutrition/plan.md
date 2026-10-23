# Implementation Plan: Translate the nutrition plan screen

**Spec**: [spec.md](./spec.md)

## Constitution Check
- I Server-Only Secrets: no server or Gemini change. PASS
- II Origin-Locked API: no API change. PASS
- IV Simplicity: one pure helper module, locale keys, page wiring. No new dependencies. PASS
- VI Bilingual: every new string added to `en/nutrition.ts` and `pt/nutrition.ts`; i18n parity test covers it. PASS
- VII Security by Default (checked against SECURITY.md):
  - XSS: keys from the stored plan are only used as lookup input or rendered as React text; no HTML sinks. PASS
  - CSRF/origin, input validation, rate limits, prompt injection: no request or prompt change. N/A
  - Secrets/logging: nothing logged. PASS
- Workflow: Spec Kit docs, unit tests first (RED), E2E for the screen, mutation check. PASS

## Structure
```
src/lib/nutritionLabels.ts               # pure: normalizeKey, weekdayId, mealId
src/lib/storedPlan.ts                    # pure: parseStoredPlan (JSON or legacy base64), serializePlan; moved out of workoutEdit.ts
src/app/generate-nutrition/page.tsx      # store plain JSON (US4)
src/lib/i18n/locales/{en,pt}/nutrition.ts # + mealNames, macros, macroAbbr, dayAbbr
src/lib/i18n/translations.ts, locales/index.ts # key types for the new groups
src/app/nutrition/page.tsx               # use the helpers and keys; one MacroLine for both meal shapes
tests/nutritionLabels.test.ts, tests/storedPlan.test.ts, e2e/nutrition.spec.ts
```

## Decisions
- **Render-time translation, not migration**: the plan stays as the model returned it; the page maps keys to canonical ids and looks the label up. Switching the UI language works without regenerating.
- **No prompt change**: the prompt still asks for English example keys; the page now copes with whatever keys arrive, which also covers plans already stored on users' devices.
- **Abbreviations with `<abbr title>`**: keeps the compact line and exposes the full name to hover and assistive tech.
- **Day heading without CSS `capitalize`**: labels now come from the locale files already capitalised; `capitalize` also uppercased the word after the hyphen.
- **Storage (US4)**: the workout fix from 002 is generalised into `storedPlan.ts` instead of copied; `parseStoredWorkout` delegates to it.
- **Free text (dishes, ingredients, instructions) is not translated**: it is generated in the language chosen at generation time; translating would need another AI call.
