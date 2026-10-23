---
name: scope
description: Turn a frontend interview problem statement into a prioritized, time-estimated build plan (.sprint/SCOPE.md) - MUST/SHOULD/WON'T, assumptions, clarifying questions, data model, component tree, slice plan, acceptance criteria. Use at the start of an interview sprint or when the user says "scope this" / "break this down".
argument-hint: "[problem statement or path]"
---

# Scope (target: 10% of budget, about 6 min)

Problem: `$ARGUMENTS`. If this is empty, use the problem already in the conversation. If it's a path, read it first.

## Steps

1. **Pull out the requirements.** List every explicit requirement word for word, plus the implicit ones a reviewer will check: loading, empty, and error states; basic responsiveness; keyboard accessibility; and no console errors.
2. **Classify.**
   - **MUST**: explicitly required, or the app is pointless without it. Keep this to 3–6 items.
   - **SHOULD**: nice touches you'll do only if time remains, in priority order.
   - **WON'T (this hour)**: out of scope, each with a one-line reason. Interviewers reward explicit cuts.
3. **AI check.** Decide whether the problem asks for an AI/LLM feature, such as summarize, suggest, generate, chat, classify, or "smart". Run `bash <this skill's base directory>/../../scripts/clock.sh ai yes|no`.
4. **Design, minimally.**
   - Data model: TypeScript-style types for the core entities.
   - State: where it lives (local state, context, store, or URL) and why. Pick the simplest option that works.
   - Data source: the given API, a mock JSON file, or localStorage. If an API is given, note its shape and failure modes.
   - Component tree: at most 8 components, indented.
5. **Slice plan.** Order the MUSTs as vertical slices. Each gets a minute estimate and a "demo line" (what you click to show it works). The first slice should be the thinnest end-to-end path, e.g. render a list from data. The estimates must add up to the core-build budget. If they don't, move items to SHOULD or WON'T now.
6. **Acceptance criteria.** For each MUST, write 1–3 testable statements ("Given/When/Then" or a checkbox). `/interview-sprint:verify` and the acceptance-checker grade against these.
7. **Questions.** Write at most 3 clarifying questions. For each, put your default assumption beside it so work can proceed even without an answer.

## Output

Write `.sprint/SCOPE.md` with exactly these sections: `Problem`, `MUST`, `SHOULD`, `WON'T`, `AI feature`, `Data model`, `State & data source`, `Component tree`, `Slice plan`, `Acceptance criteria`, `Open questions (with defaults)`.

Start `.sprint/DECISIONS.md` with one bullet per assumption or tradeoff, written as `- [min N] decision - why`.

Then show the user a compact summary: the MUSTs, the slice plan with times, and the questions with their defaults. Ask once: **"Confirm or adjust - I'll proceed with the defaults otherwise."** Don't wait for more than one exchange.
