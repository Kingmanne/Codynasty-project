export default function MaintenanceScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
      background: 'var(--bg)',
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '3rem' }}>⚙️</div>
      <h2 style={{ fontFamily: 'var(--mono)', color: 'var(--accent-hi)' }}>Under maintenance</h2>
      <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>We'll be back shortly. Check back soon.</p>
    </div>
  )
}
