# Implementation Plan: Security hardening pass

**Spec**: [spec.md](./spec.md)

## Constitution Check
- I Server-Only Secrets: key only in `src/lib/gemini.ts`; no key or URL in logs/errors. PASS
- II Origin-Locked API: unchanged; now layered with rate limiting and validation. PASS
- IV Simplicity: one in-memory limiter, one pure validation module, no new dependency. PASS
- VII Security by Default: this is the implementation of the checklist. PASS

## Structure
```
src/lib/requestValidation.ts    # isValidWorkoutBody / isValidNutritionBody (pure)
src/middleware/rateLimit.ts     # withRateLimit (fixed window, per IP, per route name)
src/pages/api/*.ts              # withRateLimit(withOriginValidation(handler)), 16 kB body limit, validation
next.config.js                  # headers(), CSP (prod), poweredByHeader false, no ignoreBuildErrors
vercel.json                     # security headers removed (moved to next.config.js); cache rules kept
scripts/integration.sh          # headers, 400/413/429 checks
tests/requestValidation.test.ts, tests/rateLimit.test.ts, tests/planRoutes.test.ts
```

## Decisions
- **Rate limiter outermost**: rejected and invalid requests also count, so scanning is throttled too.
- **Client IP**: `x-real-ip`, then first `x-forwarded-for` hop, then the socket. Trustworthy on Vercel (platform-set); on other proxies these headers are client-controlled, noted in SECURITY.md.
- **Validation is "present => valid"**: absent fields keep their existing server defaults, so older clients still work.
- **CSP production-only**: React's dev tooling needs eval. Verified on a production server in a real browser.
- **HSTS without `preload`**: reversible; `includeSubDomains` only affects this host's subdomains.
- **`X-XSS-Protection` dropped**: obsolete and itself a source of vulnerabilities in old browsers; CSP replaces it.
