import { PitchDisplay } from './PitchDisplay'
import { ResonanceDisplay } from './ResonanceDisplay'
import { Spectrogram } from './Spectrogram'
import type { PitchData } from '#/hooks/usePitchDetection'
import type { PitchRangeKey } from '#/lib/audio/constants'

interface VoiceHUDProps {
  data: PitchData
  targetRange: PitchRangeKey
  isActive: boolean
}

export function VoiceHUD({ data, targetRange, isActive }: VoiceHUDProps) {
  // Volume indicator
  const volumePercent = Math.min(data.rms * 500, 100)

  return (
    <div className="space-y-4">
      {/* Volume meter */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-slate-400 w-8">VOL</span>
        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${volumePercent}%`,
              backgroundColor:
                volumePercent > 80
                  ? '#ef4444'
                  : volumePercent > 50
                    ? '#eab308'
                    : '#22c55e',
            }}
          />
        </div>
      </div>

      {/* Pitch display with history graph */}
      <PitchDisplay
        pitch={data.pitch}
        pitchHistory={data.pitchHistory}
        targetRange={targetRange}
        voiced={data.voiced}
      />

      {/* Resonance / Formants */}
      <ResonanceDisplay formants={data.formants} voiced={data.voiced} />

      {/* Spectrogram */}
      <Spectrogram spectrumData={data.spectrumData} isActive={isActive} />
    </div>
  )
}
