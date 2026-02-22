import { useState, useRef, useCallback, useEffect } from 'react'
import { detectPitchYIN, calculateRMS, getAdaptiveVoiceThreshold, isVoiced } from '#/lib/audio/pitch-detection'
import { detectFormants, type FormantData } from '#/lib/audio/formant-analysis'
import { PITCH_DETECTION, VIS } from '#/lib/audio/constants'
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
  /** Last detected formant values (ghost/persistence) */
  ghostFormants: FormantData
  /** History of recent pitch values */
  pitchHistory: (number | null)[]
  /** Frequency spectrum data for visualization */
  spectrumData: Uint8Array
}

const EMPTY_FORMANTS: FormantData = { F1: null, F2: null, F3: null }

const INITIAL_DATA: PitchData = {
  pitch: null,
  rms: 0,
  voiced: false,
  formants: EMPTY_FORMANTS,
  ghostFormants: EMPTY_FORMANTS,
  pitchHistory: [],
  spectrumData: new Uint8Array(0),
}

const UPDATE_INTERVAL_MS = 80
const HOLD_LAST_VALUE_MS = 600

/** EMA smoothing factor (0–1). Higher = more smoothing / slower response */
const PITCH_SMOOTH = 0.45
const FORMANT_SMOOTH = 0.5
const INITIAL_NOISE_FLOOR = PITCH_DETECTION.VOICE_THRESHOLD * PITCH_DETECTION.VOICE_THRESHOLD_FLOOR_FACTOR

function ema(prev: number | null, cur: number | null, alpha: number): number | null {
  if (cur === null) return prev
  if (prev === null) return cur
  return prev * alpha + cur * (1 - alpha)
}

function smoothFormants(prev: FormantData, cur: FormantData, alpha: number): FormantData {
  return {
    F1: ema(prev.F1, cur.F1, alpha),
    F2: ema(prev.F2, cur.F2, alpha),
    F3: ema(prev.F3, cur.F3, alpha),
  }
}

export function usePitchDetection(processor: AudioProcessor | null) {
  const [data, setData] = useState<PitchData>(INITIAL_DATA)
  const animFrameRef = useRef<number>(0)
  const historyRef = useRef<(number | null)[]>([])
  const lastEmitAtRef = useRef<number>(0)
  const lastVoicedAtRef = useRef<number>(0)
  const lastVoicedSnapshotRef = useRef<Pick<PitchData, 'pitch' | 'formants' | 'spectrumData'>>({
    pitch: null,
    formants: EMPTY_FORMANTS,
    spectrumData: new Uint8Array(0),
  })
  const smoothedPitchRef = useRef<number | null>(null)
  const smoothedFormantsRef = useRef<FormantData>(EMPTY_FORMANTS)
  const ghostFormantsRef = useRef<FormantData>(EMPTY_FORMANTS)
  const noiseFloorRef = useRef<number>(INITIAL_NOISE_FLOOR)

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
    const adaptiveVoicedThreshold = getAdaptiveVoiceThreshold(noiseFloorRef.current)
    const detectedVoiced = isVoiced(
      timeDomain,
      adaptiveVoicedThreshold,
      PITCH_DETECTION.WHISPER_BOOST_FACTOR,
      PITCH_DETECTION.WHISPER_BOOST_MAX_RMS
    )
    const detectedPitch = detectedVoiced ? detectPitchYIN(timeDomain, processor.sampleRate) : null
    const hasCurrentVoicedPitch = detectedVoiced && detectedPitch !== null
    const detectedFormants = hasCurrentVoicedPitch
      ? detectFormants(freqData, processor.sampleRate, processor.fftSize)
      : EMPTY_FORMANTS

    // Treat "voiced gate passed but no pitch" as unvoiced for output/hold updates.
    if (hasCurrentVoicedPitch) {
      smoothedPitchRef.current = ema(smoothedPitchRef.current, detectedPitch, PITCH_SMOOTH)
      smoothedFormantsRef.current = smoothFormants(smoothedFormantsRef.current, detectedFormants, FORMANT_SMOOTH)
      ghostFormantsRef.current = { ...smoothedFormantsRef.current }
      lastVoicedAtRef.current = now
      lastVoicedSnapshotRef.current = {
        pitch: smoothedPitchRef.current,
        formants: { ...smoothedFormantsRef.current },
        spectrumData: new Uint8Array(byteFreq),
      }
    } else {
      noiseFloorRef.current =
        noiseFloorRef.current * PITCH_DETECTION.NOISE_FLOOR_EMA_ALPHA
        + rms * (1 - PITCH_DETECTION.NOISE_FLOOR_EMA_ALPHA)
    }

    const withinHold = now - lastVoicedAtRef.current <= HOLD_LAST_VALUE_MS
    const pitch = hasCurrentVoicedPitch ? smoothedPitchRef.current : withinHold ? lastVoicedSnapshotRef.current.pitch : null
    const formants = hasCurrentVoicedPitch
      ? smoothedFormantsRef.current
      : withinHold
        ? lastVoicedSnapshotRef.current.formants
        : EMPTY_FORMANTS
    const voiced = hasCurrentVoicedPitch || withinHold
    const spectrumData = hasCurrentVoicedPitch ? byteFreq : withinHold ? lastVoicedSnapshotRef.current.spectrumData : byteFreq

    historyRef.current.push(pitch)
    if (historyRef.current.length > VIS.PITCH_HISTORY_LENGTH) {
      historyRef.current.shift()
    }

    setData({
      pitch,
      rms,
      voiced,
      formants,
      ghostFormants: ghostFormantsRef.current,
      pitchHistory: [...historyRef.current],
      spectrumData,
    })

    animFrameRef.current = requestAnimationFrame(tick)
  }, [processor])

  useEffect(() => {
    if (processor?.isActive) {
      historyRef.current = []
      lastVoicedAtRef.current = 0
      lastEmitAtRef.current = 0
      smoothedPitchRef.current = null
      smoothedFormantsRef.current = EMPTY_FORMANTS
      ghostFormantsRef.current = EMPTY_FORMANTS
      noiseFloorRef.current = INITIAL_NOISE_FLOOR
      lastVoicedSnapshotRef.current = {
        pitch: null,
        formants: EMPTY_FORMANTS,
        spectrumData: new Uint8Array(0),
      }
      setData(INITIAL_DATA)
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
    smoothedPitchRef.current = null
    smoothedFormantsRef.current = EMPTY_FORMANTS
    ghostFormantsRef.current = EMPTY_FORMANTS
    noiseFloorRef.current = INITIAL_NOISE_FLOOR
    lastVoicedSnapshotRef.current = {
      pitch: null,
      formants: EMPTY_FORMANTS,
      spectrumData: new Uint8Array(0),
    }
    setData(INITIAL_DATA)
  }, [])

  return { data, reset }
}
