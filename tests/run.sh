#!/usr/bin/env bash
# Runs the browser tests against a local copy of the app.
#
#   npm i -g playwright && playwright install chromium
#   ./tests/run.sh
#
# NODE_PATH lets the tests resolve a globally installed playwright.
set -euo pipefail
cd "$(dirname "$0")/.."

# Prefer a local install; fall back to a global one.
if [ -f node_modules/playwright/index.mjs ]; then
  export PW="$PWD/node_modules/playwright/index.mjs"
elif [ -f "$(npm root -g)/playwright/index.mjs" ]; then
  export PW="$(npm root -g)/playwright/index.mjs"
else
  echo "playwright not found. npm i -g playwright && playwright install chromium" >&2
  exit 1
fi
PORT="${PORT:-8099}"
SHOT="${SHOT:-$(mktemp -d)}"
export SHOT

npx --yes http-server -p "$PORT" -s -c-1 . >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 2

fail=0
for t in tests/*.test.mjs; do
  echo
  echo "── $(basename "$t") ─────────────────────────────────"
  # `updates` needs its own throwaway copy, since it edits files on disk
  if [[ "$t" == *updates* ]]; then
    DIR=$(mktemp -d); cp -r ./* "$DIR" 2>/dev/null || true
    UPDATE_PORT=$(( 8200 + RANDOM % 300 ))
    (cd "$DIR" && npx --yes http-server -p "$UPDATE_PORT" -s -c-1 . >/dev/null 2>&1) &
    UP=$!
    sleep 2
    DIR="$DIR" UPDATE_PORT="$UPDATE_PORT" node "$t" || fail=1
    kill $UP 2>/dev/null || true
  else
    node "$t" || fail=1
  fi
done

echo
echo "screenshots in $SHOT"
exit $fail
