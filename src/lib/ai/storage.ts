import type { ProviderConfig } from './providers'

const STORAGE_KEY = 'voicehud-ai-provider'

const DEFAULT_CONFIG: ProviderConfig = {
  id: 'google',
  apiKey: '',
  model: 'gemini-2.5-flash',
  baseURL: '',
}

export function getStoredProvider(): ProviderConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function setStoredProvider(config: ProviderConfig) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }
}

/** Check if the provider has a valid API key configured */
export function isProviderConfigured(): boolean {
  const config = getStoredProvider()
  return config.apiKey.length > 0
}
