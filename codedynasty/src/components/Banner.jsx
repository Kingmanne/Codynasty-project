// Driven by AppConfig show_new_banner flag
export default function Banner({ message }) {
  return (
    <div style={{
      background: 'linear-gradient(90deg, var(--accent) 0%, #4f46e5 100%)',
      color: '#fff', textAlign: 'center',
      padding: '0.5rem 1rem', fontSize: '0.85rem',
      fontFamily: 'var(--mono)',
    }}>
      🚀 {message || 'CodeDynasty is live — welcome to the dynasty.'}
    </div>
  )
}
