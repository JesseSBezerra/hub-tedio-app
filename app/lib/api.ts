const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8101'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  type: string
}

export interface User {
  userId: number
  userName: string
  userEmail: string
  permissions: string[]
}

export interface Permission {
  id: number
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface UpdatePermissionsRequest {
  permissions: string[]
}

export interface Owner {
  id: number
  nome: string
  descricao: string
  createdAt: string
  updatedAt: string
}

export interface CreateOwnerRequest {
  nome: string
  descricao: string
}

export interface UpdateOwnerRequest {
  nome: string
  descricao: string
}

export type AuthenticationType = 'OAUTH2' | 'BASIC' | 'BEARER' | 'API_KEY' | 'NONE'
export type ContentType = 'APPLICATION_JSON' | 'APPLICATION_XML' | 'APPLICATION_FORM_URLENCODED' | 'MULTIPART_FORM_DATA' | 'TEXT_PLAIN'

export interface Authentication {
  id: number
  nome: string
  descricao: string
  ownerId: number
  ownerNome: string
  url: string
  authenticationType: AuthenticationType
  contentType: ContentType
  requestBody: Record<string, any> | null
  headers: Record<string, string> | null
  responseFields: Record<string, string> | null
  createdAt: string
  updatedAt: string
}

export interface CreateAuthenticationRequest {
  nome: string
  descricao: string
  ownerId: number
  url: string
  authenticationType: AuthenticationType
  contentType: ContentType
  requestBody: Record<string, any>
  headers: Record<string, string>
}

export interface UpdateAuthenticationRequest {
  nome: string
  descricao: string
  ownerId: number
  url: string
  authenticationType: AuthenticationType
  contentType: ContentType
  requestBody: Record<string, any>
  headers: Record<string, string>
}

export interface TestAuthenticationResponse {
  success: boolean
  statusCode: number
  statusMessage: string
  responseHeaders: Record<string, string>
  responseBody: string
  extractedFields: Record<string, string>
  errorMessage: string | null
  responseTimeMs: number
}

export interface Integration {
  id: number
  nome: string
  description: string
  baseUrl: string
  ownerId: number
  ownerNome: string
  authenticationId: number
  authenticationNome: string
  headers: Record<string, string> | null
  createdAt: string
  updatedAt: string
}

export interface CreateIntegrationRequest {
  nome: string
  description: string
  baseUrl: string
  ownerId: number
  authenticationId: number
  headers: Record<string, string>
}

export interface UpdateIntegrationRequest {
  nome: string
  description: string
  baseUrl: string
  ownerId: number
  authenticationId: number
  headers: Record<string, string>
}

export interface Path {
  id: number
  nome: string
  path: string
  integrationId: number
  integrationNome: string
  createdAt: string
  updatedAt: string
}

export interface CreatePathRequest {
  nome: string
  path: string
  integrationId: number
}

export interface UpdatePathRequest {
  nome: string
  path: string
  integrationId: number
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface Request {
  id: number
  nome: string
  httpMethod: HttpMethod
  pathId: number
  pathNome: string
  pathValue: string
  contentType: ContentType
  bodyFields: Record<string, string> | null
  headerFields: Record<string, string> | null
  paramFields: Record<string, string> | null
  requestExample: Record<string, any> | null
  createdAt: string
  updatedAt: string
}

export interface CreateRequestRequest {
  nome: string
  httpMethod: HttpMethod
  pathId: number
  contentType: ContentType
  bodyFields: Record<string, string>
  headerFields: Record<string, string>
  paramFields: Record<string, string>
  requestExample: Record<string, any>
}

export interface UpdateRequestRequest {
  nome: string
  httpMethod: HttpMethod
  pathId: number
  contentType: ContentType
  bodyFields: Record<string, string>
  headerFields: Record<string, string>
  paramFields: Record<string, string>
  requestExample: Record<string, any>
}

export interface TestRequestResponse {
  success: boolean
  statusCode: number
  statusMessage: string
  fullUrl: string
  httpMethod: HttpMethod
  requestHeaders: Record<string, string>
  requestParams: Record<string, string>
  requestBody: any
  responseHeaders: Record<string, string>
  responseBody: any
  extractedFields: Record<string, string>
  errorMessage: string | null
  responseTimeMs: number
}

export interface Evolution {
  id: number
  nome: string
  descricao: string
  url: string
  apiKey: string
  ownerId: number
  ownerNome: string
  createdAt: string
  updatedAt: string
}

export interface CreateEvolutionRequest {
  nome: string
  descricao: string
  url: string
  apiKey: string
  ownerId: number
}

export interface UpdateEvolutionRequest {
  nome: string
  descricao: string
  url: string
  apiKey: string
  ownerId: number
}

export interface EvolutionInstance {
  id: number
  instanceName: string
  instanceId: string
  qrcode: boolean
  qrcodeBase64: string | null
  integration: string
  status: string
  hash: string
  evolutionId: number
  evolutionNome: string
  userId: number
  userName: string
  webhookUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateInstanceRequest {
  instanceName: string
  qrcode: boolean
  evolutionId: number
  integration: string
  webhookUrl?: string
}

export interface ConnectionStateResponse {
  instance: {
    instanceName: string
    state: string
  }
  state: string | null
}

export interface ConnectResponse {
  pairingCode: string | null
  code: string | null
  base64: string | null
  count: number | null
}

export interface LogoutResponse {
  status: string
  error: boolean
  response: {
    message: string
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      throw new ApiError(response.status, 'Credenciais inválidas')
    }

    return response.json()
  },

  async getUser(token: string): Promise<User> {
    console.log('[API] Buscando permissões do usuário')
    console.log('[API] Token:', token)

    const response = await fetch(
      `${API_BASE_URL}/api/permission`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    console.log('[API] Response status:', response.status)
    console.log('[API] Response ok:', response.ok)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro na resposta:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar usuário')
    }

    const data = await response.json()
    console.log('[API] Dados retornados:', data)

    return data
  },
}

export const permissionApi = {
  async getAvailablePermissions(token: string): Promise<Permission[]> {
    console.log('[API] Buscando permissões disponíveis')

    const response = await fetch(`${API_BASE_URL}/api/permission/available`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar permissões:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar permissões disponíveis')
    }

    const data = await response.json()
    console.log('[API] Permissões disponíveis:', data)

    return data
  },

  async updatePermissions(token: string, permissions: string[]): Promise<User> {
    console.log('[API] Atualizando permissões:', permissions)

    const response = await fetch(`${API_BASE_URL}/api/permission`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ permissions }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao atualizar permissões:', errorText)
      throw new ApiError(response.status, 'Erro ao atualizar permissões')
    }

    const data = await response.json()
    console.log('[API] Permissões atualizadas:', data)

    return data
  },
}

export const ownerApi = {
  async getAll(token: string): Promise<Owner[]> {
    console.log('[API] Buscando todos os owners')

    const response = await fetch(`${API_BASE_URL}/api/owner`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar owners:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar owners')
    }

    const data = await response.json()
    console.log('[API] Owners:', data)

    return data
  },

  async getById(token: string, id: number): Promise<Owner> {
    console.log('[API] Buscando owner por ID:', id)

    const response = await fetch(`${API_BASE_URL}/api/owner/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar owner:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar owner')
    }

    const data = await response.json()
    console.log('[API] Owner:', data)

    return data
  },

  async create(token: string, owner: CreateOwnerRequest): Promise<Owner> {
    console.log('[API] Criando owner:', owner)

    const response = await fetch(`${API_BASE_URL}/api/owner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(owner),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao criar owner:', errorText)
      throw new ApiError(response.status, 'Erro ao criar owner')
    }

    const data = await response.json()
    console.log('[API] Owner criado:', data)

    return data
  },

  async update(token: string, id: number, owner: UpdateOwnerRequest): Promise<Owner> {
    console.log('[API] Atualizando owner:', id, owner)

    const response = await fetch(`${API_BASE_URL}/api/owner/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(owner),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao atualizar owner:', errorText)
      throw new ApiError(response.status, 'Erro ao atualizar owner')
    }

    const data = await response.json()
    console.log('[API] Owner atualizado:', data)

    return data
  },

  async delete(token: string, id: number): Promise<void> {
    console.log('[API] Deletando owner:', id)

    const response = await fetch(`${API_BASE_URL}/api/owner/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text()
      console.error('[API] Erro ao deletar owner:', errorText)
      throw new ApiError(response.status, 'Erro ao deletar owner')
    }

    console.log('[API] Owner deletado com sucesso')
  },
}

export const authenticationApi = {
  async getAll(token: string, ownerId?: number): Promise<Authentication[]> {
    console.log('[API] Buscando autenticações', ownerId ? `para owner ${ownerId}` : '')

    const url = ownerId
      ? `${API_BASE_URL}/api/register/authentication?ownerId=${ownerId}`
      : `${API_BASE_URL}/api/register/authentication`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar autenticações:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar autenticações')
    }

    const data = await response.json()
    console.log('[API] Autenticações:', data)

    return data
  },

  async getById(token: string, id: number): Promise<Authentication> {
    console.log('[API] Buscando autenticação por ID:', id)

    const response = await fetch(`${API_BASE_URL}/api/register/authentication/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar autenticação:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar autenticação')
    }

    const data = await response.json()
    console.log('[API] Autenticação:', data)

    return data
  },

  async create(token: string, auth: CreateAuthenticationRequest): Promise<Authentication> {
    console.log('[API] Criando autenticação:', auth)

    const response = await fetch(`${API_BASE_URL}/api/register/authentication`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(auth),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao criar autenticação:', errorText)
      throw new ApiError(response.status, 'Erro ao criar autenticação')
    }

    const data = await response.json()
    console.log('[API] Autenticação criada:', data)

    return data
  },

  async update(token: string, id: number, auth: UpdateAuthenticationRequest): Promise<Authentication> {
    console.log('[API] Atualizando autenticação:', id, auth)

    const response = await fetch(`${API_BASE_URL}/api/register/authentication/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(auth),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao atualizar autenticação:', errorText)
      throw new ApiError(response.status, 'Erro ao atualizar autenticação')
    }

    const data = await response.json()
    console.log('[API] Autenticação atualizada:', data)

    return data
  },

  async delete(token: string, id: number): Promise<void> {
    console.log('[API] Deletando autenticação:', id)

    const response = await fetch(`${API_BASE_URL}/api/register/authentication/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text()
      console.error('[API] Erro ao deletar autenticação:', errorText)
      throw new ApiError(response.status, 'Erro ao deletar autenticação')
    }

    console.log('[API] Autenticação deletada com sucesso')
  },

  async test(token: string, authName: string): Promise<TestAuthenticationResponse> {
    console.log('[API] Testando autenticação:', authName)

    const response = await fetch(`${API_BASE_URL}/api/register/authentication/test/${encodeURIComponent(authName)}?registerTest=true`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao testar autenticação:', errorText)
      throw new ApiError(response.status, 'Erro ao testar autenticação')
    }

    const data = await response.json()
    console.log('[API] Resultado do teste:', data)

    return data
  },
}

export const integrationApi = {
  async getAll(token: string, ownerId?: number): Promise<Integration[]> {
    console.log('[API] Buscando integrações', ownerId ? `para owner ${ownerId}` : '')

    const url = ownerId
      ? `${API_BASE_URL}/api/integration?ownerId=${ownerId}`
      : `${API_BASE_URL}/api/integration`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar integrações:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar integrações')
    }

    const data = await response.json()
    console.log('[API] Integrações:', data)

    return data
  },

  async getById(token: string, id: number): Promise<Integration> {
    console.log('[API] Buscando integração por ID:', id)

    const response = await fetch(`${API_BASE_URL}/api/integration/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar integração:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar integração')
    }

    const data = await response.json()
    console.log('[API] Integração:', data)

    return data
  },

  async create(token: string, integration: CreateIntegrationRequest): Promise<Integration> {
    console.log('[API] Criando integração:', integration)

    const response = await fetch(`${API_BASE_URL}/api/integration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(integration),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao criar integração:', errorText)
      throw new ApiError(response.status, 'Erro ao criar integração')
    }

    const data = await response.json()
    console.log('[API] Integração criada:', data)

    return data
  },

  async update(token: string, id: number, integration: UpdateIntegrationRequest): Promise<Integration> {
    console.log('[API] Atualizando integração:', id, integration)

    const response = await fetch(`${API_BASE_URL}/api/integration/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(integration),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao atualizar integração:', errorText)
      throw new ApiError(response.status, 'Erro ao atualizar integração')
    }

    const data = await response.json()
    console.log('[API] Integração atualizada:', data)

    return data
  },

  async delete(token: string, id: number): Promise<void> {
    console.log('[API] Deletando integração:', id)

    const response = await fetch(`${API_BASE_URL}/api/integration/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text()
      console.error('[API] Erro ao deletar integração:', errorText)
      throw new ApiError(response.status, 'Erro ao deletar integração')
    }

    console.log('[API] Integração deletada com sucesso')
  },
}

export const pathApi = {
  async getAll(token: string, integrationId?: number): Promise<Path[]> {
    console.log('[API] Buscando paths', integrationId ? `para integração ${integrationId}` : '')

    const url = integrationId
      ? `${API_BASE_URL}/api/path?integrationId=${integrationId}`
      : `${API_BASE_URL}/api/path`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar paths:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar paths')
    }

    const data = await response.json()
    console.log('[API] Paths:', data)

    return data
  },

  async getById(token: string, id: number): Promise<Path> {
    console.log('[API] Buscando path por ID:', id)

    const response = await fetch(`${API_BASE_URL}/api/path/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar path:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar path')
    }

    const data = await response.json()
    console.log('[API] Path:', data)

    return data
  },

  async create(token: string, path: CreatePathRequest): Promise<Path> {
    console.log('[API] Criando path:', path)

    const response = await fetch(`${API_BASE_URL}/api/path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(path),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao criar path:', errorText)
      throw new ApiError(response.status, 'Erro ao criar path')
    }

    const data = await response.json()
    console.log('[API] Path criado:', data)

    return data
  },

  async update(token: string, id: number, path: UpdatePathRequest): Promise<Path> {
    console.log('[API] Atualizando path:', id, path)

    const response = await fetch(`${API_BASE_URL}/api/path/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(path),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao atualizar path:', errorText)
      throw new ApiError(response.status, 'Erro ao atualizar path')
    }

    const data = await response.json()
    console.log('[API] Path atualizado:', data)

    return data
  },

  async delete(token: string, id: number): Promise<void> {
    console.log('[API] Deletando path:', id)

    const response = await fetch(`${API_BASE_URL}/api/path/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text()
      console.error('[API] Erro ao deletar path:', errorText)
      throw new ApiError(response.status, 'Erro ao deletar path')
    }

    console.log('[API] Path deletado com sucesso')
  },
}

export const requestApi = {
  async getAll(token: string, pathId?: number): Promise<Request[]> {
    console.log('[API] Buscando requests', pathId ? `para path ${pathId}` : '')

    const url = pathId
      ? `${API_BASE_URL}/api/request?pathId=${pathId}`
      : `${API_BASE_URL}/api/request`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar requests:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar requests')
    }

    const data = await response.json()
    console.log('[API] Requests:', data)

    return data
  },

  async getById(token: string, id: number): Promise<Request> {
    console.log('[API] Buscando request por ID:', id)

    const response = await fetch(`${API_BASE_URL}/api/request/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar request:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar request')
    }

    const data = await response.json()
    console.log('[API] Request:', data)

    return data
  },

  async create(token: string, request: CreateRequestRequest): Promise<Request> {
    console.log('[API] Criando request:', request)

    const response = await fetch(`${API_BASE_URL}/api/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao criar request:', errorText)
      throw new ApiError(response.status, 'Erro ao criar request')
    }

    const data = await response.json()
    console.log('[API] Request criado:', data)

    return data
  },

  async update(token: string, id: number, request: UpdateRequestRequest): Promise<Request> {
    console.log('[API] Atualizando request:', id, request)

    const response = await fetch(`${API_BASE_URL}/api/request/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao atualizar request:', errorText)
      throw new ApiError(response.status, 'Erro ao atualizar request')
    }

    const data = await response.json()
    console.log('[API] Request atualizado:', data)

    return data
  },

  async delete(token: string, id: number): Promise<void> {
    console.log('[API] Deletando request:', id)

    const response = await fetch(`${API_BASE_URL}/api/request/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text()
      console.error('[API] Erro ao deletar request:', errorText)
      throw new ApiError(response.status, 'Erro ao deletar request')
    }

    console.log('[API] Request deletado com sucesso')
  },

  async test(token: string, requestId: number): Promise<TestRequestResponse> {
    console.log('[API] Testando request:', requestId)

    const response = await fetch(`${API_BASE_URL}/api/request/test/${requestId}?registerTest=true`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao testar request:', errorText)
      throw new ApiError(response.status, 'Erro ao testar request')
    }

    const data = await response.json()
    console.log('[API] Resultado do teste:', data)

    return data
  },
}

// Funções para gerenciar token e usuário no localStorage
export const storage = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  },

  setUser(user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
  },

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      if (!user || user === 'undefined' || user === 'null') {
        return null
      }
      try {
        return JSON.parse(user)
      } catch (err) {
        console.error('[Storage] Erro ao fazer parse do usuário:', err)
        return null
      }
    }
    return null
  },

  clear() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },
}

export const evolutionApi = {
  async list(token: string): Promise<Evolution[]> {
    console.log('[API] Listando Evolutions')

    const response = await fetch(`${API_BASE_URL}/api/evolution`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao listar evolutions:', errorText)
      throw new ApiError(response.status, 'Erro ao listar evolutions')
    }

    const data = await response.json()
    console.log('[API] Evolutions listados:', data)

    return data
  },

  async create(token: string, evolution: CreateEvolutionRequest): Promise<Evolution> {
    console.log('[API] Criando Evolution:', evolution)

    const response = await fetch(`${API_BASE_URL}/api/evolution`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evolution),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao criar evolution:', errorText)
      throw new ApiError(response.status, 'Erro ao criar evolution')
    }

    const data = await response.json()
    console.log('[API] Evolution criado:', data)

    return data
  },

  async update(token: string, id: number, evolution: UpdateEvolutionRequest): Promise<Evolution> {
    console.log('[API] Atualizando Evolution:', id, evolution)

    const response = await fetch(`${API_BASE_URL}/api/evolution/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evolution),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao atualizar evolution:', errorText)
      throw new ApiError(response.status, 'Erro ao atualizar evolution')
    }

    const data = await response.json()
    console.log('[API] Evolution atualizado:', data)

    return data
  },

  async delete(token: string, id: number): Promise<void> {
    console.log('[API] Deletando Evolution:', id)

    const response = await fetch(`${API_BASE_URL}/api/evolution/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao deletar evolution:', errorText)
      throw new ApiError(response.status, 'Erro ao deletar evolution')
    }

    console.log('[API] Evolution deletado com sucesso')
  },
}

export const evolutionInstanceApi = {
  async list(token: string): Promise<EvolutionInstance[]> {
    console.log('[API] Listando Instances')

    const response = await fetch(`${API_BASE_URL}/api/evolution-instance`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao listar instances:', errorText)
      throw new ApiError(response.status, 'Erro ao listar instances')
    }

    const data = await response.json()
    console.log('[API] Instances listadas:', data)

    return data
  },

  async create(token: string, instance: CreateInstanceRequest): Promise<EvolutionInstance> {
    console.log('[API] Criando Instance:', instance)

    const response = await fetch(`${API_BASE_URL}/api/evolution-instance`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(instance),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao criar instance:', errorText)
      throw new ApiError(response.status, 'Erro ao criar instance')
    }

    const data = await response.json()
    console.log('[API] Instance criada:', data)

    return data
  },

  async delete(token: string, id: number): Promise<void> {
    console.log('[API] Deletando Instance:', id)

    const response = await fetch(`${API_BASE_URL}/api/evolution-instance/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text()
      console.error('[API] Erro ao deletar instance:', errorText)
      throw new ApiError(response.status, 'Erro ao deletar instance')
    }

    console.log('[API] Instance deletada com sucesso')
  },

  async connect(token: string, id: number): Promise<ConnectResponse> {
    console.log('[API] Conectando Instance:', id)

    const response = await fetch(`${API_BASE_URL}/api/evolution-instance/${id}/connect`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao conectar instance:', errorText)
      throw new ApiError(response.status, 'Erro ao conectar instance')
    }

    const data = await response.json()
    console.log('[API] Resposta de conexão:', data)

    return data
  },

  async logout(token: string, id: number): Promise<LogoutResponse> {
    console.log('[API] Fazendo logout da Instance:', id)

    const response = await fetch(`${API_BASE_URL}/api/evolution-instance/${id}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao fazer logout:', errorText)
      throw new ApiError(response.status, 'Erro ao fazer logout')
    }

    const data = await response.json()
    console.log('[API] Logout realizado:', data)

    return data
  },

  async getConnectionState(token: string, id: number): Promise<ConnectionStateResponse> {
    console.log('[API] Buscando estado de conexão da Instance:', id)

    const response = await fetch(`${API_BASE_URL}/api/evolution-instance/${id}/connection-state`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao buscar estado:', errorText)
      throw new ApiError(response.status, 'Erro ao buscar estado')
    }

    const data = await response.json()
    console.log('[API] Estado de conexão:', data)

    return data
  },

  async setWebhook(token: string, id: number, webhookUrl: string): Promise<EvolutionInstance> {
    console.log('[API] Configurando webhook da Instance:', id, webhookUrl)

    const response = await fetch(`${API_BASE_URL}/api/evolution-instance/${id}/webhook`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ webhookUrl }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[API] Erro ao configurar webhook:', errorText)
      throw new ApiError(response.status, 'Erro ao configurar webhook')
    }

    const data = await response.json()
    console.log('[API] Webhook configurado:', data)

    return data
  },
}
