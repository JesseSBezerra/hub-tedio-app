'use client'

import { useState, useEffect } from 'react'
import { Key, Plus, Edit, Trash2, X, Play, ChevronDown, ChevronRight } from 'lucide-react'
import {
  authenticationApi,
  ownerApi,
  storage,
  type Authentication,
  type Owner,
  type AuthenticationType,
  type ContentType,
  type TestAuthenticationResponse,
} from '@/lib/api'
import { toast } from 'sonner'

const AUTHENTICATION_TYPES: AuthenticationType[] = ['OAUTH2', 'BASIC', 'BEARER', 'API_KEY', 'NONE']
const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'APPLICATION_JSON', label: 'application/json' },
  { value: 'APPLICATION_XML', label: 'application/xml' },
  { value: 'APPLICATION_FORM_URLENCODED', label: 'application/x-www-form-urlencoded' },
  { value: 'MULTIPART_FORM_DATA', label: 'multipart/form-data' },
  { value: 'TEXT_PLAIN', label: 'text/plain' },
]

export default function AuthenticationPage() {
  const [authentications, setAuthentications] = useState<Authentication[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showTestModal, setShowTestModal] = useState(false)
  const [editingAuth, setEditingAuth] = useState<Authentication | null>(null)
  const [testingAuth, setTestingAuth] = useState<Authentication | null>(null)
  const [testResult, setTestResult] = useState<TestAuthenticationResponse | null>(null)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ownerId: 0,
    url: '',
    authenticationType: 'BASIC' as AuthenticationType,
    contentType: 'APPLICATION_JSON' as ContentType,
  })

  const [requestBodyFields, setRequestBodyFields] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ])
  const [headerFields, setHeaderFields] = useState<Array<{ key: string; value: string }>>([
    { key: '', value: '' },
  ])

  const [selectedResponseFields, setSelectedResponseFields] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada. Faça login novamente.')
        return
      }

      console.log('[AUTH] Carregando dados...')
      const [authsData, ownersData] = await Promise.all([
        authenticationApi.getAll(token),
        ownerApi.getAll(token),
      ])

      setAuthentications(authsData)
      setOwners(ownersData)
      console.log('[AUTH] Dados carregados')
    } catch (error) {
      console.error('[AUTH] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingAuth(null)
    setFormData({
      nome: '',
      descricao: '',
      ownerId: owners[0]?.id || 0,
      url: '',
      authenticationType: 'BASIC',
      contentType: 'APPLICATION_JSON',
    })
    setRequestBodyFields([{ key: '', value: '' }])
    setHeaderFields([{ key: '', value: '' }])
    setShowModal(true)
  }

  const handleEdit = (auth: Authentication) => {
    setEditingAuth(auth)
    setFormData({
      nome: auth.nome,
      descricao: auth.descricao,
      ownerId: auth.ownerId,
      url: auth.url,
      authenticationType: auth.authenticationType,
      contentType: auth.contentType,
    })

    // Convert requestBody object to array of key-value pairs
    const bodyEntries = auth.requestBody
      ? Object.entries(auth.requestBody).map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: '', value: '' }]
    setRequestBodyFields(bodyEntries)

    // Convert headers object to array of key-value pairs
    const headerEntries = auth.headers
      ? Object.entries(auth.headers).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }]
    setHeaderFields(headerEntries)

    setShowModal(true)
  }

  const handleDelete = async (auth: Authentication) => {
    if (!confirm(`Confirma a exclusão de "${auth.nome}"?`)) {
      return
    }

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      console.log('[AUTH] Deletando:', auth.id)
      await authenticationApi.delete(token, auth.id)
      toast.success('Autenticação deletada com sucesso!')
      loadData()
    } catch (error) {
      console.error('[AUTH] Erro ao deletar:', error)
      toast.error('Erro ao deletar autenticação')
    }
  }

  const handleTest = async (auth: Authentication) => {
    setTestingAuth(auth)
    setTestResult(null)
    setSelectedResponseFields(new Set())
    setShowTestModal(true)
  }

  const executeTest = async () => {
    if (!testingAuth) return

    try {
      setTesting(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      console.log('[AUTH] Executando teste:', testingAuth.id)
      const result = await authenticationApi.test(token, testingAuth.id)
      setTestResult(result)

      if (result.success) {
        toast.success(`Teste executado com sucesso! (${result.responseTimeMs}ms)`)
      } else {
        toast.error(`Teste falhou: ${result.errorMessage}`)
      }
    } catch (error) {
      console.error('[AUTH] Erro ao executar teste:', error)
      toast.error('Erro ao executar teste')
    } finally {
      setTesting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.url.trim() || !formData.ownerId) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    // Convert array of key-value pairs to objects
    const requestBody = requestBodyFields
      .filter((f) => f.key.trim())
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

    const headers = headerFields
      .filter((f) => f.key.trim())
      .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

    const payload = {
      ...formData,
      requestBody,
      headers,
    }

    try {
      setSaving(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      if (editingAuth) {
        console.log('[AUTH] Atualizando:', editingAuth.id)
        await authenticationApi.update(token, editingAuth.id, payload)
        toast.success('Autenticação atualizada com sucesso!')
      } else {
        console.log('[AUTH] Criando nova autenticação')
        await authenticationApi.create(token, payload)
        toast.success('Autenticação criada com sucesso!')
      }

      setShowModal(false)
      loadData()
    } catch (error) {
      console.error('[AUTH] Erro ao salvar:', error)
      toast.error('Erro ao salvar autenticação')
    } finally {
      setSaving(false)
    }
  }

  const addRequestBodyField = () => {
    setRequestBodyFields([...requestBodyFields, { key: '', value: '' }])
  }

  const removeRequestBodyField = (index: number) => {
    setRequestBodyFields(requestBodyFields.filter((_, i) => i !== index))
  }

  const updateRequestBodyField = (index: number, field: 'key' | 'value', val: string) => {
    const newFields = [...requestBodyFields]
    newFields[index][field] = val
    setRequestBodyFields(newFields)
  }

  const addHeaderField = () => {
    setHeaderFields([...headerFields, { key: '', value: '' }])
  }

  const removeHeaderField = (index: number) => {
    setHeaderFields(headerFields.filter((_, i) => i !== index))
  }

  const updateHeaderField = (index: number, field: 'key' | 'value', val: string) => {
    const newFields = [...headerFields]
    newFields[index][field] = val
    setHeaderFields(newFields)
  }

  const toggleResponseField = (field: string) => {
    setSelectedResponseFields((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(field)) {
        newSet.delete(field)
      } else {
        newSet.add(field)
      }
      return newSet
    })
  }

  const saveResponseFields = async () => {
    if (!testingAuth || !testResult) return

    // TODO: Implementar endpoint para salvar responseFields selecionados
    // Por enquanto, apenas fecha o modal
    toast.success('Campos do response salvos!')
    setShowTestModal(false)
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
              <Key className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">{'>'} AUTHENTICATION</h1>
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
              <span className="text-secondary">$</span> GERENCIAMENTO DE AUTENTICAÇÕES
            </p>
            <p className="mt-2">
              <span className="text-secondary">$</span> TOTAL:{' '}
              <span className="text-accent">{authentications.length}</span>
            </p>
          </div>

          {/* Tabela */}
          {authentications.length === 0 ? (
            <div className="border-2 border-primary p-8 text-center">
              <p className="text-muted-foreground text-sm">NENHUMA AUTENTICAÇÃO CADASTRADA</p>
              <p className="text-xs text-muted-foreground mt-2">Clique em [NOVO] para adicionar</p>
            </div>
          ) : (
            <div className="border-2 border-primary overflow-hidden">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-primary bg-primary bg-opacity-10">
                  <tr>
                    <th className="text-left py-3 px-4 text-secondary font-bold">ID</th>
                    <th className="text-left py-3 px-4 text-secondary font-bold">NOME</th>
                    <th className="text-left py-3 px-4 text-secondary font-bold">OWNER</th>
                    <th className="text-left py-3 px-4 text-secondary font-bold">TIPO</th>
                    <th className="text-left py-3 px-4 text-secondary font-bold">URL</th>
                    <th className="text-right py-3 px-4 text-secondary font-bold">AÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {authentications.map((auth) => (
                    <tr
                      key={auth.id}
                      className="border-b border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
                    >
                      <td className="py-3 px-4 text-accent">{auth.id}</td>
                      <td className="py-3 px-4 text-primary font-bold">{auth.nome}</td>
                      <td className="py-3 px-4 text-muted-foreground">{auth.ownerNome}</td>
                      <td className="py-3 px-4 text-secondary">{auth.authenticationType}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs truncate max-w-xs">
                        {auth.url}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTest(auth)}
                            className="p-2 border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
                            title="Testar"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(auth)}
                            className="p-2 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(auth)}
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
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="terminal-border bg-background p-8 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} {editingAuth ? 'EDITAR AUTENTICAÇÃO' : 'NOVA AUTENTICAÇÃO'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome e Descrição */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-secondary mb-2 block">NOME:*</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="terminal-input w-full px-4 py-2 text-sm"
                    disabled={saving}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-2 block">OWNER:*</label>
                  <select
                    value={formData.ownerId}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerId: parseInt(e.target.value) })
                    }
                    className="terminal-input w-full px-4 py-2 text-sm"
                    disabled={saving}
                    required
                  >
                    <option value={0}>Selecione...</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">DESCRIÇÃO:</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm min-h-[80px]"
                  disabled={saving}
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-xs text-secondary mb-2 block">URL:*</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={saving}
                  required
                />
              </div>

              {/* Tipo e Content-Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-secondary mb-2 block">AUTHENTICATION TYPE:*</label>
                  <select
                    value={formData.authenticationType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        authenticationType: e.target.value as AuthenticationType,
                      })
                    }
                    className="terminal-input w-full px-4 py-2 text-sm"
                    disabled={saving}
                  >
                    {AUTHENTICATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-secondary mb-2 block">CONTENT TYPE:*</label>
                  <select
                    value={formData.contentType}
                    onChange={(e) =>
                      setFormData({ ...formData, contentType: e.target.value as ContentType })
                    }
                    className="terminal-input w-full px-4 py-2 text-sm"
                    disabled={saving}
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Request Body (dinâmico) */}
              <div className="border-2 border-primary p-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs text-secondary">REQUEST BODY:</label>
                  <button
                    type="button"
                    onClick={addRequestBodyField}
                    className="text-xs text-accent hover:text-primary"
                  >
                    + ADICIONAR CAMPO
                  </button>
                </div>
                <div className="space-y-2">
                  {requestBodyFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="key"
                        value={field.key}
                        onChange={(e) => updateRequestBodyField(index, 'key', e.target.value)}
                        className="terminal-input flex-1 px-3 py-1 text-xs"
                        disabled={saving}
                      />
                      <input
                        type="text"
                        placeholder="value"
                        value={field.value}
                        onChange={(e) => updateRequestBodyField(index, 'value', e.target.value)}
                        className="terminal-input flex-1 px-3 py-1 text-xs"
                        disabled={saving}
                      />
                      {requestBodyFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequestBodyField(index)}
                          className="text-destructive hover:text-destructive-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Headers (dinâmico) */}
              <div className="border-2 border-primary p-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs text-secondary">HEADERS:</label>
                  <button
                    type="button"
                    onClick={addHeaderField}
                    className="text-xs text-accent hover:text-primary"
                  >
                    + ADICIONAR HEADER
                  </button>
                </div>
                <div className="space-y-2">
                  {headerFields.map((field, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="header name"
                        value={field.key}
                        onChange={(e) => updateHeaderField(index, 'key', e.target.value)}
                        className="terminal-input flex-1 px-3 py-1 text-xs"
                        disabled={saving}
                      />
                      <input
                        type="text"
                        placeholder="header value"
                        value={field.value}
                        onChange={(e) => updateHeaderField(index, 'value', e.target.value)}
                        className="terminal-input flex-1 px-3 py-1 text-xs"
                        disabled={saving}
                      />
                      {headerFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHeaderField(index)}
                          className="text-destructive hover:text-destructive-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
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

      {/* Modal de Teste */}
      {showTestModal && testingAuth && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="terminal-border bg-background p-8 max-w-6xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} TESTAR AUTENTICAÇÃO: {testingAuth.nome}
              </h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Botão Executar */}
            {!testResult && (
              <div className="mb-6">
                <button
                  onClick={executeTest}
                  disabled={testing}
                  className="terminal-button px-8 py-3 text-sm font-bold flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {testing ? '[EXECUTANDO...]' : '[EXECUTAR TESTE]'}
                </button>
              </div>
            )}

            {/* Resultado do Teste */}
            {testResult && (
              <div className="space-y-6">
                {/* Status */}
                <div className="border-2 border-primary p-4">
                  <div className="text-xs text-secondary mb-3">STATUS:</div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-lg font-bold ${
                        testResult.success ? 'text-primary' : 'text-destructive'
                      }`}
                    >
                      {testResult.statusCode} {testResult.statusMessage}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {testResult.responseTimeMs}ms
                    </span>
                  </div>
                  {testResult.errorMessage && (
                    <div className="mt-2 text-destructive text-xs">{testResult.errorMessage}</div>
                  )}
                </div>

                {/* Response Body */}
                <div className="border-2 border-primary p-4">
                  <div className="text-xs text-secondary mb-3">RESPONSE BODY:</div>
                  <pre className="text-xs text-muted-foreground bg-background border border-primary p-4 overflow-x-auto max-h-60">
                    {JSON.stringify(JSON.parse(testResult.responseBody), null, 2)}
                  </pre>
                </div>

                {/* Extracted Fields com checkboxes */}
                {testResult.extractedFields && Object.keys(testResult.extractedFields).length > 0 && (
                  <div className="border-2 border-accent p-4">
                    <div className="text-xs text-secondary mb-4">
                      CAMPOS EXTRAÍDOS (selecione para salvar):
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {Object.entries(testResult.extractedFields).map(([field, type]) => (
                        <div
                          key={field}
                          className="flex items-center gap-3 p-2 hover:bg-primary hover:bg-opacity-5 cursor-pointer"
                          onClick={() => toggleResponseField(field)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedResponseFields.has(field)}
                            onChange={() => toggleResponseField(field)}
                            className="w-4 h-4"
                          />
                          <span className="text-primary text-xs font-mono flex-1">{field}</span>
                          <span className="text-accent text-xs">{type}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Selecionados: {selectedResponseFields.size} / {Object.keys(testResult.extractedFields).length}
                    </div>
                  </div>
                )}

                {/* Botões */}
                <div className="border-t-2 border-primary pt-6 flex items-center justify-end gap-4">
                  <button
                    onClick={() => setShowTestModal(false)}
                    className="px-6 py-2 border-2 border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold"
                  >
                    [FECHAR]
                  </button>
                  {selectedResponseFields.size > 0 && (
                    <button
                      onClick={saveResponseFields}
                      className="terminal-button px-6 py-2 text-sm font-bold"
                    >
                      [SALVAR CAMPOS SELECIONADOS]
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
