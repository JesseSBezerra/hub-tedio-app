'use client'

import { useState, useEffect } from 'react'
import { Shield, Check } from 'lucide-react'
import { permissionApi, storage, type Permission, type User } from '@/lib/api'
import { toast } from 'sonner'

export default function PermissionsPage() {
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set())
  const [initialPermissions, setInitialPermissions] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const token = storage.getToken()
      const userData = storage.getUser()

      if (!token || !userData) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }

      setUser(userData)

      console.log('[PERMISSIONS] Carregando permissões disponíveis...')
      const permissions = await permissionApi.getAvailablePermissions(token)
      setAvailablePermissions(permissions)

      // Define permissões selecionadas baseado no usuário
      const userPermissions = new Set(userData.permissions)
      setSelectedPermissions(userPermissions)
      setInitialPermissions(userPermissions)

      console.log('[PERMISSIONS] Permissões carregadas:', permissions)
      console.log('[PERMISSIONS] Permissões do usuário:', userData.permissions)
    } catch (error) {
      console.error('[PERMISSIONS] Erro ao carregar permissões:', error)
      toast.error('Erro ao carregar permissões')
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(permissionName)) {
        newSet.delete(permissionName)
      } else {
        newSet.add(permissionName)
      }
      return newSet
    })
  }

  const hasChanges = () => {
    if (selectedPermissions.size !== initialPermissions.size) return true
    for (const perm of selectedPermissions) {
      if (!initialPermissions.has(perm)) return true
    }
    return false
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const token = storage.getToken()

      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const permissionsArray = Array.from(selectedPermissions)
      console.log('[PERMISSIONS] Salvando permissões:', permissionsArray)

      const updatedUser = await permissionApi.updatePermissions(token, permissionsArray)

      // Atualiza o usuário no localStorage
      storage.setUser(updatedUser)
      setUser(updatedUser)
      setInitialPermissions(new Set(updatedUser.permissions))

      console.log('[PERMISSIONS] Permissões atualizadas com sucesso:', updatedUser)
      toast.success('Permissões atualizadas com sucesso!')
    } catch (error) {
      console.error('[PERMISSIONS] Erro ao salvar permissões:', error)
      toast.error('Erro ao atualizar permissões')
    } finally {
      setSaving(false)
    }
  }

  const getButtonLabel = () => {
    const addedPermissions = Array.from(selectedPermissions).filter(
      (p) => !initialPermissions.has(p)
    )
    const removedPermissions = Array.from(initialPermissions).filter(
      (p) => !selectedPermissions.has(p)
    )

    if (addedPermissions.length > 0 && removedPermissions.length === 0) {
      return 'VINCULAR'
    }
    if (removedPermissions.length > 0 && addedPermissions.length === 0) {
      return 'DESVINCULAR'
    }
    if (addedPermissions.length > 0 && removedPermissions.length > 0) {
      return 'ATUALIZAR'
    }
    return 'SALVAR'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="terminal-border p-8">
          <div className="flex items-center justify-center">
            <div className="text-primary text-sm">
              <span className="cursor-blink">CARREGANDO...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="terminal-border p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-primary">{'>'} PERMISSIONS</h1>
        </div>

        <div className="text-xs text-muted-foreground mb-8">
          <p>
            <span className="text-secondary">$</span> GERENCIAMENTO DE PERMISSÕES
          </p>
          {user && (
            <p className="mt-2">
              <span className="text-secondary">$</span> USUÁRIO:{' '}
              <span className="text-accent">{user.userName}</span>
            </p>
          )}
        </div>

        {/* Lista de Permissões */}
        <div className="space-y-4 mb-8">
          {availablePermissions.map((permission) => {
            const isSelected = selectedPermissions.has(permission.name)

            return (
              <div
                key={permission.id}
                className="border-2 border-primary p-4 hover:bg-primary hover:bg-opacity-10 transition-colors cursor-pointer"
                onClick={() => togglePermission(permission.name)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-5 h-5 border-2 border-primary flex items-center justify-center ${
                          isSelected ? 'bg-primary' : 'bg-background'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 text-background" />}
                      </div>
                      <div className="text-primary font-bold uppercase">{permission.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground ml-8">
                      {permission.description}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Botão de Ação */}
        <div className="border-t-2 border-primary pt-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <span className="text-secondary">$</span> PERMISSÕES SELECIONADAS:{' '}
              <span className="text-primary font-bold">{selectedPermissions.size}</span>
            </div>
            <button
              onClick={handleSave}
              disabled={!hasChanges() || saving}
              className="terminal-button px-8 py-3 text-sm font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '[PROCESSANDO...]' : `[${getButtonLabel()}]`}
            </button>
          </div>

          {hasChanges() && (
            <div className="mt-4 text-xs text-accent border-l-2 border-accent pl-4">
              <p>ALTERAÇÕES PENDENTES</p>
              <p className="text-muted-foreground mt-1">
                Clique em {getButtonLabel()} para aplicar as alterações
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Informações adicionais */}
      <div className="terminal-border p-6 border-accent">
        <div className="text-xs text-muted-foreground">
          <p className="text-accent font-bold mb-3">[INFORMAÇÃO]</p>
          <div className="space-y-2">
            <p>
              <span className="text-secondary">•</span> As permissões controlam o acesso a
              diferentes áreas do sistema
            </p>
            <p>
              <span className="text-secondary">•</span> Clique em uma permissão para
              selecioná-la ou desmarcá-la
            </p>
            <p>
              <span className="text-secondary">•</span> As alterações só serão aplicadas após
              clicar em {getButtonLabel()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
