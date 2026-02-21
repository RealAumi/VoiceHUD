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

const UPDATE_INTERVAL_MS = 240
const HOLD_LAST_VALUE_MS = 340

export function usePitchDetection(processor: AudioProcessor | null) {
  const [data, setData] = useState<PitchData>(INITIAL_DATA)
  const animFrameRef = useRef<number>(0)
  const historyRef = useRef<(number | null)[]>([])
  const lastEmitAtRef = useRef<number>(0)
  const lastVoicedAtRef = useRef<number>(0)
  const lastVoicedSnapshotRef = useRef<Pick<PitchData, 'pitch' | 'formants' | 'spectrumData'>>({
    pitch: null,
    formants: { F1: null, F2: null, F3: null },
    spectrumData: new Uint8Array(0),
  })

  const tick = useCallback(() => {
    if (!processor?.isActive) return

    const timeDomain = processor.getTimeDomainData()
    const freqData = processor.getFrequencyData()
    const byteFreq = processor.getByteFrequencyData()

    if (timeDomain.length === 0) {
      animFrameRef.current = requestAnimationFrame(tick)
      return
    }

    const now = performance.now()
    if (now - lastEmitAtRef.current < UPDATE_INTERVAL_MS) {
      animFrameRef.current = requestAnimationFrame(tick)
      return
    }
    lastEmitAtRef.current = now

    const rms = calculateRMS(timeDomain)
    const detectedVoiced = isVoiced(timeDomain)
    const detectedPitch = detectedVoiced ? detectPitchYIN(timeDomain, processor.sampleRate) : null
    const detectedFormants = detectedVoiced
      ? detectFormants(freqData, processor.sampleRate, processor.fftSize)
      : { F1: null, F2: null, F3: null }

    if (detectedVoiced && detectedPitch !== null) {
      lastVoicedAtRef.current = now
      lastVoicedSnapshotRef.current = {
        pitch: detectedPitch,
        formants: detectedFormants,
        spectrumData: byteFreq,
      }
    }

    const withinHold = now - lastVoicedAtRef.current <= HOLD_LAST_VALUE_MS
    const pitch = detectedVoiced ? detectedPitch : withinHold ? lastVoicedSnapshotRef.current.pitch : null
    const formants = detectedVoiced
      ? detectedFormants
      : withinHold
        ? lastVoicedSnapshotRef.current.formants
        : { F1: null, F2: null, F3: null }
    const voiced = detectedVoiced || withinHold
    const spectrumData = detectedVoiced ? byteFreq : withinHold ? lastVoicedSnapshotRef.current.spectrumData : byteFreq

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
      spectrumData,
    })

    animFrameRef.current = requestAnimationFrame(tick)
  }, [processor])

  useEffect(() => {
    if (processor?.isActive) {
      lastEmitAtRef.current = 0
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
    lastVoicedAtRef.current = 0
    lastEmitAtRef.current = 0
    lastVoicedSnapshotRef.current = {
      pitch: null,
      formants: { F1: null, F2: null, F3: null },
      spectrumData: new Uint8Array(0),
    }
    setData(INITIAL_DATA)
  }, [])

  return { data, reset }
}
