'use client'

import { Terminal } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="terminal-border p-8">
        <div className="flex items-center gap-3 mb-6">
          <Terminal className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-primary">
            {'>'} DASHBOARD
          </h1>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            <span className="text-secondary">$</span> BEM-VINDO AO TEDIO INFERNAL
          </p>
          <p>
            <span className="text-secondary">$</span> SISTEMA OPERACIONAL V1.0
          </p>
          <p>
            <span className="text-secondary">$</span> [████████████████████] 100% CARREGADO
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'PROJETOS', value: '12', status: 'ATIVO' },
          { label: 'TAREFAS', value: '48', status: 'PENDENTE' },
          { label: 'USUÁRIOS', value: '7', status: 'ONLINE' },
          { label: 'UPTIME', value: '99.9%', status: 'PERFEITO' },
        ].map((stat, idx) => (
          <div key={idx} className="terminal-border p-6">
            <div className="text-xs text-secondary mb-3">
              <span>$</span> {stat.label}
            </div>
            <div className="text-2xl font-bold text-primary mb-3">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">
              STATUS: <span className="text-accent">{stat.status}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity section */}
      <div className="terminal-border p-6">
        <div className="text-sm text-secondary mb-4">
          <span>$</span> ATIVIDADES RECENTES
        </div>
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="border-l-2 border-primary pl-4 py-2">
            <span className="text-secondary">{'[14:32]'}</span> Projeto "Design System" iniciado
          </div>
          <div className="border-l-2 border-primary pl-4 py-2">
            <span className="text-secondary">{'[13:45]'}</span> Tarefa #45 marcada como concluída
          </div>
          <div className="border-l-2 border-primary pl-4 py-2">
            <span className="text-secondary">{'[12:10]'}</span> Novo membro adicionado à equipe
          </div>
          <div className="border-l-2 border-primary pl-4 py-2">
            <span className="text-secondary">{'[11:20]'}</span> Backup automático realizado com sucesso
          </div>
        </div>
      </div>
    </div>
  )
}
