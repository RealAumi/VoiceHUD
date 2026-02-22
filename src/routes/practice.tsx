import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Mic, MicOff, AlertCircle, ChevronDown, Activity, Target, AudioWaveform } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { useAudioInput } from '#/hooks/useAudioInput'
import { usePitchDetection } from '#/hooks/usePitchDetection'
import { VoiceHUD } from '#/components/audio/VoiceHUD'
import { PITCH_DISPLAY, PITCH_RANGES, type PitchRangeKey } from '#/lib/audio/constants'

export const Route = createFileRoute('/practice')({ component: PracticePage })

function PracticePage() {
  const { t, locale } = useI18n()
  const [targetRange, setTargetRange] = useState<PitchRangeKey>('female')
  const [pitchMin, setPitchMin] = useState<number>(PITCH_DISPLAY.DEFAULT_Y_MIN)
  const [pitchMax, setPitchMax] = useState<number>(PITCH_DISPLAY.DEFAULT_Y_MAX)
  const { isActive, isSupported, error, start, stop, getProcessor } = useAudioInput()
  const { data } = usePitchDetection(getProcessor())

  const hasSnapshot = data.pitchHistory.length > 0
  const validPitches = data.pitchHistory.filter((p): p is number => p !== null)
  const avgPitch = validPitches.length > 0 ? Math.round(validPitches.reduce((a, b) => a + b, 0) / validPitches.length) : null
  const currentPitch = data.pitch ? Math.round(data.pitch) : null
  const inRange = currentPitch !== null && currentPitch >= PITCH_RANGES[targetRange].min && currentPitch <= PITCH_RANGES[targetRange].max

  const handlePitchMinChange = (nextMin: number) => {
    setPitchMin(nextMin)
    if (nextMin >= pitchMax) {
      setPitchMax(PITCH_DISPLAY.DEFAULT_Y_MAX)
    }
  }

  const handlePitchMaxChange = (nextMax: number) => {
    setPitchMax(nextMax)
    if (pitchMin >= nextMax) {
      setPitchMin(PITCH_DISPLAY.DEFAULT_Y_MIN)
    }
  }

  useEffect(() => {
    if (pitchMin >= pitchMax) {
      setPitchMin(PITCH_DISPLAY.DEFAULT_Y_MIN)
      setPitchMax(PITCH_DISPLAY.DEFAULT_Y_MAX)
    }
  }, [pitchMin, pitchMax])

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.practice.title}</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {locale === 'zh' ? '更大的主图 + 分区图表，让你更容易看懂每次发声变化。' : 'Larger main chart and cleaner panels for easier real-time feedback.'}
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

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button
            onClick={isActive ? stop : start}
            disabled={!isSupported}
            className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 font-medium transition-colors ${
              isActive
                ? 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300'
                : 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
            }`}
          >
            {isActive ? <MicOff size={20} /> : <Mic size={20} />}
            {isActive ? t.practice.stopMic : t.practice.startMic}
          </button>

          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><AudioWaveform size={12} /> {locale === 'zh' ? '当前音高' : 'Current'}</div>
              <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{currentPitch ? `${currentPitch} Hz` : '--'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Activity size={12} /> {locale === 'zh' ? '平均音高' : 'Average'}</div>
              <div className="font-mono text-lg font-semibold text-slate-900 dark:text-slate-100">{avgPitch ? `${avgPitch} Hz` : '--'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Target size={12} /> {locale === 'zh' ? '命中状态' : 'Target hit'}</div>
              <div className={`text-sm font-semibold ${inRange ? 'text-emerald-600 dark:text-emerald-300' : 'text-amber-600 dark:text-amber-300'}`}>
                {currentPitch ? (inRange ? (locale === 'zh' ? '在范围内' : 'In range') : (locale === 'zh' ? '偏离范围' : 'Out of range')) : '--'}
              </div>
            </div>
          </div>
        </div>

        {!isSupported && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={20} />
            <span className="text-sm">
              {locale === 'zh' ? '你的浏览器不支持麦克风访问，请使用 Chrome 或 Firefox' : 'Your browser does not support microphone access. Please use Chrome or Firefox.'}
            </span>
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
          <span>{locale === 'zh' ? '练习说明（默认折叠）' : 'Practice tips (collapsed by default)'}</span>
          <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
        </summary>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-600 dark:text-slate-400">
          <li>{locale === 'zh' ? '优先看左侧大 Pitch 图，让轨迹更平稳。' : 'Prioritize stabilizing the large pitch trace on the left.'}</li>
          <li>{locale === 'zh' ? '目标是让曲线更多时间待在目标音域高亮区。' : 'Keep the trace within the highlighted target band as long as possible.'}</li>
          <li>{locale === 'zh' ? '右侧 Formants 观察共振变化，频谱图观察噪声/紧张迹象。' : 'Use Formants for resonance placement and Spectrogram for strain/noise clues.'}</li>
          <li>{locale === 'zh' ? '停止发声后共振峰会保留虚影，方便回顾。' : 'Formant ghost bars persist after you stop speaking for easy review.'}</li>
        </ul>
      </details>

      {!isActive && !error && isSupported && !hasSnapshot && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">{t.practice.micPermission}</p>
      )}

      {(isActive || hasSnapshot) && (
        <VoiceHUD
          data={data}
          targetRange={targetRange}
          isActive={isActive}
          pitchMin={pitchMin}
          pitchMax={pitchMax}
          onPitchMinChange={handlePitchMinChange}
          onPitchMaxChange={handlePitchMaxChange}
        />
      )}

      {isActive && !data.voiced && <p className="animate-pulse text-center text-sm text-slate-500 dark:text-slate-400">{t.practice.noSignal}</p>}
    </div>
  )
}
