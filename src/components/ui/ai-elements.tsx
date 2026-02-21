import { type ReactNode, useEffect, useRef } from 'react'

export function AIMessage({ role, children }: { role: 'user' | 'assistant'; children: ReactNode }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
        role === 'assistant'
          ? 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
          : 'ml-8 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
      }`}
    >
      {children}
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
    <div ref={ref} className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
      {children}
    </div>
  )
}
