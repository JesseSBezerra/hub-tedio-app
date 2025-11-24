'use client'

import { useState, useEffect } from 'react'
import { evolutionInstanceApi, evolutionApi, storage, type EvolutionInstance, type Evolution, type ConnectionStateResponse } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Trash2, X, RefreshCw, LogOut, Wifi, WifiOff, ChevronRight, Link2 } from 'lucide-react'

const INTEGRATIONS = ['WHATSAPP-BAILEYS', 'WHATSAPP-BUSINESS']

export default function InstancesPage() {
  const [instances, setInstances] = useState<EvolutionInstance[]>([])
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    instanceName: '',
    qrcode: true,
    evolutionId: 0,
    integration: 'WHATSAPP-BAILEYS',
    webhookUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [connectionStates, setConnectionStates] = useState<Record<number, ConnectionStateResponse>>({})
  const [refreshingQr, setRefreshingQr] = useState<number | null>(null)
  const [expandedInstances, setExpandedInstances] = useState<Set<number>>(new Set())
  const [showWebhookModal, setShowWebhookModal] = useState(false)
  const [editingInstance, setEditingInstance] = useState<EvolutionInstance | null>(null)
  const [webhookFormData, setWebhookFormData] = useState('')
  const [savingWebhook, setSavingWebhook] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const [instancesData, evolutionsData] = await Promise.all([
        evolutionInstanceApi.list(token),
        evolutionApi.list(token),
      ])

      setInstances(instancesData)
      setEvolutions(evolutionsData)

      // Carregar estados de conexão para cada instância
      await loadConnectionStates(token, instancesData)
    } catch (error) {
      console.error('[INSTANCES] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadConnectionStates = async (token: string, instances: EvolutionInstance[]) => {
    const states: Record<number, ConnectionStateResponse> = {}

    await Promise.all(
      instances.map(async (instance) => {
        try {
          const state = await evolutionInstanceApi.getConnectionState(token, instance.id)
          states[instance.id] = state
        } catch (error) {
          console.error(`[INSTANCES] Erro ao carregar estado da instance ${instance.id}:`, error)
        }
      })
    )

    setConnectionStates(states)
  }

  const handleCreate = () => {
    setFormData({
      instanceName: '',
      qrcode: true,
      evolutionId: evolutions[0]?.id || 0,
      integration: 'WHATSAPP-BAILEYS',
      webhookUrl: '',
    })
    setShowModal(true)
  }

  const handleDelete = async (instance: EvolutionInstance) => {
    if (!confirm(`Confirma a exclusão da instância "${instance.instanceName}"?`)) return

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      await evolutionInstanceApi.delete(token, instance.id)
      toast.success('Instância deletada com sucesso!')
      await loadData()
    } catch (error) {
      console.error('[INSTANCES] Erro ao deletar:', error)
      toast.error('Erro ao deletar instância')
    }
  }

  const handleLogout = async (instance: EvolutionInstance) => {
    if (!confirm(`Desconectar a instância "${instance.instanceName}"?`)) return

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const result = await evolutionInstanceApi.logout(token, instance.id)
      toast.success(result.response.message)
      await loadData()
    } catch (error) {
      console.error('[INSTANCES] Erro ao fazer logout:', error)
      toast.error('Erro ao desconectar instância')
    }
  }

  const handleRefreshQr = async (instanceId: number) => {
    try {
      setRefreshingQr(instanceId)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const connectData = await evolutionInstanceApi.connect(token, instanceId)

      // Atualizar a instância com o novo QR code
      setInstances(prev => prev.map(inst =>
        inst.id === instanceId
          ? { ...inst, qrcodeBase64: connectData.base64 || inst.qrcodeBase64 }
          : inst
      ))

      if (connectData.base64) {
        toast.success('QR Code atualizado!')
      } else {
        toast.info('Instância já conectada')
      }
    } catch (error) {
      console.error('[INSTANCES] Erro ao atualizar QR:', error)
      toast.error('Erro ao atualizar QR Code')
    } finally {
      setRefreshingQr(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.instanceName.trim()) {
      toast.error('Preencha o nome da instância')
      return
    }

    if (formData.evolutionId === 0) {
      toast.error('Selecione um serviço Evolution')
      return
    }

    try {
      setSaving(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      await evolutionInstanceApi.create(token, formData)
      toast.success('Instância criada com sucesso!')
      setShowModal(false)
      await loadData()
    } catch (error) {
      console.error('[INSTANCES] Erro ao salvar:', error)
      toast.error('Erro ao criar instância')
    } finally {
      setSaving(false)
    }
  }

  const handleEditWebhook = (instance: EvolutionInstance) => {
    setEditingInstance(instance)
    setWebhookFormData(instance.webhookUrl || '')
    setShowWebhookModal(true)
  }

  const handleWebhookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingInstance) return

    try {
      setSavingWebhook(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      await evolutionInstanceApi.setWebhook(token, editingInstance.id, webhookFormData)
      toast.success('Webhook atualizado com sucesso!')
      setShowWebhookModal(false)
      await loadData()
    } catch (error) {
      console.error('[INSTANCES] Erro ao atualizar webhook:', error)
      toast.error('Erro ao atualizar webhook')
    } finally {
      setSavingWebhook(false)
    }
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'open':
        return 'text-accent'
      case 'connecting':
        return 'text-secondary'
      case 'close':
        return 'text-destructive'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStateIcon = (state: string) => {
    return state === 'open' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />
  }

  const toggleInstance = (instanceId: number) => {
    setExpandedInstances(prev => {
      const newSet = new Set(prev)
      if (newSet.has(instanceId)) {
        newSet.delete(instanceId)
      } else {
        newSet.add(instanceId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-primary text-sm">
          <span className="text-secondary">$</span> CARREGANDO...
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary mb-2">
              {'>'} EVOLUTION INSTANCES
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as instâncias do WhatsApp
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="terminal-button px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            [NOVA INSTÂNCIA]
          </button>
        </div>

        {/* Lista de Instances - Accordion */}
        <div className="space-y-3">
          {instances.length === 0 ? (
            <div className="terminal-border p-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhuma instância cadastrada.</p>
              <p className="text-xs mt-2">Clique em [NOVA INSTÂNCIA] para começar.</p>
            </div>
          ) : (
            instances.map((instance) => {
              const state = connectionStates[instance.id]
              const instanceState = state?.instance?.state || 'unknown'
              const isExpanded = expandedInstances.has(instance.id)

              return (
                <div key={instance.id} className="border-2 border-primary">
                  {/* Header do Accordion */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors"
                    onClick={() => toggleInstance(instance.id)}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <ChevronRight
                        className={`w-4 h-4 text-primary transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <h3 className="text-base font-bold text-primary">{instance.instanceName}</h3>
                        <div className={`flex items-center gap-1 ${getStateColor(instanceState)}`}>
                          {getStateIcon(instanceState)}
                          <span className="text-xs uppercase">{instanceState}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {instance.evolutionNome}
                    </div>
                  </div>

                  {/* Conteúdo do Accordion */}
                  {isExpanded && (
                    <div className="border-t-2 border-primary p-4 bg-background">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Informações */}
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-secondary">INSTANCE ID:</label>
                            <p className="text-sm text-primary font-mono">{instance.instanceId}</p>
                          </div>
                          <div>
                            <label className="text-xs text-secondary">SERVICE:</label>
                            <p className="text-sm text-primary">{instance.evolutionNome}</p>
                          </div>
                          <div>
                            <label className="text-xs text-secondary">INTEGRATION:</label>
                            <p className="text-sm text-accent">{instance.integration}</p>
                          </div>
                          <div>
                            <label className="text-xs text-secondary">HASH:</label>
                            <p className="text-sm text-muted-foreground font-mono break-all">{instance.hash}</p>
                          </div>
                          <div>
                            <label className="text-xs text-secondary">WEBHOOK URL:</label>
                            <p className="text-sm text-accent font-mono break-all">
                              {instance.webhookUrl || 'Não configurado'}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-secondary">CRIADO EM:</label>
                            <p className="text-sm text-muted-foreground">
                              {new Date(instance.createdAt).toLocaleString('pt-BR')}
                            </p>
                          </div>

                          {/* Ações */}
                          <div className="flex gap-2 pt-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditWebhook(instance)
                              }}
                              className="flex-1 p-2 border border-accent text-accent hover:bg-accent hover:text-background transition-colors text-xs flex items-center justify-center gap-2"
                            >
                              <Link2 className="w-3 h-3" />
                              WEBHOOK
                            </button>
                            {instanceState === 'open' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleLogout(instance)
                                }}
                                className="flex-1 p-2 border border-secondary text-secondary hover:bg-secondary hover:text-background transition-colors text-xs flex items-center justify-center gap-2"
                              >
                                <LogOut className="w-3 h-3" />
                                LOGOUT
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(instance)
                              }}
                              className="flex-1 p-2 border border-destructive text-destructive hover:bg-destructive hover:text-background transition-colors text-xs flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              DELETE
                            </button>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center">
                          {instance.qrcodeBase64 && instanceState !== 'open' ? (
                            <div className="w-[60%] mx-auto">
                              <div className="border-2 border-accent p-2">
                                <img
                                  src={instance.qrcodeBase64}
                                  alt="QR Code"
                                  className="w-full h-auto"
                                />
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRefreshQr(instance.id)
                                }}
                                disabled={refreshingQr === instance.id}
                                className="w-full mt-2 px-3 py-2 border-2 border-accent text-accent hover:bg-accent hover:text-background transition-colors text-xs flex items-center justify-center gap-2 font-bold"
                              >
                                <RefreshCw className={`w-3 h-3 ${refreshingQr === instance.id ? 'animate-spin' : ''}`} />
                                {refreshingQr === instance.id ? '[ATUALIZANDO...]' : '[REFRESH QR CODE]'}
                              </button>
                            </div>
                          ) : instanceState === 'open' ? (
                            <div className="text-center text-accent">
                              <Wifi className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-sm font-bold">CONECTADO</p>
                              <p className="text-xs text-muted-foreground mt-1">Instância ativa</p>
                            </div>
                          ) : (
                            <div className="text-center text-muted-foreground">
                              <WifiOff className="w-12 h-12 mx-auto mb-2" />
                              <p className="text-sm">Aguardando conexão</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Modal de Criar */}
      {showModal && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="terminal-border bg-background p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} NOVA INSTÂNCIA
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs text-secondary mb-2 block">NOME DA INSTÂNCIA:*</label>
                <input
                  type="text"
                  value={formData.instanceName}
                  onChange={(e) => setFormData({ ...formData, instanceName: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm font-mono"
                  placeholder="empresa-exemplo-sa"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">Use apenas letras, números e hífens</p>
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">SERVICE (EVOLUTION):*</label>
                <select
                  value={formData.evolutionId}
                  onChange={(e) => setFormData({ ...formData, evolutionId: Number(e.target.value) })}
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={saving}
                >
                  <option value={0}>Selecione um serviço</option>
                  {evolutions.map((evolution) => (
                    <option key={evolution.id} value={evolution.id}>
                      {evolution.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">INTEGRATION:*</label>
                <select
                  value={formData.integration}
                  onChange={(e) => setFormData({ ...formData, integration: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={saving}
                >
                  {INTEGRATIONS.map((integration) => (
                    <option key={integration} value={integration}>
                      {integration}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">WEBHOOK URL:</label>
                <input
                  type="text"
                  value={formData.webhookUrl}
                  onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm font-mono"
                  placeholder="https://example.com/webhook"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground mt-1">URL para receber notificações da instância</p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="qrcode"
                  checked={formData.qrcode}
                  onChange={(e) => setFormData({ ...formData, qrcode: e.target.checked })}
                  className="w-4 h-4"
                  disabled={saving}
                />
                <label htmlFor="qrcode" className="text-xs text-secondary cursor-pointer">
                  Gerar QR Code automaticamente
                </label>
              </div>

              <div className="border-t-2 border-primary pt-6 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-6 py-2 border-2 border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold"
                >
                  [CANCELAR]
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="terminal-button px-6 py-2 text-sm font-bold"
                >
                  {saving ? '[CRIANDO...]' : '[CRIAR]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Editar Webhook */}
      {showWebhookModal && editingInstance && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="terminal-border bg-background p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} EDITAR WEBHOOK
              </h2>
              <button
                onClick={() => setShowWebhookModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                Instância: <span className="text-primary font-bold">{editingInstance.instanceName}</span>
              </p>
            </div>

            <form onSubmit={handleWebhookSubmit} className="space-y-6">
              <div>
                <label className="text-xs text-secondary mb-2 block">WEBHOOK URL:</label>
                <input
                  type="text"
                  value={webhookFormData}
                  onChange={(e) => setWebhookFormData(e.target.value)}
                  className="terminal-input w-full px-4 py-2 text-sm font-mono"
                  placeholder="https://example.com/webhook"
                  disabled={savingWebhook}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL para receber notificações da instância. Deixe em branco para remover.
                </p>
              </div>

              <div className="border-t-2 border-primary pt-6 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  disabled={savingWebhook}
                  className="px-6 py-2 border-2 border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold"
                >
                  [CANCELAR]
                </button>
                <button
                  type="submit"
                  disabled={savingWebhook}
                  className="terminal-button px-6 py-2 text-sm font-bold"
                >
                  {savingWebhook ? '[SALVANDO...]' : '[SALVAR]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
