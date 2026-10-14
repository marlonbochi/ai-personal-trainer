# Implementation Plan: Fix npm audit findings

**Spec**: [spec.md](./spec.md)

## Constitution Check
- IV Simplicity: only version bumps plus one `overrides` entry; no code changes. PASS
- VII Security by Default (Dependencies): critical/high advisories reduced; remaining ones tracked in SECURITY.md; CI now blocks critical. PASS
- Workflow: verified against a production build, not just `next dev`. PASS

## Changes
```
package.json / package-lock.json
  next ^16.1.1 -> ^16.4.0        (16.3.7 and below are affected)
  axios ^1.8.4 -> ^1.20.0
  postcss ^8.5.3 -> ^8.5.30
  vitest ^3.2.7 -> ^5.0.4        (needs Node ^22.12; CI and Docker already use Node 22)
  @types/node ^20 -> ^22         (peer of vitest 5)
  overrides: serialize-javascript ^7.1.2   (workbox/rollup-plugin-terser pinned a vulnerable 4.x)
  transitive packages refreshed by `npm audit fix`
.github/workflows/ci.yml        + `npm audit --omit=dev --audit-level=critical`
```

## Decisions
- **Not replacing `next-pwa`** now: the remaining advisories there are build-time only and the replacement (Serwist) changes the service worker pipeline, which deserves its own spec and offline testing.
- **Override instead of `npm audit fix --force`**: `--force` proposes downgrading `next-pwa` to 2.1.0, which is unacceptable.
- **Not migrating Tailwind 3 -> 4** here: dev/build-time advisories only and a visual-regression risk.
- **CI gate at `critical`**, not `high`: `high` would fail today because of the unfixable `braces` advisory; raise it when that clears.

## Verification (see tasks.md)
Linux/Node 22 container replica of CI, plus a combined run with the uncommitted `add-workout` code, plus a production server driven in a real browser calling the live Gemini API.
