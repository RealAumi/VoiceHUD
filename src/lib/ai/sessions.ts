export type SessionMessageRole = 'user' | 'assistant'

export interface SessionMessage {
  id: string
  role: SessionMessageRole
  content: string
  createdAt: number
}

export interface AnalysisSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

const STORAGE = {
  sessions: 'voicehud:sessions',
  activeSessionId: 'voicehud:activeSessionId',
  schemaVersion: 'voicehud:schemaVersion',
} as const

const SCHEMA_VERSION = '1'

function now() {
  return Date.now()
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function ensureSessionSchema() {
  if (!isBrowser()) return
  const current = localStorage.getItem(STORAGE.schemaVersion)
  if (current === SCHEMA_VERSION) return
  migrateOrResetSessions()
}

function messageKey(sessionId: string) {
  return `voicehud:messages:${sessionId}`
}

function migrateOrResetSessions() {
  try {
    const rawSessions = localStorage.getItem(STORAGE.sessions)
    if (rawSessions) {
      const sessions = JSON.parse(rawSessions) as AnalysisSession[]
      if (Array.isArray(sessions)) {
        for (const session of sessions) {
          if (session && typeof session.id === 'string') {
            localStorage.removeItem(messageKey(session.id))
          }
        }
      }
    }
  } catch {
    // ignore parse errors and clear top-level keys below
  }

  localStorage.removeItem(STORAGE.sessions)
  localStorage.removeItem(STORAGE.activeSessionId)
  localStorage.setItem(STORAGE.schemaVersion, SCHEMA_VERSION)
}

export function listSessions(): AnalysisSession[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(STORAGE.sessions)
    const parsed = raw ? (JSON.parse(raw) as AnalysisSession[]) : []
    return [...parsed].sort((a, b) => b.updatedAt - a.updatedAt)
  } catch {
    return []
  }
}

function saveSessions(sessions: AnalysisSession[]) {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE.sessions, JSON.stringify(sessions))
}

export function getActiveSessionId(): string | null {
  if (!isBrowser()) return null
  return localStorage.getItem(STORAGE.activeSessionId)
}

export function setActiveSessionId(sessionId: string) {
  if (!isBrowser()) return
  localStorage.setItem(STORAGE.activeSessionId, sessionId)
}

export function createSession(title?: string): AnalysisSession {
  const ts = now()
  const session: AnalysisSession = {
    id: id('session'),
    title: title?.trim() || `Session ${new Date(ts).toLocaleDateString()}`,
    createdAt: ts,
    updatedAt: ts,
  }
  const sessions = listSessions()
  saveSessions([session, ...sessions])
  setActiveSessionId(session.id)
  localStorage.setItem(messageKey(session.id), JSON.stringify([]))
  return session
}

export function renameSession(sessionId: string, title: string) {
  const next = listSessions().map((s) =>
    s.id === sessionId ? { ...s, title: title.trim() || s.title, updatedAt: now() } : s
  )
  saveSessions(next)
}

export function deleteSession(sessionId: string) {
  const sessions = listSessions().filter((s) => s.id !== sessionId)
  saveSessions(sessions)
  if (isBrowser()) {
    localStorage.removeItem(messageKey(sessionId))
    const active = getActiveSessionId()
    if (active === sessionId) {
      if (sessions[0]) setActiveSessionId(sessions[0].id)
      else localStorage.removeItem(STORAGE.activeSessionId)
    }
  }
}

export function getSessionMessages(sessionId: string): SessionMessage[] {
  if (!isBrowser()) return []
  try {
    const raw = localStorage.getItem(messageKey(sessionId))
    return raw ? (JSON.parse(raw) as SessionMessage[]) : []
  } catch {
    return []
  }
}

export function pushSessionMessage(
  sessionId: string,
  role: SessionMessageRole,
  content: string
): SessionMessage {
  const message: SessionMessage = {
    id: id('msg'),
    role,
    content,
    createdAt: now(),
  }

  const messages = [...getSessionMessages(sessionId), message]
  if (isBrowser()) {
    localStorage.setItem(messageKey(sessionId), JSON.stringify(messages))
  }

  const sessions = listSessions().map((s) =>
    s.id === sessionId ? { ...s, updatedAt: now() } : s
  )
  saveSessions(sessions)

  return message
}
