import type { FormantData } from '#/lib/audio/formant-analysis'
import { describeResonance } from '#/lib/audio/formant-analysis'
import { useI18n } from '#/lib/i18n'

interface ResonanceDisplayProps {
  formants: FormantData
  voiced: boolean
}

export function ResonanceDisplay({ formants, voiced }: ResonanceDisplayProps) {
  const { locale } = useI18n()

  const formantBars = [
    { label: 'F1', value: formants.F1, max: 1000, color: '#f472b6' },
    { label: 'F2', value: formants.F2, max: 2500, color: '#a78bfa' },
    { label: 'F3', value: formants.F3, max: 3500, color: '#60a5fa' },
  ]

  const description = describeResonance(formants, locale)

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300">
          {locale === 'zh' ? '共振峰' : 'Formants'}
        </h3>
        {voiced && (
          <span className="text-xs text-slate-400 max-w-[200px] text-right">
            {description}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {formantBars.map(({ label, value, max, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 w-6">{label}</span>
            <div className="flex-1 h-6 bg-slate-800 rounded-md overflow-hidden relative">
              {voiced && value !== null ? (
                <>
                  <div
                    className="h-full rounded-md transition-all duration-150"
                    style={{
                      width: `${Math.min((value / max) * 100, 100)}%`,
                      backgroundColor: color,
                      opacity: 0.7,
                    }}
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono text-white/80">
                    {Math.round(value)} Hz
                  </span>
                </>
              ) : (
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-600">
                  --
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
