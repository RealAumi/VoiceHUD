import { useState, useRef, useCallback, useEffect } from 'react'
import { AudioProcessor } from '#/lib/audio/audio-processor'

export interface AudioInputState {
  isActive: boolean
  isSupported: boolean
  error: string | null
}

function getMicrophoneSupportError(): string | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    // Don't hard-fail during SSR; detect accurately on client/runtime.
    return null
  }

  if (typeof navigator.mediaDevices?.getUserMedia !== 'function') {
    if (!window.isSecureContext) {
      return 'Microphone access requires HTTPS (or localhost).'
    }
    return 'Microphone API is unavailable in this environment.'
  }

  return null
}

export function useAudioInput() {
  const processorRef = useRef<AudioProcessor | null>(null)
  const [state, setState] = useState<AudioInputState>({
    isActive: false,
    // Default to true to avoid SSR false-negatives (e.g. Safari flagged unsupported).
    isSupported: true,
    error: null,
  })

  const start = useCallback(async () => {
    if (processorRef.current?.isActive) return

    const supportError = getMicrophoneSupportError()
    if (supportError) {
      setState((s) => ({ ...s, isActive: false, isSupported: false, error: supportError }))
      return
    }

    try {
      const processor = new AudioProcessor()
      await processor.start()
      processorRef.current = processor
      setState((s) => ({ ...s, isActive: true, isSupported: true, error: null }))
    } catch (err) {
      const message =
        err instanceof DOMException
          ? err.name === 'NotAllowedError'
            ? 'Microphone access denied'
            : err.name === 'NotFoundError'
              ? 'No microphone device found'
              : err.name === 'NotReadableError'
                ? 'Microphone is in use by another app'
                : 'Failed to start microphone'
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
    const supportError = getMicrophoneSupportError()
    setState((s) => ({
      ...s,
      isSupported: !supportError,
      // Don't overwrite runtime errors from start(); only fill when empty.
      error: s.error ?? supportError,
    }))

    return () => {
      processorRef.current?.stop()
    }
  }, [])

  return { ...state, start, stop, getProcessor }
}
