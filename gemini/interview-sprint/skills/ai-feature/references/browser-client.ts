// Browser-side AI client (framework-agnostic). Talks only to the proxy in server/ai.ts,
// so no API key ever ships to the browser.

export type AIMode = 'live' | 'mock'

export async function streamAI(opts: {
  prompt: string
  system?: string
  onToken: (text: string) => void
  signal?: AbortSignal
}): Promise<{ text: string; mode: AIMode }> {
  const res = await fetch('/api/ai/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: opts.prompt, system: opts.system }),
    signal: opts.signal,
  })
  if (!res.ok || !res.body) throw new Error(`AI request failed (${res.status})`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let text = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    text += chunk
    opts.onToken(chunk)
  }
  return { text, mode: (res.headers.get('X-AI-Mode') as AIMode) ?? 'live' }
}

/** Ask for JSON that matches `schema` (JSON Schema; objects need additionalProperties:false + required). */
export async function askJSON<T>(opts: {
  prompt: string
  system?: string
  schema: Record<string, unknown>
  signal?: AbortSignal
}): Promise<{ data: T; mode: AIMode }> {
  const res = await fetch('/api/ai/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: opts.prompt, system: opts.system, schema: opts.schema }),
    signal: opts.signal,
  })
  const payload = await res.json()
  if (!res.ok) throw new Error(payload.error ?? `AI request failed (${res.status})`)
  return payload
}
