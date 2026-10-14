#!/bin/sh
# Smoke/integration test against a production build (run `npm run build` first).
# Verifies the security guards that are skipped in `next dev` (Constitution II).
set -eu

PORT="${PORT:-3100}"
BASE="http://localhost:$PORT"

NODE_ENV=production npx next start -p "$PORT" >/tmp/integration-server.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT

i=0
until curl -s -o /dev/null "$BASE/workout"; do
  i=$((i + 1))
  [ "$i" -gt 30 ] && { echo "server did not start"; cat /tmp/integration-server.log; exit 1; }
  sleep 1
done

FAILED=0
check() {
  name="$1"; expected="$2"; actual="$3"
  if [ "$expected" = "$actual" ]; then echo "PASS $name ($actual)"; else echo "FAIL $name: expected $expected, got $actual"; FAILED=1; fi
}

BODY='{"language":"en","exercise":{"name":"Leg Press","description":"4x12"},"otherExercises":["Squat"]}'
post() { curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/replace-exercise" -H 'Content-Type: application/json' "$@" -d "$BODY"; }

check "workout page renders" 200 "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/workout")"
check "foreign Origin is rejected" 403 "$(post -H 'Origin: https://evil.example')"
check "cross-site Sec-Fetch-Site is rejected" 403 "$(post -H 'Origin: https://aitrainer.marlonbochi.com.br' -H 'Sec-Fetch-Site: cross-site')"
check "missing Origin/Referer is rejected" 403 "$(post)"
check "lookalike Referer is rejected" 403 "$(post -H 'Referer: https://aitrainer.marlonbochi.com.br.evil.com/x')"
check "GET on API is not allowed (origin ok)" 405 "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/replace-exercise" -H 'Origin: https://aitrainer.marlonbochi.com.br')"
check "invalid body is rejected (origin ok)" 400 "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/api/replace-exercise" -H 'Content-Type: application/json' -H 'Origin: https://aitrainer.marlonbochi.com.br' -d '{}')"

ADD_BODY='{"language":"en","otherExercises":["Squat"],"description":"biceps"}'
add() { curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/add-exercise" -H 'Content-Type: application/json' "$@"; }
check "add-exercise: foreign Origin is rejected" 403 "$(add -H 'Origin: https://evil.example' -d "$ADD_BODY")"
check "add-exercise: missing Origin/Referer is rejected" 403 "$(add -d "$ADD_BODY")"
check "add-exercise: invalid body is rejected (origin ok)" 400 "$(add -H 'Origin: https://aitrainer.marlonbochi.com.br' -d '{"language":"xx"}')"
check "add-exercise: GET is not allowed (origin ok)" 405 "$(curl -s -o /dev/null -w '%{http_code}' "$BASE/api/add-exercise" -H 'Origin: https://aitrainer.marlonbochi.com.br')"

# --- security headers (defined in next.config.js, so they apply outside Vercel too)
HDRS="$(curl -s -D - -o /dev/null "$BASE/workout" | tr -d '\r')"
has() { echo "$HDRS" | grep -iq "$1" && echo yes || echo no; }
check "header: X-Content-Type-Options nosniff" yes "$(has '^x-content-type-options: nosniff')"
check "header: X-Frame-Options DENY" yes "$(has '^x-frame-options: DENY')"
check "header: Referrer-Policy" yes "$(has '^referrer-policy: strict-origin-when-cross-origin')"
check "header: Permissions-Policy" yes "$(has '^permissions-policy: ')"
check "header: Strict-Transport-Security" yes "$(has '^strict-transport-security: ')"
check "header: CSP default-src 'self'" yes "$(has "^content-security-policy: .*default-src 'self'")"
check "header: CSP frame-ancestors 'none'" yes "$(has "^content-security-policy: .*frame-ancestors 'none'")"
check "header: no X-Powered-By" no "$(has '^x-powered-by:')"
API_HDRS="$(curl -s -D - -o /dev/null -X POST "$BASE/api/replace-exercise" -H 'Content-Type: application/json' -H 'Origin: https://aitrainer.marlonbochi.com.br' -d '{}' | tr -d '\r')"
check "header: API responses are no-store" yes "$(echo "$API_HDRS" | grep -iq '^cache-control: no-store' && echo yes || echo no)"

# --- plan routes: validation, body size and rate limiting (no Gemini call is ever made)
OK_ORIGIN='Origin: https://aitrainer.marlonbochi.com.br'
plan() { curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/$1" -H 'Content-Type: application/json' -H "$OK_ORIGIN" -H "X-Real-IP: $2" -d "$3"; }
check "workout: invalid body is rejected" 400 "$(plan workout 10.0.0.1 '{"age":"DROP TABLE"}')"
check "nutrition: invalid body is rejected" 400 "$(plan nutrition 10.0.0.2 '{"dietGoal":"bulk"}')"
BIG="$(python3 -c "print('{\"additionalNotes\":\"' + 'x'*20000 + '\"}')" 2>/dev/null || printf '{"additionalNotes":"%020000d"}' 0)"
check "workout: oversized body is rejected" 413 "$(plan workout 10.0.0.3 "$BIG")"
LAST=0
for n in 1 2 3 4 5 6 7 8 9 10 11 12; do LAST="$(plan workout 10.0.0.9 '{"age":"x"}')"; done
check "workout: rate limit answers 429 after the budget" 429 "$LAST"
check "workout: other clients are unaffected" 400 "$(plan workout 10.0.0.10 '{"age":"x"}')"

exit $FAILED
