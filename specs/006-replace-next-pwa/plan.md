# Implementation Plan: Replace next-pwa with Serwist

**Spec**: [spec.md](./spec.md)

## Constitution Check
- IV Simplicity: one dependency swapped for its maintained successor; SW logic is 30 lines using library defaults. PASS
- VII Security (dependencies): production audit 5 high -> 0. CSP unchanged. PASS
- Workflow: unit + integration + real-browser offline check. PASS

## Changes
```
package.json            - next-pwa, + @serwist/next, + serwist (dev)
next.config.js -> next.config.mjs   (Serwist ships ESM)
src/sw.ts               service worker source: precache, defaultCache, offline fallback
.gitignore              generated sw.js / sw.js.map / swe-worker-*.js
scripts/integration.sh  /sw.js and /offline.html checks
scripts/pwa-offline-check.mjs   Playwright offline check (manual)
```

## Decisions
- `reloadOnOnline: false`: next-pwa did not reload on reconnect, and a reload would discard a half-filled form.
- `cacheOnNavigation` left off (next-pwa's `cacheOnFrontEndNav` default was off).
- Offline fallback added on purpose: `offline.html` was already in `public/` but unused.

## How to run the real-browser offline check
The in-app/desktop preview browsers may not support service workers, so use Playwright in Docker, sharing the server's network so the origin is `localhost` (a secure context):
```bash
# 1. production build, then start it in a container that stays up after the server is killed
docker run -d --name pwa -v "$PWD":/app -w /app -e NODE_ENV=production node:22-alpine sh -c 'npx next start -p 3000 & sleep infinity'
# 2. warm up with the server online
docker run --rm --network container:pwa -e BASE=http://localhost:3000 -v "$PWD/scripts":/work -w /work mcr.microsoft.com/playwright:v1.64.1-noble sh -c 'npm i playwright@1.64.1 && node pwa-offline-check.mjs online'
# 3. kill only the server, keep the network
docker exec pwa sh -c 'pkill -f "next start"; pkill -f next-server'
# 4. same profile, offline
docker run --rm --network container:pwa -e BASE=http://localhost:3000 -v "$PWD/scripts":/work -w /work mcr.microsoft.com/playwright:v1.64.1-noble sh -c 'npm i playwright@1.64.1 && node pwa-offline-check.mjs offline'
```
