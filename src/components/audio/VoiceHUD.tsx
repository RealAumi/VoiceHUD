import { PitchDisplay } from './PitchDisplay'
import { ResonanceDisplay } from './ResonanceDisplay'
import { Spectrogram } from './Spectrogram'
import type { PitchData } from '#/hooks/usePitchDetection'
import type { PitchRangeKey } from '#/lib/audio/constants'

interface VoiceHUDProps {
  data: PitchData
  targetRange: PitchRangeKey
  isActive: boolean
  pitchMin: number
  pitchMax: number
  onPitchMinChange: (v: number) => void
  onPitchMaxChange: (v: number) => void
}

export function VoiceHUD({ data, targetRange, isActive, pitchMin, pitchMax, onPitchMinChange, onPitchMaxChange }: VoiceHUDProps) {
  const volumePercent = Math.min(data.rms * 500, 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1">
        <span className="w-8 text-xs text-slate-500 dark:text-slate-400">VOL</span>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${volumePercent}%`,
              backgroundColor: volumePercent > 80 ? '#ef4444' : volumePercent > 50 ? '#eab308' : '#22c55e',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <PitchDisplay
            pitch={data.pitch}
            pitchHistory={data.pitchHistory}
            targetRange={targetRange}
            voiced={data.voiced}
            heightClassName="h-56 lg:h-[28rem] xl:h-[32rem]"
            yMin={pitchMin}
            yMax={pitchMax}
            onYMinChange={onPitchMinChange}
            onYMaxChange={onPitchMaxChange}
          />
        </div>

        <div className="space-y-4 lg:col-span-4">
          <ResonanceDisplay formants={data.formants} ghostFormants={data.ghostFormants} voiced={data.voiced} />
          <Spectrogram spectrumData={data.spectrumData} isActive={isActive} />
        </div>
      </div>
    </div>
  )
}
