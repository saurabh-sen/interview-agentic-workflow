---
name: slice
description: Implement one vertical feature slice end to end (UI, state, logic, test), leave the app runnable, and commit. Use repeatedly during the core-build phase of an interview sprint, or when the user says "build the next feature" / "next slice".
argument-hint: "[slice name from SCOPE.md, or empty for the next unbuilt one]"
---

# Slice (one MUST at a time)

Target: `$ARGUMENTS`. If empty, take the first unchecked slice in `.sprint/SCOPE.md`'s slice plan.

## Loop

1. **Announce.** In one line, say what you're building, the demo line, and the time estimate. Note the clock.
2. **Read only what you need.** That's the files this slice touches, plus the acceptance criteria for it in SCOPE.md.
3. **Build the thinnest working path first.** Wire data to the UI to the interaction with real behavior. Polish comes after it works.
   - Type the data model, and don't use `any`.
   - Every async path renders the Loading, Error, and Empty states.
   - Use semantic elements: `button`, `label` + `input`, lists, headings. Interactive controls must work from the keyboard. This accessibility is nearly free and interviewers notice it.
   - Put state in the simplest place that works. Lift it only when a second consumer appears.
   - Wrap side effects (fetch, storage, timers) in small functions or hooks so you can test them.
4. **Test the behavior.** Write 1–3 tests that map to this slice's acceptance criteria. Test what the user does, through roles and labels, not implementation details. Mock network calls at the fetch boundary.
5. **Run.** Run `npm test`, and the typecheck if it's fast. Fix failures. **If the same error survives 2 attempts**, stop. Simplify the approach or revert with `git checkout .`. Don't spiral.
6. **Check it in the browser if possible.** If browser tools are available, load the page and do the demo line once. Otherwise say what to click.
7. **Commit.** Use `feat(<area>): <what> - <why/tradeoff>`. Check the slice off in SCOPE.md (`- [x]`). If you made any assumptions, add them to DECISIONS.md.
8. **Report.** Print `✓ slice <name> at <min> (<est> est)`. If you went more than 50% over the estimate, say what you'll cut next to recover.

## Guardrails

- One slice per run. Don't sneak a second feature in.
- Don't refactor unrelated code. The exception is extracting a shared component because two slices need it.
- If the clock says CORE is past halfway and this slice is big, deliver its thinnest demoable form and add the rest to SHOULD.
