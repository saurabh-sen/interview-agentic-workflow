---
name: ship
description: Wrap up a time-boxed frontend build for handoff - README with run steps, what was built, decisions and tradeoffs, what was cut and why, next steps, plus a 2-minute demo script; final commit. Use at the end of an interview sprint or when the user says "wrap up" / "ship it".
---

# Ship (final 8% of budget, about 5 min)

## 1. README.md

Replace the template README. Keep it to what a reviewer reads in 2 minutes:

```markdown
# <App name>
<one-sentence what it does>

## Run
npm install && npm run dev      # <dev URL>
npm test                        # <n> tests
(AI) cp .env.example .env and set ANTHROPIC_API_KEY - runs in mock mode without it

## What's done
- [x] <MUST 1> - <one-line how>
...

## Decisions & tradeoffs
- <decision> - <why> (from .sprint/DECISIONS.md, the 4-6 that matter)

## Cut for time (and how I'd do it)
- <item> - <approach with one more hour>

## Known issues
- <anything verify left failing, honestly>

## Next steps
- <2-4 bullets: scale, testing, a11y, perf>
```

Build it from `.sprint/SCOPE.md`, `.sprint/DECISIONS.md`, `git log --oneline`, and the verify results. Don't claim anything the verify step didn't confirm.

## 2. Demo script

Print, without writing a file, a 2-minute walkthrough for the candidate to say out loud:
1. The problem in one line, and the scope cuts.
2. Each MUST's demo line, in the order to click it.
3. One architecture point: state placement, data flow, or the AI proxy.
4. One thing you'd do differently, or next.

## 3. Final commit

Run `npm run build` one last time. Then commit as `docs: README with decisions, cuts, and run steps`. Run `bash <this skill's base directory>/../../scripts/clock.sh status` and print the final time.
