'use client'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="terminal-border p-6">
        <h1 className="text-2xl font-bold text-primary mb-6">
          {'>'} ANALYTICS
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-primary p-4">
            <div className="text-xs text-secondary mb-4">$ VISITAS DIÁRIAS</div>
            <div className="text-3xl font-bold text-primary mb-2">1,247</div>
            <div className="text-xs text-muted-foreground">↑ 12% vs ontem</div>
          </div>
          
          <div className="border border-primary p-4">
            <div className="text-xs text-secondary mb-4">$ TAXA DE CONVERSÃO</div>
            <div className="text-3xl font-bold text-primary mb-2">3.24%</div>
            <div className="text-xs text-muted-foreground">↑ 0.5% vs semana passada</div>
          </div>
        </div>
      </div>
    </div>
  )
}
