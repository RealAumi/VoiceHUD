import { useState, useRef, useCallback, useEffect } from 'react'
import { AudioProcessor } from '#/lib/audio/audio-processor'

export interface AudioInputState {
  isActive: boolean
  isSupported: boolean
  error: string | null
}

export function useAudioInput() {
  const processorRef = useRef<AudioProcessor | null>(null)
  const [state, setState] = useState<AudioInputState>({
    isActive: false,
    isSupported: typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
    error: null,
  })

  const start = useCallback(async () => {
    if (processorRef.current?.isActive) return

    try {
      const processor = new AudioProcessor()
      await processor.start()
      processorRef.current = processor
      setState((s) => ({ ...s, isActive: true, error: null }))
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied'
          : 'Failed to start microphone'
      setState((s) => ({ ...s, isActive: false, error: message }))
    }
  }, [])

  const stop = useCallback(() => {
    processorRef.current?.stop()
    processorRef.current = null
    setState((s) => ({ ...s, isActive: false, error: null }))
  }, [])

  const getProcessor = useCallback(() => processorRef.current, [])

  useEffect(() => {
    return () => {
      processorRef.current?.stop()
    }
  }, [])

  return { ...state, start, stop, getProcessor }
}
