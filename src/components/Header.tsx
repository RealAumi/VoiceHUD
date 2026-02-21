import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Home,
  Menu,
  X,
  Mic,
  Brain,
  BookOpen,
  Settings,
  AudioWaveform,
} from 'lucide-react'
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
      <header className="px-4 py-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-sm text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <AudioWaveform size={24} className="text-cyan-400" />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-cyan-400">Voice</span>
              <span className="text-white">HUD</span>
            </span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-1.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              activeProps={{
                className:
                  'px-3 py-1.5 text-sm text-cyan-400 bg-cyan-500/10 rounded-lg transition-colors',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Language toggle */}
        <button
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          className="px-3 py-1 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-full transition-colors"
        >
          {locale === 'zh' ? 'EN' : '中'}
        </button>
      </header>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-slate-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AudioWaveform size={22} className="text-cyan-400" />
            <span className="font-bold">VoiceHUD</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
              activeProps={{
                className:
                  'flex items-center gap-3 p-3 rounded-lg bg-cyan-600/20 text-cyan-400 transition-colors',
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
