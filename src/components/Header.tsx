import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Home, Menu, X, Mic, Brain, BookOpen, Settings, AudioWaveform } from 'lucide-react'
import { useI18n } from '#/lib/i18n'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { t, locale, setLocale } = useI18n()

  const navItems = [
    { to: '/' as const, icon: Home, label: t.nav.home },
    { to: '/practice' as const, icon: Mic, label: t.nav.practice },
    { to: '/analysis' as const, icon: Brain, label: t.nav.analysis },
    { to: '/training' as const, icon: BookOpen, label: t.nav.training },
    { to: '/settings' as const, icon: Settings, label: t.nav.settings },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <Link to="/" className="flex items-center gap-2">
              <AudioWaveform size={22} className="text-teal-700" />
              <div className="leading-tight">
                <p className="text-base font-semibold tracking-tight text-slate-900">VoiceHUD</p>
                <p className="hidden text-[11px] text-slate-500 md:block">
                  Voice Hard, but Voice HUD helps you
                </p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                activeProps={{
                  className: 'rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white transition-colors',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-slate-900 hover:text-slate-900"
          >
            {locale === 'zh' ? 'EN' : '中'}
          </button>
        </div>
      </header>

      {isOpen && <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-72 transform flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <span className="font-semibold text-slate-900">VoiceHUD</span>
          <button onClick={() => setIsOpen(false)} className="rounded-lg p-2 hover:bg-slate-100" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg p-3 text-slate-600 transition-colors hover:bg-slate-100"
              activeProps={{
                className: 'flex items-center gap-3 rounded-lg bg-slate-900 p-3 text-white transition-colors',
              }}
            >
              <Icon size={18} />
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
