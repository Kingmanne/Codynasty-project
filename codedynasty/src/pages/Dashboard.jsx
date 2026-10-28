import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { listUsers } from '../api/users'
import UserCard from '../components/UserCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await listUsers()
        setUsers(res.data.users || [])
      } catch (err) {
        setError('Could not load members. Lambda may not be deployed yet.')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  return (
    <main style={{ maxWidth: '700px', margin: '0 auto', padding: '3rem 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Welcome back
        </p>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          {user?.name}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', fontFamily: 'var(--mono)', marginTop: '0.3rem' }}>
          {user?.email}
        </p>
      </div>

      {/* Registry */}
      <div style={{
        border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden',
      }}>
        <div style={{
          padding: '1rem 1.2rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--surface)',
        }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Dynasty Registry
          </span>
          {!loading && (
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem',
              background: 'rgba(124,58,237,0.15)', color: 'var(--accent-hi)',
              padding: '0.2rem 0.6rem', borderRadius: '4px',
            }}>
              {users.length} member{users.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', minHeight: '120px' }}>
          {loading && (
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '0.85rem', textAlign: 'center', marginTop: '1.5rem' }}>
              Querying DynamoDB...
            </p>
          )}
          {error && (
            <p style={{ color: 'var(--danger)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
              ✗ {error}
            </p>
          )}
          {!loading && !error && users.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem', textAlign: 'center', marginTop: '1.5rem' }}>
              No members yet. You might be the first.
            </p>
          )}
          {users.map((u, i) => (
            <UserCard key={u.email || i} user={u} index={i} />
          ))}
        </div>
      </div>
    </main>
  )
}
