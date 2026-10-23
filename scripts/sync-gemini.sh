#!/usr/bin/env bash
# Copies the shared skills and scripts from the Claude Code plugin into the Gemini CLI extension.
# Run after editing anything under plugins/interview-sprint/{skills,scripts}, then commit both.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
src="$root/plugins/interview-sprint"
dst="$root/gemini/interview-sprint"
rsync -a --delete "$src/skills/" "$dst/skills/"
rsync -a --delete "$src/scripts/" "$dst/scripts/"
echo "Synced skills/ and scripts/ into $dst"
