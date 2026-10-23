# agentic-workflow

A Claude Code plugin marketplace (with a matching Gemini CLI extension). It currently holds one plugin, **`interview-sprint`**: a time-boxed agentic workflow for solving a frontend interview or machine-coding problem end to end in about 1 hour. That covers scoping, a running app, the core requirements working and tested, an AI feature if one is asked for, verification, and a README. It works with any framework.

## Install

```bash
# inside Claude Code
/plugin marketplace add /Users/saurabhs_500408/personal/projects/agentic-workflow
/plugin install interview-sprint@agentic-workflow
```

Or try it for a single session without installing: `claude --plugin-dir /Users/saurabhs_500408/personal/projects/agentic-workflow/plugins/interview-sprint`

### Gemini CLI

The same workflow ships as a Gemini CLI extension in `gemini/interview-sprint/`. The commands have the same names (`/interview-sprint:scope`, etc.).

```bash
gemini extensions link /Users/saurabhs_500408/personal/projects/agentic-workflow/gemini/interview-sprint   # live link: edits show up after a CLI restart
# or: gemini extensions install <path>   # makes a copy, so re-run `gemini extensions update interview-sprint` after edits
```

| Piece | Claude Code plugin | Gemini CLI extension |
|---|---|---|
| Skills + `clock.sh` | `plugins/interview-sprint/skills`, `scripts` (source of truth) | Copied in by `scripts/sync-gemini.sh` |
| Slash commands | The skills themselves | `commands/interview-sprint/*.toml`, thin wrappers that activate the skill |
| Clock hook | `UserPromptSubmit` | `BeforeAgent` |
| Verifier | `agents/acceptance-checker.md` (Claude tools) | Same prompt with Gemini tool names |

**After you edit a skill or `clock.sh`, run `scripts/sync-gemini.sh` and commit both copies.**

To enable the browser smoke test in Gemini, set `agents.overrides.browser_agent.enabled: true` in `~/.gemini/settings.json`.

## Use

Open Claude Code in an empty folder, or in the repo the interview gives you, then run:

```
/interview-sprint:interview <paste the problem> --minutes 60 --stack react
```

The orchestrator runs every phase. You can also drive each phase yourself:

| Command | Phase (60-min budget) | What it does |
|---|---|---|
| `/interview-sprint:scope` | 0–6 | Writes `.sprint/SCOPE.md`: MUST/SHOULD/WON'T, data model, component tree, timed slice plan, acceptance criteria, questions with defaults |
| `/interview-sprint:bootstrap` | 6–10 | Detects or scaffolds React/Vue/Svelte/Angular/Next/vanilla, sets up the test harness, normalizes scripts, adds loading/error/empty states, first commit |
| `/interview-sprint:slice [name]` | 10–40 | Builds one vertical slice (UI, state, logic, test), commits it, checks it off |
| `/interview-sprint:ai-feature [what]` | 40–48 | Server-side key proxy, streaming or JSON-schema output, mock fallback, AI UX checklist |
| `/interview-sprint:verify` | 48–55 | typecheck/lint/test/build, an independent `acceptance-checker` agent, browser smoke test |
| `/interview-sprint:ship` | 55–60 | README (decisions, cuts, known issues), 2-minute demo script, final commit |
| `/interview-sprint:timebox` | any time | Clock status, ON TRACK / AT RISK / OVER, and the next thing to cut |

## How it stays on time

- **Clock hook.** `scripts/clock.sh start` writes `.sprint/start`. From then on, a `UserPromptSubmit` hook adds `SPRINT CLOCK: 23/60 min · Phase: CORE · Next: …` to every prompt, so Claude always knows the phase. It does nothing when no sprint is running.
- **Cut ladder.** `timebox` drops SHOULDs first, then polish, then the AI feature, then thins the MUSTs. It never cuts the running app, verify, or the README.
- **Vertical slices plus a commit per slice.** The app stays demoable after every commit, and a bad turn can be undone with git.
- **Decision log.** `.sprint/DECISIONS.md` records each assumption and cut with a timestamp. It feeds the README, and you can talk through it with the interviewer.

## AI feature

`skills/ai-feature/references/` holds tested reference code:
- `node-ai-proxy.ts` works as a Vite plugin or as a standalone `node server/ai.ts`. It covers streaming, JSON-schema output, refusal handling, and **automatic mock mode** when there's no key or no network.
- `browser-client.ts` has `streamAI()` and `askJSON()`.
- `react-useAIStream.ts` is a hook you can port to Angular signals or a Vue composable.

The API key stays on the server and never reaches the browser.

## Practice run

Before the real interview, run the whole flow once on a toy prompt, e.g. *"Build a kanban board with drag-and-drop between 3 columns, persisted locally, with AI-suggested task breakdowns."*
