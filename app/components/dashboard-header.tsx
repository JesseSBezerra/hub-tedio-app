'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Terminal, LogOut } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { storage, type User } from '@/lib/api'

export function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const userData = storage.getUser()
    setUser(userData)
  }, [])

  const handleLogout = () => {
    storage.clear()
    window.location.href = '/'
  }

  return (
    <header className="border-b-2 border-primary bg-background text-foreground font-mono">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo and Title */}
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <Terminal className="w-6 h-6 text-primary" />
            <Link href="/dashboard" className="text-lg font-bold text-primary hover:text-secondary transition-colors">
              {'>'} TEDIO INFERNAL
            </Link>
          </div>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center gap-6">
          <div className="text-xs text-muted-foreground">
            {user && (
              <>
                <span className="text-accent">{user.userName}</span>
                <span className="mx-2">|</span>
              </>
            )}
            <span className="text-secondary">$</span> STATUS: <span className="text-primary">ONLINE</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary hover:bg-primary hover:text-background transition-all text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            [LOGOUT]
          </button>
        </div>
      </div>
    </header>
  )
}
