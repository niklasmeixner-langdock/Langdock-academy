#!/bin/bash
# Start the main Langdock app on port 3001 with iframe embedding allowed.
# This patches CSP headers locally (not committed) so the academy can embed it.

set -e

LANGDOCK_DIR="${LANGDOCK_DIR:-$(cd "$(dirname "$0")/../../langdock-main" && pwd)}"
DOCUMENT_FILE="$LANGDOCK_DIR/apps/web-app/src/pages/_document.tsx"
PROXY_FILE="$LANGDOCK_DIR/apps/web-app/src/proxy.ts"

if [ ! -f "$DOCUMENT_FILE" ]; then
  echo "Error: Langdock main repo not found at $LANGDOCK_DIR"
  echo "Set LANGDOCK_DIR to the correct path."
  exit 1
fi

echo "Patching CSP headers to allow iframe embedding..."

# Patch _document.tsx: change frame-ancestors 'none' to allow localhost
sed -i.academy-bak 's/frameAncestors: embedDomains ?? undefined/frameAncestors: [...(embedDomains ?? []), "http:\/\/localhost:3000"]/' "$DOCUMENT_FILE"
sed -i.academy-bak 's/ctx.res.setHeader("X-Frame-Options", "DENY");/\/\/ ctx.res.setHeader("X-Frame-Options", "DENY"); \/\/ disabled for academy/' "$DOCUMENT_FILE"

# Patch proxy.ts: allow framing
sed -i.academy-bak 's/frameAncestors: undefined/frameAncestors: ["http:\/\/localhost:3000"]/' "$PROXY_FILE"
sed -i.academy-bak 's/response.headers.set("X-Frame-Options", "DENY");/\/\/ response.headers.set("X-Frame-Options", "DENY"); \/\/ disabled for academy/' "$PROXY_FILE"

echo "Starting Langdock on port 3001..."
echo "(Press Ctrl+C to stop — patches will be reverted)"

cleanup() {
  echo ""
  echo "Reverting patches..."
  mv "$DOCUMENT_FILE.academy-bak" "$DOCUMENT_FILE" 2>/dev/null || true
  mv "$PROXY_FILE.academy-bak" "$PROXY_FILE" 2>/dev/null || true
  echo "Done."
}
trap cleanup EXIT INT TERM

cd "$LANGDOCK_DIR"
PORT=3001 pnpm --filter web-app dev
