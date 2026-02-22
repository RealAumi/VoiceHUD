import type { FormantData } from '#/lib/audio/formant-analysis'
import { describeResonance } from '#/lib/audio/formant-analysis'
import { useI18n } from '#/lib/i18n'

interface ResonanceDisplayProps {
  formants: FormantData
  ghostFormants: FormantData
  voiced: boolean
}

const FORMANT_CONFIG = [
  { key: 'F1' as const, label: 'F1', max: 1000, color: '#f472b6', ghostColor: 'rgba(244, 114, 182, 0.25)', desc: { zh: '下颚开合', en: 'Jaw opening' } },
  { key: 'F2' as const, label: 'F2', max: 2500, color: '#a78bfa', ghostColor: 'rgba(167, 139, 250, 0.25)', desc: { zh: '舌位前后', en: 'Tongue position' } },
  { key: 'F3' as const, label: 'F3', max: 3500, color: '#60a5fa', ghostColor: 'rgba(96, 165, 250, 0.25)', desc: { zh: '声道长度', en: 'Vocal tract' } },
] as const

export function ResonanceDisplay({ formants, ghostFormants, voiced }: ResonanceDisplayProps) {
  const { locale } = useI18n()
  const description = describeResonance(formants, locale)
  const hasGhost = ghostFormants.F1 !== null || ghostFormants.F2 !== null || ghostFormants.F3 !== null

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">{locale === 'zh' ? '共振峰' : 'Formants'}</h3>
        {voiced && <span className="max-w-[220px] text-right text-xs text-slate-500 dark:text-slate-400">{description}</span>}
      </div>

      <div className="space-y-3">
        {FORMANT_CONFIG.map(({ key, label, max, color, ghostColor, desc }) => {
          const value = formants[key]
          const ghostValue = ghostFormants[key]
          const isActive = voiced && value !== null
          const showGhost = !isActive && hasGhost && ghostValue !== null

          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{desc[locale]}</span>
                </div>
                <span className="font-mono text-xs tabular-nums text-slate-600 dark:text-slate-300">
                  {isActive ? `${Math.round(value!)} Hz` : showGhost ? `${Math.round(ghostValue!)} Hz` : '—'}
                </span>
              </div>
              <div className="relative h-5 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800/80">
                {/* Ghost bar (persistence) */}
                {showGhost && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.min((ghostValue! / max) * 100, 100)}%`,
                      backgroundColor: ghostColor,
                      borderRight: `2px dashed ${color}`,
                    }}
                  />
                )}
                {/* Active bar */}
                {isActive && (
                  <div
                    className="absolute inset-y-0 left-0 rounded-md transition-all duration-200 ease-out"
                    style={{
                      width: `${Math.min((value! / max) * 100, 100)}%`,
                      background: `linear-gradient(90deg, ${color}cc, ${color})`,
                    }}
                  />
                )}
                {/* Scale marks */}
                {[0.25, 0.5, 0.75].map((frac) => (
                  <div
                    key={frac}
                    className="absolute inset-y-0 w-px bg-slate-200/50 dark:bg-slate-700/50"
                    style={{ left: `${frac * 100}%` }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
