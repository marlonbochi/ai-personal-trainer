# Feature Specification: Security hardening pass

**Feature Branch**: `add-workout`
**Status**: Implemented (pending user review)
**Input**: "Do all the necessary security handling and best practices, and check the code for remaining flaws such as leaking sensitive information."

## Audit result (2026-10-14)

| Check | Result |
|---|---|
| Secrets in git history / tracked env files | None (0 commits match a Google key pattern; no `.env*` tracked) |
| Secrets in working tree, `.dockerignore`, client bundle | None; only `NEXT_PUBLIC_APP_URL` is public by design |
| Server logs | Old routes logged whole axios errors (URL with `?key=`) and full plan bodies (personal data). Fixed. |
| XSS sinks | None (`dangerouslySetInnerHTML`, `innerHTML`, `eval`, ...) |
| Input validation | `/api/workout` and `/api/nutrition` accepted anything. Fixed. |
| Abuse / DoS | No rate limit, no body size limit. Fixed (best effort). |
| Headers | Only in `vercel.json` (absent in Docker / `next start`), no CSP, `X-Powered-By` sent, obsolete `X-XSS-Protection`. Fixed. |
| Build safety | `ignoreBuildErrors` hid type errors; duplicate dead `next.config.ts`. Fixed. |

## Requirements

- **FR-001**: Every Gemini call goes through `src/lib/gemini.ts` (key in header, sanitised errors) - see spec 004.
- **FR-002**: `/api/workout` and `/api/nutrition` MUST validate type, allow-list and bounds server-side and answer 400 (`src/lib/requestValidation.ts`). Numeric fields MUST accept numeric strings because the forms send them.
- **FR-003**: All four Gemini routes MUST limit the body to 16 kB.
- **FR-004**: All four Gemini routes MUST be rate limited per client IP (workout/nutrition 10/min, exercise routes 20/min), answering 429 + `Retry-After`. Best effort per instance (see SECURITY.md #2).
- **FR-005**: Security headers MUST be defined in `next.config.js` so they apply in every environment: `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security`, and a production CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src 'self'`).
- **FR-006**: `/api/*` responses MUST be `Cache-Control: no-store`; `X-Powered-By` MUST NOT be sent.
- **FR-007**: The build MUST fail on type errors (`ignoreBuildErrors` removed).
- **FR-008**: Server logs MUST NOT contain secrets, request URLs/headers, prompts or generated plans; log only a safe message.

## Success Criteria
- SC-001: Unit tests for validation, rate limiting and route behaviour (110 tests total).
- SC-002: Integration script verifies headers, 400/413/429 on a production server (25 checks).
- SC-003: Real browser run on a production server with CSP active: workout and nutrition forms submit (200), pages render, no CSP violations in the console.

## Known limits
- CSP keeps `'unsafe-inline'` for scripts and styles: Next.js inlines hydration data and critical CSS; removing it needs per-request nonces, i.e. dynamic rendering of every page.
- Rate limiting is in memory per serverless instance: it blunts bursts and casual scripts, not a distributed attacker. A hard guarantee needs a shared store (Upstash/Vercel KV) or Vercel Firewall rules.
- Origin validation still does not authenticate callers (see Principle II).
