import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Mic, MicOff, AlertCircle, ChevronDown } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { useAudioInput } from '#/hooks/useAudioInput'
import { usePitchDetection } from '#/hooks/usePitchDetection'
import { VoiceHUD } from '#/components/audio/VoiceHUD'
import { PITCH_RANGES, type PitchRangeKey } from '#/lib/audio/constants'

export const Route = createFileRoute('/practice')({ component: PracticePage })

function PracticePage() {
  const { t, locale } = useI18n()
  const [targetRange, setTargetRange] = useState<PitchRangeKey>('female')
  const { isActive, isSupported, error, start, stop, getProcessor } = useAudioInput()
  const { data } = usePitchDetection(getProcessor())

  const hasSnapshot = data.pitchHistory.length > 0

  const validPitches = data.pitchHistory.filter((p): p is number => p !== null)
  const avgPitch = validPitches.length > 0 ? Math.round(validPitches.reduce((a, b) => a + b, 0) / validPitches.length) : null

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.practice.title}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {locale === 'zh'
                ? '在实时反馈中微调音高与共振，先稳定再追求表现力。'
                : 'Refine pitch and resonance with real-time feedback. Stability first, expression second.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">{t.practice.targetRange}:</span>
            <select
              value={targetRange}
              onChange={(e) => setTargetRange(e.target.value as PitchRangeKey)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {(Object.keys(PITCH_RANGES) as PitchRangeKey[]).map((key) => (
                <option key={key} value={key}>
                  {t.practice.pitchRange[key]} ({PITCH_RANGES[key].min}-{PITCH_RANGES[key].max} Hz)
                </option>
              ))}
            </select>
          </div>
        </div>

        {!isSupported ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={20} />
            <span className="text-sm">
              {locale === 'zh'
                ? '你的浏览器不支持麦克风访问，请使用 Chrome 或 Firefox'
                : 'Your browser does not support microphone access. Please use Chrome or Firefox.'}
            </span>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={isActive ? stop : start}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors ${
                isActive
                  ? 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300'
                  : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
              }`}
            >
              {isActive ? <MicOff size={20} /> : <Mic size={20} />}
              {isActive ? t.practice.stopMic : t.practice.startMic}
            </button>

            {avgPitch && (
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {t.practice.avgPitch}: <span className="font-mono font-bold text-teal-700 dark:text-teal-300">{avgPitch} Hz</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>

      <details className="group rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <summary className="flex cursor-pointer list-none items-center justify-between text-slate-700 dark:text-slate-300">
          <span>{locale === 'zh' ? '练习说明（点击展开）' : 'Quick practice guide (click to expand)'}</span>
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
        </summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600 dark:text-slate-400">
          <li>{locale === 'zh' ? '先持续发元音 5-10 秒，观察 Pitch 曲线是否平稳。' : 'Hold a vowel for 5–10s and keep the pitch trace stable.'}</li>
          <li>{locale === 'zh' ? '让主要轨迹尽量落在目标音域高亮区。' : 'Aim to keep your trace inside the highlighted target range.'}</li>
          <li>{locale === 'zh' ? '共振峰面板用于观察口腔共鸣变化，建议配合镜子练习口型。' : 'Use the formants panel to monitor resonance shifts while adjusting articulation.'}</li>
          <li>{locale === 'zh' ? '频谱图适合观察能量分布与噪声，避免过度用力。' : 'The spectrogram helps detect noise/strain and energy balance.'}</li>
        </ul>
      </details>

      {!isActive && !error && isSupported && !hasSnapshot && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{t.practice.micPermission}</p>
      )}

      {(isActive || hasSnapshot) && <VoiceHUD data={data} targetRange={targetRange} isActive={isActive} />}

      {isActive && !data.voiced && <p className="animate-pulse text-center text-sm text-slate-500 dark:text-slate-400">{t.practice.noSignal}</p>}
    </div>
  )
}
