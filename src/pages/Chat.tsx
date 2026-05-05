import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { sendChatMessage, deleteSession } from '../api/client'
import type { ChatMessage } from '../types'

function getSessionId(): string {
  const params = new URLSearchParams(window.location.search)

  // Returning from an OAuth redirect — restore the session_id the agent issued
  // the auth link from so the conversation continues in the same session.
  const fromOauth = params.get('session_id')
  if (fromOauth) {
    localStorage.setItem('technovation_session_id', fromOauth)
    return fromOauth
  }

  // If coming from landing page with a role, always start a fresh session
  if (params.get('role')) {
    const newId = crypto.randomUUID()
    localStorage.setItem('technovation_session_id', newId)
    return newId
  }
  let id = localStorage.getItem('technovation_session_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('technovation_session_id', id)
  }
  return id
}

function RoleBadge({ role }: { role: string }) {
  if (role === 'unknown' || !role) return null
  const isCoach = role === 'coach'
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={isCoach
        ? { background: '#FEF3C7', color: '#92400e' }
        : { background: '#DBEAFE', color: '#1e40af' }}>
      {isCoach ? 'Coach' : 'Participant'}
    </span>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-semibold"
        style={{ background: '#1565C0' }}>T</div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ border: '1px solid #e8ecf2' }}>
        <div className="flex gap-1 items-center h-4">
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ msg, sessionId }: { msg: ChatMessage; sessionId: string }) {
  const isUser = msg.role === 'user'

  const parseMarkdown = (str: string, keyPrefix: number) => {
    const parts: React.ReactNode[] = []
    const mdRegex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
    let last = 0
    let match
    let i = 0
    while ((match = mdRegex.exec(str)) !== null) {
      if (match.index > last) parts.push(<span key={`${keyPrefix}-t${i++}`}>{str.slice(last, match.index)}</span>)
      if (match[0].startsWith('**')) parts.push(<strong key={`${keyPrefix}-b${i++}`}>{match[2]}</strong>)
      else parts.push(<em key={`${keyPrefix}-i${i++}`}>{match[3]}</em>)
      last = match.index + match[0].length
    }
    if (last < str.length) parts.push(<span key={`${keyPrefix}-t${i++}`}>{str.slice(last)}</span>)
    return parts
  }

  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const segments = text.split(urlRegex)
    return segments.map((part, i) => {
      if (urlRegex.test(part)) {
        const cleanPart = part.replace(/[*_.,'";:!?)]+$/, '')
        const isAuthUrl = cleanPart.includes('/auth/')
        let href = cleanPart
        if (isAuthUrl && !href.includes('session_id=')) {
          href += (href.includes('?') ? '&' : '?') + `session_id=${sessionId}`
        }
        if (isAuthUrl) {
          const label = cleanPart.includes('calcom') ? '🔗 Connect Cal.com' : '🔗 Connect Google'
          // Same-tab navigation so OAuth redirects land back in this same chat
          // tab. With target="_blank" the original tab never updates and the
          // user perceives "the chat doesn't open."
          return (
            <a key={i} href={href}
              className="inline-block mt-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors"
              style={{ background: '#1565C0' }}>
              {label}
            </a>
          )
        }
        return (
          <a key={i} href={cleanPart} target="_blank" rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100 break-all">
            {cleanPart}
          </a>
        )
      }
      return <span key={i}>{parseMarkdown(part, i)}</span>
    })
  }

  return (
    <div className={`flex items-end gap-2 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className="flex items-center justify-center shrink-0 font-semibold"
        style={{
          width: 30, height: 30, borderRadius: '50%',
          background: isUser ? '#F59E0B' : '#1565C0',
          color: '#fff', fontSize: 11,
        }}>
        {isUser ? 'U' : 'T'}
      </div>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`} style={{ maxWidth: '82%' }}>
        <div className="mb-1" style={{
          fontSize: 10, color: '#9ca3af',
          paddingLeft: isUser ? 0 : 2, paddingRight: isUser ? 2 : 0,
          textAlign: isUser ? 'right' : 'left',
        }}>
          {isUser ? 'You' : 'Assistant'}
        </div>
        <div className="whitespace-pre-line" style={{
          padding: '9px 12px',
          borderRadius: 14,
          fontSize: 12.5,
          lineHeight: 1.55,
          ...(isUser
            ? { background: '#1565C0', color: '#fff', borderBottomRightRadius: 4 }
            : { background: '#fff', color: '#111827', border: '1px solid #e8ecf2', borderBottomLeftRadius: 4 }
          ),
        }}>
          {renderContent(msg.content)}
          <div style={{ fontSize: 10, marginTop: 4, color: isUser ? 'rgba(255,255,255,0.6)' : '#9ca3af' }}>
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sessionId] = useState(getSessionId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('unknown')
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  const addMessage = (role: 'user' | 'agent', content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
    }])
  }

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return
    addMessage('user', text)
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const res = await sendChatMessage(sessionId, text)
      addMessage('agent', res.response)
      if (res.role !== 'unknown') setRole(res.role)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(msg.includes('503') ? 'Agent is unavailable — is the backend running?' : `Error: ${msg}`)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [sessionId, loading])

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const roleParam = searchParams.get('role')
    const calcomConnected = searchParams.get('calcom_connected') === '1'

    if (calcomConnected) {
      addMessage('agent', '✅ Cal.com account connected!')
      setSearchParams({}, { replace: true })
      send("I've connected my Cal.com account.")
    } else if (roleParam === 'coach') send('I am a coach')
    else if (roleParam === 'participant') send('I am a participant')
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleNewSession = async () => {
    try { await deleteSession(sessionId) } catch (_) { /* ignore */ }
    localStorage.removeItem('technovation_session_id')
    window.location.reload()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    send(input)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 flex flex-col" style={{ height: '100vh' }}>

      {/* Chat card */}
      <div className="flex flex-col flex-1 overflow-hidden"
        style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid #e8ecf2' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center text-white font-semibold shrink-0"
              style={{ width: 30, height: 30, borderRadius: '50%', background: '#1565C0', fontSize: 11 }}>T</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Technovation Assistant</div>
              <div className="flex items-center gap-1.5">
                <span style={{ fontSize: 10, color: '#10b981' }}>● online</span>
                <RoleBadge role={role} />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono" style={{ fontSize: 11, color: '#9ca3af' }}>{sessionId.slice(0, 8)}…</span>
            <button onClick={handleNewSession} className="btn-secondary text-xs py-1 px-2">
              New Session
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll space-y-3 p-3"
          style={{ background: '#F9FAFB' }}>
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col items-center justify-center gap-2" style={{ color: '#9ca3af' }}>
              <p className="text-sm">Type a message to get started</p>
            </div>
          )}
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} sessionId={sessionId} />
          ))}
          {loading && <TypingIndicator />}
          {error && (
            <div className="text-sm rounded-xl px-4 py-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="shrink-0 flex gap-2 items-center px-3 py-2.5"
          style={{ background: '#fff', borderTop: '1px solid #e8ecf2' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
            placeholder="Type a message..."
            disabled={loading}
            className="flex-1 outline-none text-xs"
            style={{
              background: '#F9FAFB',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: '8px 14px',
              color: '#374151',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="flex items-center justify-center shrink-0 disabled:opacity-40 transition-opacity"
            style={{ width: 30, height: 30, borderRadius: '50%', background: '#1565C0', border: 'none' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1.5 6.5h10M6.5 1.5l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

      </div>{/* end chat card */}

      <p className="text-center text-xs mt-2 shrink-0" style={{ color: '#9ca3af' }}>
        After connecting Google or Cal.com, return here and continue the conversation.
      </p>
    </div>
  )
}
