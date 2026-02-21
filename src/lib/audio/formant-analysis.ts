/**
 * Simplified formant (resonance) analysis using spectral peak detection
 *
 * Formants are resonance frequencies of the vocal tract.
 * F1 correlates with jaw opening (higher = more open)
 * F2 correlates with tongue position (higher = more front)
 * F3 correlates with vocal tract length (higher = shorter tract)
 */

export interface FormantData {
  F1: number | null
  F2: number | null
  F3: number | null
}

/**
 * Detect formant frequencies from FFT magnitude data.
 * Uses spectral peak picking within expected formant ranges.
 */
export function detectFormants(
  frequencyData: Float32Array,
  sampleRate: number,
  fftSize: number
): FormantData {
  const binFrequency = sampleRate / fftSize

  // Apply spectral smoothing (moving average)
  const smoothed = smoothSpectrum(frequencyData, 5)

  // Find peaks in expected formant ranges
  const F1 = findPeakInRange(smoothed, binFrequency, 200, 1000)
  const F2 = findPeakInRange(smoothed, binFrequency, 700, 2500)
  const F3 = findPeakInRange(smoothed, binFrequency, 1800, 3500)

  return { F1, F2, F3 }
}

/**
 * Smooth spectrum using moving average
 */
function smoothSpectrum(data: Float32Array, windowSize: number): Float32Array {
  const smoothed = new Float32Array(data.length)
  const halfWindow = Math.floor(windowSize / 2)

  for (let i = 0; i < data.length; i++) {
    let sum = 0
    let count = 0
    for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
      sum += data[j]
      count++
    }
    smoothed[i] = sum / count
  }

  return smoothed
}

/**
 * Find the highest spectral peak within a frequency range
 */
function findPeakInRange(
  data: Float32Array,
  binFrequency: number,
  minFreq: number,
  maxFreq: number
): number | null {
  const minBin = Math.ceil(minFreq / binFrequency)
  const maxBin = Math.min(Math.floor(maxFreq / binFrequency), data.length - 2)

  let peakBin = -1
  let peakVal = -Infinity

  for (let i = minBin + 1; i < maxBin; i++) {
    // Check if it's a local maximum
    if (data[i] > data[i - 1] && data[i] > data[i + 1] && data[i] > peakVal) {
      peakVal = data[i]
      peakBin = i
    }
  }

  if (peakBin === -1 || peakVal < -80) return null

  // Parabolic interpolation for sub-bin accuracy
  const alpha = data[peakBin - 1]
  const beta = data[peakBin]
  const gamma = data[peakBin + 1]
  const p = 0.5 * (alpha - gamma) / (alpha - 2 * beta + gamma)

  return (peakBin + p) * binFrequency
}

/**
 * Get a qualitative description of resonance based on formant values
 */
export function describeResonance(
  formants: FormantData,
  locale: 'zh' | 'en' = 'zh'
): string {
  if (!formants.F1 || !formants.F2) {
    return locale === 'zh' ? '未检测到共振' : 'No resonance detected'
  }

  const descriptions: string[] = []

  // Head vs chest resonance (simplified heuristic based on F1 and overall spectral shape)
  if (formants.F1 > 600) {
    descriptions.push(locale === 'zh' ? '口腔共振明显' : 'Strong oral resonance')
  } else if (formants.F1 < 400) {
    descriptions.push(locale === 'zh' ? '胸腔共振为主' : 'Chest resonance dominant')
  }

  // Forward vs back resonance
  if (formants.F2 > 1800) {
    descriptions.push(locale === 'zh' ? '前置共振' : 'Forward resonance')
  } else if (formants.F2 < 1200) {
    descriptions.push(locale === 'zh' ? '后置共振' : 'Back resonance')
  }

  // Vocal tract length indication via F3
  if (formants.F3) {
    if (formants.F3 > 2800) {
      descriptions.push(locale === 'zh' ? '较短声道特征' : 'Shorter vocal tract')
    } else if (formants.F3 < 2400) {
      descriptions.push(locale === 'zh' ? '较长声道特征' : 'Longer vocal tract')
    }
  }

  return descriptions.join(locale === 'zh' ? '，' : ', ') ||
    (locale === 'zh' ? '共振中性' : 'Neutral resonance')
}
