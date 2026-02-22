import { PITCH_DETECTION, SAMPLE_RATE } from './constants'

/**
 * YIN pitch detection algorithm
 * Based on "YIN, a fundamental frequency estimator for speech and music"
 * by Alain de Cheveigné and Hideki Kawahara (2002)
 */
export function detectPitchYIN(
  buffer: Float32Array,
  sampleRate: number = SAMPLE_RATE,
  threshold: number = PITCH_DETECTION.YIN_THRESHOLD
): number | null {
  const halfLen = Math.floor(buffer.length / 2)
  const yinBuffer = new Float32Array(halfLen)

  // Step 1: Compute the difference function
  for (let tau = 0; tau < halfLen; tau++) {
    let sum = 0
    for (let i = 0; i < halfLen; i++) {
      const delta = buffer[i] - buffer[i + tau]
      sum += delta * delta
    }
    yinBuffer[tau] = sum
  }

  // Step 2: Cumulative mean normalized difference function
  yinBuffer[0] = 1
  let runningSum = 0
  for (let tau = 1; tau < halfLen; tau++) {
    runningSum += yinBuffer[tau]
    yinBuffer[tau] *= tau / runningSum
  }

  // Step 3: Absolute threshold
  let tauEstimate = -1
  for (let tau = 2; tau < halfLen; tau++) {
    if (yinBuffer[tau] < threshold) {
      while (tau + 1 < halfLen && yinBuffer[tau + 1] < yinBuffer[tau]) {
        tau++
      }
      tauEstimate = tau
      break
    }
  }

  if (tauEstimate === -1) return null

  // Step 4: Parabolic interpolation for sub-sample accuracy
  let betterTau: number
  const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1
  const x2 = tauEstimate + 1 < halfLen ? tauEstimate + 1 : tauEstimate

  if (x0 === tauEstimate) {
    betterTau = yinBuffer[tauEstimate] <= yinBuffer[x2] ? tauEstimate : x2
  } else if (x2 === tauEstimate) {
    betterTau = yinBuffer[tauEstimate] <= yinBuffer[x0] ? tauEstimate : x0
  } else {
    const s0 = yinBuffer[x0]
    const s1 = yinBuffer[tauEstimate]
    const s2 = yinBuffer[x2]
    betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0))
  }

  const pitch = sampleRate / betterTau

  // Validate pitch range
  if (pitch < PITCH_DETECTION.MIN_PITCH || pitch > PITCH_DETECTION.MAX_PITCH) {
    return null
  }

  return pitch
}

/**
 * Calculate RMS (Root Mean Square) amplitude of a buffer
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i]
  }
  return Math.sqrt(sum / buffer.length)
}

/**
 * Compute a bounded voiced threshold from recent noise floor estimates.
 */
export function getAdaptiveVoiceThreshold(
  noiseFloor: number,
  baseThreshold: number = PITCH_DETECTION.VOICE_THRESHOLD
): number {
  const normalizedNoiseFloor = Number.isFinite(noiseFloor) ? Math.max(0, noiseFloor) : 0
  const thresholdFloor = baseThreshold * PITCH_DETECTION.VOICE_THRESHOLD_FLOOR_FACTOR
  const thresholdCeiling = baseThreshold * PITCH_DETECTION.VOICE_THRESHOLD_CEILING_FACTOR
  const noiseScaledThreshold = normalizedNoiseFloor * PITCH_DETECTION.VOICE_THRESHOLD_NOISE_MULTIPLIER
  return Math.min(thresholdCeiling, Math.max(thresholdFloor, noiseScaledThreshold))
}

/**
 * Check if the signal is voiced (has enough energy)
 */
export function isVoiced(
  buffer: Float32Array,
  threshold: number = PITCH_DETECTION.VOICE_THRESHOLD,
  whisperBoost: number = 1,
  whisperBoostMaxRms: number = PITCH_DETECTION.WHISPER_BOOST_MAX_RMS
): boolean {
  const rms = calculateRMS(buffer)
  const boostedRms = whisperBoost > 1 && rms <= whisperBoostMaxRms ? rms * whisperBoost : rms
  return boostedRms > threshold
}

/**
 * Convert frequency in Hz to musical note name
 */
export function frequencyToNote(freq: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const noteNum = 12 * (Math.log2(freq / 440)) + 69
  const note = noteNames[Math.round(noteNum) % 12]
  const octave = Math.floor(Math.round(noteNum) / 12) - 1
  return `${note}${octave}`
}

/**
 * Convert frequency to semitone distance from A4 (440Hz)
 */
export function frequencyToSemitones(freq: number): number {
  return 12 * Math.log2(freq / 440)
}
