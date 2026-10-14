# Tasks: Gemini model fallback

- [x] T001 `src/lib/gemini.ts` helper + `GeminiError`
- [x] T002 Refactor `geminiExercise.ts`, `workout.ts`, `nutrition.ts` onto the helper
- [x] T003 Header auth (`x-goog-api-key`), sanitised errors/logs
- [x] T004 `tests/gemini.test.ts` (25 tests)
- [x] T005 Live check: normal path, forced 404 -> fallback (default and `gemini-3.5-flash-lite`), no key in output
- [x] T006 Docs: `.env.example`, README, SECURITY.md
- [x] T007 Production build, `tsc`, integration
