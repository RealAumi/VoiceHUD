import { describe, it, expect } from 'vitest'
import {
  PROVIDER_PRESETS,
  getPreset,
  getPresetType,
} from './providers'

describe('PROVIDER_PRESETS', () => {
  it('contains at least 4 presets', () => {
    expect(PROVIDER_PRESETS.length).toBeGreaterThanOrEqual(4)
  })

  it('has unique IDs', () => {
    const ids = PROVIDER_PRESETS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes google, openrouter, zenmux, and custom presets', () => {
    const ids = PROVIDER_PRESETS.map((p) => p.id)
    expect(ids).toContain('google')
    expect(ids).toContain('openrouter')
    expect(ids).toContain('zenmux')
    expect(ids).toContain('custom')
  })

  it('each preset has bilingual name and description', () => {
    for (const preset of PROVIDER_PRESETS) {
      expect(preset.name.zh).toBeTruthy()
      expect(preset.name.en).toBeTruthy()
      expect(preset.description.zh).toBeTruthy()
      expect(preset.description.en).toBeTruthy()
    }
  })

  it('each preset has a valid type', () => {
    const validTypes = ['google', 'openrouter', 'openai-compatible']
    for (const preset of PROVIDER_PRESETS) {
      expect(validTypes).toContain(preset.type)
    }
  })

  it('google preset uses google type', () => {
    const google = PROVIDER_PRESETS.find((p) => p.id === 'google')!
    expect(google.type).toBe('google')
    expect(google.customBaseURL).toBe(false)
  })

  it('openrouter preset uses openrouter type', () => {
    const openrouter = PROVIDER_PRESETS.find((p) => p.id === 'openrouter')!
    expect(openrouter.type).toBe('openrouter')
    expect(openrouter.defaultBaseURL).toContain('openrouter.ai')
  })

  it('zenmux preset uses openai-compatible type', () => {
    const zenmux = PROVIDER_PRESETS.find((p) => p.id === 'zenmux')!
    expect(zenmux.type).toBe('openai-compatible')
    expect(zenmux.customBaseURL).toBe(true)
  })

  it('custom preset allows custom baseURL', () => {
    const custom = PROVIDER_PRESETS.find((p) => p.id === 'custom')!
    expect(custom.type).toBe('openai-compatible')
    expect(custom.customBaseURL).toBe(true)
  })
})

describe('getPreset', () => {
  it('returns the correct preset by id', () => {
    const google = getPreset('google')
    expect(google).toBeDefined()
    expect(google!.id).toBe('google')
  })

  it('returns undefined for unknown id', () => {
    expect(getPreset('nonexistent')).toBeUndefined()
  })

  it('returns each known preset', () => {
    for (const preset of PROVIDER_PRESETS) {
      const result = getPreset(preset.id)
      expect(result).toBeDefined()
      expect(result!.id).toBe(preset.id)
    }
  })
})

describe('getPresetType', () => {
  it('returns google type for google preset', () => {
    expect(getPresetType('google')).toBe('google')
  })

  it('returns openrouter type for openrouter preset', () => {
    expect(getPresetType('openrouter')).toBe('openrouter')
  })

  it('returns openai-compatible type for zenmux preset', () => {
    expect(getPresetType('zenmux')).toBe('openai-compatible')
  })

  it('returns openai-compatible as fallback for unknown id', () => {
    expect(getPresetType('unknown')).toBe('openai-compatible')
  })
})
