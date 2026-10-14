# Implementation Plan: Gemini model fallback

**Spec**: [spec.md](./spec.md)

## Constitution Check
- I Server-Only Secrets: key and URL read only in `src/lib/gemini.ts`; errors sanitised. PASS
- IV Simplicity: one helper replacing three copies of the same axios call; no new dependency; no mandatory new env var. PASS
- VII Security: key moves out of the URL (SECURITY.md gap #5), axios error objects no longer logged (they contained the URL with the key). PASS
- Workflow: unit tests + live API check + production build/integration. PASS

## Structure
```
src/lib/gemini.ts            # generateWithFallback, deriveFallbackUrl, isFallbackWorthy, GeminiError
src/lib/geminiExercise.ts    # requestExercise() now delegates to the helper
src/pages/api/workout.ts     # uses helper; module-level key/url checks removed (helper owns config)
src/pages/api/nutrition.ts   # same
tests/gemini.test.ts
```

## Decisions
- **Derive, don't add a URL env var**: the deployed `GEMINI_API_URL` already names the model; swapping the segment keeps Vercel config untouched.
- **What triggers fallback**: availability signals only (404/408/429/5xx, network, unusable output). 400/401/403 mean our request or key is wrong; a second model would fail the same way and double quota use.
- **Parse failures count**: a model that answers with unusable JSON is treated as failed for that request.
- **Single fallback attempt**: keeps worst-case latency bounded (2 x timeout).
