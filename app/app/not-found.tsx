'use client'

import Link from 'next/link'
import { Terminal } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-4 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-8 border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="text-primary text-sm">ERROR_HANDLER</span>
        </div>
        <Link
          href="/"
          className="terminal-link text-xs hover:text-accent transition-all"
        >
          [HOME]
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto w-full">
        <div className="terminal-border w-full max-w-5xl p-12 mb-8">
          <div className="mb-12">
            <div className="terminal-text text-6xl text-destructive font-bold">
              ERROR 404
            </div>
            <div className="text-secondary text-xl mt-4">
              NOT FOUND
            </div>
          </div>

          <div className="space-y-4 mb-12 text-base">
            <div className="text-muted-foreground">
              <span className="text-secondary">$</span> [SISTEMA] Procurando recurso solicitado...
            </div>
            <div className="text-muted-foreground">
              <span className="text-secondary">$</span> [ERRO] Arquivo não encontrado no servidor
            </div>
            <div className="text-destructive">
              <span className="text-secondary">$</span> [████░░░░░░░░░░░░░░] 25% - Busca interrompida
            </div>
          </div>

          <div className="border-t-2 border-primary pt-8 mt-8">
            <div className="text-muted-foreground text-sm mb-6">STATUS DA SOLICITAÇÃO:</div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-secondary">Rota:</span>{' '}
                <span className="text-primary">[INDEFINIDA]</span>
              </div>
              <div>
                <span className="text-secondary">Recurso:</span>{' '}
                <span className="text-destructive">[NÃO LOCALIZADO]</span>
              </div>
              <div>
                <span className="text-secondary">Ação recomendada:</span>{' '}
                <span className="text-accent">[RETORNAR AO INICIO]</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-primary pt-8 mt-8">
            <div className="text-muted-foreground text-sm mb-6">OPÇÕES DISPONÍVEIS:</div>
            <div className="space-y-3 text-sm">
              <Link
                href="/"
                className="text-primary hover:text-secondary transition-all block"
              >
                <span className="text-secondary">$</span> voltar_ao_inicio
              </Link>
              <Link
                href="/login"
                className="text-primary hover:text-secondary transition-all block"
              >
                <span className="text-secondary">$</span> efetuar_login
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground max-w-5xl">
          <div className="border-t-2 border-primary pt-6">
            <p className="text-destructive mb-3">[ALERT]</p>
            <p>
              RECURSO INACESSÍVEL | VERIFICAR ENDEREÇO | CONTATE O ADMINISTRADOR
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
