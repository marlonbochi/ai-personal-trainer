# Feature Specification: Gemini model fallback

**Feature Branch**: `add-workout` (builds on `src/lib/geminiExercise.ts`, which lives in this branch)
**Status**: Implemented (pending user review)
**Input**: "Keep 2.5 and, if it fails, handle it by using 3.8."

## Context

Google's docs now lead with `gemini-3.8-flash` (and a new `/v1beta/interactions` API). `gemini-2.5-flash` via `generateContent` still works (verified 2026-10-14) but access is restricted to accounts that already used 2.5, and it can disappear (a 404 "no longer available" is how Google retires models). The app must keep working when the primary model is unavailable.

## User Scenarios & Testing

### User Story 1 - Generation survives a primary-model outage (Priority: P1)
When `gemini-2.5-flash` fails with an availability-type error, the same request is retried once on `gemini-3.8-flash` and the user gets their plan/exercise as usual.

**Acceptance Scenarios**:
1. Primary OK -> no second request is made.
2. Primary returns 404 / 408 / 429 / 5xx, a network error/timeout, or an unusable body -> one retry on the fallback model.
3. Primary returns 400/401/403 (our request or credentials) -> NO fallback, fail fast with the generic error.
4. Both fail -> generic client error, nothing sensitive logged.

## Requirements

- **FR-001**: One server-side helper (`src/lib/gemini.ts`) MUST perform every Gemini call; the three routes (`/api/workout`, `/api/nutrition`, exercise routes) MUST use it.
- **FR-002**: The fallback URL MUST be derived from `GEMINI_API_URL` by swapping the `/models/<name>:` segment, using `GEMINI_FALLBACK_MODEL` (default `gemini-3.8-flash`). No new mandatory env var, so no Vercel change is needed.
- **FR-003**: `thinkingConfig` MUST be removed from the fallback request (its options differ between model generations).
- **FR-004**: The API key MUST be sent in the `x-goog-api-key` header, never in the URL.
- **FR-005**: Errors leaving the helper MUST be sanitised (`GeminiError`: status + safe message). Axios errors carry the request URL/headers and MUST NOT be logged or returned.
- **FR-006**: Per-attempt timeouts: 45 s for single-exercise routes, 90 s for full plans.

## Success Criteria
- SC-001: Unit tests cover every branch above (25 tests in `tests/gemini.test.ts`).
- SC-002: Live check against the real API proves primary-success, and a forced primary failure falling back and succeeding.

## Known limits
- One fallback attempt only; a transient 503 on the fallback model fails the request. On the maintainer's free-tier key `gemini-3.8-flash` returned 503/429 during testing while `gemini-3.5-flash-lite` answered 200, so `GEMINI_FALLBACK_MODEL` exists to switch without a code change.
- Not migrated to the Interactions API; `generateContent` remains supported for both models.
