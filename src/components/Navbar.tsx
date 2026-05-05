import { Link, useLocation } from 'react-router-dom'

const links = [
  { to: '/',         label: 'Home'     },
  { to: '/coaches',  label: 'Coaches'  },
  { to: '/bookings', label: 'Bookings' },
]

function TechnovationLogo() {
  return (
    <div className="flex items-center gap-2">
      <img src="/src/assets/logo.png" alt="Technovation" style={{ width: 38, height: 38, objectFit: 'contain', marginBottom: 4 }} />
      <span style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 15, color: '#1565C0', letterSpacing: '-0.01em' }}>
        TECHNOVATION
      </span>
    </div>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e8ecf2', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/">
          <TechnovationLogo />
        </Link>

        <div className="flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              style={pathname === to
                ? { background: '#EFF6FF', color: '#1565C0' }
                : { color: '#6b7280' }
              }
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
