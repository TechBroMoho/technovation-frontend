import { useState, useEffect } from 'react'
import { getBookings, getCoaches, cancelBooking } from '../api/client'
import type { Booking, Coach } from '../types'

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, React.CSSProperties> = {
    confirmed: { background: '#D1FAE5', color: '#065f46' },
    cancelled:  { background: '#F3F4F6', color: '#6b7280' },
    pending:    { background: '#FEF3C7', color: '#92400e' },
  }
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full"
      style={styles[status] ?? { background: '#F3F4F6', color: '#6b7280' }}>
      {status}
    </span>
  )
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
    time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    day:  d.getDate(),
    mon:  d.toLocaleDateString([], { month: 'short' }),
  }
}

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [coaches, setCoaches] = useState<Record<number, Coach>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<number | null>(null)

  useEffect(() => {
    Promise.all([getBookings(), getCoaches()])
      .then(([bks, chs]) => {
        setBookings(bks)
        const map: Record<number, Coach> = {}
        chs.forEach(c => { map[c.id] = c })
        setCoaches(map)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (id: number) => {
    if (!confirm('Cancel this booking?')) return
    setCancelling(id)
    try {
      const updated = await cancelBooking(id)
      setBookings(prev => prev.map(b => b.id === id ? updated : b))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cancel failed')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'Nunito, sans-serif', color: '#111827' }}>
            Bookings
          </h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>All scheduled coaching sessions</p>
        </div>
        {!loading && (
          <span className="text-sm" style={{ color: '#9ca3af' }}>
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading && (
        <div className="card p-4 space-y-3 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-lg" style={{ background: '#F9FAFB' }}></div>)}
        </div>
      )}

      {error && (
        <div className="card p-6 text-center">
          <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>
          <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>Is the backend running at localhost:8000?</p>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="card p-10 text-center" style={{ color: '#9ca3af' }}>
          <p className="text-base mb-1">No bookings yet</p>
          <p className="text-sm">Sessions booked through the chat will appear here.</p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map(b => {
            const { time, day, mon } = formatDateTime(b.start_time)
            const coach = coaches[b.coach_id]
            return (
              <div key={b.id} className="card p-4 flex items-center gap-4">
                {/* Date column */}
                <div className="w-9 text-center shrink-0">
                  <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 22, color: '#1565C0', lineHeight: 1 }}>
                    {day}
                  </div>
                  <div className="text-xs uppercase" style={{ color: '#9ca3af' }}>{mon}</div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold" style={{ color: '#111827' }}>
                    {coach?.name ?? `Coach #${b.coach_id}`}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                    {time} · Participant #{b.participant_id}
                  </div>
                </div>

                {/* Status */}
                <StatusBadge status={b.status} />

                {/* Meeting link */}
                {b.meeting_link && (
                  <a href={b.meeting_link} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium" style={{ color: '#1565C0' }}>
                    Join →
                  </a>
                )}

                {/* Cancel */}
                {b.status === 'confirmed' && (
                  <button onClick={() => handleCancel(b.id)} disabled={cancelling === b.id}
                    className="text-xs font-medium disabled:opacity-50 transition-colors"
                    style={{ color: '#DC2626' }}>
                    {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
