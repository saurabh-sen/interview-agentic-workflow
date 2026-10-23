---
name: timebox
description: Check the interview sprint clock and decide what to cut - elapsed vs budget, current phase, remaining slices vs remaining time, and a concrete cut recommendation. Use when the user asks "how are we on time?", "status", "what should I cut?", or when a phase overruns.
argument-hint: "[start N | ai yes|no]  (optional: start the clock or set AI scope)"
---

# Timebox

If `$ARGUMENTS` starts with `start` or `ai`, run `bash <this skill's base directory>/../../scripts/clock.sh $ARGUMENTS` and report the output. Then stop.

Otherwise:

1. Run `bash <this skill's base directory>/../../scripts/clock.sh status`.
2. Read `.sprint/SCOPE.md`. Count the unchecked slices and add up their estimates.
3. Compare the remaining slice estimates with the minutes left in the build phases. Leave the full verify and ship windows untouched.
4. Output exactly this:

```
⏱  <elapsed>/<budget> min · phase <PHASE> · <n> MUST slices left (~<m> min est) vs <k> min available
Status: ON TRACK | AT RISK | OVER
Recommendation: <one concrete action>
```

## Cut ladder (go down it in order and stop as soon as the plan fits)

1. Drop the remaining SHOULD items.
2. Drop the polish, keeping states and accessibility basics.
3. Shrink the AI feature to one non-streaming JSON call. If it's not explicitly required, drop it.
4. Make MUSTs thinner: in-memory instead of persisted, a simple list instead of a fancy grid, client-side filtering instead of server-side, one view instead of routes.
5. Cut a MUST to stubbed UI plus a clear "next step" note. This is a last resort, and you must ask the user first.

**Never cut:** a running app, the verify gate, the README, the final commit.

Log any cut you make in `.sprint/DECISIONS.md` as `- [min N] CUT <item> - <reason>`, and move the item to WON'T in SCOPE.md.
