import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Send, Upload, MessageSquare, AudioLines } from 'lucide-react'
import { useI18n } from '#/lib/i18n'

export type InputMode = 'voice' | 'text'

interface ChatInputProps {
  onSendAudio: (blob: Blob) => void
  onSendText: (text: string) => void
  onUploadAudio: (file: File) => void
  onError?: (message: string) => void
  disabled?: boolean
  isAnalyzing?: boolean
}

export function ChatInput({ onSendAudio, onSendText, onUploadAudio, onError, disabled, isAnalyzing }: ChatInputProps) {
  const { locale } = useI18n()
  const [mode, setMode] = useState<InputMode>('voice')
  const [textValue, setTextValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordDuration, setRecordDuration] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)
  const startTimeRef = useRef(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current)
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      streamRef.current = stream

      const preferredTypes = [
        'audio/mp4;codecs=mp4a.40.2',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/ogg',
        'audio/webm;codecs=opus',
        'audio/webm',
      ]
      const mimeType = preferredTypes.find((t) => MediaRecorder.isTypeSupported(t)) ?? ''

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []
      startTimeRef.current = Date.now()

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const finalMime = recorder.mimeType || mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: finalMime })
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        clearInterval(timerRef.current)
        setIsRecording(false)
        setRecordDuration(0)
        onSendAudio(blob)
      }

      recorder.start(100)
      setIsRecording(true)

      timerRef.current = setInterval(() => {
        setRecordDuration(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    } catch {
      const message = locale === 'zh' ? '无法访问麦克风，请检查浏览器权限后重试。' : 'Unable to access microphone. Please check browser permissions and try again.'
      onError?.(message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }

  const handleSendText = () => {
    const trimmed = textValue.trim()
    if (!trimmed) return
    onSendText(trimmed)
    setTextValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendText()
    }
  }

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const isDisabled = disabled || isAnalyzing

  return (
    <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/90">
      {/* Mode toggle */}
      <div className="mb-2 flex items-center gap-2" role="tablist" aria-label={locale === 'zh' ? '输入模式' : 'Input mode'}>
        <button
          onClick={() => setMode('voice')}
          role="tab"
          aria-selected={mode === 'voice'}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'voice'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <AudioLines size={14} />
          {locale === 'zh' ? '语音' : 'Voice'}
        </button>
        <button
          onClick={() => setMode('text')}
          role="tab"
          aria-selected={mode === 'text'}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'text'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare size={14} />
          {locale === 'zh' ? '文字' : 'Text'}
        </button>

        <div className="flex-1" />

        {/* Upload button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <Upload size={14} />
          {locale === 'zh' ? '上传' : 'Upload'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUploadAudio(file)
            e.currentTarget.value = ''
          }}
        />
      </div>

      {/* Input area */}
      {mode === 'voice' ? (
        <div className="flex items-center justify-center gap-4 py-2">
          {isRecording ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
                <span className="font-mono text-sm text-red-600 dark:text-red-400">{formatDuration(recordDuration)}</span>
              </div>
              <button
                onClick={stopRecording}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
              >
                <Square size={14} />
                {locale === 'zh' ? '停止并发送' : 'Stop & Send'}
              </button>
            </>
          ) : (
            <button
              onClick={startRecording}
              disabled={isDisabled}
              aria-label={
                isAnalyzing
                  ? locale === 'zh'
                    ? '正在分析，暂不可录音'
                    : 'Analyzing in progress, recording is unavailable'
                  : locale === 'zh'
                    ? '开始录音'
                    : 'Start recording'
              }
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mic size={16} />
              {isAnalyzing
                ? locale === 'zh'
                  ? '分析中...'
                  : 'Analyzing...'
                : locale === 'zh'
                  ? '按下录音'
                  : 'Record'}
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-end gap-2">
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={locale === 'zh' ? '输入消息...' : 'Type a message...'}
            aria-label={locale === 'zh' ? '消息输入框' : 'Message input'}
            disabled={isDisabled}
            rows={1}
            className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-teal-400 dark:focus:ring-teal-400"
          />
          <button
            onClick={handleSendText}
            disabled={isDisabled || !textValue.trim()}
            aria-label={locale === 'zh' ? '发送消息' : 'Send message'}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white transition-colors hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
