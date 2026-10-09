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

exit $FAILED
