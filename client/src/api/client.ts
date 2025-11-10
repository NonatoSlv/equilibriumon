import config from '../config/env'

export type ApiClientOptions = {
  baseURL?: string
  timeout?: number
}

export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown
  constructor(
    message: string,
    status: number,
    code?: string,
    details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function api(options: ApiClientOptions = {}) {
  const baseURL = options.baseURL || config.apiUrl
  const timeout = options.timeout || config.timeouts.api
  const token = typeof window !== 'undefined' ? localStorage.getItem(config.cache.tokenKey) : null

  async function request<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string>),
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    try {
      const resp = await fetch(`${baseURL}${path}`, { 
        ...init, 
        headers,
        signal: AbortSignal.timeout(timeout)
      })
      
      const isJson = resp.headers.get('content-type')?.includes('application/json')
      const dataRaw = isJson ? await resp.json() : await resp.text()
      
      if (!resp.ok) {
        let errorMessage = resp.statusText || 'Erro de requisição'
        let errorCode: string | undefined = 'unknown_error'
        if (typeof dataRaw === 'object' && dataRaw !== null) {
          const obj = dataRaw as Record<string, unknown>
          errorMessage = (typeof obj.message === 'string' ? obj.message : errorMessage)
          errorCode = (typeof obj.error === 'string' ? obj.error : errorCode)
        } else if (typeof dataRaw === 'string' && dataRaw.trim().length) {
          errorMessage = dataRaw
        }
        
        // Tratar erros específicos
        if (resp.status === 401) {
          // Token expirado ou inválido - limpar localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem(config.cache.tokenKey)
            localStorage.removeItem(config.cache.userKey)
            // Redirecionar para login se não estiver já na página de login
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login'
            }
          }
        }
        
        throw new ApiError(errorMessage, resp.status, errorCode, dataRaw)
      }
      
      return dataRaw as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      
      // Erros de rede ou timeout
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Tempo limite da requisição excedido', 408, 'timeout')
        }
        if (error.message.includes('Failed to fetch')) {
          throw new ApiError('Erro de conexão. Verifique sua internet.', 0, 'network_error')
        }
      }
      
      throw new ApiError('Erro inesperado', 500, 'unknown_error', error)
    }
  }

  return {
    get: <T = unknown>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T = unknown>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T = unknown>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T = unknown>(path: string) => request<T>(path, { method: 'DELETE' }),
  }
}