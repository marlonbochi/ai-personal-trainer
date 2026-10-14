<!--
Sync Impact Report
- Version change: 1.1.0 → 1.2.0 (MINOR: added Principle VII Security by Default; corrected the
  rationale of Principle II; added security review step to the Development Workflow)
- Modified principles: II (rationale corrected: origin checks stop cross-site browser abuse, NOT
  scripted clients that forge headers; route list updated)
- Added sections:
  - Core Principles: I. Server-Only Secrets, II. Origin-Locked Public API,
    III. No-Build Local Dev, IV. Simplicity & YAGNI, V. Verified Documentation,
    VI. Bilingual by Design, VII. Security by Default
  - Technology & Architecture Constraints
  - Development Workflow
  - Governance
- Removed sections: n/a
- Templates requiring updates:
  - .specify/templates/plan-template.md: ⚠ pending review (no manual edits made; relies on
    reading this constitution at plan time, no template change required)
  - .specify/templates/spec-template.md: ⚠ pending review (no changes required)
  - .specify/templates/tasks-template.md: ⚠ pending review (no changes required)
- Follow-up TODOs: see SECURITY.md "Known gaps" (rate limiting, CSP, dependency upgrades, API
  body validation on workout/nutrition routes)
-->

# AI Personal Trainer Constitution

## Core Principles

### I. Server-Only Secrets
Gemini API credentials (`GEMINI_API_KEY`, `GEMINI_API_URL`) MUST be read only in
server-side code (`src/pages/api/*`) and MUST NEVER be assigned to a
`NEXT_PUBLIC_*` variable, returned in an API response body, or included in any
log/error line that could reach the client. Client-facing error responses MUST
stay generic (e.g. `{ error: 'Failed to generate workout plan' }`); detailed
error context is for server logs only.
Rationale: these routes are the only backend surface of the app and the only
place secrets exist; a single leak point compromises the whole project's
Gemini quota and billing.

### II. Origin-Locked Public API
Every public API route that spends the Gemini quota (currently
`/api/workout`, `/api/nutrition`, `/api/replace-exercise` and
`/api/add-exercise`) MUST validate that requests come from the
app's own origin before doing any paid work, using `withOriginValidation`
(`src/middleware/validateOrigin.ts`). Validation MUST fail closed: a missing
`Origin` header is not treated as same-origin, and `Referer` MUST be compared
by parsed origin (`new URL(referer).origin`), never by string prefix.
`Sec-Fetch-Site` MUST be checked as an additional, browser-set signal that
page JavaScript cannot override. Origin validation MAY be skipped only when
`NODE_ENV === 'development'`.
Rationale: this is a public, unauthenticated app. Origin checks stop other
websites from driving a visitor's browser at the API (CSRF-style quota abuse).
They do NOT stop a non-browser client (curl, scripts), which can forge the
`Origin` header freely; that threat is addressed by Principle VII (rate
limiting and input bounds), not by this principle.

### III. No-Build Local Dev
Local development MUST be runnable with a single command
(`docker compose up`) using `Dockerfile.dev`, with hot reload via a bind mount
and no manual `next build` step required. `Dockerfile.dev` MUST install
dependencies with `--ignore-scripts` so the `postinstall` production build
never runs during a dev install. Any change to `package.json` scripts or to
required environment variables MUST be reflected in `docker-compose.yml`,
`.env.example`, and the README in the same change.
Rationale: the explicit goal of this setup was running the app locally
"sem precisar dar build e confusão" — friction here defeats the purpose.

### IV. Simplicity & YAGNI
Do not add authentication, a database, rate limiting, retry/backoff logic, or
new abstractions unless they solve a concrete, present need. The app's state
model stays as-is: no user accounts, plans are generated on demand and kept
client-side in `localStorage` (`generatedWorkout`, `generatedNutrition`,
`workoutPreferences`, `nutritionPreferences`). The two Gemini-backed API
routes remain the only backend surface unless a requirement explicitly
demands more.
Rationale: this is a small, personal project; prior sessions deliberately
proposed but did not implement rate limiting and Gemini retry/backoff,
leaving them as opt-in future work rather than default scope creep.

### V. Verified Documentation
Documentation (README, code comments, setup instructions) MUST describe only
what has been verified against the actual code, config, or a live check —
never an invented URL, an assumed env var, or an unverified capability.
When documenting env vars, cross-check `process.env.*` usages in `src/`.
When documenting the live URL, use the one already present in
`src/app/layout.tsx` metadata and `ALLOWED_ORIGINS`/`PRODUCTION_ORIGIN` in
`src/middleware/validateOrigin.ts`, not a guess.
Rationale: this project's README was previously generic
create-next-app boilerplate; documentation only earns its keep if it can be
trusted without re-verification.

### VI. Bilingual by Design
User-facing text — UI copy and the prompts sent to Gemini — MUST support both
Portuguese and English through `src/lib/i18n`. New user-facing strings MUST be
added to both `src/lib/i18n/locales/en/*` and `src/lib/i18n/locales/pt/*` in
the same change, and new Gemini prompt text MUST branch on `language` the way
`src/pages/api/workout.ts` and `src/pages/api/nutrition.ts` already do.
Rationale: pt/en support already exists end-to-end (UI + generation prompts);
a partial addition in only one language is a regression, not a shortcut.

### VII. Security by Default
Security MUST be considered in every feature, using current best practice
(OWASP Top 10 as the baseline), not retrofitted afterwards. Every `plan.md`
MUST address the checklist below in its Constitution Check, and
[SECURITY.md](../../SECURITY.md) is the single place that records what is in
place and what is a known gap. Rules:

- **XSS**: user text and AI output MUST be rendered only as React text
  children. `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`
  and `document.write` MUST NOT be used; if HTML is ever required it MUST be
  sanitised with a vetted library first. URLs derived from user or AI content
  MUST be checked against a scheme allow-list (`https:`/`http:`) before use in
  `href`/`src`.
- **CSRF**: state-changing endpoints MUST accept POST only, MUST NOT perform
  side effects on GET, and MUST use `withOriginValidation` (Principle II). If
  cookie-based sessions are ever introduced, cookies MUST be `HttpOnly`,
  `Secure` and `SameSite=Lax` or stricter, with CSRF tokens on top.
- **Input validation**: every API route MUST validate and bound its body on
  the server (type, enum/allow-list, length, array size) before use, in a
  pure function that is unit tested (pattern: `isValidReplaceBody`,
  `sanitizeContext`). Client-side checks are UX only. Data read back from
  `localStorage` MUST be treated as untrusted.
- **Prompt injection**: user-supplied text is data, never instructions.
  Model output MUST be parsed against a strict shape, MUST NOT be executed or
  rendered as HTML, and MUST be length-bounded before persisting.
- **Abuse and DoS**: routes that spend money MUST have request timeouts and
  bounded input, and SHOULD be rate limited per client; any new
  quota-spending route MUST NOT make the existing gap worse.
- **Transport and headers**: the app MUST send `X-Content-Type-Options:
  nosniff`, `Referrer-Policy`, a framing restriction and a Content Security
  Policy appropriate to what the app loads; headers MUST be defined in app
  config (not only on one hosting platform) so they apply in every
  environment.
- **Dependencies**: no dependency is added without a clear need; `npm audit`
  MUST be reviewed when dependencies change, and critical/high advisories in
  production dependencies MUST be tracked until fixed. The lockfile MUST be
  committed.
- **Secrets and logging**: Principle I applies; additionally logs MUST NOT
  contain secrets or user free-text beyond what is needed to debug.
- **Least data**: the app MUST NOT collect or persist more personal data than
  the feature needs, and MUST NOT put secrets or PII in URLs, query strings or
  client storage.
Rationale: the app is public and unauthenticated and fronts a paid API; a
single injection, CSRF or abuse path costs money or exposes visitors, and
retrofitting protections is more expensive than designing them in.

## Technology & Architecture Constraints

- **Framework**: Next.js (App Router for pages, Pages API routes for the two
  Gemini-backed endpoints) with React and TypeScript.
- **Styling**: Tailwind CSS.
- **Generation backend**: Google Gemini API, called server-side via `axios`
  from `src/pages/api/workout.ts` and `src/pages/api/nutrition.ts`. Chosen
  originally for its free tier; no other LLM provider is integrated.
- **Hosting**: Vercel, production origin `https://aitrainer.marlonbochi.com.br`.
  Secrets in Vercel MUST be stored as **Sensitive** environment variables, not
  plain ones.
- **PWA**: `next-pwa` + Workbox, disabled in development
  (`next.config.js` disables it when `NODE_ENV === 'development'`).
- **i18n**: custom context-based implementation in `src/lib/i18n`, not a
  third-party i18n library.
- **No database, no auth provider, no server-side session** — all user
  preferences and generated plans live in browser `localStorage`.

## Development Workflow

- **Local run**: `docker compose up` (see `Dockerfile.dev`,
  `docker-compose.yml`). Environment variables come from `.env.local`
  (git-ignored), seeded from `.env.example`.
- **Env var changes**: when a running dev container's env no longer matches
  `.env.local` (e.g. after rotating `GEMINI_API_KEY`), it MUST be recreated
  with `docker compose up -d --force-recreate` — editing `.env.local` alone
  does not update an already-running container.
- **Secret rotation**: rotate-before-invalidate — generate the new credential,
  update it in Vercel (marked Sensitive) and in local `.env.local`, redeploy
  and verify, and only then revoke the old credential at the source
  (Google AI Studio).
- **New features**: every new feature MUST start from a Spec Kit spec in
  `specs/NNN-feature-name/` (`spec.md`, `plan.md`, `tasks.md`) on its own branch,
  ship with vitest tests (`npm test`), and follow the `new-feature` skill
  (`.claude/skills/new-feature/SKILL.md`).
- **Commits**: only create git commits when the user explicitly asks for one
  in that turn; a prior request to commit does not carry forward.
- **Security review**: before reporting a feature as done, check it against
  Principle VII (and run the `security-review` skill for changes touching API
  routes, storage or dependencies). Record new gaps in SECURITY.md instead of
  leaving them implicit.
- **Security-relevant changes** (origin validation, secret handling, env var
  exposure) MUST be verified against a production-mode build
  (`NODE_ENV=production`, not `next dev`) before being reported as working,
  since `withOriginValidation` and similar guards are skipped in development.

## Governance

This constitution supersedes ad-hoc practice for this project. Amendments are
made by editing this file directly, MUST include a Sync Impact Report as an
HTML comment at the top of the diff, and MUST bump `CONSTITUTION_VERSION`
per semantic versioning: MAJOR for a backward-incompatible principle removal
or redefinition, MINOR for a new principle or materially expanded guidance,
PATCH for wording/clarification only. Any change touching a Core Principle
MUST state, in the Sync Impact Report, whether downstream Spec Kit templates
(`plan-template.md`, `spec-template.md`, `tasks-template.md`) need review.

**Version**: 1.2.0 | **Ratified**: 2026-09-22 | **Last Amended**: 2026-10-10
