---
name: verify
description: Pre-demo quality gate for a time-boxed frontend build - typecheck, lint, tests, production build, browser smoke test of every acceptance criterion, and an independent requirements check. Fixes only demo-breaking issues. Use near the end of an interview sprint or when the user says "verify" / "are we good?".
---

# Verify (target: about 12% of budget, 7 min)

First, run `bash <this skill's base directory>/../../scripts/clock.sh status` and say the time. Do it again before each major step if the run is long.

From here on, **no new features**. Fix only things that would break or embarrass the demo.

## 1. Automated gate

Run `npm run verify`. If it doesn't exist, run typecheck, then lint, then test, then build.

Fix failures in priority order: build, then type errors, then failing tests, then lint errors. Lint warnings can wait. Don't disable a test to make it pass unless the feature was cut, and say so if you do.

## 2. Requirements check (independent)

Launch the `acceptance-checker` agent from this plugin, **one instance only**. Give it the project path and `.sprint/SCOPE.md`. It reports PASS, FAIL, or PARTIAL per acceptance criterion, with evidence. While it runs, continue with step 3. When its report arrives, fix FAILs in MUST items first.

## 3. Browser smoke test

If browser tools are available (claude-in-chrome or chrome-devtools), use them. Otherwise give the user a 5-step manual checklist.
- Load the dev URL. **Check the console has no errors.**
- Walk each MUST's demo line from SCOPE.md.
- Check the edge states: empty data, a slow or failed network (if there's an API), very long text, and rapid repeat clicks.
- Resize to about 375px wide. Nothing should overflow horizontally.
- Tab through the main flow. Focus should be visible and Enter/Space should activate controls.

## 4. Quick polish (only if green and time remains)

These are the cheapest wins, in order:
- Page title
- Empty-state copy
- Disabled states on buttons while submitting
- Consistent spacing
- Remove leftover `console.log` calls

## 5. Commit

Commit as `chore: verify - <n> tests passing, build green, <fixes>`. Print a table: criterion | status. Any criterion still failing goes into the README's "Known issues".
