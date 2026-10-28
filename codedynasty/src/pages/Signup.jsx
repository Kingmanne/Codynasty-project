import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await signUp(form.name, form.email, form.password)
      login(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.6rem', letterSpacing: '-0.5px', marginBottom: '0.4rem' }}>Create your account</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Your name joins the dynasty registry instantly.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { name: 'name', placeholder: 'Full name', type: 'text' },
            { name: 'email', placeholder: 'Email address', type: 'email' },
            { name: 'password', placeholder: 'Password', type: 'password' },
          ].map(field => (
            <input
              key={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder}
              value={form[field.name]}
              onChange={handleChange}
              required
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '0.75rem 1rem',
                borderRadius: '8px', fontSize: '0.9rem', width: '100%',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          ))}

          {error && (
            <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontFamily: 'var(--mono)' }}>
              ✗ {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--border)' : 'var(--accent)',
              color: '#fff', padding: '0.8rem',
              borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem',
              transition: 'opacity 0.2s',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Registering...' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          Already in the dynasty?{' '}
          <Link to="/login" style={{ color: 'var(--accent-hi)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
