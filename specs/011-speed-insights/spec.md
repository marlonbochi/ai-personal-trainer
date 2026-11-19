# Feature Specification: Vercel Speed Insights

**Feature Branch**: `speed-insights`
**Status**: Implemented
**Input**: "Install Vercel Speed Insights, npm i @vercel/speed-insights"

## User Story

As the app owner, I want real-user Core Web Vitals (LCP, INP, CLS, FCP, TTFB) per route in the Vercel dashboard, so I can see how fast the app is on real phones.

**Acceptance**:
1. In production on Vercel, every page loads `/_vercel/speed-insights/script.js` and reports to `/_vercel/speed-insights/vitals`.
2. The production CSP does not block it and no new CSP violation appears.
3. Outside Vercel (Docker, `next start`) the app keeps working; the script request simply 404s.

## Requirements

- **FR-001**: Add `@vercel/speed-insights` and render `<SpeedInsights />` once in the root layout (`src/app/client-layout.tsx`).
- **FR-002**: No CSP change: script and endpoint are same-origin, covered by `'self'`.
- **FR-003**: E2E proves the script is requested and executes under the production CSP.
