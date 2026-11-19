# Implementation Plan: Vercel Speed Insights

**Spec**: [spec.md](./spec.md)

## Constitution Check
- I Server-Only Secrets: no secret involved. PASS
- II Origin-Locked API: no API route change; the vitals endpoint is served by Vercel, not by the app. PASS
- IV Simplicity: one official dependency, one component. PASS
- VII Security by Default (SECURITY.md):
  - CSP: unchanged. In production the script is `/_vercel/speed-insights/script.js` and the endpoint `/_vercel/speed-insights/vitals`, both `'self'`. The dev build loads `va.vercel-scripts.com/.../script.debug.js`, but dev has no CSP. PASS
  - Least data / privacy: the script sends route path, metric values, and device/connection class; no cookies, no identifiers, no localStorage content. Routes carry no user data (plans live in localStorage). PASS
  - Dependencies: `npm audit --omit=dev` adds no advisory for this package. PASS
- Tests: E2E stands in for Vercel's `/_vercel/*` route and asserts the script executes with no CSP violation (RED without the component). PASS

## Structure
```
package.json, package-lock.json   # + @vercel/speed-insights
src/app/client-layout.tsx         # <SpeedInsights /> at the end of <body>
e2e/security.spec.ts              # script loads and runs under the CSP
```

## Decisions
- **Next.js entry point (`@vercel/speed-insights/next`)**: tracks routes, not full URLs.
- **No `sampleRate`**: traffic is small; the Vercel plan quota is the limit.
- **Enable in the Vercel dashboard**: Speed Insights must be turned on for the project (Project → Speed Insights), otherwise `/_vercel/speed-insights/*` is not served.
