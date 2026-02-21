import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, KeyRound, Plus, Trash2 } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { useI18n } from '#/lib/i18n'
import { useVoiceRecorder } from '#/hooks/useVoiceRecorder'
import { AudioRecorder, AnalyzeButton } from '#/components/audio/AudioRecorder'
import { analyzeVoice, type ConversationTurn } from '#/lib/ai/client'
import { appStore } from '#/lib/store/app-store'
import {
  createSession,
  deleteSession,
  ensureSessionSchema,
  getActiveSessionId,
  getSessionMessages,
  listSessions,
  pushSessionMessage,
  setActiveSessionId,
  type AnalysisSession,
  type SessionMessage,
} from '#/lib/ai/sessions'
import { AIConversation, AIMessage } from '#/components/ui/ai-elements'

export const Route = createFileRoute('/analysis')({ component: AnalysisPage })

function AnalysisPage() {
  const { t, locale } = useI18n()
  const recorder = useVoiceRecorder()
  const config = useStore(appStore, (s) => s.provider)

  const [sessions, setSessions] = useState<AnalysisSession[]>([])
  const [activeSessionId, setActiveSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [analysisError, setAnalysisError] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const configured = config.apiKey.trim().length > 0

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  )

  const refreshSessions = () => setSessions(listSessions())

  useEffect(() => {
    ensureSessionSchema()
    const all = listSessions()
    if (all.length === 0) {
      const created = createSession(locale === 'zh' ? '训练会话 1' : 'Training Session 1')
      setSessions([created])
      setActiveSession(created.id)
      setMessages([])
      return
    }

    setSessions(all)
    const stored = getActiveSessionId()
    const chosen = stored && all.some((s) => s.id === stored) ? stored : all[0].id
    setActiveSession(chosen)
    setActiveSessionId(chosen)
    setMessages(getSessionMessages(chosen))
  }, [locale])

  const switchSession = (sessionId: string) => {
    setActiveSession(sessionId)
    setActiveSessionId(sessionId)
    setMessages(getSessionMessages(sessionId))
    setAnalysisError('')
  }

  const handleCreateSession = () => {
    const nextNumber = sessions.length + 1
    const session = createSession(locale === 'zh' ? `训练会话 ${nextNumber}` : `Training Session ${nextNumber}`)
    refreshSessions()
    switchSession(session.id)
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
    const remaining = listSessions()
    setSessions(remaining)
    if (remaining[0]) {
      switchSession(remaining[0].id)
    } else {
      const fallback = createSession(locale === 'zh' ? '训练会话 1' : 'Training Session 1')
      setSessions([fallback])
      switchSession(fallback.id)
    }
  }

  const handleAnalyze = async () => {
    if (!recorder.audioBlob || !activeSessionId) return

    setIsAnalyzing(true)
    setAnalysisError('')

    const history = getSessionMessages(activeSessionId)
    const historyTurns: ConversationTurn[] = history.map((item) => ({
      role: item.role,
      content: item.content,
    }))

    pushSessionMessage(
      activeSessionId,
      'user',
      locale === 'zh' ? '请继续分析我这次录音，并给出下一步训练建议。' : 'Please analyze this recording and suggest the next training steps.'
    )

    const result = await analyzeVoice(recorder.audioBlob, config, locale, historyTurns)

    if (result.error) {
      setAnalysisError(result.error)
    } else {
      pushSessionMessage(activeSessionId, 'assistant', result.text)
      setMessages(getSessionMessages(activeSessionId))
      refreshSessions()
    }

    setIsAnalyzing(false)
  }

  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <button
          onClick={handleCreateSession}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          <Plus size={16} /> {locale === 'zh' ? '新建会话' : 'New Session'}
        </button>

        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                session.id === activeSessionId
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              <button className="min-w-0 flex-1 truncate text-left" onClick={() => switchSession(session.id)}>
                {session.title}
              </button>
              <button
                onClick={() => handleDeleteSession(session.id)}
                className={`ml-2 rounded p-1 ${
                  session.id === activeSessionId ? 'hover:bg-white/20' : 'hover:bg-slate-100'
                }`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">{t.analysis.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.analysis.recordPrompt}</p>
          <p className="mt-1 text-xs text-slate-500">{t.analysis.securityNotice}</p>
        </div>

        {!configured && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-700">
            <div className="flex items-center gap-3">
              <KeyRound size={20} />
              <span className="text-sm">{t.analysis.noApiKey}</span>
            </div>
            <Link to="/settings" className="rounded-lg border border-amber-300 bg-white px-3 py-1 text-sm">
              {t.analysis.goToSettings}
            </Link>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <AudioRecorder
            isRecording={recorder.isRecording}
            duration={recorder.duration}
            audioBlob={recorder.audioBlob}
            onStartRecording={recorder.startRecording}
            onStopRecording={recorder.stopRecording}
            onUpload={recorder.loadAudioFile}
            onClear={recorder.clearRecording}
          />

          {recorder.error && (
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {recorder.error}
            </div>
          )}

          {recorder.audioBlob && !recorder.isRecording && (
            <div className="mt-4">
              <AnalyzeButton
                onClick={handleAnalyze}
                isAnalyzing={isAnalyzing}
                disabled={!configured || !activeSession}
                label={isAnalyzing ? t.analysis.analyzing : t.analysis.analyzeButton}
              />
            </div>
          )}

          {analysisError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {analysisError}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-slate-900">{activeSession?.title ?? t.analysis.result}</h3>
          <AIConversation>
            {messages.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                {locale === 'zh'
                  ? '还没有历史分析，先录一段音频开启会话。'
                  : 'No analysis history yet. Record a clip to start this session.'}
              </p>
            ) : (
              messages.map((msg) => (
                <AIMessage key={msg.id} role={msg.role}>
                  {msg.content}
                </AIMessage>
              ))
            )}
          </AIConversation>
        </div>
      </section>
    </div>
  )
}
