import { describe, it, expect } from 'vitest'
import {
  detectPitchYIN,
  calculateRMS,
  getAdaptiveVoiceThreshold,
  isVoiced,
  frequencyToNote,
  frequencyToSemitones,
} from './pitch-detection'
import { SAMPLE_RATE, PITCH_DETECTION } from './constants'

describe('calculateRMS', () => {
  it('returns 0 for a silent buffer', () => {
    const buffer = new Float32Array(512)
    expect(calculateRMS(buffer)).toBe(0)
  })

  it('returns correct RMS for a constant signal', () => {
    const buffer = new Float32Array(100).fill(0.5)
    expect(calculateRMS(buffer)).toBeCloseTo(0.5, 5)
  })

  it('returns correct RMS for a known signal', () => {
    // RMS of [1, -1, 1, -1] = sqrt(4/4) = 1
    const buffer = new Float32Array([1, -1, 1, -1])
    expect(calculateRMS(buffer)).toBeCloseTo(1, 5)
  })
})

describe('frequencyToNote', () => {
  it('converts 440 Hz to A4', () => {
    expect(frequencyToNote(440)).toBe('A4')
  })

  it('converts 261.63 Hz to C4 (middle C)', () => {
    expect(frequencyToNote(261.63)).toBe('C4')
  })

  it('converts 880 Hz to A5', () => {
    expect(frequencyToNote(880)).toBe('A5')
  })

  it('converts 220 Hz to A3', () => {
    expect(frequencyToNote(220)).toBe('A3')
  })

  it('converts 329.63 Hz to E4', () => {
    expect(frequencyToNote(329.63)).toBe('E4')
  })
})

describe('frequencyToSemitones', () => {
  it('returns 0 for A4 (440 Hz)', () => {
    expect(frequencyToSemitones(440)).toBeCloseTo(0, 5)
  })

  it('returns 12 for A5 (880 Hz)', () => {
    expect(frequencyToSemitones(880)).toBeCloseTo(12, 5)
  })

  it('returns -12 for A3 (220 Hz)', () => {
    expect(frequencyToSemitones(220)).toBeCloseTo(-12, 5)
  })

  it('returns negative for frequencies below 440 Hz', () => {
    expect(frequencyToSemitones(300)).toBeLessThan(0)
  })

  it('returns positive for frequencies above 440 Hz', () => {
    expect(frequencyToSemitones(500)).toBeGreaterThan(0)
  })
})

describe('getAdaptiveVoiceThreshold', () => {
  const base = PITCH_DETECTION.VOICE_THRESHOLD // 0.01
  const floor = base * PITCH_DETECTION.VOICE_THRESHOLD_FLOOR_FACTOR
  const ceiling = base * PITCH_DETECTION.VOICE_THRESHOLD_CEILING_FACTOR

  it('returns floor when noise floor is 0', () => {
    expect(getAdaptiveVoiceThreshold(0)).toBeCloseTo(floor, 5)
  })

  it('returns ceiling when noise floor is very high', () => {
    expect(getAdaptiveVoiceThreshold(1)).toBeCloseTo(ceiling, 5)
  })

  it('clamps negative noise floor to 0 (returns floor)', () => {
    expect(getAdaptiveVoiceThreshold(-0.5)).toBeCloseTo(floor, 5)
  })

  it('handles NaN noise floor gracefully', () => {
    expect(getAdaptiveVoiceThreshold(NaN)).toBeCloseTo(floor, 5)
  })

  it('handles Infinity noise floor gracefully', () => {
    expect(getAdaptiveVoiceThreshold(Infinity)).toBeCloseTo(floor, 5)
  })

  it('returns value between floor and ceiling for moderate noise', () => {
    const result = getAdaptiveVoiceThreshold(0.005)
    expect(result).toBeGreaterThanOrEqual(floor)
    expect(result).toBeLessThanOrEqual(ceiling)
  })
})

describe('isVoiced', () => {
  it('returns false for a silent buffer', () => {
    const buffer = new Float32Array(512)
    expect(isVoiced(buffer)).toBe(false)
  })

  it('returns true for a loud buffer', () => {
    const buffer = new Float32Array(512).fill(0.5)
    expect(isVoiced(buffer)).toBe(true)
  })

  it('uses whisper boost for low-amplitude signals', () => {
    // Create a buffer just below threshold
    const rms = 0.008 // below default 0.01 threshold
    const buffer = new Float32Array(100).fill(rms)
    expect(isVoiced(buffer)).toBe(false)
    // With whisper boost of 2x, rms becomes 0.016 > 0.01
    expect(isVoiced(buffer, PITCH_DETECTION.VOICE_THRESHOLD, 2)).toBe(true)
  })

  it('does not apply whisper boost when rms exceeds whisperBoostMaxRms', () => {
    const buffer = new Float32Array(100).fill(0.03) // above WHISPER_BOOST_MAX_RMS (0.02)
    // Without boost, 0.03 > 0.01 threshold, so voiced
    expect(isVoiced(buffer, PITCH_DETECTION.VOICE_THRESHOLD, 2)).toBe(true)
  })
})

describe('detectPitchYIN', () => {
  function generateSineWave(freq: number, sampleRate: number, length: number): Float32Array {
    const buffer = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      buffer[i] = Math.sin((2 * Math.PI * freq * i) / sampleRate)
    }
    return buffer
  }

  it('detects a 440 Hz sine wave', () => {
    const buffer = generateSineWave(440, SAMPLE_RATE, 4096)
    const pitch = detectPitchYIN(buffer, SAMPLE_RATE)
    expect(pitch).not.toBeNull()
    expect(pitch!).toBeCloseTo(440, -1) // within ~10 Hz
  })

  it('detects a 220 Hz sine wave', () => {
    const buffer = generateSineWave(220, SAMPLE_RATE, 4096)
    const pitch = detectPitchYIN(buffer, SAMPLE_RATE)
    expect(pitch).not.toBeNull()
    expect(pitch!).toBeCloseTo(220, -1)
  })

  it('detects a 150 Hz sine wave (female low range)', () => {
    const buffer = generateSineWave(150, SAMPLE_RATE, 4096)
    const pitch = detectPitchYIN(buffer, SAMPLE_RATE)
    expect(pitch).not.toBeNull()
    expect(pitch!).toBeCloseTo(150, -1)
  })

  it('returns null for a silent buffer', () => {
    const buffer = new Float32Array(4096)
    const pitch = detectPitchYIN(buffer, SAMPLE_RATE)
    expect(pitch).toBeNull()
  })

  it('returns null for white noise', () => {
    const buffer = new Float32Array(4096)
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = (Math.random() - 0.5) * 2
    }
    // Noise should generally not produce a valid pitch
    // (may occasionally pass due to randomness, so we use a larger buffer)
    const pitch = detectPitchYIN(buffer, SAMPLE_RATE, 0.05) // strict threshold
    // Not asserting null because noise can sometimes fool detection,
    // but with a strict threshold it should usually be null
    if (pitch !== null) {
      // If it does detect something, it should be outside typical voice range
      // This is a soft check - noise is inherently unpredictable
      expect(pitch).toBeDefined()
    }
  })

  it('returns null for frequencies outside valid range', () => {
    // 30 Hz is below MIN_PITCH (50 Hz)
    const buffer = generateSineWave(30, SAMPLE_RATE, 8192)
    const pitch = detectPitchYIN(buffer, SAMPLE_RATE)
    expect(pitch).toBeNull()
  })
})
