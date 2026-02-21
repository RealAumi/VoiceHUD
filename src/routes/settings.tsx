import { createFileRoute } from '@tanstack/react-router'
import { type ReactNode, useEffect, useState } from 'react'
import { Check, ExternalLink, Moon, Monitor, Sun } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { useI18n } from '#/lib/i18n'
import { PROVIDER_PRESETS, getPreset, type ProviderPreset } from '#/lib/ai/providers'
import { setStoredProvider } from '#/lib/ai/storage'
import { testProviderConnection } from '#/lib/ai/client'
import type { ProviderConfig } from '#/lib/ai/providers'
import { appStore, setTheme, type AppTheme } from '#/lib/store/app-store'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const storedProvider = useStore(appStore, (s) => s.provider)
  const theme = useStore(appStore, (s) => s.theme)
  const [config, setConfig] = useState<ProviderConfig>(storedProvider)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setConfig(storedProvider)
  }, [storedProvider])
  const [isTesting, setIsTesting] = useState(false)
  const [testMessage, setTestMessage] = useState<string>('')
  const [testOk, setTestOk] = useState<boolean | null>(null)

  const preset = getPreset(config.id)
  const resolvedBaseURL = preset?.customBaseURL ? config.baseURL : (preset?.defaultBaseURL ?? '')

  const handleSelectProvider = (presetId: string) => {
    const p = getPreset(presetId)
    if (!p) return
    setConfig((prev) => ({
      ...prev,
      id: presetId,
      model: prev.id === presetId ? prev.model : p.defaultModel,
      baseURL: prev.id === presetId ? prev.baseURL : p.defaultBaseURL,
      fallbackBaseURLs: prev.id === presetId ? prev.fallbackBaseURLs : p.endpointCandidates?.slice(1) ?? [],
    }))
    setSaved(false)
    setTestMessage('')
    setTestOk(null)
  }

  const handleSave = () => {
    setStoredProvider({
      ...config,
      baseURL: resolvedBaseURL,
      fallbackBaseURLs: config.fallbackBaseURLs
        .map((v) => v.trim())
        .filter(Boolean)
        .filter((v) => v !== resolvedBaseURL),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestMessage('')
    const result = await testProviderConnection({ ...config, baseURL: resolvedBaseURL }, locale)
    setTestOk(result.ok)
    setTestMessage(result.message)
    setIsTesting(false)
  }

  const fallbackText = config.fallbackBaseURLs.join('\n')

  const themeOptions: Array<{ key: AppTheme; icon: ReactNode; label: string }> = [
    { key: 'light', icon: <Sun size={14} />, label: locale === 'zh' ? '浅色' : 'Light' },
    { key: 'dark', icon: <Moon size={14} />, label: locale === 'zh' ? '深色' : 'Dark' },
    { key: 'system', icon: <Monitor size={14} />, label: locale === 'zh' ? '跟随系统' : 'System' },
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.settings.title}</h1>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t.settings.language.title}</h2>
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => setLocale('zh')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              locale === 'zh'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {t.settings.language.zh}
          </button>
          <button
            onClick={() => setLocale('en')}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              locale === 'en'
                ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {t.settings.language.en}
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">{locale === 'zh' ? '外观主题' : 'Appearance'}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {themeOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setTheme(opt.key)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                theme === opt.key
                  ? 'border-teal-700 bg-teal-50 text-teal-700 dark:border-teal-400/60 dark:bg-teal-400/10 dark:text-teal-300'
                  : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t.settings.provider.title}</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.settings.provider.desc}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {PROVIDER_PRESETS.map((p: ProviderPreset) => (
            <button
              key={p.id}
              onClick={() => handleSelectProvider(p.id)}
              className={`rounded-lg border p-3 text-left transition-all ${
                config.id === p.id
                  ? 'border-teal-500/60 bg-teal-50 dark:bg-teal-500/10'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900'
              }`}
            >
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{p.name[locale]}</div>
              <div className="mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400">{p.description[locale]}</div>
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.settings.provider.apiKey}</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => {
              setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
              setSaved(false)
              setTestMessage('')
            }}
            placeholder={t.settings.provider.apiKeyPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.settings.provider.securityNotice}</p>
          {preset?.apiKeyUrl && (
            <a href={preset.apiKeyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
              {t.settings.provider.howToGet}
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.settings.provider.model}</label>
          <input
            type="text"
            value={config.model}
            onChange={(e) => {
              setConfig((prev) => ({ ...prev, model: e.target.value }))
              setSaved(false)
              setTestMessage('')
            }}
            placeholder={t.settings.provider.modelPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          {preset && <p className="text-xs text-slate-500 dark:text-slate-400">{preset.modelHint}</p>}
        </div>

        <div className="mt-4 space-y-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.settings.provider.baseURL}</label>
          <input
            type="url"
            value={resolvedBaseURL}
            onChange={(e) => {
              setConfig((prev) => ({ ...prev, baseURL: e.target.value }))
              setSaved(false)
              setTestMessage('')
            }}
            readOnly={!preset?.customBaseURL}
            placeholder={t.settings.provider.baseURLPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none read-only:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.settings.provider.httpsOnlyNotice}</p>

          {preset?.customBaseURL && (
            <>
              <label className="block pt-2 text-xs text-slate-500 dark:text-slate-400">
                {locale === 'zh' ? '备用端点（每行一个，按顺序尝试）' : 'Fallback endpoints (one per line, tried in order)'}
              </label>
              <textarea
                value={fallbackText}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').map((v) => v.trim()).filter(Boolean)
                  setConfig((prev) => ({ ...prev, fallbackBaseURLs: lines }))
                  setSaved(false)
                  setTestMessage('')
                }}
                rows={3}
                placeholder="https://api2.example.com/v1"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={handleSave} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200">
            {saved ? (
              <>
                <Check size={16} />
                {t.settings.provider.saved}
              </>
            ) : (
              t.common.save
            )}
          </button>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            {isTesting ? (locale === 'zh' ? '测试中...' : 'Testing...') : t.settings.provider.testConnection}
          </button>
        </div>

        {testMessage && (
          <div className={`mt-3 rounded-lg border p-3 text-sm ${testOk ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300' : 'border-red-300 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300'}`}>
            {testMessage}
          </div>
        )}
      </section>
    </div>
  )
}
