import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8000'

export default function Landing() {
  const navigate = useNavigate()

  // OAuth callbacks land here when the backend redirects to FRONTEND_URL with
  // no /chat suffix. Forward to the chat UI, preserving query params.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('calcom_connected') || params.get('google_connected')) {
      navigate(`/chat?${params.toString()}`, { replace: true })
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#F4F6FA' }}>
      <div className="w-full max-w-sm">

        {/* Logo + tagline */}
        <div className="text-center mb-7">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src="/src/assets/logo.png" alt="Technovation" style={{ width: 52, height: 52, objectFit: 'contain', marginBottom: 6 }} />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 20, color: '#1565C0', letterSpacing: '-0.01em' }}>
              TECHNOVATION
            </span>
          </div>
          <p style={{ fontSize: 15, color: '#4b5563' }}>How can I help you today?</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <button
            onClick={() => navigate('/chat?role=participant')}
            className="text-left bg-white transition-all"
            style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 12px', cursor: 'pointer' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#1565C0'
              ;(e.currentTarget as HTMLElement).style.background = '#EFF6FF'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
              ;(e.currentTarget as HTMLElement).style.background = '#fff'
            }}
          >
            <div className="flex items-center justify-center mb-2"
              style={{ width: 32, height: 32, borderRadius: 8, background: '#DBEAFE' }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5" stroke="#1565C0" strokeWidth="1.5" />
                <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span className="block font-semibold" style={{ fontSize: 13, color: '#111827' }}>Participant</span>
            <span className="block mt-0.5" style={{ fontSize: 11, color: '#6b7280' }}>Find &amp; book a coach</span>
          </button>

          <button
            onClick={() => { window.location.href = `${API_URL}/auth/calcom/login` }}
            className="text-left bg-white transition-all"
            style={{ border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '14px 12px', cursor: 'pointer' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#1565C0'
              ;(e.currentTarget as HTMLElement).style.background = '#EFF6FF'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
              ;(e.currentTarget as HTMLElement).style.background = '#fff'
            }}
          >
            <div className="flex items-center justify-center mb-2"
              style={{ width: 32, height: 32, borderRadius: 8, background: '#FEF3C7' }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <path d="M10 2l2.4 5 5.6.8-4 3.9 1 5.5L10 14.5 4.9 17.2l1-5.5L2 7.8l5.6-.8L10 2z"
                  stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="block font-semibold" style={{ fontSize: 13, color: '#111827' }}>Coach</span>
            <span className="block mt-0.5" style={{ fontSize: 11, color: '#6b7280' }}>Manage your schedule</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="flex-1 h-px" style={{ background: '#e8ecf2' }} />
          <span style={{ fontSize: 11, color: '#9ca3af' }}>or sign in with</span>
          <div className="flex-1 h-px" style={{ background: '#e8ecf2' }} />
        </div>

        {/* Google sign-in */}
        <button
          onClick={() => navigate('/chat')}
          className="w-full flex items-center justify-center gap-2 bg-white transition-colors"
          style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 500, color: '#374151', cursor: 'pointer' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

      </div>
    </div>
  )
}
