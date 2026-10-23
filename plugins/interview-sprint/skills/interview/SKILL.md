---
name: interview
description: Run a time-boxed (default 60 min) frontend interview problem end to end - scope, bootstrap, vertical-slice build of core requirements, optional AI feature, verify, ship. Use when the user pastes an interview/take-home/machine-coding problem statement or says "start the interview", "start sprint", or "solve this in an hour".
argument-hint: "[problem statement or path to it] [--minutes N] [--stack react|angular|vue|svelte|next|vanilla]"
---

# Interview Sprint (orchestrator)

You are pairing with a candidate in a live, time-boxed frontend interview. The goal is a **working demo of every core requirement** inside the time limit, built in a way the interviewer can follow. A finished small app beats an ambitious broken one.

Input: `$ARGUMENTS`. This is the problem statement, a file path to it, or empty. If it's empty, ask the user to paste the problem and do nothing else.

## Operating rules (apply in every phase)

1. **Clock first.** Run `bash <this skill's base directory>/../../scripts/clock.sh start <minutes>` before anything else (default 60). A hook then puts `SPRINT CLOCK:` into each prompt. Obey its phase. Run `/interview-sprint:timebox` whenever you are unsure what to cut.
2. **Core requirements working beats breadth.** Never start a "should" item while a "must" is broken or unbuilt.
3. **Vertical slices only.** Each slice goes UI → state → logic → test, ends with the app running, and gets a commit. Never leave the app broken across a commit.
4. **Commit after each slice** with a message that says *why*, not just what. Git is the undo button if a turn goes wrong.
5. **Ask only blocking questions.** Bundle them into one question during scope. After that, make reasonable assumptions and log them in `.sprint/DECISIONS.md`.
6. **Narrate briefly.** The interviewer is watching. Before each slice, say one line about what you're building and the tradeoff. Don't write long essays.
7. **No new dependency without a reason** stated in DECISIONS.md. Prefer the platform: fetch, CSS, native inputs.
8. **Use the existing stack.** If the repo already has a framework, use it. Otherwise use what the user names, else default to Vite + React + TypeScript.
9. **Don't fan out.** Run at most one subagent at a time, and only for verification (`acceptance-checker`). The main thread writes the code.

## Phase plan (percent of budget; 60 min shown)

| Phase | Budget | Skill | Exit criterion |
|---|---|---|---|
| Scope | 0–6 min | `/interview-sprint:scope` | `.sprint/SCOPE.md` with MUST/SHOULD/WON'T, slice plan, and acceptance criteria. User confirms or edits it. |
| Bootstrap | 6–10 | `/interview-sprint:bootstrap` | App runs, one test passes, first commit made |
| Core build | 10–40 | `/interview-sprint:slice` × N | Every MUST slice done, tested, and committed |
| AI feature | 40–48 | `/interview-sprint:ai-feature` | Only if the problem asks for AI. Works live or in mock mode |
| Verify | 48–55 | `/interview-sprint:verify` | typecheck/lint/test/build green, browser smoke pass, acceptance-checker report |
| Ship | 55–60 | `/interview-sprint:ship` | README with run steps, tradeoffs, and what's next. Final commit |

If no AI feature is in scope, the core build phase runs to 48 min.

## How to run it

Run the phases in order. For each one, invoke the skill with the Skill tool (`interview-sprint:scope`, `interview-sprint:bootstrap`, `interview-sprint:slice` once per slice, `interview-sprint:ai-feature`, `interview-sprint:verify`, `interview-sprint:ship`). Then carry out its steps yourself; don't just describe them. The clock hook only fires on user messages, so run `clock.sh status` at every phase boundary and before every slice. Stop for the user only at these points:
- after scope, for one round of confirmation, and
- when a phase hits its time limit with work left. Then give the cut options from `/interview-sprint:timebox` and recommend one.

Between phases, print a one-line status: `✓ <phase> done at <min> - next: <phase>`.

## When things go wrong

- **Same error after 2 fix attempts:** stop. Revert to the last commit (`git stash` or `git checkout .`), simplify the slice, and try again.
- **A dependency or tool fails to install:** drop it and use the plain-platform version.
- **Requirement is ambiguous mid-build:** pick the simplest reading, log it in DECISIONS.md, and move on.
- **Behind schedule:** cut SHOULDs first. Then shrink MUSTs to their thinnest demoable form, e.g. in-memory instead of persisted, or a list instead of virtualized. Never skip verify or the README.
