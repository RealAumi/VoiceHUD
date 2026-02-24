import { describe, it, expect } from 'vitest'
import {
  SAMPLE_RATE,
  FFT_SIZE,
  BUFFER_SIZE,
  PITCH_RANGES,
  FORMANT_RANGES,
  PITCH_DETECTION,
  PITCH_DISPLAY,
  VIS,
} from './constants'

describe('audio constants', () => {
  it('has valid sample rate', () => {
    expect(SAMPLE_RATE).toBe(44100)
  })

  it('has valid FFT size (power of 2)', () => {
    expect(FFT_SIZE).toBe(2048)
    expect(Math.log2(FFT_SIZE) % 1).toBe(0)
  })

  it('has valid buffer size', () => {
    expect(BUFFER_SIZE).toBe(2048)
  })

  describe('PITCH_RANGES', () => {
    it('has male, female, and androgynous ranges', () => {
      expect(PITCH_RANGES.male).toBeDefined()
      expect(PITCH_RANGES.female).toBeDefined()
      expect(PITCH_RANGES.androgynous).toBeDefined()
    })

    it('male range is valid (min < max)', () => {
      expect(PITCH_RANGES.male.min).toBeLessThan(PITCH_RANGES.male.max)
    })

    it('female range is valid (min < max)', () => {
      expect(PITCH_RANGES.female.min).toBeLessThan(PITCH_RANGES.female.max)
    })

    it('androgynous range overlaps between male and female', () => {
      expect(PITCH_RANGES.androgynous.min).toBeGreaterThanOrEqual(PITCH_RANGES.male.min)
      expect(PITCH_RANGES.androgynous.max).toBeLessThanOrEqual(PITCH_RANGES.female.max)
    })
  })

  describe('FORMANT_RANGES', () => {
    it('has F1, F2, F3 ranges', () => {
      expect(FORMANT_RANGES.F1).toBeDefined()
      expect(FORMANT_RANGES.F2).toBeDefined()
      expect(FORMANT_RANGES.F3).toBeDefined()
    })

    it('formant ranges are ordered (F1 < F2 < F3)', () => {
      expect(FORMANT_RANGES.F1.max).toBeLessThanOrEqual(FORMANT_RANGES.F2.max)
      expect(FORMANT_RANGES.F2.max).toBeLessThanOrEqual(FORMANT_RANGES.F3.max)
    })
  })

  describe('PITCH_DETECTION', () => {
    it('has valid pitch range', () => {
      expect(PITCH_DETECTION.MIN_PITCH).toBeLessThan(PITCH_DETECTION.MAX_PITCH)
      expect(PITCH_DETECTION.MIN_PITCH).toBeGreaterThan(0)
    })

    it('has valid YIN threshold (0 to 1)', () => {
      expect(PITCH_DETECTION.YIN_THRESHOLD).toBeGreaterThan(0)
      expect(PITCH_DETECTION.YIN_THRESHOLD).toBeLessThan(1)
    })

    it('has valid voice threshold', () => {
      expect(PITCH_DETECTION.VOICE_THRESHOLD).toBeGreaterThan(0)
    })

    it('floor factor is less than ceiling factor', () => {
      expect(PITCH_DETECTION.VOICE_THRESHOLD_FLOOR_FACTOR).toBeLessThan(
        PITCH_DETECTION.VOICE_THRESHOLD_CEILING_FACTOR
      )
    })
  })

  describe('PITCH_DISPLAY', () => {
    it('has valid default Y range', () => {
      expect(PITCH_DISPLAY.DEFAULT_Y_MIN).toBeLessThan(PITCH_DISPLAY.DEFAULT_Y_MAX)
    })
  })

  describe('VIS', () => {
    it('has positive visualization constants', () => {
      expect(VIS.PITCH_HISTORY_LENGTH).toBeGreaterThan(0)
      expect(VIS.TARGET_FPS).toBeGreaterThan(0)
      expect(VIS.SPECTROGRAM_WIDTH).toBeGreaterThan(0)
    })
  })
})
