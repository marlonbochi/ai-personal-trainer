# Security

Security is a standing requirement of this project (see Principle VII in
[`.specify/memory/constitution.md`](.specify/memory/constitution.md)). This
file is the single place that records **what is protected, how to keep it
that way, and what is still a known gap**. Claims below were verified against
the code on 2026-10-10; update this file in the same change whenever
something here changes.

## Reporting a vulnerability

Please do not open a public issue. Contact the maintainer privately
(GitHub: [@marlonbochi](https://github.com/marlonbochi)) with the steps to
reproduce.

## Threat model (short)

- Public, unauthenticated Next.js app. There are **no accounts, cookies or
  server-side user data**.
- The only secret is the Gemini API key (`GEMINI_API_KEY`); the main asset at
  risk is its **quota/billing**.
- User data (preferences, generated plans) lives only in the visitor's
  browser `localStorage`.
- The main threats are: XSS via AI/user text, other websites driving a
  visitor's browser at the API (CSRF-style), scripted abuse of the paid API,
  secret leakage, and vulnerable dependencies.

## Protections in place

| Area | What exists | Where |
|---|---|---|
| XSS | No `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function` or `document.write` in `src/`; all AI/user text is rendered as React text children (auto-escaped) | `src/` (grep) |
| CSRF / cross-site abuse | `withOriginValidation`: requires `Sec-Fetch-Site` same-origin/none, exact `Origin` match, strict `Referer` fallback by parsed origin; fails closed; POST-only routes | `src/middleware/validateOrigin.ts`, checked on a production build by `scripts/integration.sh` |
| Secrets | `GEMINI_API_KEY`/`GEMINI_API_URL` read only in server code; never `NEXT_PUBLIC_*`; env files git-ignored; client errors are generic | `src/pages/api/*`, `src/lib/geminiExercise.ts`, `.gitignore` |
| Prompt injection (new routes) | Free text is passed as data; model output must parse as `{name, description}`; unknown context fields are dropped before reaching the prompt | `src/lib/geminiExercise.ts`, `tests/addExerciseApi.test.ts` |
| Response headers | `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `Strict-Transport-Security`, production CSP (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `connect-src 'self'`), `Cache-Control: no-store` on `/api/*`, no `X-Powered-By`. Defined in app config, so they apply on Vercel, Docker and `next start`; checked on a production server by the integration script | `next.config.js`, `scripts/integration.sh` |
| Input validation (all routes) | Type, allow-list and bounds checked server-side; invalid bodies get 400 before any paid call; 16 kB body limit | `src/lib/requestValidation.ts`, `src/lib/addExercise.ts`, `src/lib/replaceExercise.ts`, `tests/` |
| Rate limiting (best effort) | Per client IP and route: 10/min for plans, 20/min for exercise routes; 429 + `Retry-After`. In-memory per serverless instance (see gap #2) | `src/middleware/rateLimit.ts` |
| Logging | Server logs carry only safe messages: no keys, URLs, headers, prompts or generated plans | `src/lib/gemini.ts`, `src/pages/api/*` |
| Gemini calls | Single helper: key in header (not URL), sanitised errors, per-attempt timeouts (45 s exercise / 90 s plans), model fallback only on availability errors | `src/lib/gemini.ts`, `tests/gemini.test.ts` |

Important limit: origin validation only protects against **other websites in
a browser**. A script (curl etc.) can forge `Origin`, so it does **not**
authenticate callers or protect the quota by itself. That is what the rate
limiting gap below is about.

## Rules for every change (checklist)

Use this when writing a `plan.md` and before calling a feature done:

1. **Output encoding**: AI and user text only as React text; no HTML sinks;
   validate URL schemes before putting them in `href`/`src`.
2. **State changes**: POST only, wrapped in `withOriginValidation`, no side
   effects on GET.
3. **Validate on the server**: type, enum/allow-list, max length, max array
   size; reject with 400. Put the logic in a pure, tested function.
4. **Treat storage as untrusted**: `localStorage` content can be edited by the
   user or other scripts; parse defensively and never use it to build HTML.
5. **LLM**: user text is data; strict-parse output; bound its length; never
   execute or render it as HTML.
6. **Secrets**: server only, never logged, never in URLs shown to the client,
   generic client error messages.
7. **Cost/abuse**: timeouts, bounded input, and do not add paid routes without
   considering rate limiting.
8. **Dependencies**: justify every new one; run `npm audit`; do not add
   packages with open critical/high advisories.
9. **Least data**: do not collect or store more personal data than needed.
10. **Tests**: security-relevant behaviour (validation, origin, error
    shape) has a unit or integration test.
11. **Docs**: update this file if the protections or gaps change.

## Known gaps (prioritised)

Findings from the 2026-10-10 audit, updated 2026-10-14 after the hardening pass (spec `005`), the dependency upgrade (spec `003`) and the Serwist migration (spec `006`). Struck-through rows are fixed.

| # | Severity | Gap | Suggested fix |
|---|---|---|---|
| 1a | ~~High~~ Fixed | ~~Dependencies, PWA build chain (`braces` via `next-pwa`)~~: after the upgrade of spec `003` (30 → 5 production advisories, 0 critical), `next-pwa` was replaced by Serwist (spec `006`); `npm audit --omit=dev` now reports **0** advisories and CI fails on high or critical ones. On 2026-10-22 `next` 16.4.0 was flagged critical (RCE in image optimization with SVG and in `use cache`, DoS via Server Actions); upgraded to 16.4.2 (spec `010`). | - |
| 1b | Low (accepted) | **Dependencies, Tailwind 3 chain** (dev/build time only): `tailwindcss` 3.x pulls `chokidar`/`braces`/`postcss-selector-parser`/`postcss-nested` (ReDoS / quadratic CSS parsing at build). Nothing of it ships to users, and `npm audit --omit=dev` is clean. **Decision (2026-10-14): keep Tailwind 3**, because Tailwind 4 would drop older browsers (iOS/Safari < 16.4, Chrome < 111) for no runtime security gain. A pixel-identical v4 migration was prepared and verified (branch `tailwind-4`, not merged). | Revisit when Tailwind 3 stops building or when dropping those browsers is acceptable. |
| 2 | Medium (reduced) | **Rate limiting is best effort**: the limiter is in memory, per serverless instance, so a distributed or patient client can exceed it, and a client can forge `X-Forwarded-For` on hosts that do not overwrite it. | Shared store (Upstash/Vercel KV) or Vercel Firewall rate-limit rules; set a spending cap on the Gemini key. |
| 3 | ~~Medium~~ Fixed | ~~Plan routes did not validate the body~~: `/api/workout` and `/api/nutrition` now validate type, allow-list and bounds (400), with a 16 kB body limit. | Keep validators in sync when form fields change. |
| 4 | Low (reduced) | **CSP allows `'unsafe-inline'`** for scripts and styles, because Next.js inlines hydration data and critical CSS. An injected inline script would therefore not be blocked by CSP (React escaping is the primary defence). | Nonce-based CSP, which requires dynamic rendering of every page. |
| 5 | ~~Medium~~ Fixed | ~~Gemini key sent as `?key=`~~: all calls now go through `src/lib/gemini.ts`, which sends it in the `x-goog-api-key` header and throws sanitised errors (the old routes logged whole axios errors, whose `config.url` contained the key). | Keep new Gemini calls inside that helper. |
| 6 | ~~Low~~ Fixed | ~~`ignoreBuildErrors`/`eslint` flags and duplicate `next.config.ts`~~: removed; the build now type-checks. | - |
| 7 | Low | Origin validation is skipped when `NODE_ENV === 'development'` (by design); never deploy with that value. | Keep as is; documented here so deployments are checked. |
| 8 | Low | `fetchWithValidation` adds `X-Request-Origin`/`X-Requested-With` request headers that the server does not use; they are spoofable and must not be relied on. | Remove them or leave a comment; do not build checks on them. |
| 9 | Info | `localStorage` plans are stored unencrypted in the browser (no secrets/PII beyond fitness preferences). Acceptable by design; revisit if accounts or sync are added. | If sync is added: HttpOnly/SameSite cookies, CSRF tokens, server-side authorisation. |

## How to verify

```bash
npm test                  # validation, rate limit, fallback and API error-shape tests
npm run build && npm run test:integration   # origin validation, headers/CSP, 400/413/429 on a production build
npm audit --omit=dev      # dependency advisories
grep -rnE "dangerouslySetInnerHTML|innerHTML|eval\(|new Function|document\.write" src   # must be empty
```
