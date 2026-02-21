/** Audio processing constants */
export const SAMPLE_RATE = 44100
export const FFT_SIZE = 2048
export const BUFFER_SIZE = 2048

/** Pitch ranges in Hz */
export const PITCH_RANGES = {
  male: { min: 85, max: 180, label: 'male' },
  female: { min: 165, max: 255, label: 'female' },
  androgynous: { min: 145, max: 200, label: 'androgynous' },
} as const

/** Common formant frequency ranges (Hz) for vowels */
export const FORMANT_RANGES = {
  F1: { min: 200, max: 1000 }, // First formant (jaw opening)
  F2: { min: 700, max: 2500 }, // Second formant (tongue position)
  F3: { min: 1800, max: 3500 }, // Third formant (lip rounding / vocal tract length)
} as const

/** Pitch detection thresholds */
export const PITCH_DETECTION = {
  /** Minimum valid pitch in Hz */
  MIN_PITCH: 50,
  /** Maximum valid pitch in Hz */
  MAX_PITCH: 600,
  /** YIN threshold (lower = more selective) */
  YIN_THRESHOLD: 0.15,
  /** Minimum RMS amplitude to consider signal as voiced */
  VOICE_THRESHOLD: 0.01,
} as const

/** Visualization constants */
export const VIS = {
  /** Number of pitch history points to keep */
  PITCH_HISTORY_LENGTH: 200,
  /** Target frames per second for visualization */
  TARGET_FPS: 30,
  /** Spectrogram width in data points */
  SPECTROGRAM_WIDTH: 300,
} as const

export type PitchRangeKey = keyof typeof PITCH_RANGES
