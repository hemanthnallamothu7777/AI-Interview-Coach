/**
 * QuestionCard — shows current question number and progress bar.
 * Displayed at the top of the Interview page.
 */

/**
 * @param {{ current: number, total: number, role: string, difficulty: string }} props
 */
export default function QuestionCard({ current, total, role, difficulty }) {
  const progress = total > 0 ? ((current) / total) * 100 : 0

  const difficultyColors = {
    Easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    Hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="glass-card px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Role badge */}
          <span className="text-sm font-medium text-white/80">{role}</span>
          <span className="text-white/20">·</span>
          {/* Difficulty badge */}
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColors[difficulty] || difficultyColors.Medium}`}>
            {difficulty}
          </span>
        </div>

        {/* Question counter */}
        <span className="text-sm text-white/50">
          {current < total ? (
            <span>Question <span className="text-white font-semibold">{current + 1}</span> of {total}</span>
          ) : (
            <span className="text-violet-400 font-medium">All done!</span>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
