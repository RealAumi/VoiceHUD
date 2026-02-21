import { Store } from '@tanstack/store'
import type { ProviderConfig } from '#/lib/ai/providers'

const STORAGE_KEYS = {
  locale: 'voicehud-locale',
  provider: 'voicehud-ai-provider',
  theme: 'voicehud-theme',
} as const

const DEFAULT_PROVIDER: ProviderConfig = {
  id: 'google',
  apiKey: '',
  model: 'gemini-3-flash-preview',
  baseURL: '',
  fallbackBaseURLs: [],
}

export type AppLocale = 'zh' | 'en'
export type AppTheme = 'light' | 'dark' | 'system'

interface AppState {
  locale: AppLocale
  provider: ProviderConfig
  theme: AppTheme
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

function loadTheme(): AppTheme {
  if (typeof window === 'undefined') return 'system'
  const raw = localStorage.getItem(STORAGE_KEYS.theme)
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system'
}

export const appStore = new Store<AppState>({
  locale: loadLocale(),
  provider: loadProvider(),
  theme: loadTheme(),
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

export function setTheme(theme: AppTheme) {
  appStore.setState((s) => ({ ...s, theme }))
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.theme, theme)
  }
}

export function getTheme(): AppTheme {
  return appStore.state.theme
}

export function getProvider(): ProviderConfig {
  return appStore.state.provider
}

export function isProviderConfigured(): boolean {
  return appStore.state.provider.apiKey.trim().length > 0
}
