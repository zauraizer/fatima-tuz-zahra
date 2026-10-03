#!/bin/sh
# Node lives in the parent folder's .tooling/node (this Mac has no system Node).
# Usage:  ./dev.sh          -> dev server on http://localhost:5190
#         ./dev.sh build    -> production build into dist/
#         ./dev.sh preview  -> serve the built site
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$DIR/../.tooling/node/bin:$PATH"
cd "$DIR"
exec npm run "${1:-dev}"
