/**
 * ResumeScore — displays the AI-generated resume score as a circular gauge
 * along with experience level badge and score label.
 */

export default function ResumeScore({ score, experienceLevel }) {
  // SVG circle ring parameters
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference

  function getScoreColor(s) {
    if (s >= 80) return { stroke: '#34d399', text: 'text-emerald-400', label: 'Excellent', bg: 'bg-emerald-500/15 text-emerald-400' }
    if (s >= 60) return { stroke: '#a78bfa', text: 'text-violet-400', label: 'Good', bg: 'bg-violet-500/15 text-violet-400' }
    if (s >= 40) return { stroke: '#facc15', text: 'text-yellow-400', label: 'Average', bg: 'bg-yellow-500/15 text-yellow-400' }
    return { stroke: '#f87171', text: 'text-red-400', label: 'Needs Work', bg: 'bg-red-500/15 text-red-400' }
  }

  const colors = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circular gauge */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          {/* Progress */}
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-white/40 text-xs">/100</span>
        </div>
      </div>

      {/* Label badges */}
      <div className="flex flex-col items-center gap-1.5">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg}`}>
          {colors.label}
        </span>
        {experienceLevel && (
          <span className="px-3 py-1 rounded-full text-xs bg-white/8 text-white/60">
            {experienceLevel}
          </span>
        )}
      </div>
    </div>
  )
}
