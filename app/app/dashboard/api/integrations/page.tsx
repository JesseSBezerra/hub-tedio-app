'use client'

import { useState, useEffect, useRef } from 'react'
import { Link as LinkIcon, Plus, Edit, Trash2, X, ChevronRight, Route, FileCode, Play } from 'lucide-react'
import { integrationApi, ownerApi, authenticationApi, pathApi, requestApi, storage, type Integration, type Owner, type Authentication, type Path, type Request, type HttpMethod, type ContentType, type TestRequestResponse } from '@/lib/api'
import { toast } from 'sonner'

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

const CONTENT_TYPES = [
  { value: 'APPLICATION_JSON', label: 'application/json' },
  { value: 'APPLICATION_XML', label: 'application/xml' },
  { value: 'APPLICATION_FORM_URLENCODED', label: 'application/x-www-form-urlencoded' },
  { value: 'MULTIPART_FORM_DATA', label: 'multipart/form-data' },
  { value: 'TEXT_PLAIN', label: 'text/plain' },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [authentications, setAuthentications] = useState<Authentication[]>([])
  const [loading, setLoading] = useState(true)

  // Modal de Integration
  const [showModal, setShowModal] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    description: '',
    baseUrl: '',
    ownerId: 0,
    authenticationId: 0,
  })
  const [headerFields, setHeaderFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const [saving, setSaving] = useState(false)

  // Accordion de Integrations
  const [expandedIntegrationId, setExpandedIntegrationId] = useState<number | null>(null)
  const [pathsByIntegration, setPathsByIntegration] = useState<{ [key: number]: Path[] }>({})
  const [loadingPaths, setLoadingPaths] = useState<{ [key: number]: boolean }>({})

  // Accordion de Paths (dentro de Integration)
  const [expandedPathId, setExpandedPathId] = useState<number | null>(null)
  const [requestsByPath, setRequestsByPath] = useState<{ [key: number]: Request[] }>({})
  const [loadingRequests, setLoadingRequests] = useState<{ [key: number]: boolean }>({})

  // Modal de Path
  const [showPathModal, setShowPathModal] = useState(false)
  const [editingPath, setEditingPath] = useState<Path | null>(null)
  const [currentIntegrationForPath, setCurrentIntegrationForPath] = useState<Integration | null>(null)
  const [pathFormData, setPathFormData] = useState({ nome: '', path: '' })
  const [savingPath, setSavingPath] = useState(false)

  // Modal de Request
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState<Request | null>(null)
  const [currentPathForRequest, setCurrentPathForRequest] = useState<Path | null>(null)
  const [requestFormData, setRequestFormData] = useState({
    nome: '',
    httpMethod: 'POST' as HttpMethod,
    contentType: 'APPLICATION_JSON' as ContentType,
  })
  const [bodyFields, setBodyFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const [headerFieldsReq, setHeaderFieldsReq] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const [paramFields, setParamFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const [exampleFields, setExampleFields] = useState<Array<{ key: string; value: string }>>([{ key: '', value: '' }])
  const [savingRequest, setSavingRequest] = useState(false)
  const [isRequestExampleOpen, setIsRequestExampleOpen] = useState(false)
  const [requestExampleJson, setRequestExampleJson] = useState('')
  const [isBodyFieldsOpen, setIsBodyFieldsOpen] = useState(false)
  const [isHeaderFieldsOpen, setIsHeaderFieldsOpen] = useState(false)
  const [isParamFieldsOpen, setIsParamFieldsOpen] = useState(false)

  // Modal de Teste de Request
  const [showTestModal, setShowTestModal] = useState(false)
  const [testingRequest, setTestingRequest] = useState<Request | null>(null)
  const [testResult, setTestResult] = useState<TestRequestResponse | null>(null)
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [isExtractedFieldsOpen, setIsExtractedFieldsOpen] = useState(false)

  // Autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState<number | null>(null)
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 })
  const [cursorPosition, setCursorPosition] = useState(0)
  const inputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

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

      const [integrationsData, ownersData, authsData] = await Promise.all([
        integrationApi.getAll(token),
        ownerApi.getAll(token),
        authenticationApi.getAll(token),
      ])

      setIntegrations(integrationsData)
      setOwners(ownersData)
      setAuthentications(authsData)
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const loadPathsForIntegration = async (integrationId: number) => {
    try {
      setLoadingPaths({ ...loadingPaths, [integrationId]: true })
      const token = storage.getToken()
      if (!token) return

      const paths = await pathApi.getAll(token, integrationId)
      setPathsByIntegration({ ...pathsByIntegration, [integrationId]: paths })
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao carregar paths:', error)
      toast.error('Erro ao carregar paths')
    } finally {
      setLoadingPaths({ ...loadingPaths, [integrationId]: false })
    }
  }

  const loadRequestsForPath = async (pathId: number) => {
    try {
      setLoadingRequests({ ...loadingRequests, [pathId]: true })
      const token = storage.getToken()
      if (!token) return

      const requests = await requestApi.getAll(token, pathId)
      setRequestsByPath({ ...requestsByPath, [pathId]: requests })
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao carregar requests:', error)
      toast.error('Erro ao carregar requests')
    } finally {
      setLoadingRequests({ ...loadingRequests, [pathId]: false })
    }
  }

  const toggleIntegrationAccordion = async (integrationId: number) => {
    if (expandedIntegrationId === integrationId) {
      setExpandedIntegrationId(null)
      setExpandedPathId(null) // Fechar path accordion também
    } else {
      setExpandedIntegrationId(integrationId)
      if (!pathsByIntegration[integrationId]) {
        await loadPathsForIntegration(integrationId)
      }
    }
  }

  const togglePathAccordion = async (pathId: number) => {
    if (expandedPathId === pathId) {
      setExpandedPathId(null)
    } else {
      setExpandedPathId(pathId)
      if (!requestsByPath[pathId]) {
        await loadRequestsForPath(pathId)
      }
    }
  }

  // Integration handlers
  const handleCreate = () => {
    setEditingIntegration(null)
    setFormData({ nome: '', description: '', baseUrl: '', ownerId: 0, authenticationId: 0 })
    setHeaderFields([{ key: '', value: '' }])
    setShowModal(true)
  }

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration)
    setFormData({
      nome: integration.nome,
      description: integration.description,
      baseUrl: integration.baseUrl,
      ownerId: integration.ownerId,
      authenticationId: integration.authenticationId,
    })

    if (integration.headers && Object.keys(integration.headers).length > 0) {
      const fields = Object.entries(integration.headers).map(([key, value]) => ({ key, value }))
      setHeaderFields(fields)
    } else {
      setHeaderFields([{ key: '', value: '' }])
    }

    setShowModal(true)
  }

  const handleDelete = async (integration: Integration) => {
    if (!confirm(`Confirma a exclusão de "${integration.nome}"?`)) return

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      await integrationApi.delete(token, integration.id)
      toast.success('Integração deletada com sucesso!')
      loadData()
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao deletar integração:', error)
      toast.error('Erro ao deletar integração')
    }
  }

  const addHeaderField = () => {
    setHeaderFields([...headerFields, { key: '', value: '' }])
  }

  const removeHeaderField = (index: number) => {
    setHeaderFields(headerFields.filter((_, i) => i !== index))
  }

  const updateHeaderField = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...headerFields]
    updated[index][field] = value

    if (field === 'value') {
      const lastTwoChars = value.slice(-2)
      if (lastTwoChars === '${') {
        const input = inputRefs.current[index]
        if (input) {
          const rect = input.getBoundingClientRect()
          setAutocompletePosition({
            top: rect.bottom + window.scrollY,
            left: rect.left + window.scrollX,
          })
          setCursorPosition(value.length)
          setShowAutocomplete(index)
        }
      } else if (!value.includes('${')) {
        setShowAutocomplete(null)
      }
    }

    setHeaderFields(updated)
  }

  const insertAutocompleteValue = (fieldName: string) => {
    if (showAutocomplete === null) return

    const field = headerFields[showAutocomplete]
    const value = field.value
    const beforeCursor = value.slice(0, cursorPosition)
    const afterCursor = value.slice(cursorPosition)
    const newValue = beforeCursor + fieldName + '}' + afterCursor

    updateHeaderField(showAutocomplete, 'value', newValue)
    setShowAutocomplete(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim() || !formData.baseUrl.trim() || formData.ownerId === 0 || formData.authenticationId === 0) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    try {
      setSaving(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const headers = headerFields
        .filter((f) => f.key.trim())
        .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

      const payload = { ...formData, headers }

      if (editingIntegration) {
        await integrationApi.update(token, editingIntegration.id, payload)
        toast.success('Integração atualizada com sucesso!')
      } else {
        await integrationApi.create(token, payload)
        toast.success('Integração criada com sucesso!')
      }

      setShowModal(false)
      setFormData({ nome: '', description: '', baseUrl: '', ownerId: 0, authenticationId: 0 })
      setHeaderFields([{ key: '', value: '' }])
      loadData()
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao salvar integração:', error)
      toast.error('Erro ao salvar integração')
    } finally {
      setSaving(false)
    }
  }

  const getSelectedAuthentication = (): Authentication | undefined => {
    return authentications.find((a) => a.id === formData.authenticationId)
  }

  const getAvailableResponseFields = (): string[] => {
    const auth = getSelectedAuthentication()
    if (!auth || !auth.responseFields) return []
    return Object.keys(auth.responseFields)
  }

  // Path handlers
  const handleCreatePath = (integration: Integration) => {
    setCurrentIntegrationForPath(integration)
    setEditingPath(null)
    setPathFormData({ nome: '', path: '' })
    setShowPathModal(true)
  }

  const handleEditPath = (path: Path, integration: Integration) => {
    setCurrentIntegrationForPath(integration)
    setEditingPath(path)
    setPathFormData({ nome: path.nome, path: path.path })
    setShowPathModal(true)
  }

  const handleDeletePath = async (path: Path, integrationId: number) => {
    if (!confirm(`Confirma a exclusão de "${path.nome}"?`)) return

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      await pathApi.delete(token, path.id)
      toast.success('Path deletado com sucesso!')
      await loadPathsForIntegration(integrationId)
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao deletar path:', error)
      toast.error('Erro ao deletar path')
    }
  }

  const handleSubmitPath = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!pathFormData.nome.trim() || !pathFormData.path.trim()) {
      toast.error('Preencha todos os campos')
      return
    }

    if (!currentIntegrationForPath) return

    try {
      setSavingPath(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const payload = {
        ...pathFormData,
        integrationId: currentIntegrationForPath.id,
      }

      if (editingPath) {
        await pathApi.update(token, editingPath.id, payload)
        toast.success('Path atualizado com sucesso!')
      } else {
        await pathApi.create(token, payload)
        toast.success('Path criado com sucesso!')
      }

      setShowPathModal(false)
      setPathFormData({ nome: '', path: '' })
      setCurrentIntegrationForPath(null)
      await loadPathsForIntegration(currentIntegrationForPath.id)
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao salvar path:', error)
      toast.error('Erro ao salvar path')
    } finally {
      setSavingPath(false)
    }
  }

  // Request handlers
  const handleCreateRequest = (path: Path) => {
    setCurrentPathForRequest(path)
    setEditingRequest(null)
    setRequestFormData({ nome: '', httpMethod: 'POST', contentType: 'APPLICATION_JSON' })
    setBodyFields([{ key: '', value: '' }])
    setHeaderFieldsReq([{ key: '', value: '' }])
    setParamFields([{ key: '', value: '' }])
    setExampleFields([{ key: '', value: '' }])
    setRequestExampleJson('')
    setIsRequestExampleOpen(false)
    setIsBodyFieldsOpen(false)
    setIsHeaderFieldsOpen(false)
    setIsParamFieldsOpen(false)
    setShowRequestModal(true)
  }

  const handleEditRequest = (request: Request, path: Path) => {
    setCurrentPathForRequest(path)
    setEditingRequest(request)
    setRequestFormData({
      nome: request.nome,
      httpMethod: request.httpMethod,
      contentType: request.contentType,
    })

    // Converter objetos para arrays de fields
    if (request.bodyFields && Object.keys(request.bodyFields).length > 0) {
      setBodyFields(Object.entries(request.bodyFields).map(([key, value]) => ({ key, value })))
    } else {
      setBodyFields([{ key: '', value: '' }])
    }

    if (request.headerFields && Object.keys(request.headerFields).length > 0) {
      setHeaderFieldsReq(Object.entries(request.headerFields).map(([key, value]) => ({ key, value })))
    } else {
      setHeaderFieldsReq([{ key: '', value: '' }])
    }

    if (request.paramFields && Object.keys(request.paramFields).length > 0) {
      setParamFields(Object.entries(request.paramFields).map(([key, value]) => ({ key, value })))
    } else {
      setParamFields([{ key: '', value: '' }])
    }

    if (request.requestExample && Object.keys(request.requestExample).length > 0) {
      setExampleFields(Object.entries(request.requestExample).map(([key, value]) => ({ key, value: String(value) })))
      // Carregar JSON formatado para o editor
      setRequestExampleJson(JSON.stringify(request.requestExample, null, 2))
    } else {
      setExampleFields([{ key: '', value: '' }])
      setRequestExampleJson('')
    }

    setShowRequestModal(true)
  }

  const handleDeleteRequest = async (request: Request, pathId: number) => {
    if (!confirm(`Confirma a exclusão de "${request.nome}"?`)) return

    try {
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      await requestApi.delete(token, request.id)
      toast.success('Request deletado com sucesso!')
      await loadRequestsForPath(pathId)
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao deletar request:', error)
      toast.error('Erro ao deletar request')
    }
  }

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!requestFormData.nome.trim()) {
      toast.error('Preencha o nome')
      return
    }

    if (!currentPathForRequest) return

    try {
      setSavingRequest(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const bodyFieldsObj = bodyFields
        .filter((f) => f.key.trim())
        .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

      const headerFieldsObj = headerFieldsReq
        .filter((f) => f.key.trim())
        .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

      const paramFieldsObj = paramFields
        .filter((f) => f.key.trim())
        .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})

      // Se for POST + APPLICATION_JSON, usar o JSON do editor
      let exampleObj = {}
      if (requestFormData.httpMethod === 'POST' && requestFormData.contentType === 'APPLICATION_JSON') {
        if (requestExampleJson.trim()) {
          try {
            exampleObj = JSON.parse(requestExampleJson)
          } catch (error) {
            toast.error('JSON inválido no Request Example')
            setSavingRequest(false)
            return
          }
        }
      } else {
        // Para outros casos, usar os campos key-value
        exampleObj = exampleFields
          .filter((f) => f.key.trim())
          .reduce((acc, { key, value }) => ({ ...acc, [key]: value }), {})
      }

      const payload = {
        ...requestFormData,
        pathId: currentPathForRequest.id,
        bodyFields: bodyFieldsObj,
        headerFields: headerFieldsObj,
        paramFields: paramFieldsObj,
        requestExample: exampleObj,
      }

      if (editingRequest) {
        await requestApi.update(token, editingRequest.id, payload)
        toast.success('Request atualizado com sucesso!')
      } else {
        await requestApi.create(token, payload)
        toast.success('Request criado com sucesso!')
      }

      setShowRequestModal(false)
      setCurrentPathForRequest(null)
      await loadRequestsForPath(currentPathForRequest.id)
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao salvar request:', error)
      toast.error('Erro ao salvar request')
    } finally {
      setSavingRequest(false)
    }
  }

  const handleTestRequest = (request: Request) => {
    setTestingRequest(request)
    setTestResult(null)
    setIsExtractedFieldsOpen(false)
    setShowTestModal(true)
  }

  const executeTest = async () => {
    if (!testingRequest) return

    try {
      setIsTestRunning(true)
      const token = storage.getToken()
      if (!token) {
        toast.error('Sessão expirada')
        return
      }

      const result = await requestApi.test(token, testingRequest.id)
      setTestResult(result)

      if (result.success) {
        toast.success('Teste executado com sucesso!')
      } else {
        toast.error('Teste executado com erros')
      }
    } catch (error) {
      console.error('[INTEGRATIONS] Erro ao testar request:', error)
      toast.error('Erro ao executar teste')
    } finally {
      setIsTestRunning(false)
    }
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
              <LinkIcon className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold text-primary">{'>'} INTEGRATIONS</h1>
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
              <span className="text-secondary">$</span> GERENCIAMENTO DE INTEGRAÇÕES
            </p>
            <p className="mt-2">
              <span className="text-secondary">$</span> TOTAL:{' '}
              <span className="text-accent">{integrations.length}</span>
            </p>
          </div>

          {/* Accordion de Integrations */}
          {integrations.length === 0 ? (
            <div className="border-2 border-primary p-8 text-center">
              <p className="text-muted-foreground text-sm">
                NENHUMA INTEGRAÇÃO CADASTRADA
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Clique em [NOVO] para adicionar
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {integrations.map((integration) => (
                <div key={integration.id} className="border-2 border-primary">
                  {/* Header do Accordion - Integration */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors"
                    onClick={() => toggleIntegrationAccordion(integration.id)}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <ChevronRight
                        className={`w-5 h-5 text-accent transition-transform ${
                          expandedIntegrationId === integration.id ? 'rotate-90' : ''
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-primary font-bold">{integration.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            #{integration.id}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {integration.baseUrl} | Owner: {integration.ownerNome} | Auth:{' '}
                          {integration.authenticationNome}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleEdit(integration)}
                        className="p-2 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(integration)}
                        className="p-2 border border-destructive text-destructive hover:bg-destructive hover:text-background transition-colors"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo expandido - Paths */}
                  {expandedIntegrationId === integration.id && (
                    <div className="border-t-2 border-primary p-4 bg-background bg-opacity-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Route className="w-4 h-4 text-accent" />
                          <span className="text-xs text-secondary font-bold">PATHS:</span>
                        </div>
                        <button
                          onClick={() => handleCreatePath(integration)}
                          className="text-xs text-accent hover:text-primary transition-colors"
                        >
                          + ADICIONAR PATH
                        </button>
                      </div>

                      {loadingPaths[integration.id] ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          Carregando paths...
                        </div>
                      ) : pathsByIntegration[integration.id]?.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          Nenhum path cadastrado
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {pathsByIntegration[integration.id]?.map((path) => (
                            <div key={path.id} className="border border-primary">
                              {/* Header do Path - Accordion aninhado */}
                              <div
                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors"
                                onClick={() => togglePathAccordion(path.id)}
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <ChevronRight
                                    className={`w-4 h-4 text-accent transition-transform ${
                                      expandedPathId === path.id ? 'rotate-90' : ''
                                    }`}
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm text-primary font-bold">{path.nome}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {path.path}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleEditPath(path, integration)}
                                    className="p-1 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                                    title="Editar"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePath(path, integration.id)}
                                    className="p-1 border border-destructive text-destructive hover:bg-destructive hover:text-background transition-colors"
                                    title="Deletar"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Conteúdo expandido - Requests */}
                              {expandedPathId === path.id && (
                                <div className="border-t border-primary p-3 bg-background bg-opacity-30">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <FileCode className="w-3 h-3 text-accent" />
                                      <span className="text-xs text-secondary font-bold">REQUESTS:</span>
                                    </div>
                                    <button
                                      onClick={() => handleCreateRequest(path)}
                                      className="text-xs text-accent hover:text-primary transition-colors"
                                    >
                                      + ADICIONAR REQUEST
                                    </button>
                                  </div>

                                  {loadingRequests[path.id] ? (
                                    <div className="text-xs text-muted-foreground text-center py-3">
                                      Carregando requests...
                                    </div>
                                  ) : requestsByPath[path.id]?.length === 0 ? (
                                    <div className="text-xs text-muted-foreground text-center py-3">
                                      Nenhum request cadastrado
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      {requestsByPath[path.id]?.map((request) => (
                                        <div
                                          key={request.id}
                                          className="flex items-center justify-between p-2 border border-primary hover:bg-primary hover:bg-opacity-5 transition-colors"
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                              <span className="text-xs font-bold text-accent">
                                                [{request.httpMethod}]
                                              </span>
                                              <span className="text-xs text-primary font-bold">
                                                {request.nome}
                                              </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              {request.contentType}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <button
                                              onClick={() => handleTestRequest(request)}
                                              className="p-1 border border-accent text-accent hover:bg-accent hover:text-background transition-colors"
                                              title="Testar"
                                            >
                                              <Play className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleEditRequest(request, path)}
                                              className="p-1 border border-primary text-primary hover:bg-primary hover:text-background transition-colors"
                                              title="Editar"
                                            >
                                              <Edit className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteRequest(request, path.id)}
                                              className="p-1 border border-destructive text-destructive hover:bg-destructive hover:text-background transition-colors"
                                              title="Deletar"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações */}
        <div className="terminal-border p-6 border-accent">
          <div className="text-xs text-muted-foreground">
            <p className="text-accent font-bold mb-3">[INFORMAÇÃO]</p>
            <div className="space-y-2">
              <p>
                <span className="text-secondary">•</span> Clique na integração para ver paths
              </p>
              <p>
                <span className="text-secondary">•</span> Clique no path para ver requests
              </p>
              <p>
                <span className="text-secondary">•</span> Nos headers, use ${'{'}campo{'}'} para referenciar campos da autenticação
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Criação/Edição de Integration */}
      {showModal && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="terminal-border bg-background p-8 max-w-4xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} {editingIntegration ? 'EDITAR INTEGRAÇÃO' : 'NOVA INTEGRAÇÃO'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="text-xs text-secondary mb-2 block">BASE URL:*</label>
                <input
                  type="url"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={saving}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">AUTHENTICATION:*</label>
                <select
                  value={formData.authenticationId}
                  onChange={(e) =>
                    setFormData({ ...formData, authenticationId: parseInt(e.target.value) })
                  }
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={saving}
                  required
                >
                  <option value={0}>Selecione...</option>
                  {authentications.map((auth) => (
                    <option key={auth.id} value={auth.id}>
                      {auth.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">DESCRIÇÃO:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="terminal-input w-full px-4 py-2 text-sm min-h-[80px]"
                  disabled={saving}
                />
              </div>

              <div className="border-2 border-primary p-4 relative">
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
                        ref={(el) => {
                          inputRefs.current[index] = el
                        }}
                        type="text"
                        placeholder="header value (use ${campo} para referenciar)"
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

                {showAutocomplete !== null && getAvailableResponseFields().length > 0 && (
                  <div
                    className="absolute z-50 bg-background border-2 border-accent shadow-lg max-h-48 overflow-y-auto"
                    style={{
                      top: `${autocompletePosition.top}px`,
                      left: `${autocompletePosition.left}px`,
                    }}
                  >
                    <div className="p-2">
                      <div className="text-xs text-accent mb-2 font-bold">
                        CAMPOS DISPONÍVEIS:
                      </div>
                      {getAvailableResponseFields().map((fieldName) => (
                        <button
                          key={fieldName}
                          type="button"
                          onClick={() => insertAutocompleteValue(fieldName)}
                          className="block w-full text-left px-3 py-2 text-xs hover:bg-primary hover:text-background transition-colors"
                        >
                          {fieldName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

      {/* Modal de Criação/Edição de Path */}
      {showPathModal && currentIntegrationForPath && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="terminal-border bg-background p-8 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} {editingPath ? 'EDITAR PATH' : 'NOVO PATH'}
              </h2>
              <button
                onClick={() => setShowPathModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 border border-accent">
              <div className="text-xs text-accent">INTEGRAÇÃO:</div>
              <div className="text-sm text-primary font-bold mt-1">
                {currentIntegrationForPath.nome}
              </div>
            </div>

            <form onSubmit={handleSubmitPath} className="space-y-6">
              <div>
                <label className="text-xs text-secondary mb-2 block">NOME:*</label>
                <input
                  type="text"
                  value={pathFormData.nome}
                  onChange={(e) => setPathFormData({ ...pathFormData, nome: e.target.value })}
                  placeholder="Ex: Login"
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={savingPath}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-secondary mb-2 block">PATH:*</label>
                <input
                  type="text"
                  value={pathFormData.path}
                  onChange={(e) => setPathFormData({ ...pathFormData, path: e.target.value })}
                  placeholder="Ex: /auth/login"
                  className="terminal-input w-full px-4 py-2 text-sm"
                  disabled={savingPath}
                  required
                />
              </div>

              <div className="border-t-2 border-primary pt-6 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowPathModal(false)}
                  disabled={savingPath}
                  className="px-6 py-2 border-2 border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold"
                >
                  [CANCELAR]
                </button>
                <button
                  type="submit"
                  disabled={savingPath}
                  className="terminal-button px-6 py-2 text-sm font-bold"
                >
                  {savingPath ? '[SALVANDO...]' : '[SALVAR]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição de Request */}
      {showRequestModal && currentPathForRequest && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="terminal-border bg-background p-8 max-w-5xl w-full my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-primary">
                {'>'} {editingRequest ? 'EDITAR REQUEST' : 'NOVO REQUEST'}
              </h2>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4 p-3 border border-accent">
              <div className="text-xs text-accent">PATH:</div>
              <div className="text-sm text-primary font-bold mt-1">
                {currentPathForRequest.nome} - {currentPathForRequest.path}
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-secondary mb-2 block">NOME:*</label>
                  <input
                    type="text"
                    value={requestFormData.nome}
                    onChange={(e) => setRequestFormData({ ...requestFormData, nome: e.target.value })}
                    placeholder="Ex: Login Request"
                    className="terminal-input w-full px-4 py-2 text-sm"
                    disabled={savingRequest}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-secondary mb-2 block">HTTP METHOD:*</label>
                  <select
                    value={requestFormData.httpMethod}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, httpMethod: e.target.value as HttpMethod })
                    }
                    className="terminal-input w-full px-4 py-2 text-sm"
                    disabled={savingRequest}
                  >
                    {HTTP_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-secondary mb-2 block">CONTENT TYPE:*</label>
                  <select
                    value={requestFormData.contentType}
                    onChange={(e) =>
                      setRequestFormData({ ...requestFormData, contentType: e.target.value as ContentType })
                    }
                    className="terminal-input w-full px-4 py-2 text-sm"
                    disabled={savingRequest}
                  >
                    {CONTENT_TYPES.map((ct) => (
                      <option key={ct.value} value={ct.value}>
                        {ct.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Body Fields - Accordion */}
              <div className="border-2 border-primary">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors"
                  onClick={() => setIsBodyFieldsOpen(!isBodyFieldsOpen)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight
                      className={`w-4 h-4 text-primary transition-transform ${
                        isBodyFieldsOpen ? 'rotate-90' : ''
                      }`}
                    />
                    <label className="text-xs text-primary font-bold cursor-pointer">BODY FIELDS</label>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {bodyFields.filter(f => f.key.trim()).length} campos
                  </div>
                </div>

                {isBodyFieldsOpen && (
                  <div className="border-t-2 border-primary p-4">
                    <div className="flex items-center justify-end mb-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setBodyFields([...bodyFields, { key: '', value: '' }])
                        }}
                        className="text-xs text-accent hover:text-primary"
                      >
                        + ADICIONAR CAMPO
                      </button>
                    </div>
                    <div className="space-y-2">
                      {bodyFields.map((field, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="key"
                            value={field.key}
                            onChange={(e) => {
                              const updated = [...bodyFields]
                              updated[index].key = e.target.value
                              setBodyFields(updated)
                            }}
                            className="terminal-input flex-1 px-3 py-1 text-xs"
                            disabled={savingRequest}
                          />
                          <input
                            type="text"
                            placeholder="type (ex: string, number)"
                            value={field.value}
                            onChange={(e) => {
                              const updated = [...bodyFields]
                              updated[index].value = e.target.value
                              setBodyFields(updated)
                            }}
                            className="terminal-input flex-1 px-3 py-1 text-xs"
                            disabled={savingRequest}
                          />
                          {bodyFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setBodyFields(bodyFields.filter((_, i) => i !== index))}
                              className="text-destructive hover:text-destructive-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Header Fields - Accordion */}
              <div className="border-2 border-primary">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors"
                  onClick={() => setIsHeaderFieldsOpen(!isHeaderFieldsOpen)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight
                      className={`w-4 h-4 text-primary transition-transform ${
                        isHeaderFieldsOpen ? 'rotate-90' : ''
                      }`}
                    />
                    <label className="text-xs text-primary font-bold cursor-pointer">HEADER FIELDS</label>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {headerFieldsReq.filter(f => f.key.trim()).length} campos
                  </div>
                </div>

                {isHeaderFieldsOpen && (
                  <div className="border-t-2 border-primary p-4">
                    <div className="flex items-center justify-end mb-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setHeaderFieldsReq([...headerFieldsReq, { key: '', value: '' }])
                        }}
                        className="text-xs text-accent hover:text-primary"
                      >
                        + ADICIONAR HEADER
                      </button>
                    </div>
                    <div className="space-y-2">
                      {headerFieldsReq.map((field, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="header name"
                            value={field.key}
                            onChange={(e) => {
                              const updated = [...headerFieldsReq]
                              updated[index].key = e.target.value
                              setHeaderFieldsReq(updated)
                            }}
                            className="terminal-input flex-1 px-3 py-1 text-xs"
                            disabled={savingRequest}
                          />
                          <input
                            type="text"
                            placeholder="type"
                            value={field.value}
                            onChange={(e) => {
                              const updated = [...headerFieldsReq]
                              updated[index].value = e.target.value
                              setHeaderFieldsReq(updated)
                            }}
                            className="terminal-input flex-1 px-3 py-1 text-xs"
                            disabled={savingRequest}
                          />
                          {headerFieldsReq.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setHeaderFieldsReq(headerFieldsReq.filter((_, i) => i !== index))}
                              className="text-destructive hover:text-destructive-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Param Fields - Accordion */}
              <div className="border-2 border-primary">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-primary hover:bg-opacity-5 transition-colors"
                  onClick={() => setIsParamFieldsOpen(!isParamFieldsOpen)}
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight
                      className={`w-4 h-4 text-primary transition-transform ${
                        isParamFieldsOpen ? 'rotate-90' : ''
                      }`}
                    />
                    <label className="text-xs text-primary font-bold cursor-pointer">PARAM FIELDS</label>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {paramFields.filter(f => f.key.trim()).length} campos
                  </div>
                </div>

                {isParamFieldsOpen && (
                  <div className="border-t-2 border-primary p-4">
                    <div className="flex items-center justify-end mb-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setParamFields([...paramFields, { key: '', value: '' }])
                        }}
                        className="text-xs text-accent hover:text-primary"
                      >
                        + ADICIONAR PARAM
                      </button>
                    </div>
                    <div className="space-y-2">
                      {paramFields.map((field, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="param name"
                            value={field.key}
                            onChange={(e) => {
                              const updated = [...paramFields]
                              updated[index].key = e.target.value
                              setParamFields(updated)
                            }}
                            className="terminal-input flex-1 px-3 py-1 text-xs"
                            disabled={savingRequest}
                          />
                          <input
                            type="text"
                            placeholder="type"
                            value={field.value}
                            onChange={(e) => {
                              const updated = [...paramFields]
                              updated[index].value = e.target.value
                              setParamFields(updated)
                            }}
                            className="terminal-input flex-1 px-3 py-1 text-xs"
                            disabled={savingRequest}
                          />
                          {paramFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setParamFields(paramFields.filter((_, i) => i !== index))}
                              className="text-destructive hover:text-destructive-foreground"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Request Example - Accordion (apenas para POST + APPLICATION_JSON) */}
              {requestFormData.httpMethod === 'POST' && requestFormData.contentType === 'APPLICATION_JSON' && (
                <div className="border-2 border-accent">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent hover:bg-opacity-5 transition-colors"
                    onClick={() => setIsRequestExampleOpen(!isRequestExampleOpen)}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight
                        className={`w-4 h-4 text-accent transition-transform ${
                          isRequestExampleOpen ? 'rotate-90' : ''
                        }`}
                      />
                      <label className="text-xs text-accent font-bold cursor-pointer">REQUEST EXAMPLE (JSON)</label>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isRequestExampleOpen ? 'Clique para fechar' : 'Clique para abrir'}
                    </div>
                  </div>

                  {isRequestExampleOpen && (
                    <div className="border-t-2 border-accent p-4">
                      <div className="text-xs mb-3 text-muted-foreground">
                        Insira um exemplo de JSON para o request:
                      </div>
                      <textarea
                        value={requestExampleJson}
                        onChange={(e) => setRequestExampleJson(e.target.value)}
                        placeholder='{\n  "key": "value",\n  "nested": {\n    "field": "example"\n  }\n}'
                        className="terminal-input w-full px-4 py-3 text-xs font-mono min-h-[200px] resize-y"
                        disabled={savingRequest}
                        style={{ fontFamily: 'monospace' }}
                      />
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span className="text-secondary">•</span> Use JSON válido para facilitar testes futuros
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="border-t-2 border-primary pt-6 flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  disabled={savingRequest}
                  className="px-6 py-2 border-2 border-muted text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm font-bold"
                >
                  [CANCELAR]
                </button>
                <button
                  type="submit"
                  disabled={savingRequest}
                  className="terminal-button px-6 py-2 text-sm font-bold"
                >
                  {savingRequest ? '[SALVANDO...]' : '[SALVAR]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Teste de Request */}
      {showTestModal && testingRequest && (
        <div className="fixed inset-0 bg-background bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="terminal-border bg-background max-w-6xl w-full my-8 max-h-[90vh] flex flex-col">
            {/* Header fixo */}
            <div className="flex items-center justify-between p-8 pb-6 border-b-2 border-primary">
              <h2 className="text-xl font-bold text-primary">
                {'>'} TESTE DE REQUEST
              </h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo scrollável */}
            <div className="overflow-y-auto px-8 py-6">
              {/* Informações do Request */}
              <div className="mb-6 p-4 border-2 border-accent">
              <div className="text-xs text-accent mb-2">REQUEST:</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>{' '}
                  <span className="text-primary font-bold">{testingRequest.nome}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Método:</span>{' '}
                  <span className="text-accent font-bold">[{testingRequest.httpMethod}]</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Path:</span>{' '}
                  <span className="text-primary">{testingRequest.pathValue}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Content Type:</span>{' '}
                  <span className="text-primary">{testingRequest.contentType}</span>
                </div>
              </div>
            </div>

            {/* Botão de Execução */}
            <div className="mb-6 flex justify-center">
              <button
                onClick={executeTest}
                disabled={isTestRunning}
                className="terminal-button px-8 py-3 text-sm font-bold flex items-center gap-3 disabled:opacity-50"
              >
                <Play className="w-5 h-5" />
                {isTestRunning ? '[EXECUTANDO TESTE...]' : '[EXECUTAR TESTE]'}
              </button>
            </div>

            {/* Resultado do Teste */}
            {testResult && (
              <div className="space-y-4">
                {/* Status do Teste */}
                <div className={`border-2 p-4 ${testResult.success ? 'border-accent' : 'border-destructive'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`font-bold ${testResult.success ? 'text-accent' : 'text-destructive'}`}>
                        {testResult.success ? '[SUCESSO]' : '[FALHA]'}
                      </span>
                      <span className="text-muted-foreground ml-4">
                        Status: {testResult.statusCode} - {testResult.statusMessage}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Tempo: {testResult.responseTimeMs}ms
                    </div>
                  </div>
                  {testResult.errorMessage && (
                    <div className="mt-3 text-xs text-destructive">
                      ERRO: {testResult.errorMessage}
                    </div>
                  )}
                </div>

                {/* Request Details */}
                <div className="border-2 border-primary p-4">
                  <div className="text-xs text-secondary font-bold mb-3">REQUEST DETAILS:</div>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">URL:</span>{' '}
                      <span className="text-accent">{testResult.fullUrl}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Método:</span>{' '}
                      <span className="text-primary font-bold">{testResult.httpMethod}</span>
                    </div>

                    {/* Request Headers */}
                    {testResult.requestHeaders && Object.keys(testResult.requestHeaders).length > 0 && (
                      <div>
                        <div className="text-secondary mb-2">Headers:</div>
                        <pre className="bg-background border border-primary p-2 overflow-x-auto">
                          {JSON.stringify(testResult.requestHeaders, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Request Params */}
                    {testResult.requestParams && Object.keys(testResult.requestParams).length > 0 && (
                      <div>
                        <div className="text-secondary mb-2">Params:</div>
                        <pre className="bg-background border border-primary p-2 overflow-x-auto">
                          {JSON.stringify(testResult.requestParams, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Request Body */}
                    {testResult.requestBody && (
                      <div>
                        <div className="text-secondary mb-2">Body:</div>
                        <pre className="bg-background border border-primary p-2 overflow-x-auto">
                          {typeof testResult.requestBody === 'string'
                            ? testResult.requestBody
                            : JSON.stringify(testResult.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Response Details */}
                <div className="border-2 border-primary p-4">
                  <div className="text-xs text-secondary font-bold mb-3">RESPONSE DETAILS:</div>
                  <div className="space-y-3 text-xs">
                    {/* Response Headers */}
                    {testResult.responseHeaders && Object.keys(testResult.responseHeaders).length > 0 && (
                      <div>
                        <div className="text-secondary mb-2">Headers:</div>
                        <pre className="bg-background border border-primary p-2 overflow-x-auto">
                          {JSON.stringify(testResult.responseHeaders, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response Body */}
                    {testResult.responseBody && (
                      <div>
                        <div className="text-secondary mb-2">Body:</div>
                        <pre className="bg-background border border-primary p-2 overflow-x-auto max-h-96">
                          {typeof testResult.responseBody === 'string'
                            ? testResult.responseBody
                            : JSON.stringify(testResult.responseBody, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Extracted Fields - Accordion */}
                {testResult.extractedFields && Object.keys(testResult.extractedFields).length > 0 && (
                  <div className="border-2 border-accent">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent hover:bg-opacity-5 transition-colors"
                      onClick={() => setIsExtractedFieldsOpen(!isExtractedFieldsOpen)}
                    >
                      <div className="flex items-center gap-3">
                        <ChevronRight
                          className={`w-4 h-4 text-accent transition-transform ${
                            isExtractedFieldsOpen ? 'rotate-90' : ''
                          }`}
                        />
                        <div className="text-xs text-accent font-bold">EXTRACTED FIELDS</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Object.keys(testResult.extractedFields).length} campos
                      </div>
                    </div>

                    {isExtractedFieldsOpen && (
                      <div className="border-t-2 border-accent p-4">
                        <div className="text-xs mb-3 text-muted-foreground">
                          Campos extraídos da resposta com seus tipos e posições:
                        </div>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                          {Object.entries(testResult.extractedFields).map(([fieldPath, fieldType]) => (
                            <div
                              key={fieldPath}
                              className="flex items-center justify-between p-2 border border-accent hover:bg-accent hover:bg-opacity-5"
                            >
                              <span className="text-primary font-bold">{fieldPath}</span>
                              <span className="text-accent text-xs">[{fieldType}]</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            </div>

            {/* Footer fixo com botões */}
            <div className="border-t-2 border-primary p-8 pt-6 flex items-center justify-end">
              <button
                onClick={() => setShowTestModal(false)}
                className="terminal-button px-6 py-2 text-sm font-bold"
              >
                [FECHAR]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
