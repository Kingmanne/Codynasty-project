import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '2rem',
        background: 'var(--bg-secondary)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          background: 'radial-gradient(circle, var(--shadow) 0%, transparent 70%)',
          top: '-200px', right: '-200px',
          animation: 'float 8s ease-in-out infinite', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: '400px', height: '400px',
          background: 'radial-gradient(circle, var(--shadow) 0%, transparent 70%)',
          bottom: '-150px', left: '-150px',
          animation: 'float 6s ease-in-out infinite reverse', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: '900px', zIndex: 1 }}>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 6vw, 4rem)',
            fontWeight: 700, lineHeight: 1.2,
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            animation: 'fadeInUp 1s ease-out',
          }}>
            From Zero to Hero in{' '}
            <span style={{
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', display: 'inline-block',
            }}>
              DevOps
            </span>
            {' '}& Software Engineering
          </h1>

          <p style={{
            fontSize: '1.3rem', color: 'var(--text-secondary)',
            marginBottom: '2.5rem', lineHeight: 1.7,
            animation: 'fadeInUp 1s ease-out 0.3s backwards',
          }}>
            Build your tech career with industry-leading tools and practices.
            Learn DevOps Engineering, Frontend, Backend, Mobile Development
            and Cloud Engineering from experts.
          </p>

          <div style={{
            display: 'flex', gap: '1.5rem', justifyContent: 'center',
            flexWrap: 'wrap',
            animation: 'fadeInUp 1s ease-out 0.6s backwards',
          }}>
            <Link to="/signup" style={{
              padding: '1.2rem 3rem',
              background: 'var(--accent-gradient)',
              color: '#fff', borderRadius: '50px',
              fontSize: '1.1rem', fontWeight: 700,
              boxShadow: '0 10px 30px var(--shadow-hover)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              display: 'inline-block',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 15px 40px var(--shadow-hover)' }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px var(--shadow-hover)' }}
            >
              Start Learning
            </Link>
            <Link to="/login" style={{
              padding: '1.2rem 3rem',
              background: 'transparent',
              border: '2px solid var(--accent-primary)',
              color: 'var(--accent-primary)',
              borderRadius: '50px', fontSize: '1.1rem', fontWeight: 700,
              transition: 'all 0.3s', display: 'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--shadow)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '4rem 5%', background: 'var(--bg-primary)' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem', maxWidth: '1200px', margin: '0 auto', textAlign: 'center',
        }}>
          {[
            { number: '100+', label: 'Students Trained' },
            { number: '95%',  label: 'Job Placement Rate' },
            { number: '10+',  label: 'Industry Partners' },
            { number: '4.9/5', label: 'Student Rating' },
          ].map(s => (
            <div key={s.label} style={{
              padding: '2rem', background: 'var(--bg-card)',
              borderRadius: '20px', border: '1px solid var(--border)',
              transition: 'all 0.3s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 30px var(--shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                fontSize: '3.2rem', fontWeight: 700,
                background: 'var(--accent-gradient)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
              }}>{s.number}</div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES ── */}
      <section style={{ padding: '6rem 5%', background: 'var(--bg-secondary)' }}>
        <h2 style={{
          textAlign: 'center', fontSize: 'clamp(2rem, 4vw, 3rem)',
          marginBottom: '4rem', color: 'var(--text-primary)', fontWeight: 700,
        }}>
          Our{' '}
          <span style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Programs</span>
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2.5rem', maxWidth: '1400px', margin: '0 auto',
        }}>
          {[
            { icon: '♾️', title: 'DevOps Engineering',    desc: 'Master CI/CD pipelines, infrastructure automation, and cloud deployment strategies with hands-on projects.' },
            { icon: '💻', title: 'Software Engineering',  desc: 'Learn best practices, design patterns, and architecture for scalable applications from industry experts.' },
            { icon: '🎨', title: 'Frontend Development',  desc: 'Build stunning, responsive user interfaces with modern frameworks like React, Vue, and Angular.' },
            { icon: '🖥️', title: 'Backend Development',   desc: 'Create robust APIs, databases, and server-side applications with Node.js, Python, and Go.' },
            { icon: '📱', title: 'Mobile Development',    desc: 'Develop fully-fledged mobile applications with beautiful user interfaces for iOS and Android.' },
            { icon: '☁️', title: 'Cloud Architecture',    desc: 'Design and implement scalable cloud solutions using AWS, Azure, and Google Cloud Platform.' },
          ].map(c => (
            <div key={c.title} style={{
              background: 'var(--bg-card)', padding: '2.5rem',
              borderRadius: '20px', textAlign: 'center',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 15px var(--shadow)',
              transition: 'all 0.3s', position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 15px 40px var(--shadow-hover)'; e.currentTarget.style.borderColor = 'var(--accent-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px var(--shadow)'; e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <div style={{ fontSize: '3.5rem', marginBottom: '1.2rem' }}>{c.icon}</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text-primary)' }}>{c.title}</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1rem' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '6rem 5%', background: 'var(--bg-primary)' }}>
        <h2 style={{
          textAlign: 'center', fontSize: 'clamp(2rem, 4vw, 3rem)',
          marginBottom: '4rem', color: 'var(--text-primary)', fontWeight: 700,
        }}>
          Success{' '}
          <span style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Stories</span>
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2.5rem', maxWidth: '1200px', margin: '0 auto',
        }}>
          {[
            { initials: 'CA', name: 'Chukwuemeka Adebayo', role: 'DevOps Engineer @ Amazon',    quote: 'CodeDynasty transformed my career. Within 6 months, I landed my dream DevOps role at a Fortune 500 company!' },
            { initials: 'AO', name: 'Amara Okafor',        role: 'Software Engineer @ Google',  quote: 'The hands-on projects and real-world scenarios prepared me perfectly for industry challenges. Best investment I\'ve made!' },
            { initials: 'OB', name: 'Oluwaseun Balogun',   role: 'Cloud Architect @ Microsoft', quote: 'The instructors are amazing! They explain complex concepts in simple terms and are always ready to help.' },
          ].map(t => (
            <div key={t.name} style={{
              background: 'var(--bg-card)', padding: '2.5rem',
              borderRadius: '20px', border: '1px solid var(--border)',
              boxShadow: '0 4px 15px var(--shadow)',
              transition: 'transform 0.3s, box-shadow 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 40px var(--shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px var(--shadow)' }}
            >
              <p style={{
                fontSize: '1.05rem', color: 'var(--text-secondary)',
                lineHeight: 1.7, marginBottom: '1.5rem', fontStyle: 'italic',
              }}>
                "{t.quote}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '50px', height: '50px', borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1rem', color: '#fff', flexShrink: 0,
                }}>{t.initials}</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>{t.name}</div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--accent-primary)' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOOLS ── */}
      <section style={{ padding: '6rem 5%', background: 'var(--bg-secondary)', textAlign: 'center' }}>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '3rem',
          color: 'var(--text-primary)', fontWeight: 700,
        }}>
          Technologies You Will{' '}
          <span style={{
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Learn</span>
        </h2>
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
          gap: '2rem', maxWidth: '1200px', margin: '0 auto',
        }}>
          {[
            { icon: '☁️', label: 'AWS' },
            { icon: '📊', label: 'Grafana' },
            { icon: '🔥', label: 'Prometheus' },
            { icon: '🏗️', label: 'CodeBuild' },
            { icon: '⚙️', label: 'Ansible' },
            { icon: '🔀', label: 'CodePipeline' },
            { icon: '🐳', label: 'Docker' },
            { icon: '☸️', label: 'Kubernetes' },
            { icon: '🌿', label: 'Git' },
            { icon: '🐙', label: 'GitHub' },
            { icon: '🤖', label: 'Jenkins' },
            { icon: '🐍', label: 'Python' },
            { icon: '🟩', label: 'Node.js' },
          ].map(t => (
            <div key={t.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.8rem', padding: '1.5rem 1.8rem',
              background: 'var(--bg-card)', borderRadius: '15px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 15px var(--shadow)',
              transition: 'transform 0.3s, box-shadow 0.3s',
              minWidth: '90px',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 10px 30px var(--shadow-hover)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px var(--shadow)' }}
            >
              <span style={{ fontSize: '2.8rem' }}>{t.icon}</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: 'var(--navbar-bg)', padding: '3rem 5%',
        textAlign: 'center', borderTop: '1px solid var(--border)',
      }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          © 2025 CodeDynasty. Building the future of AWS DevOps and Software Engineering.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
          {[
            { label: 'LinkedIn', icon: '💼' },
            { label: 'Twitter',  icon: '🐦' },
            { label: 'GitHub',   icon: '🐙' },
            { label: 'YouTube',  icon: '▶️' },
          ].map(s => (
            <a key={s.label} href="#" aria-label={s.label} style={{
              fontSize: '1.6rem', transition: 'transform 0.3s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {s.icon}
            </a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(20px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  )
}