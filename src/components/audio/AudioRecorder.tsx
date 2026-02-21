import { Mic, Square, Loader2, Trash2, Upload } from 'lucide-react'
import { useI18n } from '#/lib/i18n'

interface AudioRecorderProps {
  isRecording: boolean
  duration: number
  audioBlob: Blob | null
  onStartRecording: () => void
  onStopRecording: () => void
  onUpload: (file: File) => void
  onClear: () => void
}

export function AudioRecorder({
  isRecording,
  duration,
  audioBlob,
  onStartRecording,
  onStopRecording,
  onUpload,
  onClear,
}: AudioRecorderProps) {
  const { t } = useI18n()

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex items-center gap-4">
      {!isRecording && !audioBlob && (
        <>
          <button
            onClick={onStartRecording}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium"
          >
            <Mic size={20} />
            {t.analysis.recordButton}
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium cursor-pointer">
            <Upload size={18} />
            {t.analysis.uploadButton}
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onUpload(file)
                e.currentTarget.value = ''
              }}
            />
          </label>
        </>
      )}

      {isRecording && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 font-mono">{formatDuration(duration)}</span>
          </div>
          <button
            onClick={onStopRecording}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
          >
            <Square size={16} />
            {t.analysis.stopButton}
          </button>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="flex items-center gap-3">
          <audio src={URL.createObjectURL(audioBlob)} controls className="h-10" />
          <button
            onClick={onClear}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Delete recording"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

interface AnalyzeButtonProps {
  onClick: () => void
  isAnalyzing: boolean
  disabled: boolean
  label: string
}

export function AnalyzeButton({ onClick, isAnalyzing, disabled, label }: AnalyzeButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isAnalyzing}
      className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors font-medium"
    >
      {isAnalyzing && <Loader2 size={18} className="animate-spin" />}
      {label}
    </button>
  )
}
