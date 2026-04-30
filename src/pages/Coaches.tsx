import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCoaches, getCoachAvailability } from '../api/client'
import type { Coach, AvailabilitySlot } from '../types'

function formatSlot(slot: AvailabilitySlot | { start: string }) {
  const d = new Date(slot.start)
  return {
    date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

function normalizeSlots(raw: AvailabilitySlot[] | Record<string, { start: string }[]>): AvailabilitySlot[] {
  if (Array.isArray(raw)) return raw
  const slots: AvailabilitySlot[] = []
  for (const times of Object.values(raw)) {
    for (const t of times) slots.push({ start: t.start, end: '' })
  }
  return slots
}

function CoachCard({ coach }: { coach: Coach }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [source, setSource] = useState('')

  const loadAvailability = async () => {
    if (expanded) { setExpanded(false); return }
    setExpanded(true)
    if (slots.length > 0) return
    setLoadingSlots(true)
    setSlotError(null)
    try {
      const res = await getCoachAvailability(coach.id)
      setSlots(normalizeSlots(res.slots as AvailabilitySlot[] | Record<string, { start: string }[]>))
      setSource(res.source)
    } catch (e) {
      setSlotError(e instanceof Error ? e.message : 'Failed to load availability')
    } finally {
      setLoadingSlots(false)
    }
  }

  const initials = coach.name.split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <div className="card overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
              style={{ background: '#DBEAFE', color: '#1e40af' }}>
              {initials}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: '#111827' }}>{coach.name}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{coach.timezone}</div>
              {coach.calcom_username && (
                <div className="inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#EFF6FF', color: '#1565C0' }}>
                  <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#10b981' }}></span>
                  Cal.com connected
                </div>
              )}
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={coach.is_active
              ? { background: '#D1FAE5', color: '#065f46' }
              : { background: '#F3F4F6', color: '#6b7280' }}>
            {coach.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {coach.expertise && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {coach.expertise.split(',').map(tag => (
              <span key={tag.trim()} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: '#F3F4F6', color: '#374151' }}>
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div className="mt-3 flex gap-2">
          <button onClick={loadAvailability} className="btn-secondary text-xs py-1.5 flex items-center gap-1">
            <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {expanded ? 'Hide' : 'View'} Availability
          </button>
          <button onClick={() => navigate('/chat?role=participant')}
            className="btn-primary text-xs py-1.5">
            Book via Chat
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t px-4 py-3" style={{ borderColor: '#e8ecf2', background: '#F9FAFB' }}>
          {loadingSlots && <p className="text-sm text-center py-3" style={{ color: '#6b7280' }}>Loading slots…</p>}
          {slotError && <p className="text-sm" style={{ color: '#DC2626' }}>{slotError}</p>}
          {!loadingSlots && !slotError && slots.length === 0 && (
            <p className="text-sm text-center py-3" style={{ color: '#9ca3af' }}>No available slots.</p>
          )}
          {!loadingSlots && !slotError && slots.length > 0 && (
            <>
              {source === 'simulated' && (
                <p className="text-xs px-3 py-1.5 rounded-lg mb-3"
                  style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400e' }}>
                  Showing simulated availability — Cal.com not connected yet.
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {slots.slice(0, 12).map((slot, i) => {
                  const { date, time } = formatSlot(slot)
                  return (
                    <div key={i} className="bg-white rounded-lg px-3 py-2 text-center cursor-pointer transition-colors"
                      style={{ border: '1px solid #e8ecf2' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#1565C0'
                        ;(e.currentTarget as HTMLElement).style.background = '#EFF6FF'
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#e8ecf2'
                        ;(e.currentTarget as HTMLElement).style.background = '#fff'
                      }}>
                      <p className="text-xs" style={{ color: '#6b7280' }}>{date}</p>
                      <p className="text-sm font-medium" style={{ color: '#111827' }}>{time}</p>
                    </div>
                  )
                })}
              </div>
              {slots.length > 12 && (
                <p className="text-xs text-center mt-2" style={{ color: '#9ca3af' }}>
                  +{slots.length - 12} more — book via chat to see all
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default function Coaches() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCoaches()
      .then(setCoaches)
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load coaches'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Nunito, sans-serif', color: '#111827' }}>
            Coaches
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Browse available coaches and their open slots
          </p>
        </div>
        {!loading && (
          <span className="text-sm" style={{ color: '#9ca3af' }}>
            {coaches.length} coach{coaches.length !== 1 ? 'es' : ''}
          </span>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full" style={{ background: '#F3F4F6' }}></div>
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded" style={{ background: '#F3F4F6' }}></div>
                  <div className="h-2.5 w-20 rounded" style={{ background: '#F3F4F6' }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="card p-6 text-center">
          <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Is the backend running at localhost:8000?</p>
        </div>
      )}

      {!loading && !error && coaches.length === 0 && (
        <div className="card p-10 text-center" style={{ color: '#9ca3af' }}>
          <p className="text-base mb-1">No coaches yet</p>
          <p className="text-sm">Coaches will appear here after they connect their Cal.com account.</p>
        </div>
      )}

      <div className="space-y-3">
        {coaches.map(coach => <CoachCard key={coach.id} coach={coach} />)}
      </div>
    </div>
  )
}
