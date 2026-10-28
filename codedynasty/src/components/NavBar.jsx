import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function NavBar() {
  const { isAuth, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 2rem', height: '60px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--surface)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <Link to="/" style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '1.1rem', color: 'var(--accent-hi)', letterSpacing: '-0.5px' }}>
        Code<span style={{ color: 'var(--accent)' }}>Dynasty</span>
      </Link>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuth ? (
          <>
            <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {user?.name}
            </span>
            <Link to="/dashboard" style={{ color: 'var(--text)', fontSize: '0.9rem' }}>Dashboard</Link>
            <button onClick={handleLogout} style={{
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--muted)', padding: '0.35rem 0.9rem',
              borderRadius: '6px', fontSize: '0.85rem',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.target.style.borderColor = 'var(--danger)'}
              onMouseLeave={e => e.target.style.borderColor = 'var(--border)'}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Sign in</Link>
            <Link to="/signup" style={{
              background: 'var(--accent)', color: '#fff',
              padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.9rem',
            }}>
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
