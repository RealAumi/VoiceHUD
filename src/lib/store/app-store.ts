import { Store } from '@tanstack/store'
import type { ProviderConfig } from '#/lib/ai/providers'

const STORAGE_KEYS = {
  locale: 'voicehud-locale',
  provider: 'voicehud-ai-provider',
} as const

const DEFAULT_PROVIDER: ProviderConfig = {
  id: 'google',
  apiKey: '',
  model: 'gemini-3-flash-preview',
  baseURL: '',
  fallbackBaseURLs: [],
}

export type AppLocale = 'zh' | 'en'

interface AppState {
  locale: AppLocale
  provider: ProviderConfig
}

function loadLocale(): AppLocale {
  if (typeof window === 'undefined') return 'zh'
  const raw = localStorage.getItem(STORAGE_KEYS.locale)
  return raw === 'en' ? 'en' : 'zh'
}

function loadProvider(): ProviderConfig {
  if (typeof window === 'undefined') return DEFAULT_PROVIDER

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.provider)
    if (!raw) return DEFAULT_PROVIDER
    const parsed = JSON.parse(raw) as Partial<ProviderConfig>

    return {
      ...DEFAULT_PROVIDER,
      ...parsed,
      fallbackBaseURLs: Array.isArray(parsed.fallbackBaseURLs)
        ? parsed.fallbackBaseURLs.filter((v): v is string => typeof v === 'string')
        : [],
    }
  } catch {
    return DEFAULT_PROVIDER
  }
}

export const appStore = new Store<AppState>({
  locale: loadLocale(),
  provider: loadProvider(),
})

export function setLocale(locale: AppLocale) {
  appStore.setState((s) => ({ ...s, locale }))
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.locale, locale)
  }
}

export function setProvider(provider: ProviderConfig) {
  appStore.setState((s) => ({ ...s, provider }))
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify(provider))
  }
}

export function getLocale(): AppLocale {
  return appStore.state.locale
}

export function getProvider(): ProviderConfig {
  return appStore.state.provider
}

export function isProviderConfigured(): boolean {
  return appStore.state.provider.apiKey.trim().length > 0
}
