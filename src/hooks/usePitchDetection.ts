import { useState, useRef, useCallback, useEffect } from 'react'
import { detectPitchYIN, calculateRMS, isVoiced } from '#/lib/audio/pitch-detection'
import { detectFormants, type FormantData } from '#/lib/audio/formant-analysis'
import { VIS } from '#/lib/audio/constants'
import type { AudioProcessor } from '#/lib/audio/audio-processor'

export interface PitchData {
  /** Current detected pitch in Hz, null if not detected */
  pitch: number | null
  /** RMS amplitude (volume) */
  rms: number
  /** Whether voice is detected */
  voiced: boolean
  /** Formant frequencies */
  formants: FormantData
  /** History of recent pitch values */
  pitchHistory: (number | null)[]
  /** Frequency spectrum data for visualization */
  spectrumData: Uint8Array
}

const INITIAL_DATA: PitchData = {
  pitch: null,
  rms: 0,
  voiced: false,
  formants: { F1: null, F2: null, F3: null },
  pitchHistory: [],
  spectrumData: new Uint8Array(0),
}

export function usePitchDetection(processor: AudioProcessor | null) {
  const [data, setData] = useState<PitchData>(INITIAL_DATA)
  const animFrameRef = useRef<number>(0)
  const historyRef = useRef<(number | null)[]>([])

  const tick = useCallback(() => {
    if (!processor?.isActive) return

    const timeDomain = processor.getTimeDomainData()
    const freqData = processor.getFrequencyData()
    const byteFreq = processor.getByteFrequencyData()

    if (timeDomain.length === 0) {
      animFrameRef.current = requestAnimationFrame(tick)
      return
    }

    const rms = calculateRMS(timeDomain)
    const voiced = isVoiced(timeDomain)
    const pitch = voiced ? detectPitchYIN(timeDomain, processor.sampleRate) : null
    const formants = voiced
      ? detectFormants(freqData, processor.sampleRate, processor.fftSize)
      : { F1: null, F2: null, F3: null }

    // Update pitch history
    historyRef.current.push(pitch)
    if (historyRef.current.length > VIS.PITCH_HISTORY_LENGTH) {
      historyRef.current.shift()
    }

    setData({
      pitch,
      rms,
      voiced,
      formants,
      pitchHistory: [...historyRef.current],
      spectrumData: byteFreq,
    })

    animFrameRef.current = requestAnimationFrame(tick)
  }, [processor])

  useEffect(() => {
    if (processor?.isActive) {
      historyRef.current = []
      animFrameRef.current = requestAnimationFrame(tick)
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [processor, tick])

  const reset = useCallback(() => {
    historyRef.current = []
    setData(INITIAL_DATA)
  }, [])

  return { data, reset }
}
