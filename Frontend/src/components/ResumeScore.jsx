/**
 * ResumeScore — circular gauge for the AI-generated resume score.
 */

export default function ResumeScore({ score, experienceLevel }) {
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (score / 100) * circumference

  function getScoreColor(s) {
    if (s >= 80) return { stroke: '#16a34a', text: '#16a34a', label: 'Excellent', badge: { background: 'rgba(22,163,74,0.1)', color: '#16a34a' } }
    if (s >= 60) return { stroke: '#C45C1A', text: '#C45C1A', label: 'Good',      badge: { background: 'rgba(196,92,26,0.1)', color: '#C45C1A' } }
    if (s >= 40) return { stroke: '#d97706', text: '#d97706', label: 'Average',   badge: { background: 'rgba(217,119,6,0.1)', color: '#d97706' } }
    return         { stroke: '#dc2626', text: '#dc2626', label: 'Needs Work', badge: { background: 'rgba(220,38,38,0.1)', color: '#dc2626' } }
  }

  const colors = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: colors.text }}>{score}</span>
          <span className="text-xs" style={{ color: '#9E9189' }}>/100</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <span className="px-3 py-1 rounded-full text-xs font-semibold" style={colors.badge}>
          {colors.label}
        </span>
        {experienceLevel && (
          <span className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(0,0,0,0.06)', color: '#6B6358' }}>
            {experienceLevel}
          </span>
        )}
      </div>
    </div>
  )
}
