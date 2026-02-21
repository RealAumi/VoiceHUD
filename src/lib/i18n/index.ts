import { createContext, useContext } from 'react'
import { zh } from './zh'
import { en } from './en'

export type Locale = 'zh' | 'en'
export type Translations = typeof zh

const translations: Record<Locale, Translations> = { zh, en }

export function getTranslations(locale: Locale): Translations {
  return translations[locale]
}

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  return (localStorage.getItem('voicehud-locale') as Locale) || 'zh'
}

export function setStoredLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('voicehud-locale', locale)
  }
}

export interface I18nContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'zh',
  t: zh,
  setLocale: () => {},
})

export function useI18n() {
  return useContext(I18nContext)
}
