import { useEffect, useMemo, useRef, useState } from 'react'
import { createMusic } from './music.js'

/* ===================== CONFIGURA AQUÍ ===================== */
const EVENTO = {
  fechaTexto: 'XX de Diciembre 2026', // cámbialo cuando haya fecha (ej. '20 de Diciembre 2026')
  fechaCuentaRegresiva: '2026-12-20T20:00:00', // fecha tentativa para la cuenta regresiva
  hora: 'De 8:00 PM a 12:00 de la noche',
  lugar: 'Lugar por confirmar',
  direccion: 'Dirección por confirmar',
  mapsUrl: 'https://maps.google.com', // pega aquí el link de Google Maps
}
/* ========================================================== */

const Snow = () => {
  const flakes = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 4 + Math.random() * 8,
        dur: 8 + Math.random() * 12,
        delay: -Math.random() * 20,
        drift: (Math.random() - 0.5) * 120,
        op: 0.4 + Math.random() * 0.6,
      })),
    []
  )
  return (
    <div className="snow" aria-hidden>
      {flakes.map((f) => (
        <span
          key={f.id}
          style={{
            left: `${f.left}%`,
            width: f.size,
            height: f.size,
            opacity: f.op,
            animationDuration: `${f.dur}s`,
            animationDelay: `${f.delay}s`,
            '--drift': `${f.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

const Lights = () => (
  <div className="lights" aria-hidden>
    <svg className="wire" viewBox="0 0 1000 60" preserveAspectRatio="none">
      <path d="M0,10 Q125,55 250,10 T500,10 T750,10 T1000,10" />
    </svg>
    {Array.from({ length: 18 }, (_, i) => (
      <span key={i} className={`bulb c${i % 4}`} style={{ left: `${(i + 0.5) * (100 / 18)}%`, animationDelay: `${(i % 4) * 0.35}s`, top: `${10 + Math.abs(Math.sin(((i + 0.5) / 18) * Math.PI * 4)) * 26}px` }} />
    ))}
  </div>
)

const Cactus = ({ className }) => (
  <svg className={className} viewBox="0 0 120 200" aria-hidden>
    <path fill="#2f6b3a" d="M50 200V40a10 10 0 0 1 20 0v160z" />
    <path fill="#2f6b3a" d="M50 120H30a10 10 0 0 1-10-10V70a8 8 0 0 1 16 0v34h14zM70 100h16V60a8 8 0 0 1 16 0v40a10 10 0 0 1-10 10H70z" />
    <circle cx="60" cy="32" r="7" fill="#c41e3a" />
    <circle cx="52" cy="30" r="4" fill="#1e7a3c" />
    <circle cx="68" cy="30" r="4" fill="#1e7a3c" />
    <path d="M38 196h44" stroke="#6b3e1e" strokeWidth="8" strokeLinecap="round" />
  </svg>
)

const Hat = () => (
  <svg className="hat" viewBox="0 0 200 110" aria-hidden>
    <path fill="#8b5a2b" d="M60 70c0-40 10-60 40-60s40 20 40 60z" />
    <path fill="#6b3e1e" d="M100 10c-8 0-14 10-14 22 4-6 24-6 28 0 0-12-6-22-14-22z" />
    <rect x="60" y="58" width="80" height="12" fill="#c41e3a" />
    <circle cx="100" cy="64" r="5" fill="#f2c14e" />
    <path fill="#a0693a" d="M5 78c20 20 170 20 190 0-10 18-40 28-95 28S15 96 5 78z" />
    <path fill="#a0693a" d="M10 72c30 14 150 14 180 0v10c-30 14-150 14-180 0z" />
    {/* gorrito navideño */}
    <path fill="#c41e3a" d="M118 14c20-6 40 2 50 22l-12 4c-6-12-20-18-34-14z" />
    <circle cx="164" cy="42" r="7" fill="#fff" />
  </svg>
)

function useCountdown(target) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const diff = Math.max(0, new Date(target).getTime() - now)
  return {
    días: Math.floor(diff / 864e5),
    horas: Math.floor((diff / 36e5) % 24),
    min: Math.floor((diff / 6e4) % 60),
    seg: Math.floor((diff / 1e3) % 60),
  }
}

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setSeen(true), { threshold: 0.15 })
    ref.current && io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

const aportes = [
  { icon: '🥤', t: 'Refrescos' },
  { icon: '🧊', t: 'Hielo' },
  { icon: '🍗', t: 'Botana' },
  { icon: '🌮', t: 'Comida' },
  { icon: '🍰', t: 'Postre' },
  { icon: '🍺', t: 'Lo que gustes' },
]

export default function App() {
  const [open, setOpen] = useState(false)
  const [sound, setSound] = useState(false)
  const music = useMemo(() => createMusic(), [])
  const abrir = () => { setOpen(true); music.play(); setSound(true) }
  const toggle = () => { sound ? music.stop() : music.play(); setSound(!sound) }
  const cd = useCountdown(EVENTO.fechaCuentaRegresiva)

  return (
    <main className={open ? 'is-open' : ''}>
      <Snow />

      {/* ---------- SOBRE / INTRO ---------- */}
      <section className={`envelope-screen ${open ? 'gone' : ''}`}>
        <div className="envelope" onClick={abrir}>
          <div className="env-back" />
          <div className="env-letter">
            <span>🤠</span>
          </div>
          <div className="env-front" />
          <div className="env-flap" />
          <div className="seal">★</div>
        </div>
        <p className="tap">Toca el sobre, compadre</p>
        <button className="btn-open" onClick={abrir}>
          Abrir invitación
        </button>
      </section>

      {/* ---------- INVITACIÓN ---------- */}
      {open && (
        <button className={`music-btn ${sound ? 'on' : ''}`} onClick={toggle} aria-label={sound ? 'Silenciar música' : 'Reproducir música'}>
          {sound ? '🔊' : '🔇'}<span>{sound ? 'Música' : 'Sin música'}</span>
        </button>
      )}

      {open && (
        <div className="content">
          <Lights />

          <header className="hero">
            <Hat />
            <p className="kicker">¡Yeehaw! Están cordialmente invitados a la</p>
            <h1 className="title">
              <span className="t1">Posada</span>
              <span className="t2">Navideña</span>
              <span className="t3">Vaquera</span>
            </h1>
            <p className="year">✦ 2026 ✦</p>
            <p className="sub">Para convivir con los amigos del trabajo</p>
            <div className="scroll-hint">▼</div>
            <Cactus className="cactus left" />
            <Cactus className="cactus right" />
          </header>

          <section className="wanted-wrap">
            <Reveal className="wanted">
              <div className="nails"><i /><i /><i /><i /></div>
              <h2 className="se-busca">SE BUSCA</h2>
              <p className="wanted-sub">a toda la banda para la posada</p>
              <div className="divider">⭐ 🎄 ⭐</div>

              <div className="info-grid">
                <div className="info">
                  <span className="ic">📅</span>
                  <small>Fecha (tentativa)</small>
                  <strong>{EVENTO.fechaTexto}</strong>
                </div>
                <div className="info">
                  <span className="ic">🕗</span>
                  <small>Hora (tentativa)</small>
                  <strong>{EVENTO.hora}</strong>
                </div>
                <div className="info">
                  <span className="ic">📍</span>
                  <small>Ubicación</small>
                  <strong>{EVENTO.lugar}</strong>
                  <em>{EVENTO.direccion}</em>
                  <a className="maps" href={EVENTO.mapsUrl} target="_blank" rel="noreferrer">
                    Ver en Google Maps →
                  </a>
                </div>
              </div>

              <div className="reward">
                <small>Recompensa</small>
                <strong>¡Una noche inolvidable!</strong>
              </div>
            </Reveal>
          </section>

          <section className="countdown">
            <Reveal>
              <h3 className="section-title">Faltan</h3>
              <div className="cd-grid">
                {Object.entries(cd).map(([k, v]) => (
                  <div key={k} className="cd-box">
                    <b>{String(v).padStart(2, '0')}</b>
                    <span>{k}</span>
                  </div>
                ))}
              </div>
              <p className="note">*Cuenta regresiva con fecha tentativa</p>
            </Reveal>
          </section>

          <section className="features">
            <Reveal delay={0} className="card">
              <span className="big">🎻🪗</span>
              <h4>¡Norteño en vivo!</h4>
              <p>Saca las botas y prepárate para zapatear toda la noche.</p>
            </Reveal>
            <Reveal delay={150} className="card">
              <span className="big">🤠👢</span>
              <h4>Código de vestimenta</h4>
              <p>Ven de vaquero: sombrero, botas, cinto pitiado y camisa a cuadros.</p>
            </Reveal>
            <Reveal delay={300} className="card">
              <span className="big">🎁🎄</span>
              <h4>Espíritu navideño</h4>
              <p>Piñatas, ponche, villancicos con acordeón y buena compañía.</p>
            </Reveal>
          </section>

          <section className="traje">
            <Reveal>
              <h3 className="section-title">Es de traje</h3>
              <p className="traje-sub">Cada quien trae su aportación para la mesa del rancho 🍽️</p>
              <div className="aportes">
                {aportes.map((a, i) => (
                  <div key={a.t} className="aporte" style={{ animationDelay: `${i * 0.2}s` }}>
                    <span>{a.icon}</span>
                    <p>{a.t}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <footer className="foot">
            <Reveal>
              <p className="foot-big">¡Los esperamos, vaqueros!</p>
              <p className="foot-small">🌵 Feliz Navidad y próspero Año Nuevo 🌵</p>
              <div className="horseshoe">🐴</div>
            </Reveal>
          </footer>
        </div>
      )}
    </main>
  )
}
