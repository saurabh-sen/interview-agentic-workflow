---
name: ai-feature
description: Add an LLM-powered feature (summarize, suggest, generate, classify, chat, smart search) to a frontend app in about 8 minutes - server-side key proxy, streaming text or schema-validated JSON, mock-mode fallback so the demo never dead-ends. Framework-agnostic. Use when an interview problem asks for AI, or the user says "add AI" / "make it smart".
argument-hint: "[what the AI should do, e.g. 'suggest subtasks for a todo']"
---

# AI feature (target: about 13% of budget, 8 min)

First, run `bash <this skill's base directory>/../../scripts/clock.sh status` and say the time. Do it again before each major step if the run is long.

Feature: the arguments passed with the command (`$ARGUMENTS`; if that shows up as a literal placeholder, use the text the user gave with the command). If this is empty, use SCOPE.md's `AI feature` section.

**Precondition:** all MUST slices are done. If not, tell the user, and build the AI feature only if they explicitly say to.

## 1. Choose the interaction shape (decide in 10 seconds)

| The feature produces... | Use | Endpoint |
|---|---|---|
| Prose the user reads (summary, explanation, reply, draft) | **streaming text** | `POST /api/ai/stream` |
| Data the UI renders (list of suggestions, tags, a category, fields) | **structured JSON** with a JSON Schema | `POST /api/ai/json` |
| Multi-turn chat | streaming text, with prior turns serialized into the prompt | `/api/ai/stream` |

## 2. Install the proxy (the key never goes to the browser)

The reference files are in `<this skill's base directory>/references/`:
- `node-ai-proxy.ts`: the server. Copy it to `server/ai.ts`. It contains streaming, JSON-schema output, the refusal check, and mock fallback.
- `browser-client.ts`: the client, with `streamAI()` and `askJSON()`. Copy it to `src/lib/ai.ts`. It's framework-agnostic.
- `react-useAIStream.ts`: a React hook with loading, error, and cancel. For Angular, Vue, or Svelte, port it to a signal, composable, or store using the same shape: `{text, loading, error, mode, run, cancel}`.

Wire it up for the stack:
- **Vite (react, vue, svelte, vanilla):** in `vite.config.ts`, call `Object.assign(process.env, loadEnv(mode, process.cwd(), ''))` and add `aiPlugin()` to `plugins`. Add `"server"` to `tsconfig.node.json`'s `include`.
- **Angular / other:** run `node server/ai.ts`, which serves on :8787, as a background process. Add `proxy.conf.json` with `{"/api": {"target": "http://localhost:8787"}}` and point `ng serve` at it.
- **Next.js:** port the two handlers to `app/api/ai/stream/route.ts` and `app/api/ai/json/route.ts`. Return a `ReadableStream` for streaming. Keep the same request and response shapes.

Then:
1. Run `npm i @anthropic-ai/sdk`.
2. Create `.env.example` containing `ANTHROPIC_API_KEY=`, and make sure `.env` is in `.gitignore`.
3. If there's no key, it runs in **mock mode** automatically. Mock JSON is generated from the schema, so the UI still renders.

Model and API details: the reference uses `claude-opus-5-5` at `effort: "low"` for speed, with server-side refusal fallbacks. If you change the model or request shape, load the `claude-api` skill first if it's available, otherwise check the current Anthropic docs. Don't rely on memory.

## 3. Build the feature as a slice

- **Prompt design.** Put the role and output rules in `system`. Put the user's data in `prompt`, wrapped in tags like `<item>…</item>`. For JSON, the schema does the formatting work: every object needs `additionalProperties: false` and `required`.
- **UX checklist.** Interviewers grade this part:
  - A clear trigger (button or action), disabled while it's running
  - Visible progress: streaming text, or a spinner with a label
  - Cancel for anything longer than about 3 seconds
  - An error state with Retry
  - A small badge showing `AI` / `mock`, read from `mode`
  - The user can accept, edit, or discard what the AI produced. Never overwrite user data silently.
- **Test.** Mock `fetch` at the `/api/ai/*` boundary. Assert the loading state, the rendered result, and the error state. Don't call the real API in tests.

## 4. Verify and commit

1. Do one live run if a key exists, and one with `AI_MOCK=1`.
2. Commit as `feat(ai): <feature> via server-side proxy - key never reaches browser, mock fallback for offline demo`.
3. Log the prompt and model choice in DECISIONS.md.
