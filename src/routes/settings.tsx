import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Check, ExternalLink } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { PROVIDER_PRESETS, getPreset, type ProviderPreset } from '#/lib/ai/providers'
import { getStoredProvider, setStoredProvider } from '#/lib/ai/storage'
import { testProviderConnection } from '#/lib/ai/client'
import type { ProviderConfig } from '#/lib/ai/providers'

export const Route = createFileRoute('/settings')({ component: SettingsPage })

function SettingsPage() {
  const { t, locale, setLocale } = useI18n()
  const [config, setConfig] = useState<ProviderConfig>({
    id: 'google',
    apiKey: '',
    model: 'gemini-3-flash',
    baseURL: '',
  })
  const [saved, setSaved] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testMessage, setTestMessage] = useState<string>('')
  const [testOk, setTestOk] = useState<boolean | null>(null)

  useEffect(() => {
    setConfig(getStoredProvider())
  }, [])

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
    }))
    setSaved(false)
    setTestMessage('')
    setTestOk(null)
  }

  const handleSave = () => {
    setStoredProvider({ ...config, baseURL: resolvedBaseURL })
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

  const apiKeyLinks: Record<string, string> = {
    google: 'https://aistudio.google.com/apikey',
    openrouter: 'https://openrouter.ai/settings/keys',
    zenmux: 'https://dash.zenmux.top',
  }

  const endpointOptions: Record<string, string[]> = {
    openrouter: ['https://openrouter.ai/api/v1'],
    zenmux: ['https://api.zenmux.top/v1', 'https://api2.zenmux.top/v1', 'https://api3.zenmux.top/v1'],
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold">{t.settings.title}</h1>

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

      <section className="rounded-xl bg-slate-800/60 border border-slate-700 p-5 space-y-5">
        <div>
          <h2 className="font-semibold text-white">{t.settings.provider.title}</h2>
          <p className="text-sm text-slate-400 mt-1">{t.settings.provider.desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PROVIDER_PRESETS.map((p: ProviderPreset) => (
            <button
              key={p.id}
              onClick={() => handleSelectProvider(p.id)}
              className={`text-left p-3 rounded-lg border transition-all ${
                config.id === p.id
                  ? 'border-cyan-500/50 bg-cyan-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
              }`}
            >
              <div className="font-medium text-sm text-white">{p.name[locale]}</div>
              <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{p.description[locale]}</div>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300 font-medium">{t.settings.provider.apiKey}</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => {
              setConfig((prev) => ({ ...prev, apiKey: e.target.value }))
              setSaved(false)
              setTestMessage('')
            }}
            placeholder={t.settings.provider.apiKeyPlaceholder}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
          {apiKeyLinks[config.id] && (
            <a
              href={apiKeyLinks[config.id]}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {t.settings.provider.howToGet}
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300 font-medium">{t.settings.provider.model}</label>
          <input
            type="text"
            value={config.model}
            onChange={(e) => {
              setConfig((prev) => ({ ...prev, model: e.target.value }))
              setSaved(false)
              setTestMessage('')
            }}
            placeholder={t.settings.provider.modelPlaceholder}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
          {preset && <p className="text-xs text-slate-500">{preset.modelHint}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-slate-300 font-medium">{t.settings.provider.baseURL}</label>
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
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500 read-only:opacity-70"
          />
          {endpointOptions[config.id] && preset?.customBaseURL && (
            <div className="flex flex-wrap gap-2 pt-1">
              {endpointOptions[config.id].map((endpoint) => (
                <button
                  key={endpoint}
                  type="button"
                  onClick={() => {
                    setConfig((prev) => ({ ...prev, baseURL: endpoint }))
                    setSaved(false)
                    setTestMessage('')
                  }}
                  className={`px-2.5 py-1 rounded-md border text-xs transition-colors ${
                    resolvedBaseURL === endpoint
                      ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {endpoint}
                </button>
              ))}
            </div>
          )}
          {!preset?.customBaseURL && resolvedBaseURL && (
            <p className="text-xs text-emerald-400">
              {locale === 'zh' ? '已使用官方推荐端点。' : 'Using the official recommended endpoint.'}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
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
            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isTesting
              ? locale === 'zh'
                ? '测试中...'
                : 'Testing...'
              : t.settings.provider.testConnection}
          </button>
        </div>

        {testMessage && (
          <div
            className={`p-3 rounded-lg border text-sm ${
              testOk
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            {testMessage}
          </div>
        )}
      </section>
    </div>
  )
}
