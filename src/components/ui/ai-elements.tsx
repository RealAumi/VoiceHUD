import type { ReactNode } from 'react'

export function AIMessage({ role, children }: { role: 'user' | 'assistant'; children: ReactNode }) {
  return (
    <div
      className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
        role === 'assistant'
          ? 'border border-slate-200 bg-slate-50 text-slate-700'
          : 'ml-8 bg-slate-900 text-white'
      }`}
    >
      {children}
    </div>
  )
}

export function AIConversation({ children }: { children: ReactNode }) {
  return <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">{children}</div>
}
