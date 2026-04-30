import { useState, useEffect } from 'react'
import { getBookings, getCoaches } from '../api/client'
import type { Booking, Coach } from '../types'

const TABS = ['Overview', 'Bookings', 'Availability', 'Settings']

function TnLogo() {
  return (
    <div className="flex items-center gap-1.5">
      <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
        <path d="M6 6 L6 22 L10 22 L10 10 L18 10 L18 6 Z" fill="#F59E0B" />
        <rect x="10" y="14" width="20" height="3" rx="1" fill="#1565C0" />
        <rect x="10" y="20" width="14" height="3" rx="1" fill="#1565C0" />
        <rect x="10" y="26" width="8" height="3" rx="1" fill="#1565C0" />
      </svg>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 13, color: '#1565C0', letterSpacing: '-0.01em' }}>
        TECHNOVATION
      </span>
    </div>
  )
}

function initials(name: string) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    day: d.getDate(),
    mon: d.toLocaleDateString([], { month: 'short' }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
}

const AVATAR_COLORS = ['#DBEAFE', '#FEF3C7', '#D1FAE5', '#EDE9FE', '#FCE7F3']
const AVATAR_TEXT_COLORS = ['#1e40af', '#92400e', '#065f46', '#5b21b6', '#9d174d']

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [coachMap, setCoachMap] = useState<Record<number, Coach>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getBookings(), getCoaches()])
      .then(([bks, chs]) => {
        setBookings(bks)
        setCoaches(chs)
        const map: Record<number, Coach> = {}
        chs.forEach(c => { map[c.id] = c })
        setCoachMap(map)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  const confirmed = bookings.filter(b => b.status === 'confirmed')
  const pending = bookings.filter(b => b.status === 'pending')
  const upcoming = bookings
    .filter(b => b.status === 'confirmed' && new Date(b.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
    .slice(0, 5)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 min-h-screen" style={{ background: '#F4F6FA' }}>
      {/* Dashboard card */}
      <div className="overflow-hidden" style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5"
          style={{ borderBottom: '1px solid #e8ecf2' }}>
          <TnLogo />
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center font-semibold text-white"
              style={{ width: 26, height: 26, borderRadius: '50%', background: '#1565C0', fontSize: 10 }}>
              A
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>Admin</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>Coach</div>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <div className="flex" style={{ borderBottom: '1px solid #e8ecf2', padding: '0 14px', background: '#fff' }}>
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                padding: '9px 12px',
                color: activeTab === tab ? '#1565C0' : '#6b7280',
                borderBottom: activeTab === tab ? '2px solid #1565C0' : '2px solid transparent',
                background: 'none',
                border: 'none',
                borderBottomWidth: 2,
                borderBottomStyle: 'solid',
                borderBottomColor: activeTab === tab ? '#1565C0' : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ padding: 14, background: '#F9FAFB', minHeight: 380 }}>
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl h-16" style={{ background: '#e8ecf2' }} />
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}>
              {error} — is the backend running at localhost:8000?
            </div>
          )}

          {!loading && !error && activeTab === 'Overview' && (
            <div className="flex flex-col gap-4">

              {/* Stats */}
              <div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', fontWeight: 600, marginBottom: 8 }}>
                  This week
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { num: confirmed.length, lbl: 'Confirmed' },
                    { num: pending.length,   lbl: 'Pending' },
                  ].map(({ num, lbl }) => (
                    <div key={lbl} className="rounded-xl p-3" style={{ background: '#fff', border: '1px solid #e8ecf2' }}>
                      <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 28, color: '#1565C0', lineHeight: 1 }}>
                        {num}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 3 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming sessions */}
              <div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', fontWeight: 600, marginBottom: 8 }}>
                  Upcoming sessions
                </div>
                {upcoming.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>No upcoming sessions</p>
                ) : (
                  upcoming.map(b => {
                    const { day, mon, time } = formatDate(b.start_time)
                    const coach = coachMap[b.coach_id]
                    return (
                      <div key={b.id} className="flex items-center gap-3 rounded-xl mb-2"
                        style={{ background: '#fff', border: '1px solid #e8ecf2', padding: '10px 12px' }}>
                        <div style={{ width: 34, textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 20, color: '#1565C0', lineHeight: 1 }}>
                            {day}
                          </div>
                          <div style={{ fontSize: 9, color: '#9ca3af', textTransform: 'uppercase' }}>{mon}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                            {coach?.expertise ?? 'Session'} · 30 min
                          </div>
                          <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 1 }}>
                            {time} · Participant #{b.participant_id}
                          </div>
                        </div>
                        <span style={{
                          fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 10, flexShrink: 0,
                          background: '#D1FAE5', color: '#065f46',
                        }}>
                          Confirmed
                        </span>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Coaches */}
              <div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9ca3af', fontWeight: 600, marginBottom: 8 }}>
                  Coaches
                </div>
                {coaches.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>No coaches found</p>
                ) : (
                  coaches.map((c, idx) => (
                    <div key={c.id} className="flex items-center gap-2.5 py-2"
                      style={{ borderBottom: idx < coaches.length - 1 ? '1px solid #f0f2f6' : 'none' }}>
                      <div className="flex items-center justify-center font-semibold shrink-0"
                        style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                          color: AVATAR_TEXT_COLORS[idx % AVATAR_TEXT_COLORS.length],
                          fontSize: 10,
                        }}>
                        {initials(c.name)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{c.name}</div>
                        {c.calcom_username ? (
                          <div className="inline-flex items-center gap-1 mt-0.5"
                            style={{ fontSize: 9.5, background: '#EFF6FF', color: '#1565C0', padding: '2px 7px', borderRadius: 10, fontWeight: 500 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                            Cal.com connected
                          </div>
                        ) : (
                          <div style={{ fontSize: 10.5, color: '#6b7280', marginTop: 1 }}>
                            {c.expertise ?? 'No specialty set'}
                          </div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 10, flexShrink: 0,
                        ...(c.is_active
                          ? { background: '#D1FAE5', color: '#065f46' }
                          : { background: '#FEF3C7', color: '#92400e' }),
                      }}>
                        {c.is_active ? 'Active' : 'Setup'}
                      </span>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {!loading && !error && activeTab !== 'Overview' && (
            <div className="flex items-center justify-center h-48" style={{ color: '#9ca3af' }}>
              <p style={{ fontSize: 13 }}>{activeTab} — coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
