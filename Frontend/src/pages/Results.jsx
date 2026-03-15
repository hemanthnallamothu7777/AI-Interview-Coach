/**
 * Results page — comprehensive final interview report.
 * Receives report data via React Router state from Interview.jsx.
 *
 * Displays:
 *  - Overall score with visual ring
 *  - Performance summary
 *  - Strengths & weaknesses
 *  - Improvement plan
 *  - Per-question breakdown
 */

import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

/** Determine color theme based on score (1-10) */
function scoreTheme(score) {
  if (score >= 8) return { gradient: 'from-emerald-400 to-green-500', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Excellent' }
  if (score >= 6) return { gradient: 'from-yellow-400 to-orange-400', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Good' }
  if (score >= 4) return { gradient: 'from-orange-400 to-red-400', text: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Average' }
  return { gradient: 'from-red-400 to-rose-500', text: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'Needs Work' }
}

function ScoreRing({ score, max = 10 }) {
  const theme = scoreTheme(score)
  const pct = Math.round((score / max) * 100)
  // SVG circle parameters
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className={`transition-all duration-1000 ease-out`}
          style={{ stroke: 'url(#scoreGrad)' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${theme.text}`}>{score.toFixed(1)}</span>
        <span className="text-white/40 text-xs">out of 10</span>
      </div>
    </div>
  )
}

function Section({ icon, title, children }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ListItem({ text, color = 'violet' }) {
  const colors = {
    violet: 'text-violet-400',
    emerald: 'text-emerald-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
  }
  return (
    <li className="flex items-start gap-2 text-white/80 text-sm">
      <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors[color]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

  // Redirect if no report data
  useEffect(() => {
    if (!report) navigate('/', { replace: true })
  }, [report, navigate])

  if (!report) return null

  const theme = scoreTheme(report.overall_score)

  return (
    <div className="min-h-screen bg-dark-900 relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-sm text-violet-300 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Interview Complete
          </div>
          <h1 className="text-3xl font-bold text-white">Your Interview Report</h1>
          <p className="text-white/40 text-sm">{role} · {difficulty} difficulty</p>
        </div>

        {/* ── Overall score card ──────────────────────────────────────── */}
        <div className="glass-card p-6 text-center space-y-4">
          <ScoreRing score={report.overall_score} />
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${theme.bg} ${theme.text} mb-2`}>
              {theme.label}
            </span>
            <p className="text-white/70 text-sm leading-relaxed max-w-md mx-auto">
              {report.summary}
            </p>
          </div>
        </div>

        {/* ── Strengths ───────────────────────────────────────────────── */}
        {report.strengths?.length > 0 && (
          <Section icon="💪" title="Strengths">
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <ListItem key={i} text={s} color="emerald" />
              ))}
            </ul>
          </Section>
        )}

        {/* ── Weaknesses ──────────────────────────────────────────────── */}
        {report.weaknesses?.length > 0 && (
          <Section icon="⚠️" title="Areas to Improve">
            <ul className="space-y-2">
              {report.weaknesses.map((w, i) => (
                <ListItem key={i} text={w} color="red" />
              ))}
            </ul>
          </Section>
        )}

        {/* ── Improvement plan ────────────────────────────────────────── */}
        {report.improvement_plan?.length > 0 && (
          <Section icon="🗺️" title="Your Improvement Plan">
            <ol className="space-y-2">
              {report.improvement_plan.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-white/80">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 text-xs font-bold">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* ── Per-question breakdown ──────────────────────────────────── */}
        {evaluations.length > 0 && (
          <Section icon="📋" title="Question-by-Question Breakdown">
            <div className="space-y-4">
              {evaluations.map((ev, i) => {
                const t = scoreTheme(ev.score)
                return (
                  <div key={i} className="border border-white/5 rounded-xl p-4 space-y-2 bg-white/2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-white/70 text-sm font-medium leading-snug flex-1">
                        Q{i + 1}: {ev.question}
                      </p>
                      <span className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold border bg-gradient-to-br ${t.gradient} bg-clip-text`}
                        style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}>
                        <span className={`text-sm font-bold ${t.text}`}>{ev.score}</span>
                      </span>
                    </div>
                    <p className="text-white/50 text-xs leading-relaxed">{ev.feedback}</p>
                    <div className="text-xs text-violet-300/80 bg-violet-500/10 rounded-lg px-3 py-2">
                      💡 {ev.improvement}
                    </div>
                  </div>
                )
              })}
            </div>
          </Section>
        )}

        {/* ── CTA buttons ─────────────────────────────────────────────── */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/interview', { state: { role, difficulty, interviewType: 'text' } })}
            className="btn-primary flex-1 py-4 text-base"
          >
            Practice Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex-1 py-4"
          >
            Change Settings
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs pb-4">
          Report generated by AI Interview Coach · Powered by OpenAI
        </p>
      </div>
    </div>
  )
}
