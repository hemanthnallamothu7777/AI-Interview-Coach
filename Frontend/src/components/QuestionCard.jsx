/**
 * QuestionCard — shows current question number and progress bar.
 */

export default function QuestionCard({ current, total, role, difficulty }) {
  const progress = total > 0 ? (current / total) * 100 : 0

  const difficultyStyles = {
    Easy:   { background: 'rgba(22,163,74,0.1)',   color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' },
    Medium: { background: 'rgba(217,119,6,0.1)',   color: '#d97706', border: '1px solid rgba(217,119,6,0.25)' },
    Hard:   { background: 'rgba(220,38,38,0.1)',   color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)' },
  }

  return (
    <div className="glass-card px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: '#1C1410' }}>{role}</span>
          <span style={{ color: '#C5BAB2' }}>·</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={difficultyStyles[difficulty] || difficultyStyles.Medium}>
            {difficulty}
          </span>
        </div>
        <span className="text-sm" style={{ color: '#6B6358' }}>
          {current < total ? (
            <span>Question <span className="font-semibold" style={{ color: '#1C1410' }}>{current + 1}</span> of {total}</span>
          ) : (
            <span className="font-medium" style={{ color: '#C45C1A' }}>All done!</span>
          )}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%`, background: '#C45C1A' }}
        />
      </div>
    </div>
  )
}
