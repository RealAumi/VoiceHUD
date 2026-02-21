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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh' ? '共振峰' : 'Formants'}</h3>
        {voiced && <span className="max-w-[220px] text-right text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </div>

      <div className="space-y-3">
        {formantBars.map(({ label, value, max, color }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-6 text-xs font-mono text-slate-500 dark:text-slate-400">{label}</span>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
              {voiced && value !== null ? (
                <>
                  <div
                    className="h-full rounded-md transition-all duration-150"
                    style={{
                      width: `${Math.min((value / max) * 100, 100)}%`,
                      backgroundColor: color,
                      opacity: 0.8,
                    }}
                  />
                  <span className="absolute top-1/2 right-2 -translate-y-1/2 text-xs font-mono text-slate-700 dark:text-white/85">
                    {Math.round(value)} Hz
                  </span>
                </>
              ) : (
                <span className="absolute top-1/2 left-2 -translate-y-1/2 text-xs text-slate-500 dark:text-slate-500">--</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
