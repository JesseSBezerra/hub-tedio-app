'use client'

export default function TeamPage() {
  const team = [
    { name: 'Admin', role: 'Sistema', status: 'ATIVO' },
    { name: 'Dev 1', role: 'Desenvolvedor', status: 'ATIVO' },
    { name: 'Dev 2', role: 'Desenvolvedor', status: 'INATIVO' },
  ]

  return (
    <div className="space-y-6">
      <div className="terminal-border p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {'>'} TEAM
        </h1>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-primary">
              <tr>
                <th className="text-left py-3 px-4 text-secondary">NOME</th>
                <th className="text-left py-3 px-4 text-secondary">FUNÇÃO</th>
                <th className="text-left py-3 px-4 text-secondary">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member, idx) => (
                <tr key={idx} className="border-b border-primary">
                  <td className="py-3 px-4 text-primary">{member.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{member.role}</td>
                  <td className="py-3 px-4">
                    <span className={member.status === 'ATIVO' ? 'text-primary' : 'text-muted-foreground'}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
