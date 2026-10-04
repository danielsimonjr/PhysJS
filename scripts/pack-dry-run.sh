#!/usr/bin/env bash
# Pack every workspace package without talking to the registry.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
found=0

for dir in "$root"/packages/*; do
  if [[ ! -f "$dir/package.json" ]]; then
    continue
  fi
  found=$((found + 1))
  name="$(basename "$dir")"
  echo "pack --dry-run packages/$name"
  (cd "$dir" && bun pm pack --dry-run)
done

if [[ "$found" -ne 10 ]]; then
  echo "expected 10 workspace packages, found $found" >&2
  exit 1
fi
