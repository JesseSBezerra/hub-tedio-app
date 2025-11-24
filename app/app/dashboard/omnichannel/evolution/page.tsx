'use client'

import { useState, useEffect } from 'react'
import { evolutionApi, ownerApi, storage, type Evolution, type Owner } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Edit, Trash2, X } from 'lucide-react'

export default function EvolutionPage() {
  const [evolutions, setEvolutions] = useState<Evolution[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEvolution, setEditingEvolution] = useState<Evolution | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    url: '',
    apiKey: '',
    ownerId: 0,
  })
  const [saving, setSaving] = useState(false)

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

      const [evolutionsData, ownersData] = await Promise.all([
        evolutionApi.list(token),
        ownerApi.getAll(token),
      ])

      setEvolutions(evolutionsData)
      setOwners(ownersData)
    } catch (error) {
      console.error('[EVOLUTION] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingEvolution(null)
    setFormData({ nome: '', descricao: '', url: '', apiKey: '', ownerId: owners[0]?.id || 0 })
    setShowModal(true)
  }

  const handleEdit = (evolution: Evolution) => {
    setEditingEvolution(evolution)
    setFormData({
      nome: evolution.nome,
      descricao: evolution.descricao,
      url: evolution.url,
      apiKey: evolution.apiKey,
      ownerId: evolution.ownerId,
    })
    setShowModal(true)
  }

  const handleDelete = async (evolution: Evolution) => {
    if (!confirm(`Confirma a exclusão de "${evolution.nome}"?`)) return

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      await evolutionApi.delete(token, evolution.id)
      toast.success('Evolution deletado com sucesso!')
      await loadData()
    } catch (error) {
      console.error('[EVOLUTION] Erro ao deletar:', error)
      toast.error('Erro ao deletar evolution')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.url.trim() || !formData.apiKey.trim()) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    if (formData.ownerId === 0) {
      toast.error('Selecione um Owner')
      return
    }

    try {
      setSaving(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      if (editingEvolution) {
        await evolutionApi.update(token, editingEvolution.id, formData)
        toast.success('Evolution atualizado com sucesso!')
      } else {
        await evolutionApi.create(token, formData)
        toast.success('Evolution criado com sucesso!')
      }

      setShowModal(false)
      await loadData()
    } catch (error) {
      console.error('[EVOLUTION] Erro ao salvar:', error)
      toast.error('Erro ao salvar evolution')
    } finally {
      setSaving(false)
    }
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
              {'>'} EVOLUTION API
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerencie as instâncias da Evolution API
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="terminal-button px-4 py-2 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            [NOVO EVOLUTION]
          </button>
        </div>

        {/* Lista de Evolutions */}
        <div className="terminal-border p-6">
          {evolutions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Nenhum evolution cadastrado.</p>
              <p className="text-xs mt-2">Clique em [NOVO EVOLUTION] para começar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evolutions.map((evolution) => (
                <div
                  key={evolution.id}
                  className="border-2 border-primary p-4 hover:bg-primary hover:bg-opacity-5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-primary">{evolution.nome}</h3>
                        <span className="text-xs text-muted-foreground">
                          ID: {evolution.id}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{evolution.descricao}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">URL:</span>{' '}
                          <span className="text-accent font-mono">{evolution.url}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">API Key:</span>{' '}
                          <span className="text-secondary font-mono">
                            {evolution.apiKey.substring(0, 20)}...
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Owner:</span>{' '}
                          <span className="text-primary">{evolution.ownerNome}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Criado em:</span>{' '}
                          <span className="text-primary">
                            {new Date(evolution.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(evolution)}
                        className="p-2 border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(evolution)}
                        className="p-2 border border-destructive text-destructive hover:bg-destructive hover:text-background transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="terminal-border bg-background p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} {editingEvolution ? 'EDITAR' : 'NOVO'} EVOLUTION
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
                <label className="text-xs text-secondary mb-2 block">NOME:*</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm"
                  placeholder="Ex: Evolution Produção"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">DESCRIÇÃO:</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm min-h-[100px] resize-y"
                  placeholder="Descreva esta instância..."
                  disabled={saving}
                />
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">URL:*</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm font-mono"
                  placeholder="http://191.252.195.25:9010"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">API KEY:*</label>
                <input
                  type="text"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm font-mono"
                  placeholder="6a1b023f-4e5c-48d7-b9a1-f3c5b8d2e4f0"
                  disabled={saving}
                />
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">OWNER:*</label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: Number(e.target.value) })}
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={saving}
                >
                  <option value={0}>Selecione um owner</option>
                  {owners.map((owner) => (
                    <option key={owner.id} value={owner.id}>
                      {owner.nome}
                    </option>
                  ))}
                </select>
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
                  {saving ? '[SALVANDO...]' : '[SALVAR]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
