#!/usr/bin/env bash
# Interview sprint clock. State lives in ./.sprint/ of the project being built.
#
#   clock.sh start [minutes]   start the clock (default 60)
#   clock.sh ai yes|no         record whether an AI feature is in scope (changes the schedule)
#   clock.sh status            human-readable elapsed / phase / what to do next
#   clock.sh hook              JSON for a UserPromptSubmit hook (silent when no sprint is running)
set -euo pipefail

DIR="${SPRINT_DIR:-.sprint}"
cmd="${1:-status}"

case "$cmd" in
  start)
    mkdir -p "$DIR"
    date +%s > "$DIR/start"
    echo "${2:-60}" > "$DIR/budget"
    [ -f "$DIR/ai" ] || echo "unknown" > "$DIR/ai"
    echo "Sprint clock started: ${2:-60} minutes."
    exit 0
    ;;
  ai)
    mkdir -p "$DIR"
    echo "${2:-unknown}" > "$DIR/ai"
    echo "AI feature in scope: ${2:-unknown}"
    exit 0
    ;;
esac

if [ ! -f "$DIR/start" ]; then
  [ "$cmd" = "hook" ] && exit 0
  echo "No sprint running. Start one with: clock.sh start 60"
  exit 0
fi

start=$(cat "$DIR/start")
budget=$(cat "$DIR/budget" 2>/dev/null || echo 60)
ai=$(cat "$DIR/ai" 2>/dev/null || echo unknown)
now=$(date +%s)
elapsed=$(( (now - start) / 60 ))
remaining=$(( budget - elapsed ))
pct=$(( elapsed * 100 / budget ))

# Phase boundaries as % of budget. Without an AI feature, core build absorbs that slot.
if [ "$ai" = "no" ]; then core_end=80; ai_end=80; else core_end=67; ai_end=80; fi

if   [ $pct -lt 10 ];        then phase="SCOPE";     next="Finish SCOPE.md, confirm must-haves with the interviewer, then /interview-sprint:bootstrap"; end=10
elif [ $pct -lt 17 ];        then phase="BOOTSTRAP"; next="Get a running app + one passing test + first commit, then start slices"; end=17
elif [ $pct -lt $core_end ]; then phase="CORE";      next="Build must-have slices one at a time (/interview-sprint:slice). Each ends runnable + committed"; end=$core_end
elif [ $pct -lt $ai_end ];   then phase="AI";        next="Add the AI feature (/interview-sprint:ai-feature) - only if every must-have works"; end=$ai_end
elif [ $pct -lt 92 ];        then phase="VERIFY";    next="Stop adding features. Run /interview-sprint:verify and fix only what breaks the demo"; end=92
elif [ $pct -lt 100 ];       then phase="SHIP";      next="Run /interview-sprint:ship: README, tradeoffs, demo script. Commit"; end=100
else                              phase="OVERTIME";  next="Out of time. Commit what works, write the README, stop coding"; end=100
fi
phase_left=$(( end * budget / 100 - elapsed )); [ $phase_left -lt 0 ] && phase_left=0

msg="SPRINT CLOCK: ${elapsed}/${budget} min elapsed (${remaining} left). Phase: ${phase} (~${phase_left} min left in phase). AI in scope: ${ai}. Next: ${next}."
if [ $pct -ge 50 ] && [ "$phase" = "CORE" ]; then
  msg="$msg Past halfway - if a must-have is not started, simplify it now rather than add anything new."
fi

if [ "$cmd" = "hook" ]; then
  # Escape for JSON (quotes and backslashes only; message has no newlines).
  esc=$(printf '%s' "$msg" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '{"hookSpecificOutput":{"hookEventName":"UserPromptSubmit","additionalContext":"%s"}}\n' "$esc"
else
  echo "$msg"
fi
