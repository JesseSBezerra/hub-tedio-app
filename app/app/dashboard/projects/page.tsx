'use client'

export default function ProjectsPage() {
  const projects = [
    { id: 1, name: 'Design System', status: 'ATIVO', progress: 75 },
    { id: 2, name: 'Mobile App', status: 'DESENVOLVIMENTO', progress: 45 },
    { id: 3, name: 'API Integration', status: 'PLANEJAMENTO', progress: 20 },
  ]

  return (
    <div className="space-y-6">
      <div className="terminal-border p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {'>'} PROJECTS
        </h1>
        
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="border-l-4 border-primary pl-4 py-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-primary font-bold">{project.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Status: <span className="text-secondary">{project.status}</span>
                  </div>
                </div>
              </div>
              <div className="w-full bg-background border border-primary h-2 overflow-hidden">
                <div 
                  className="bg-primary h-full"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground mt-2">{project.progress}% COMPLETO</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
