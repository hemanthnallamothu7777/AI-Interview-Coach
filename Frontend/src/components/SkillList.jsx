/**
 * SkillList — renders a tagged list of technical skills extracted from the resume.
 * Supports an optional selection mode used for the "Start Interview" flow.
 */

export default function SkillList({ skills = [], title = 'Detected Skills', variant = 'default' }) {
  if (!skills.length) return null

  const chipStyles = {
    default: 'bg-violet-500/15 text-violet-300 border border-violet-500/25',
    missing: 'bg-red-500/10 text-red-300 border border-red-500/20',
    strength: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  }

  const style = chipStyles[variant] || chipStyles.default

  return (
    <div>
      <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2.5">{title}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}
