import { useCallback, useRef, useState } from 'react'
import { streamAI, type AIMode } from '../lib/ai' // = browser-client.ts

/** Streams an AI response into state with loading / error / cancel handled. */
export function useAIStream() {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<AIMode | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const run = useCallback(async (prompt: string, system?: string) => {
    abortRef.current?.abort()
    const ctrl = new AbortController()
    abortRef.current = ctrl
    setText('')
    setError(null)
    setLoading(true)
    try {
      const result = await streamAI({
        prompt,
        system,
        signal: ctrl.signal,
        onToken: (t) => setText((prev) => prev + t),
      })
      setMode(result.mode)
      return result.text
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      return null
    } finally {
      if (abortRef.current === ctrl) setLoading(false)
    }
  }, [])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
  }, [])

  return { text, loading, error, mode, run, cancel }
}
