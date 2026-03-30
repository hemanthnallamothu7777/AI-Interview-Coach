/**
 * Results page — comprehensive final interview report.
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

function scoreTheme(score) {
  if (score >= 8) return { stroke: '#16a34a', text: '#16a34a', badge: { background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' }, label: 'Excellent' }
  if (score >= 6) return { stroke: '#d97706', text: '#d97706', badge: { background: 'rgba(217,119,6,0.1)', color: '#d97706', border: '1px solid rgba(217,119,6,0.25)' }, label: 'Good' }
  if (score >= 4) return { stroke: '#C45C1A', text: '#C45C1A', badge: { background: 'rgba(196,92,26,0.1)', color: '#C45C1A', border: '1px solid rgba(196,92,26,0.25)' }, label: 'Average' }
  return           { stroke: '#dc2626', text: '#dc2626', badge: { background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)' }, label: 'Needs Work' }
}

function ScoreRing({ score, max = 10 }) {
  const theme = scoreTheme(score)
  const pct = Math.round((score / max) * 100)
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className="transition-all duration-1000 ease-out"
          style={{ stroke: theme.stroke }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: theme.text }}>{score.toFixed(1)}</span>
        <span className="text-xs" style={{ color: '#9E9189' }}>out of 10</span>
      </div>
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold" style={{ color: '#1C1410' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ListItem({ text, color = 'accent' }) {
  const colors = {
    accent:  '#C45C1A',
    emerald: '#16a34a',
    red:     '#dc2626',
  }
  return (
    <li className="flex items-start gap-2 text-sm" style={{ color: '#1C1410' }}>
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors[color] || colors.accent }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      {text}
    </li>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const location = useLocation()
  const { report, role, difficulty, evaluations = [] } = location.state || {}

  useEffect(() => {
    if (!report) navigate('/', { replace: true })
  }, [report, navigate])

  if (!report) return null

  const theme = scoreTheme(report.overall_score)

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#F9F6F1' }}>
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
          style={{ background: '#C45C1A', opacity: 0.05, filter: 'blur(80px)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
          style={{ background: '#E8834A', opacity: 0.04, filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm mb-2" style={{ color: '#C45C1A' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Interview Complete
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#1C1410' }}>Your Interview Report</h1>
          <p className="text-sm" style={{ color: '#9E9189' }}>{role} · {difficulty} difficulty</p>
        </div>

        {/* ── Overall score ─────────────────────────────────────────── */}
        <div className="glass-card p-6 text-center space-y-4">
          <ScoreRing score={report.overall_score} />
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2" style={theme.badge}>
              {theme.label}
            </span>
            <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: '#6B6358' }}>
              {report.summary}
            </p>
          </div>
        </div>

        {/* ── Strengths ─────────────────────────────────────────────── */}
        {report.strengths?.length > 0 && (
          <Section icon="💪" title="Strengths">
            <ul className="space-y-2">
              {report.strengths.map((s, i) => <ListItem key={i} text={s} color="emerald" />)}
            </ul>
          </Section>
        )}

        {/* ── Weaknesses ────────────────────────────────────────────── */}
        {report.weaknesses?.length > 0 && (
          <Section icon="⚠️" title="Areas to Improve">
            <ul className="space-y-2">
              {report.weaknesses.map((w, i) => <ListItem key={i} text={w} color="red" />)}
            </ul>
          </Section>
        )}

        {/* ── Improvement plan ──────────────────────────────────────── */}
        {report.improvement_plan?.length > 0 && (
          <Section icon="🗺️" title="Your Improvement Plan">
            <ol className="space-y-2">
              {report.improvement_plan.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm" style={{ color: '#1C1410' }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(196,92,26,0.12)', border: '1px solid rgba(196,92,26,0.25)', color: '#C45C1A' }}>
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* ── Per-question breakdown ─────────────────────────────────── */}
        {evaluations.length > 0 && (
          <Section icon="📋" title="Question-by-Question Breakdown">
            <div className="space-y-4">
              {evaluations.map((ev, i) => {
                const t = scoreTheme(ev.score)
                return (
                  <div key={i} className="rounded-xl p-4 space-y-2"
                    style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium leading-snug flex-1" style={{ color: '#1C1410' }}>
                        Q{i + 1}: {ev.question}
                      </p>
                      <span className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
                        style={{ background: 'rgba(255,255,255,0.8)', border: `2px solid ${t.stroke}`, color: t.text }}>
                        {ev.score}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B6358' }}>{ev.feedback}</p>
                    <div className="text-xs rounded-lg px-3 py-2"
                      style={{ background: 'rgba(196,92,26,0.07)', color: '#C45C1A' }}>
                      💡 {ev.improvement}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── CTA buttons ───────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/interview', { state: { role, difficulty, interviewType: 'text' } })}
            className="btn-primary flex-1 py-4 text-base"
          >
            Practice Again
          </button>
          <button onClick={() => navigate('/app')} className="btn-secondary flex-1 py-4">
            Change Settings
          </button>
        </div>

        <p className="text-center text-xs pb-4" style={{ color: '#C5BAB2' }}>
          Report generated by AI Interview Coach · Powered by Claude AI
        </p>
      </div>
    </div>
  )
}
