import { describe, it, expect } from 'vitest'
import { detectFormants, describeResonance, type FormantData } from './formant-analysis'

describe('detectFormants', () => {
  const sampleRate = 44100
  const fftSize = 2048
  const binFreq = sampleRate / fftSize // ~21.53 Hz per bin

  function createSpectrumWithPeak(peakFreq: number, peakValue: number): Float32Array {
    const data = new Float32Array(fftSize / 2).fill(-100)
    const peakBin = Math.round(peakFreq / binFreq)
    // Create a wide peak that survives the moving-average smoothing (window=5)
    const width = 8
    for (let i = -width; i <= width; i++) {
      const bin = peakBin + i
      if (bin >= 0 && bin < data.length) {
        // Gaussian-like falloff
        data[bin] = peakValue - (i * i)
      }
    }
    return data
  }

  it('returns null formants for flat spectrum', () => {
    const data = new Float32Array(fftSize / 2).fill(-100)
    const formants = detectFormants(data, sampleRate, fftSize)
    expect(formants.F1).toBeNull()
    expect(formants.F2).toBeNull()
    expect(formants.F3).toBeNull()
  })

  it('detects F1 peak around 500 Hz', () => {
    const data = createSpectrumWithPeak(500, -20)
    const formants = detectFormants(data, sampleRate, fftSize)
    expect(formants.F1).not.toBeNull()
    // Allow some tolerance due to smoothing and interpolation
    expect(formants.F1!).toBeGreaterThan(400)
    expect(formants.F1!).toBeLessThan(600)
  })

  it('detects formants with multiple peaks', () => {
    const data = new Float32Array(fftSize / 2).fill(-100)
    const width = 8

    // Helper to create a wide peak
    function addPeak(freq: number, value: number) {
      const bin = Math.round(freq / binFreq)
      for (let i = -width; i <= width; i++) {
        const b = bin + i
        if (b >= 0 && b < data.length) {
          data[b] = Math.max(data[b], value - (i * i))
        }
      }
    }

    addPeak(500, -20)  // F1
    addPeak(1500, -15) // F2
    addPeak(2500, -25) // F3

    const formants = detectFormants(data, sampleRate, fftSize)
    expect(formants.F1).not.toBeNull()
    expect(formants.F2).not.toBeNull()
    expect(formants.F3).not.toBeNull()
  })
})

describe('describeResonance', () => {
  it('returns "no resonance" message when F1 is null', () => {
    const formants: FormantData = { F1: null, F2: null, F3: null }
    expect(describeResonance(formants, 'en')).toBe('No resonance detected')
    expect(describeResonance(formants, 'zh')).toBe('未检测到共振')
  })

  it('returns "no resonance" message when F2 is null', () => {
    const formants: FormantData = { F1: 500, F2: null, F3: null }
    expect(describeResonance(formants, 'en')).toBe('No resonance detected')
  })

  it('describes strong oral resonance for high F1', () => {
    const formants: FormantData = { F1: 700, F2: 1500, F3: null }
    const result = describeResonance(formants, 'en')
    expect(result).toContain('Strong oral resonance')
  })

  it('describes chest resonance for low F1', () => {
    const formants: FormantData = { F1: 300, F2: 1500, F3: null }
    const result = describeResonance(formants, 'en')
    expect(result).toContain('Chest resonance dominant')
  })

  it('describes forward resonance for high F2', () => {
    const formants: FormantData = { F1: 500, F2: 2000, F3: null }
    const result = describeResonance(formants, 'en')
    expect(result).toContain('Forward resonance')
  })

  it('describes back resonance for low F2', () => {
    const formants: FormantData = { F1: 500, F2: 1000, F3: null }
    const result = describeResonance(formants, 'en')
    expect(result).toContain('Back resonance')
  })

  it('describes shorter vocal tract for high F3', () => {
    const formants: FormantData = { F1: 500, F2: 1500, F3: 3000 }
    const result = describeResonance(formants, 'en')
    expect(result).toContain('Shorter vocal tract')
  })

  it('describes longer vocal tract for low F3', () => {
    const formants: FormantData = { F1: 500, F2: 1500, F3: 2200 }
    const result = describeResonance(formants, 'en')
    expect(result).toContain('Longer vocal tract')
  })

  it('returns neutral resonance when values are in middle ranges', () => {
    const formants: FormantData = { F1: 500, F2: 1500, F3: 2600 }
    const result = describeResonance(formants, 'en')
    expect(result).toBe('Neutral resonance')
  })

  it('works with Chinese locale', () => {
    const formants: FormantData = { F1: 700, F2: 2000, F3: 3000 }
    const result = describeResonance(formants, 'zh')
    expect(result).toContain('口腔共振明显')
    expect(result).toContain('前置共振')
    expect(result).toContain('较短声道特征')
  })

  it('combines multiple descriptions with locale-appropriate separator', () => {
    const formants: FormantData = { F1: 700, F2: 2000, F3: null }
    const enResult = describeResonance(formants, 'en')
    expect(enResult).toContain(', ')

    const zhResult = describeResonance(formants, 'zh')
    expect(zhResult).toContain('，')
  })
})
