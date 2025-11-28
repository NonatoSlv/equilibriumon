// Cliente inteligente que usa demo ou API real automaticamente
import { api } from './client'
import { demoClient } from './demoClient'
import { demoConfig } from '../config/demo'

// Detecta automaticamente se deve usar modo demo
const shouldUseDemoMode = () => {
  // Se DEMO_MODE está explicitamente ativado
  if (demoConfig.enabled) return true
  
  // Se a API_URL aponta para localhost (desenvolvimento)
  const apiUrl = import.meta.env.VITE_API_URL || ''
  if (apiUrl.includes('localhost')) return false
  
  // Em produção sem backend configurado, usa demo
  return !apiUrl || apiUrl === '/api'
}

const USE_DEMO = shouldUseDemoMode()

console.log(`🎯 Modo: ${USE_DEMO ? 'DEMO (sem backend)' : 'API REAL'}`)

export const smartClient = {
  // Auth
  async login(email: string, password: string) {
    if (USE_DEMO) {
      const result = await demoClient.login(email, password)
      localStorage.setItem('balancepro_token', result.token)
      localStorage.setItem('balancepro_user', JSON.stringify(result.user))
      return result
    }
    
    const client = api()
    return await client.post('/api/auth/login', { email, password })
  },

  async register(name: string, email: string, password: string) {
    if (USE_DEMO) {
      const result = await demoClient.register(name, email, password)
      localStorage.setItem('balancepro_token', result.token)
      localStorage.setItem('balancepro_user', JSON.stringify(result.user))
      return result
    }
    
    const client = api()
    return await client.post('/api/auth/register', { name, email, password })
  },

  async me() {
    if (USE_DEMO) {
      const token = localStorage.getItem('balancepro_token')
      if (!token) throw new Error('Não autenticado')
      return await demoClient.me(token)
    }
    
    const client = api()
    return await client.get('/api/me')
  },

  // Empresas
  async getEmpresas() {
    if (USE_DEMO) return await demoClient.getEmpresas()
    const client = api()
    return await client.get('/api/empresas')
  },

  async createEmpresa(nome: string) {
    if (USE_DEMO) return await demoClient.createEmpresa(nome)
    const client = api()
    return await client.post('/api/empresas', { nome })
  },

  // Lançamentos
  async getLancamentos(params?: any) {
    if (USE_DEMO) return await demoClient.getLancamentos(params)
    const client = api()
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return await client.get(`/api/lancamentos${query}`)
  },

  async createLancamento(data: any) {
    if (USE_DEMO) return await demoClient.createLancamento(data)
    const client = api()
    return await client.post('/api/lancamentos', data)
  },

  async updateLancamento(id: number, data: any) {
    if (USE_DEMO) return await demoClient.updateLancamento(id, data)
    const client = api()
    return await client.put(`/api/lancamentos/${id}`, data)
  },

  async deleteLancamento(id: number) {
    if (USE_DEMO) return await demoClient.deleteLancamento(id)
    const client = api()
    return await client.delete(`/api/lancamentos/${id}`)
  },

  // Plano de Contas
  async getPlanoContas() {
    if (USE_DEMO) return await demoClient.getPlanoContas()
    const client = api()
    return await client.get('/api/plano-contas')
  },

  async getPlanoContasByTipo(tipo: string) {
    if (USE_DEMO) return await demoClient.getPlanoContasByTipo(tipo)
    const client = api()
    return await client.get(`/api/plano-contas/tipo/${tipo}`)
  },

  // Relatórios
  async getDRE(params?: any) {
    if (USE_DEMO) return await demoClient.getDRE(params)
    const client = api()
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return await client.get(`/api/reports/dre${query}`)
  },

  async getBalanco(params?: any) {
    if (USE_DEMO) return await demoClient.getBalanco(params)
    const client = api()
    const query = params ? `?${new URLSearchParams(params).toString()}` : ''
    return await client.get(`/api/reports/balanco${query}`)
  },

  // Health
  async health() {
    if (USE_DEMO) return await demoClient.health()
    const client = api()
    return await client.get('/api/health')
  },

  // Informações
  isDemoMode: () => USE_DEMO
}
