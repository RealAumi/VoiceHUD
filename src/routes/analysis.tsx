import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, KeyRound, Plus, Trash2, Settings2, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore } from '@tanstack/react-store'
import { useI18n } from '#/lib/i18n'
import { analyzeVoice, type ConversationTurn } from '#/lib/ai/client'
import { appStore, setCustomPrompt } from '#/lib/store/app-store'
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
import { ChatInput } from '#/components/audio/ChatInput'
import { saveAudioBlob } from '#/lib/audio/audio-storage'
import { useVoiceRecorder } from '#/hooks/useVoiceRecorder'

export const Route = createFileRoute('/analysis')({ component: AnalysisPage })

function AnalysisPage() {
  const { t, locale } = useI18n()
  const recorder = useVoiceRecorder()
  const config = useStore(appStore, (s) => s.provider)
  const customPrompt = useStore(appStore, (s) => s.customPrompt)

  const [sessions, setSessions] = useState<AnalysisSession[]>([])
  const [activeSessionId, setActiveSession] = useState<string | null>(null)
  const [messages, setMessages] = useState<SessionMessage[]>([])
  const [analysisError, setAnalysisError] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [promptDraft, setPromptDraft] = useState(customPrompt)
  const [promptSaved, setPromptSaved] = useState(false)

  const activeSessionIdRef = useRef<string | null>(null)
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  const handleSendAudioRef = useRef<(blob: Blob) => Promise<void>>(async () => {})

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
  }, [])

  const switchSession = (sessionId: string) => {
    setActiveSession(sessionId)
    setActiveSessionId(sessionId)
    setMessages(getSessionMessages(sessionId))
    setAnalysisError('')
    setShowSidebar(false)
  }

  const getNextSessionNumber = () => {
    const pattern = locale === 'zh' ? /^训练会话\s+(\d+)$/ : /^Training Session\s+(\d+)$/
    let maxNumber = 0
    for (const session of sessions) {
      const match = session.title.match(pattern)
      if (!match) continue
      const num = Number.parseInt(match[1], 10)
      if (!Number.isNaN(num) && num > maxNumber) maxNumber = num
    }
    return maxNumber + 1
  }

  const handleCreateSession = () => {
    const nextNumber = getNextSessionNumber()
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

  const handleSendAudio = async (audioBlob: Blob) => {
    if (!activeSessionId) return

    const requestSessionId = activeSessionId
    setIsAnalyzing(true)
    setAnalysisError('')

    // Save audio to IndexedDB
    const audioMsgId = `audio_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    await saveAudioBlob(audioMsgId, audioBlob)

    const userPrompt =
      locale === 'zh'
        ? '请分析我这次录音，并给出训练建议。'
        : 'Please analyze this recording and suggest training steps.'

    // Push user message with audio reference
    pushSessionMessage(requestSessionId, 'user', userPrompt, audioMsgId)

    // Update messages immediately to show user message
    if (activeSessionIdRef.current === requestSessionId) {
      setMessages(getSessionMessages(requestSessionId))
    }

    const history = getSessionMessages(requestSessionId)
    const historyTurns: ConversationTurn[] = history.map((item) => ({ role: item.role, content: item.content }))

    const result = await analyzeVoice(audioBlob, config, locale, historyTurns, customPrompt)

    const latestSessions = listSessions()
    const stillExists = latestSessions.some((s) => s.id === requestSessionId)
    if (!stillExists) {
      setIsAnalyzing(false)
      return
    }

    if (result.error) {
      setAnalysisError(result.error)
    } else {
      pushSessionMessage(requestSessionId, 'assistant', result.text)
      refreshSessions()
    }

    if (activeSessionIdRef.current === requestSessionId) {
      setMessages(getSessionMessages(requestSessionId))
    }
    setIsAnalyzing(false)
  }
  handleSendAudioRef.current = handleSendAudio

  const handleSendText = async (text: string) => {
    if (!activeSessionId) return

    const requestSessionId = activeSessionId
    setIsAnalyzing(true)
    setAnalysisError('')

    pushSessionMessage(requestSessionId, 'user', text)
    if (activeSessionIdRef.current === requestSessionId) {
      setMessages(getSessionMessages(requestSessionId))
    }

    const history = getSessionMessages(requestSessionId)
    const historyTurns: ConversationTurn[] = history.map((item) => ({ role: item.role, content: item.content }))

    const result = await analyzeVoice(null, config, locale, historyTurns, customPrompt)

    const latestSessions = listSessions()
    const stillExists = latestSessions.some((s) => s.id === requestSessionId)
    if (!stillExists) {
      setIsAnalyzing(false)
      return
    }

    if (result.error) {
      setAnalysisError(result.error)
    } else {
      pushSessionMessage(requestSessionId, 'assistant', result.text)
      refreshSessions()
    }

    if (activeSessionIdRef.current === requestSessionId) {
      setMessages(getSessionMessages(requestSessionId))
    }
    setIsAnalyzing(false)
  }

  const handleUploadAudio = (file: File) => {
    recorder.loadAudioFile(file)
  }

  // When file is loaded via upload, send it
  const prevBlobRef = useRef<Blob | null>(null)
  useEffect(() => {
    if (recorder.audioBlob && recorder.audioBlob !== prevBlobRef.current && !recorder.isRecording) {
      prevBlobRef.current = recorder.audioBlob
      const blob = recorder.audioBlob
      void (async () => {
        await handleSendAudioRef.current(blob)
        recorder.clearRecording()
      })()
    }
  }, [recorder.audioBlob, recorder.isRecording, recorder.clearRecording])

  const handleSavePrompt = () => {
    setCustomPrompt(promptDraft)
    setPromptSaved(true)
    setTimeout(() => setPromptSaved(false), 2000)
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-57px)] max-w-6xl flex-col lg:grid lg:grid-cols-[260px_1fr] lg:gap-4 lg:px-4 lg:py-6">
      {/* Mobile header bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900/70 lg:hidden">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {activeSession?.title ?? t.analysis.title}
          {showSidebar ? <ChevronUp size={14} className="ml-1 inline" /> : <ChevronDown size={14} className="ml-1 inline" />}
        </button>
        <div className="flex-1" />
        <button
          onClick={() => setShowPromptEditor(!showPromptEditor)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label={t.analysis.customPrompt}
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* Mobile sidebar dropdown */}
      {showSidebar && (
        <div className="border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/70 lg:hidden">
          <button
            onClick={handleCreateSession}
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            <Plus size={16} /> {locale === 'zh' ? '新建会话' : 'New Session'}
          </button>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                  session.id === activeSessionId
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <button className="min-w-0 flex-1 truncate text-left" onClick={() => switchSession(session.id)}>
                  {session.title}
                </button>
                <button
                  onClick={() => handleDeleteSession(session.id)}
                  aria-label={locale === 'zh' ? `删除会话：${session.title}` : `Delete session: ${session.title}`}
                  className="ml-2 rounded p-1 opacity-60 hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 lg:block">
        <button
          onClick={handleCreateSession}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          <Plus size={16} /> {locale === 'zh' ? '新建会话' : 'New Session'}
        </button>

        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center justify-between rounded-lg border px-3 py-2 text-sm ${
                session.id === activeSessionId
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              }`}
            >
              <button className="min-w-0 flex-1 truncate text-left" onClick={() => switchSession(session.id)}>
                {session.title}
              </button>
              <button
                onClick={() => handleDeleteSession(session.id)}
                aria-label={locale === 'zh' ? `删除会话：${session.title}` : `Delete session: ${session.title}`}
                className={`ml-2 rounded p-1 ${
                  session.id === activeSessionId ? 'hover:bg-white/20 dark:hover:bg-slate-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Custom prompt editor (desktop) */}
        <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700">
          <button
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <Settings2 size={14} />
            {t.analysis.customPrompt}
            {showPromptEditor ? <ChevronUp size={12} className="ml-auto" /> : <ChevronDown size={12} className="ml-auto" />}
          </button>
          {showPromptEditor && (
            <div className="mt-2 space-y-2">
              <textarea
                value={promptDraft}
                onChange={(e) => setPromptDraft(e.target.value)}
                placeholder={t.analysis.customPromptPlaceholder}
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
              />
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{t.analysis.customPromptHint}</p>
              <button
                onClick={handleSavePrompt}
                className="w-full rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {promptSaved ? t.analysis.customPromptSaved : t.common.save}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:shadow-sm lg:dark:border-slate-800 lg:dark:bg-slate-900/70">
        {/* Chat header */}
        <div className="hidden items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700 lg:flex">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {activeSession?.title ?? t.analysis.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.analysis.securityNotice}</p>
          </div>
        </div>

        {/* Mobile prompt editor */}
        {showPromptEditor && (
          <div className="border-b border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/70 lg:hidden">
            <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">{t.analysis.customPrompt}</p>
            <textarea
              value={promptDraft}
              onChange={(e) => setPromptDraft(e.target.value)}
              placeholder={t.analysis.customPromptPlaceholder}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:placeholder-slate-500"
            />
            <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">{t.analysis.customPromptHint}</p>
            <button
              onClick={handleSavePrompt}
              className="mt-2 w-full rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {promptSaved ? t.analysis.customPromptSaved : t.common.save}
            </button>
          </div>
        )}

        {/* API key warning */}
        {!configured && (
          <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <KeyRound size={16} />
              <span className="text-xs">{t.analysis.noApiKey}</span>
            </div>
            <Link to="/settings" className="shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1 text-xs dark:border-amber-500/40 dark:bg-slate-900">
              {t.analysis.goToSettings}
            </Link>
          </div>
        )}

        {/* Messages area */}
        <AIConversation messageCount={messages.length}>
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="max-w-xs text-center text-sm text-slate-400 dark:text-slate-500">
                {t.analysis.emptyChat}
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <AIMessage key={msg.id} role={msg.role} audioId={msg.audioId}>
                  {msg.content}
                </AIMessage>
              ))}
              {isAnalyzing && (
                <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-400 dark:text-slate-500">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
                  {t.analysis.analyzing}
                </div>
              )}
            </>
          )}
        </AIConversation>

        {/* Error display */}
        {analysisError && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={14} />
            {analysisError}
          </div>
        )}

        {recorder.error && (
          <div className="mx-4 mb-2 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={14} />
            {recorder.error}
          </div>
        )}

        {/* Context note */}
        {messages.length > 12 && (
          <p className="px-4 pb-1 text-[10px] text-slate-400 dark:text-slate-500">
            {t.analysis.contextNote}
          </p>
        )}

        {/* Chat input */}
        <ChatInput
          onSendAudio={handleSendAudio}
          onSendText={handleSendText}
          onUploadAudio={handleUploadAudio}
          disabled={!configured || !activeSession}
          isAnalyzing={isAnalyzing}
        />
      </section>
    </div>
  )
}
