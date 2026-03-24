export default function ProjectList({ projects = [] }) {
    if (!projects.length) return null

    return (
        <div>
            <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-3">
                Projects
            </p>

            <div className="grid gap-4 md:grid-cols-2">
                {projects.map((project, index) => (
                    <div
                        key={index}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-violet-500/40 transition-all duration-300"
                    >
                        {/* Project Name */}
                        <h3 className="text-white text-sm font-semibold mb-1">
                            {project.name}
                        </h3>

                        {/* Description */}
                        <p className="text-white/60 text-xs mb-3 leading-relaxed">
                            {project.description}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2">
                            {project.technologies?.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-violet-500/15 text-violet-300 border border-violet-500/25"
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