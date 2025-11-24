'use client'

import { useState, useEffect } from 'react'
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter, SidebarInset, SidebarSeparator, SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar'
import { DashboardHeader } from '@/components/dashboard-header'
import { Home, Briefcase, Settings, Users, FileText, BarChart3, Shield, Code2, ChevronRight, Building2, Key, Link as LinkIcon, MessageSquare, Smartphone, Layers } from 'lucide-react'
import Link from 'next/link'
import { storage } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [hasPermissionAccess, setHasPermissionAccess] = useState(false)
  const [hasApiManagerAccess, setHasApiManagerAccess] = useState(false)
  const [hasOmnichannelAccess, setHasOmnichannelAccess] = useState(false)
  const [hasEvolutionManagerAccess, setHasEvolutionManagerAccess] = useState(false)
  const [isApiMenuOpen, setIsApiMenuOpen] = useState(false)
  const [isOmnichannelMenuOpen, setIsOmnichannelMenuOpen] = useState(false)

  useEffect(() => {
    const user = storage.getUser()
    if (user?.permissions.includes('permission')) {
      setHasPermissionAccess(true)
    }
    if (user?.permissions.includes('api-manager')) {
      setHasApiManagerAccess(true)
    }
    if (user?.permissions.includes('omnichannel')) {
      setHasOmnichannelAccess(true)
    }
    if (user?.permissions.includes('evolution-manager')) {
      setHasEvolutionManagerAccess(true)
    }
  }, [])

  const menuItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: Briefcase, label: 'Projects', href: '/dashboard/projects' },
    { icon: Users, label: 'Team', href: '/dashboard/team' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: FileText, label: 'Files', href: '/dashboard/files' },
    ...(hasPermissionAccess ? [{ icon: Shield, label: 'Permissions', href: '/dashboard/permissions' }] : []),
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground font-mono">
        {/* Sidebar */}
        <Sidebar className="border-r-2 border-primary bg-background">
          <SidebarHeader className="border-b-2 border-primary p-4">
            <div className="text-xs text-muted-foreground">
              <span className="text-secondary">$</span> MENU
            </div>
          </SidebarHeader>

          <SidebarContent className="p-0">
            <SidebarMenu className="gap-1 p-4">
              {/* Menu items normais */}
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Menu API com submenu (apenas se tiver permissão) */}
              {hasApiManagerAccess && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsApiMenuOpen(!isApiMenuOpen)}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Code2 className="w-4 h-4" />
                      <span>API</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isApiMenuOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </SidebarMenuButton>

                  {/* Submenu */}
                  {isApiMenuOpen && (
                    <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href="/dashboard/api/owners"
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary"
                          >
                            <Building2 className="w-4 h-4" />
                            <span>Owners</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href="/dashboard/api/authentication"
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary"
                          >
                            <Key className="w-4 h-4" />
                            <span>Authentication</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href="/dashboard/api/integrations"
                            className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span>Integrations</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )}

              {/* Menu Omnichannel com submenu (apenas se tiver permissão) */}
              {hasOmnichannelAccess && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsOmnichannelMenuOpen(!isOmnichannelMenuOpen)}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4" />
                      <span>Omnichannel</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isOmnichannelMenuOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </SidebarMenuButton>

                  {/* Submenu */}
                  {isOmnichannelMenuOpen && (
                    <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                      {hasEvolutionManagerAccess && (
                        <>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href="/dashboard/omnichannel/evolution"
                                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary"
                              >
                                <Smartphone className="w-4 h-4" />
                                <span>Evolution</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href="/dashboard/omnichannel/instances"
                                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary"
                              >
                                <Layers className="w-4 h-4" />
                                <span>Instances</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </>
                      )}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              )}

              {/* Settings sempre no final */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-primary hover:text-background transition-colors border border-transparent hover:border-primary">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t-2 border-primary p-4">
            <div className="text-xs text-muted-foreground space-y-2">
              <div>
                <span className="text-secondary">$</span> v1.0.0
              </div>
              <div className="text-accent">SESSÃO ATIVA</div>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <SidebarInset className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
