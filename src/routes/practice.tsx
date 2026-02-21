import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Mic, MicOff, AlertCircle } from 'lucide-react'
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

  // Compute average pitch from history
  const validPitches = data.pitchHistory.filter((p): p is number => p !== null)
  const avgPitch = validPitches.length > 0
    ? Math.round(validPitches.reduce((a, b) => a + b, 0) / validPitches.length)
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.practice.title}</h1>

        {/* Target range selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{t.practice.targetRange}:</span>
          <select
            value={targetRange}
            onChange={(e) => setTargetRange(e.target.value as PitchRangeKey)}
            className="text-sm bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
          >
            {(Object.keys(PITCH_RANGES) as PitchRangeKey[]).map((key) => (
              <option key={key} value={key}>
                {t.practice.pitchRange[key]} ({PITCH_RANGES[key].min}-{PITCH_RANGES[key].max} Hz)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Microphone control */}
      {!isSupported ? (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <AlertCircle size={20} />
          <span className="text-sm">
            {locale === 'zh'
              ? '你的浏览器不支持麦克风访问，请使用 Chrome 或 Firefox'
              : 'Your browser does not support microphone access. Please use Chrome or Firefox.'}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={isActive ? stop : start}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              isActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                : 'bg-cyan-500 text-white hover:bg-cyan-600 shadow-lg shadow-cyan-500/25'
            }`}
          >
            {isActive ? <MicOff size={20} /> : <Mic size={20} />}
            {isActive ? t.practice.stopMic : t.practice.startMic}
          </button>

          {isActive && avgPitch && (
            <div className="text-sm text-slate-400">
              {t.practice.avgPitch}:{' '}
              <span className="text-cyan-400 font-mono font-bold">{avgPitch} Hz</span>
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          <AlertCircle size={20} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Permission hint */}
      {!isActive && !error && isSupported && (
        <p className="text-sm text-slate-500 text-center py-8">
          {t.practice.micPermission}
        </p>
      )}

      {/* Voice HUD */}
      {isActive && (
        <VoiceHUD data={data} targetRange={targetRange} isActive={isActive} />
      )}

      {/* No signal indicator */}
      {isActive && !data.voiced && (
        <p className="text-sm text-slate-500 text-center animate-pulse">
          {t.practice.noSignal}
        </p>
      )}
    </div>
  )
}
