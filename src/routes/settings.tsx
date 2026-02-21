import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Check, ExternalLink } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { getStoredApiKey, setStoredApiKey } from '#/lib/gemini/client'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const [apiKey, setApiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setApiKey(getStoredApiKey())
  }, [])

  const handleSaveKey = () => {
    setStoredApiKey(apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>

      {/* Language setting */}
      <section className="rounded-xl bg-slate-800/60 border border-slate-700 p-5 space-y-3">
        <h2 className="font-semibold text-white">{t.settings.language.title}</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setLocale('zh')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              locale === 'zh'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
            }`}
          >
            {t.settings.language.zh}
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              locale === 'en'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
            }`}
          >
            {t.settings.language.en}
          </button>
        </div>
      </section>

      {/* Gemini API Key */}
      <section className="rounded-xl bg-slate-800/60 border border-slate-700 p-5 space-y-3">
        <h2 className="font-semibold text-white">{t.settings.apiKey.title}</h2>
        <p className="text-sm text-slate-400">{t.settings.apiKey.desc}</p>

        <div className="flex gap-3">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={t.settings.apiKey.placeholder}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSaveKey}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {saved ? (
              <>
                <Check size={16} />
                {t.settings.apiKey.saved}
              </>
            ) : (
              t.common.save
            )}
          </button>
        </div>

        <a
          href="https://aistudio.google.com/apikey"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          {t.settings.apiKey.howToGet}
          <ExternalLink size={14} />
        </a>
      </section>
    </div>
  )
}
