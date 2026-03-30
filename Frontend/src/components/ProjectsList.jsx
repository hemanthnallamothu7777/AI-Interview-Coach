export default function ProjectList({ projects = [] }) {
  if (!projects.length) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#9E9189' }}>
        Projects
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <div
            key={index}
            className="rounded-xl p-4 transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(0,0,0,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,92,26,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.85)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.6)' }}
          >
            <h3 className="text-sm font-semibold mb-1" style={{ color: '#1C1410' }}>
              {project.name}
            </h3>
            <p className="text-xs mb-3 leading-relaxed" style={{ color: '#6B6358' }}>
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {project.technologies?.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-full text-[10px] font-medium"
                  style={{ background: 'rgba(196,92,26,0.1)', color: '#C45C1A', border: '1px solid rgba(196,92,26,0.22)' }}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
