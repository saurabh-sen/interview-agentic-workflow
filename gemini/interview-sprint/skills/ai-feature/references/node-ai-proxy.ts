// AI proxy. Keeps the API key server-side. Two ways to run it:
//   - Vite stacks (react/vue/svelte/vanilla): copy to server/ai.ts, add aiPlugin() to vite.config plugins.
//   - Anything else (Angular, CRA, ...): `node server/ai.ts` (Node >= 22.18 strips types natively),
//     listens on :8787; proxy /api -> http://localhost:8787 from the dev server.
// Needs: npm i @anthropic-ai/sdk. Vite stacks: call loadEnv(mode, cwd, '') in vite.config
// and Object.assign(process.env, ...) so .env keys reach this file.
//
//   POST /api/ai/stream  { prompt, system? }          -> text/plain stream
//   POST /api/ai/json    { prompt, system?, schema }  -> application/json
//   GET  /api/ai/status                               -> { mode: "live" | "mock" }
//
// Falls back to MOCK mode when AI_MOCK=1, or when the live call fails before any
// output (no key, no network), so the demo never dead-ends.
import Anthropic from '@anthropic-ai/sdk'
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { Plugin } from 'vite'

const MODEL = process.env.AI_MODEL ?? 'claude-opus-5-5'
// Interview demos need snappy responses; raise to "medium"/"high" for harder tasks.
const EFFORT = (process.env.AI_EFFORT ?? 'low') as 'low' | 'medium' | 'high'

type Body = { prompt?: string; system?: string; schema?: Record<string, unknown> }

let client: Anthropic | null = null
const getClient = () => (client ??= new Anthropic())
const forceMock = () => process.env.AI_MOCK === '1'

async function readBody(req: IncomingMessage): Promise<Body> {
  const chunks: Buffer[] = []
  for await (const c of req) chunks.push(c as Buffer)
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}
}

function mockText(prompt: string) {
  return `[mock AI] You asked: "${prompt.slice(0, 80)}". Set ANTHROPIC_API_KEY in .env (or unset AI_MOCK) for live responses.`
}

// Builds a minimal value that satisfies a JSON schema, so JSON features render in mock mode.
function mockFromSchema(schema: Record<string, unknown>): unknown {
  switch (schema.type) {
    case 'object': {
      const props = (schema.properties ?? {}) as Record<string, Record<string, unknown>>
      return Object.fromEntries(Object.entries(props).map(([k, v]) => [k, mockFromSchema(v)]))
    }
    case 'array':
      return [1, 2, 3].map(() => mockFromSchema((schema.items ?? {}) as Record<string, unknown>))
    case 'number':
    case 'integer':
      return 1
    case 'boolean':
      return true
    default:
      return Array.isArray(schema.enum) ? schema.enum[0] : 'mock value'
  }
}

async function handleStream(body: Body, res: ServerResponse) {
  const prompt = body.prompt ?? ''
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache')

  const writeMock = async () => {
    res.setHeader('X-AI-Mode', 'mock')
    for (const word of mockText(prompt).split(' ')) {
      res.write(word + ' ')
      await new Promise((r) => setTimeout(r, 25))
    }
    res.end()
  }
  if (forceMock()) return writeMock()

  let started = false
  try {
    const stream = getClient().beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: EFFORT },
      ...(body.system ? { system: body.system } : {}),
      messages: [{ role: 'user', content: prompt }],
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    })
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        if (!started) {
          res.setHeader('X-AI-Mode', 'live')
          started = true
        }
        res.write(event.delta.text)
      }
    }
    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') res.write('\n[The model declined this request.]')
    res.end()
  } catch (err) {
    console.warn('[ai] live call failed:', (err as Error).message)
    if (!started) return writeMock()
    res.end('\n[stream interrupted]')
  }
}

async function handleJson(body: Body, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json')
  const schema = body.schema ?? { type: 'object', properties: {} }
  const sendMock = () => res.end(JSON.stringify({ mode: 'mock', data: mockFromSchema(schema) }))
  if (forceMock()) return sendMock()

  try {
    const msg = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      output_config: { effort: EFFORT, format: { type: 'json_schema', schema } },
      ...(body.system ? { system: body.system } : {}),
      messages: [{ role: 'user', content: body.prompt ?? '' }],
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
    })
    if (msg.stop_reason === 'refusal') {
      res.statusCode = 422
      return res.end(JSON.stringify({ error: 'The model declined this request.' }))
    }
    const text = msg.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('')
    res.end(JSON.stringify({ mode: 'live', data: JSON.parse(text) }))
  } catch (err) {
    console.warn('[ai] live JSON call failed:', (err as Error).message)
    sendMock()
  }
}

export async function aiMiddleware(req: IncomingMessage, res: ServerResponse, next: () => void) {
  try {
    if (req.method === 'GET' && req.url?.startsWith('/status')) {
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ mode: forceMock() ? 'mock' : 'live', model: MODEL }))
    }
    if (req.method !== 'POST') return next()
    const body = await readBody(req)
    if (req.url?.startsWith('/stream')) return await handleStream(body, res)
    if (req.url?.startsWith('/json')) return await handleJson(body, res)
    next()
  } catch (err) {
    res.statusCode = 500
    res.end(JSON.stringify({ error: (err as Error).message }))
  }
}

export function aiPlugin(): Plugin {
  return {
    name: 'ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/ai', aiMiddleware)
    },
  }
}

// Standalone mode: `node server/ai.ts` -> http://localhost:8787/api/ai/*
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.loadEnvFile('.env')
  } catch {
    /* no .env: SDK falls back to env vars / `ant auth login` profile, else mock mode */
  }
  const port = Number(process.env.AI_PORT ?? 8787)
  createServer((req, res) => {
    if (!req.url?.startsWith('/api/ai')) return void res.writeHead(404).end()
    req.url = req.url.slice('/api/ai'.length) || '/'
    aiMiddleware(req, res, () => void res.writeHead(404).end())
  }).listen(port, () => console.log(`[ai] proxy on http://localhost:${port}/api/ai`))
}
