#!/usr/bin/env bash
# new-post.sh — Thin wrapper that calls new-post.py
# Usage (from repo root):
#   ./scripts/new-post.sh <obsidian-file.md> <slug>
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec python3 "$SCRIPT_DIR/new-post.py" "$@"
