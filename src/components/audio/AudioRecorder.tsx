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
    <div className="flex flex-wrap items-center gap-4">
      {!isRecording && !audioBlob && (
        <>
          <button
            onClick={onStartRecording}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-medium text-white transition-colors hover:bg-slate-700"
          >
            <Mic size={20} />
            {t.analysis.recordButton}
          </button>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900">
            <Upload size={18} />
            {t.analysis.uploadButton}
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              aria-label={t.analysis.uploadInputLabel}
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
            <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <span className="font-mono text-red-600">{formatDuration(duration)}</span>
          </div>
          <button
            onClick={onStopRecording}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
          >
            <Square size={16} />
            {t.analysis.stopButton}
          </button>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="flex items-center gap-3">
          <audio src={URL.createObjectURL(audioBlob)} controls className="h-10" />
          <button onClick={onClear} className="p-2 text-slate-400 transition-colors hover:text-red-500" title="Delete recording">
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
      className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 font-medium text-white transition-colors hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
    >
      {isAnalyzing && <Loader2 size={18} className="animate-spin" />}
      {label}
    </button>
  )
}
