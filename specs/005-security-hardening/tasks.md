# Tasks: Security hardening pass

- [x] T001 Audit: logs, git history, env files, docker context, client bundle, XSS sinks, headers
- [x] T002 `src/lib/requestValidation.ts` + tests; wire into workout/nutrition (400)
- [x] T003 `src/middleware/rateLimit.ts` + tests; wrap all four Gemini routes
- [x] T004 16 kB body limit on all four routes
- [x] T005 `next.config.js`: headers, CSP, `poweredByHeader: false`, API `no-store`, drop `ignoreBuildErrors`/`eslint` flags
- [x] T006 Remove duplicate `next.config.ts`; move security headers out of `vercel.json`
- [x] T007 Integration script: headers, 400, 413, 429
- [x] T008 Production build passes with type checking; `tsc` passes
- [x] T009 Browser: workout + nutrition forms against a production server with CSP; no violations
- [x] T010 Docs: SECURITY.md, constitution note
- [ ] T011 (follow-up) Shared rate-limit store (Upstash/Vercel KV) or Vercel Firewall rules
- [ ] T012 (follow-up) Nonce-based CSP (needs dynamic rendering)
