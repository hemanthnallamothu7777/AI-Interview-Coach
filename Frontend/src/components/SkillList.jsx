/**
 * SkillList — renders a tagged list of technical skills extracted from the resume.
 */

export default function SkillList({ skills = [], title = 'Detected Skills', variant = 'default' }) {
  if (!skills.length) return null

  const chipStyles = {
    default: { background: 'rgba(196,92,26,0.1)', color: '#C45C1A', border: '1px solid rgba(196,92,26,0.22)' },
    missing: { background: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' },
    strength: { background: 'rgba(22,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' },
  }

  const style = chipStyles[variant] || chipStyles.default

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: '#9E9189' }}>{title}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium" style={style}>
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}
