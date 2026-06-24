#!/usr/bin/env bash
#
# Build + pack the config, then install it into every example consumer under
# examples/ and run that example's own typecheck + lint. This catches rules or
# plugins that break only in a real consumer install — peer/transitive
# resolution, framework-version detection, SFC handling — which the in-repo
# dogfood tests (tests/*.test.mjs) cannot see because they run against the
# repo's own node_modules.
#
# Usage: npm run verify:examples
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

echo "▸ Building and packing eslint-config-mocg…"
npm run build
npm pack >/dev/null

status=0
for dir in "$root"/examples/*/; do
  name="$(basename "$dir")"
  echo ""
  echo "──────────────────────────────────────────────"
  echo "▸ $name — installing against the packed tarball"
  echo "──────────────────────────────────────────────"
  if (
    cd "$dir"
    rm -rf node_modules package-lock.json
    npm install --no-audit --no-fund
    npm run typecheck
    npm run lint
  ); then
    echo "✓ $name passed"
  else
    echo "✗ $name FAILED"
    status=1
  fi
done

echo ""
if [ "$status" -eq 0 ]; then
  echo "✓ All example consumers verified."
else
  echo "✗ Example verification failed — see the output above."
fi
exit "$status"
