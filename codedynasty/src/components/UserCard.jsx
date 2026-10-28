export default function UserCard({ user, index }) {
  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.9rem',
      padding: '0.85rem 1rem',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: `hsl(${(index * 47 + 200) % 360}, 60%, 25%)`,
        border: `2px solid hsl(${(index * 47 + 200) % 360}, 60%, 45%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--mono)', fontWeight: 600, fontSize: '0.75rem',
        color: `hsl(${(index * 47 + 200) % 360}, 80%, 75%)`,
        flexShrink: 0,
      }}>
        {initials}
      </div>
      <div>
        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{user.name}</div>
        <div style={{ color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'var(--mono)' }}>{user.email}</div>
      </div>
      <div style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
        #{String(index + 1).padStart(3, '0')}
      </div>
    </div>
  )
}
