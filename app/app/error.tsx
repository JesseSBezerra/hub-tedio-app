'use client'

import Link from 'next/link'
import { Terminal } from 'lucide-react'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Error caught:', error.message)
  }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-4 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between mb-8 border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="text-primary text-sm">CRITICAL_ERROR</span>
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
            <div className="terminal-text text-6xl text-destructive font-bold glitch">
              ERROR 500
            </div>
            <div className="text-secondary text-xl mt-4">
              INTERNAL SERVER ERROR
            </div>
          </div>

          <div className="space-y-4 mb-12 text-base">
            <div className="text-muted-foreground">
              <span className="text-secondary">$</span> [SISTEMA] Processando requisição...
            </div>
            <div className="text-destructive">
              <span className="text-secondary">$</span> [FALHA CRÍTICA] Exceção não tratada
            </div>
            <div className="text-destructive">
              <span className="text-secondary">$</span> [████████████████░░] 80% - Operação abortada
            </div>
          </div>

          <div className="border-t-2 border-primary pt-8 mt-8">
            <div className="text-muted-foreground text-sm mb-6">INFORMAÇÕES DO ERRO:</div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-secondary">Código:</span>{' '}
                <span className="text-destructive">INTERNAL_ERROR</span>
              </div>
              <div>
                <span className="text-secondary">Status:</span>{' '}
                <span className="text-destructive">[CRITICO]</span>
              </div>
              <div>
                <span className="text-secondary">Mensagem:</span>{' '}
                <span className="text-primary text-xs break-all">{error.message}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-primary pt-8 mt-8">
            <div className="text-muted-foreground text-sm mb-6">AÇÕES DISPONÍVEIS:</div>
            <div className="space-y-3 text-sm">
              <button
                onClick={reset}
                className="text-primary hover:text-secondary transition-all block w-full text-left"
              >
                <span className="text-secondary">$</span> tentar_novamente
              </button>
              <Link
                href="/"
                className="text-primary hover:text-secondary transition-all block"
              >
                <span className="text-secondary">$</span> retornar_ao_inicio
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground max-w-5xl">
          <div className="border-t-2 border-primary pt-6">
            <p className="text-destructive mb-3">[CRITICAL]</p>
            <p>
              FALHA NA EXECUÇÃO | DADOS INCONSISTENTES | CONTATE SUPORTE TÉCNICO
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
