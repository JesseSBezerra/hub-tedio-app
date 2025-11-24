'use client'

import { useState, useEffect } from 'react'
import { Building2, Plus, Edit, Trash2, X } from 'lucide-react'
import { ownerApi, storage, type Owner } from '@/lib/api'
import { toast } from 'sonner'

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null)
  const [formData, setFormData] = useState({ nome: '', descricao: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadOwners()
  }, [])

  const loadOwners = async () => {
    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }

      console.log('[OWNERS] Carregando owners...')
      const data = await ownerApi.getAll(token)
      setOwners(data)
      console.log('[OWNERS] Owners carregados:', data)
    } catch (error) {
      console.error('[OWNERS] Erro ao carregar owners:', error)
      toast.error('Erro ao carregar owners')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingOwner(null)
    setFormData({ nome: '', descricao: '' })
    setShowModal(true)
  }

  const handleEdit = (owner: Owner) => {
    setEditingOwner(owner)
    setFormData({ nome: owner.nome, descricao: owner.descricao })
    setShowModal(true)
  }

  const handleDelete = async (owner: Owner) => {
    if (!confirm(`Confirma a exclusão de "${owner.nome}"?`)) {
      return
    }

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      console.log('[OWNERS] Deletando owner:', owner.id)
      await ownerApi.delete(token, owner.id)
      toast.success('Owner deletado com sucesso!')
      loadOwners()
    } catch (error) {
      console.error('[OWNERS] Erro ao deletar owner:', error)
      toast.error('Erro ao deletar owner')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.descricao.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    try {
      setSaving(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      if (editingOwner) {
        console.log('[OWNERS] Atualizando owner:', editingOwner.id)
        await ownerApi.update(token, editingOwner.id, formData)
        toast.success('Owner atualizado com sucesso!')
      } else {
        console.log('[OWNERS] Criando owner')
        await ownerApi.create(token, formData)
        toast.success('Owner criado com sucesso!')
      }

      setShowModal(false)
      setFormData({ nome: '', descricao: '' })
      loadOwners()
    } catch (error) {
      console.error('[OWNERS] Erro ao salvar owner:', error)
      toast.error('Erro ao salvar owner')
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingOwner(null)
    setFormData({ nome: '', descricao: '' })
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
    <>
      <div className="space-y-6">
        <div className="terminal-border p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">{'>'} OWNERS</h1>
            </div>
            <button
              onClick={handleCreate}
              className="terminal-button px-6 py-2 text-sm font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              [NOVO]
            </button>
          </div>

          <div className="text-xs text-muted-foreground mb-8">
            <p>
              <span className="text-secondary">$</span> GERENCIAMENTO DE OWNERS
            </p>
            <p className="mt-2">
              <span className="text-secondary">$</span> TOTAL:{' '}
              <span className="text-accent">{owners.length}</span>
            </p>
          </div>

          {/* Tabela de Owners */}
          {owners.length === 0 ? (
            <div className="border-2 border-primary p-8 text-center">
              <p className="text-muted-foreground text-sm">
                NENHUM OWNER CADASTRADO
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Clique em [NOVO] para adicionar
              </p>
            </div>
          ) : (
            <div className="border-2 border-primary overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-primary bg-primary bg-opacity-10">
                  <tr>
                    <th className="text-left py-3 px-4 text-secondary font-bold">ID</th>
                    <th className="text-left py-3 px-4 text-secondary font-bold">NOME</th>
                    <th className="text-left py-3 px-4 text-secondary font-bold">DESCRIÇÃO</th>
                    <th className="text-left py-3 px-4 text-secondary font-bold">CRIADO EM</th>
                    <th className="text-right py-3 px-4 text-secondary font-bold">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner) => (
                    <tr
                      key={owner.id}
                      className="border-b border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
                    >
                      <td className="py-3 px-4 text-accent">{owner.id}</td>
                      <td className="py-3 px-4 text-primary font-bold">{owner.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{owner.descricao}</td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(owner.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(owner)}
                            className="p-2 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(owner)}
                            className="p-2 border border-destructive text-destructive hover:bg-destructive hover:text-background transition-colors"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="terminal-border p-6 border-accent">
          <div className="text-xs text-muted-foreground">
            <p className="text-accent font-bold mb-3">[INFORMAÇÃO]</p>
            <div className="space-y-2">
              <p>
                <span className="text-secondary">•</span> Owners representam equipes ou
                empresas no sistema
              </p>
              <p>
                <span className="text-secondary">•</span> Use [NOVO] para criar um novo owner
              </p>
              <p>
                <span className="text-secondary">•</span> Clique nos ícones para editar ou
                excluir
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="terminal-border bg-background p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} {editingOwner ? 'EDITAR OWNER' : 'NOVO OWNER'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome */}
              <div>
                <label className="text-xs text-secondary mb-2 block">NOME:</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do owner"
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={saving}
                  required
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs text-secondary mb-2 block">DESCRIÇÃO:</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descrição do owner"
                  className="terminal-input w-full px-4 py-2 text-sm min-h-[100px] resize-y"
                  disabled={saving}
                  required
                />
              </div>

              {/* Botões */}
              <div className="border-t-2 border-primary pt-6 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saving}
                  className="px-6 py-2 border-2 border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold disabled:opacity-50"
                >
                  [CANCELAR]
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="terminal-button px-6 py-2 text-sm font-bold disabled:opacity-50"
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
