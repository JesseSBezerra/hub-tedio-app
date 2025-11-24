'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Terminal } from 'lucide-react'

export default function Home() {
  const [displayText, setDisplayText] = useState('')
  const fullText = '> TEDIO INFERNAL v1.0.0'

  useState(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayText(fullText.slice(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-4 flex flex-col">
      <header className="flex items-center justify-between mb-8 border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="text-primary text-sm">SYSTEM_READY</span>
        </div>
        <Link
          href="/login"
          className="terminal-link text-xs hover:text-accent transition-all"
        >
          [LOGIN]
        </Link>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center">
        {/* Terminal window */}
        <div className="terminal-border w-full max-w-2xl p-8 mb-8">
          {/* Title animation */}
          <div className="mb-12">
            <div className="terminal-text text-4xl text-primary font-bold h-16">
              {displayText}
              <span className="cursor-blink">_</span>
            </div>
          </div>

          {/* Status lines */}
          <div className="space-y-4 mb-12 text-base">
            <div className="text-muted-foreground">
              <span className="text-secondary">$</span> SYSTEM INITIALIZED
            </div>
            <div className="text-muted-foreground">
              <span className="text-secondary">$</span> LOADING CORE MODULES...
            </div>
            <div className="text-primary">
              <span className="text-secondary">$</span> [████████████████████] 100%
            </div>
          </div>

          {/* Info section */}
          <div className="border-t-2 border-primary pt-8 mt-8">
            <div className="grid grid-cols-3 gap-6 text-base mb-8">
              <div>
                <div className="text-muted-foreground">STATUS:</div>
                <div className="text-primary">OPERATIONAL</div>
              </div>
              <div>
                <div className="text-muted-foreground">UPTIME:</div>
                <div className="text-secondary">99.99%</div>
              </div>
              <div>
                <div className="text-muted-foreground">SESSIONS:</div>
                <div className="text-accent">ACTIVE</div>
              </div>
            </div>
          </div>

          {/* Commands section */}
          <div className="border-t-2 border-primary pt-8 mt-8">
            <div className="text-muted-foreground text-sm mb-6">AVAILABLE COMMANDS:</div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-secondary">$</span>{' '}
                <span className="text-primary">help</span> - Display this help message
              </div>
              <div>
                <span className="text-secondary">$</span>{' '}
                <span className="text-primary">login</span> - Access user authentication
              </div>
              <div>
                <span className="text-secondary">$</span>{' '}
                <span className="text-primary">status</span> - System status report
              </div>
              <div>
                <span className="text-secondary">$</span>{' '}
                <span className="text-primary">exit</span> - Close connection
              </div>
            </div>
          </div>
        </div>

        {/* Footer message */}
        <div className="text-center text-sm text-muted-foreground max-w-2xl">
          <div className="border-t-2 border-primary pt-6">
            <p className="text-accent mb-3">[WARNING]</p>
            <p>
              CONEXÃO CRIPTOGRAFADA | ACESSO REMOTO AUTORIZADO | MONITORAMENTO ATIVO
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-primary mt-8 pt-4 text-center">
        <p className="text-xs text-muted-foreground">
          powered by <span className="text-secondary font-bold">JESSE BEZERRA</span>
        </p>
      </footer>
    </div>
  )
}
