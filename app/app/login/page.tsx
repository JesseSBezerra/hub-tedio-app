'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Terminal, ArrowLeft } from 'lucide-react'
import { authApi, storage } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('[LOGIN] Iniciando autenticação...')
      // Autenticação real com a API
      const loginResponse = await authApi.login({ email, password })
      console.log('[LOGIN] Login bem-sucedido:', loginResponse)
      
      // Salvar token
      storage.setToken(loginResponse.token)
      console.log('[LOGIN] Token salvo')
      
      // Buscar dados do usuário (não bloqueia o login se falhar)
      try {
        console.log('[LOGIN] Buscando dados do usuário...')
        const user = await authApi.getUser(loginResponse.token)
        console.log('[LOGIN] Dados do usuário recebidos:', user)
        storage.setUser(user)
        console.log('[LOGIN] Usuário salvo no localStorage')
      } catch (userErr) {
        console.error('[LOGIN] Erro ao buscar usuário:', userErr)
        // Continua mesmo se falhar ao buscar usuário
      }
      
      setSuccess(true)
      setEmail('')
      setPassword('')
      
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (err) {
      console.error('[LOGIN] Erro no login:', err)
      setError('ERRO_CREDENCIAIS_INVALIDAS')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-mono p-4 flex flex-col">
      <header className="flex items-center justify-between mb-8 border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-6 h-6 text-primary" />
          <span className="text-primary text-sm">AUTH_SYSTEM</span>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1 terminal-link text-xs hover:text-accent transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          [BACK]
        </Link>
      </header>

      {/* Login container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <div className="terminal-border w-full max-w-md p-8">
          {/* Title */}
          <div className="mb-8 text-center">
            <div className="terminal-text text-xl text-primary font-bold mb-2">
              {'>'} ACCESS CONTROL
            </div>
            <div className="text-xs text-muted-foreground">
              AUTHENTICATION REQUIRED
            </div>
          </div>

          {/* Error/Success messages */}
          {error && (
            <div className="mb-6 p-4 border-2 border-destructive bg-opacity-10 glitch">
              <div className="text-destructive text-sm font-bold">[ERROR]</div>
              <div className="text-destructive text-xs">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 border-2 border-primary">
              <div className="text-primary text-sm font-bold">[SUCCESS]</div>
              <div className="text-primary text-xs">AUTENTICAÇÃO CONCLUÍDA</div>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label className="text-xs text-secondary mb-2 block">
                EMAIL_ADDRESS:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@system.com"
                className="terminal-input w-full px-4 py-2 text-sm"
                disabled={loading}
              />
            </div>

            {/* Password field */}
            <div>
              <label className="text-xs text-secondary mb-2 block">
                PASSWORD:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="terminal-input w-full px-4 py-2 text-sm"
                disabled={loading}
              />
            </div>

            {/* Status indicator */}
            <div className="text-xs text-muted-foreground border-t-2 border-primary pt-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 ${
                    loading ? 'bg-accent cursor-blink' : 'bg-primary'
                  }`}
                ></span>
                <span>
                  {loading ? 'VERIFICANDO_CREDENCIAIS...' : 'AGUARDANDO_ENTRADA'}
                </span>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="terminal-button w-full px-4 py-2 text-sm font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '[PROCESSANDO...]' : '[LOGIN]'}
            </button>
          </form>

          {/* Footer */}
          <div className="border-t-2 border-primary pt-4 mt-6">
            <div className="text-center text-xs text-muted-foreground space-y-2">
              <p>
                <span className="text-secondary">$</span> SESSÃO CRIPTOGRAFADA
              </p>
              <p className="text-accent">[ACESSO REMOTO AUTORIZADO]</p>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div className="mt-8 text-center text-xs text-muted-foreground max-w-md">
          <div className="border-2 border-primary p-4">
            <p className="mb-2 text-accent">[NOTIFICAÇÃO]</p>
            <p>
              USE SUAS CREDENCIAIS PARA ACESSAR O SISTEMA. TENTATIVAS INVÁLIDAS SERÃO
              REGISTRADAS.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
