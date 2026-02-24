import { type ReactNode, useEffect, useRef, useState } from 'react'
import { MarkdownRenderer } from './markdown-renderer'
import { AudioWaveform } from '#/components/audio/AudioWaveform'
import { getAudioBlob } from '#/lib/audio/audio-storage'

export function AIMessage({
  role,
  children,
  audioId,
}: {
  role: 'user' | 'assistant'
  children: ReactNode
  audioId?: string
}) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)

  useEffect(() => {
    if (!audioId) return
    let cancelled = false
    void getAudioBlob(audioId).then((blob) => {
      if (!cancelled) setAudioBlob(blob)
    })
    return () => {
      cancelled = true
    }
  }, [audioId])

  const content = typeof children === 'string' ? children : null

  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
        role === 'assistant'
          ? 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          : 'ml-8 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      }`}
    >
      {audioBlob && (
        <div className="mb-2">
          <AudioWaveform audioBlob={audioBlob} compact />
        </div>
      )}
      {role === 'assistant' && content ? <MarkdownRenderer content={content} /> : children}
    </div>
  )
}

export function AIConversation({ children, messageCount }: { children: ReactNode; messageCount: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messageCount])

  return (
    <div ref={ref} className="flex-1 space-y-3 overflow-y-auto p-4">
      {children}
    </div>
  )
}
