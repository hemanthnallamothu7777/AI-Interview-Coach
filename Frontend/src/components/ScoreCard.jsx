/**
 * ScoreCard — displays AI evaluation result inline in the chat.
 * Shows score ring, feedback, improvement tip, and optional follow-up.
 */

/** Determine score color: red < 5, yellow < 7, green >= 7 */
function getScoreColor(score) {
  if (score >= 8) return { ring: 'from-emerald-400 to-green-500', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
  if (score >= 6) return { ring: 'from-yellow-400 to-orange-400', badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' }
  return { ring: 'from-red-400 to-rose-500', badge: 'bg-red-500/20 text-red-300 border-red-500/30' }
}

function getScoreLabel(score) {
  if (score >= 9) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 5) return 'Average'
  return 'Needs Work'
}

/**
 * @param {{ evaluation: { score: number, feedback: string, improvement: string, follow_up?: string } }} props
 */
export default function ScoreCard({ evaluation }) {
  if (!evaluation) return null

  const { score, feedback, improvement, follow_up } = evaluation
  const colors = getScoreColor(score)

  return (
    <div className="glass-card p-4 space-y-3 rounded-2xl rounded-tl-sm border-white/10">
      {/* Score header */}
      <div className="flex items-center gap-3">
        {/* Score ring */}
        <div className={`relative flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${colors.ring} p-0.5 shadow-lg`}>
          <div className="w-full h-full rounded-full bg-dark-800 flex flex-col items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">{score}</span>
            <span className="text-white/40 text-[9px]">/10</span>
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Evaluation</p>
          <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs rounded-full border ${colors.badge} font-medium`}>
            {getScoreLabel(score)}
          </span>
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-1">
        <p className="text-white/50 text-xs font-medium uppercase tracking-wide">Feedback</p>
        <p className="text-white/85 text-sm leading-relaxed">{feedback}</p>
      </div>

      {/* Improvement */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 space-y-1">
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-violet-300 text-xs font-medium uppercase tracking-wide">Tip to Improve</p>
        </div>
        <p className="text-white/80 text-sm leading-relaxed">{improvement}</p>
      </div>

      {/* Follow-up question */}
      {follow_up && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-3 space-y-1">
          <p className="text-cyan-300 text-xs font-medium uppercase tracking-wide">Follow-up</p>
          <p className="text-white/80 text-sm italic leading-relaxed">"{follow_up}"</p>
        </div>
      )}
    </div>
  )
}
