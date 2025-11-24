'use client'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="terminal-border p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {'>'} SETTINGS
        </h1>
        
        <div className="space-y-4">
          <div className="border-l-4 border-primary pl-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-primary font-bold">Notificações</div>
                <div className="text-xs text-muted-foreground">Receber notificações do sistema</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </div>

          <div className="border-l-4 border-primary pl-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-primary font-bold">Modo Escuro</div>
                <div className="text-xs text-muted-foreground">Ativar tema escuro (padrão)</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
          </div>

          <div className="border-l-4 border-primary pl-4 py-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-primary font-bold">Autenticação 2FA</div>
                <div className="text-xs text-muted-foreground">Aumentar segurança da conta</div>
              </div>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      <div className="terminal-border p-6 border-destructive">
        <h2 className="text-lg font-bold text-destructive mb-4">ZONA DE PERIGO</h2>
        <button className="w-full px-4 py-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-background transition-all font-bold text-sm">
          [DELETAR CONTA]
        </button>
      </div>
    </div>
  )
}
