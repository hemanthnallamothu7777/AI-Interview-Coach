/**
 * ScoreCard — displays AI evaluation result inline in the chat.
 */

function getScoreColor(score) {
  if (score >= 8) return { ring: '#16a34a', badge: { background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' } }
  if (score >= 6) return { ring: '#d97706', badge: { background: 'rgba(217,119,6,0.1)', color: '#d97706', border: '1px solid rgba(217,119,6,0.25)' } }
  return { ring: '#dc2626', badge: { background: 'rgba(220,38,38,0.1)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)' } }
}

function getScoreLabel(score) {
  if (score >= 9) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 5) return 'Average'
  return 'Needs Work'
}

export default function ScoreCard({ evaluation }) {
  if (!evaluation) return null

  const { score, feedback, improvement, follow_up } = evaluation
  const colors = getScoreColor(score)

  return (
    <div className="glass-card p-4 space-y-3 rounded-2xl rounded-tl-sm">
      {/* Score header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0 w-14 h-14 rounded-full p-0.5"
          style={{ background: colors.ring, boxShadow: `0 4px 12px ${colors.ring}40` }}>
          <div className="w-full h-full rounded-full flex flex-col items-center justify-center"
            style={{ background: '#FFFFFF' }}>
            <span className="font-bold text-lg leading-none" style={{ color: '#1C1410' }}>{score}</span>
            <span className="text-[9px]" style={{ color: '#9E9189' }}>/10</span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: '#1C1410' }}>Evaluation</p>
          <span className="inline-block mt-0.5 px-2 py-0.5 text-xs rounded-full font-medium" style={colors.badge}>
            {getScoreLabel(score)}
          </span>
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#9E9189' }}>Feedback</p>
        <p className="text-sm leading-relaxed" style={{ color: '#1C1410' }}>{feedback}</p>
      </div>

      {/* Improvement */}
      <div className="rounded-xl p-3 space-y-1"
        style={{ background: 'rgba(196,92,26,0.07)', border: '1px solid rgba(196,92,26,0.18)' }}>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" style={{ color: '#C45C1A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#C45C1A' }}>Tip to Improve</p>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: '#1C1410' }}>{improvement}</p>
      </div>

      {/* Follow-up question */}
      {follow_up && (
        <div className="rounded-xl p-3 space-y-1"
          style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#6B6358' }}>Follow-up</p>
          <p className="text-sm italic leading-relaxed" style={{ color: '#1C1410' }}>"{follow_up}"</p>
        </div>
      )}
    </div>
  )
}
