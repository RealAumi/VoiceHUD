import { type ReactNode } from 'react'
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
    links: [{ rel: 'stylesheet', href: appCss }],
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
        <body className="dark">
          <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
            <Header />
            <main>{children}</main>
          </div>
          <Scripts />
        </body>
      </html>
    </I18nContext.Provider>
  )
}
