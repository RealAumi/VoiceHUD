import { type ReactNode, useEffect } from 'react'
import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'

import Header from '../components/Header'
import { I18nContext, getTranslations, type Locale } from '../lib/i18n'
import { appStore, setLocale } from '#/lib/store/app-store'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'VoiceHUD - 智能嗓音训练助手' },
      {
        name: 'description',
        content:
          'Real-time voice visualization + AI analysis for scientific voice training. 实时音调可视化 + AI分析，助你科学训练嗓音。',
      },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: { children: ReactNode }) {
  const locale = useStore(appStore, (s) => s.locale as Locale)
  const theme = useStore(appStore, (s) => s.theme)

  useEffect(() => {
    if (typeof document === 'undefined') return
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const resolvedDark = theme === 'dark' || (theme === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', resolvedDark)
  }, [theme])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
  }

  const t = getTranslations(locale)

  return (
    <I18nContext.Provider value={{ locale, t, setLocale: handleSetLocale }}>
      <html lang={locale === 'zh' ? 'zh-CN' : 'en'}>
        <head>
          <HeadContent />
        </head>
        <body>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7faf9,white_40%,#f5f7f8_100%)] text-slate-900 dark:bg-[radial-gradient(circle_at_top,#111827,#020617_45%,#020617)] dark:text-slate-100">
            <Header />
            <main>{children}</main>
          </div>
          <Scripts />
        </body>
      </html>
    </I18nContext.Provider>
  )
}
