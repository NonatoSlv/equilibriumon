// Cliente API que funciona em modo demo (sem backend)
import { demoConfig } from '../config/demo'
import { mockAuth, mockData } from '../utils/mockAuth'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const demoClient = {
  // Autenticação
  async login(email: string, password: string) {
    await delay(demoConfig.mockDelay)
    return mockAuth.login(email, password)
  },

  async register(name: string, email: string, password: string) {
    await delay(demoConfig.mockDelay)
    return mockAuth.register(name, email, password)
  },

  async me(token: string) {
    await delay(demoConfig.mockDelay)
    return mockAuth.verifyToken(token)
  },

  // Empresas
  async getEmpresas() {
    await delay(demoConfig.mockDelay)
    return { items: mockData.empresas }
  },

  async createEmpresa(nome: string) {
    await delay(demoConfig.mockDelay)
    const newEmpresa = {
      id: mockData.empresas.length + 1,
      nome
    }
    mockData.empresas.push(newEmpresa)
    return { item: newEmpresa }
  },

  // Lançamentos
  async getLancamentos(params?: any) {
    await delay(demoConfig.mockDelay)
    let items = [...mockData.lancamentos]
    
    // Filtrar por empresa se necessário
    if (params?.empresaId) {
      items = items.filter(l => l.empresa_id === Number(params.empresaId))
    }
    
    return { items }
  },

  async createLancamento(data: any) {
    await delay(demoConfig.mockDelay)
    const newLancamento = {
      id: mockData.lancamentos.length + 1,
      ...data,
      date: data.date || new Date().toISOString().split('T')[0]
    }
    mockData.lancamentos.push(newLancamento)
    return { item: newLancamento }
  },

  async updateLancamento(id: number, data: any) {
    await delay(demoConfig.mockDelay)
    const index = mockData.lancamentos.findIndex(l => l.id === id)
    if (index >= 0) {
      mockData.lancamentos[index] = { ...mockData.lancamentos[index], ...data }
      return { item: mockData.lancamentos[index] }
    }
    throw new Error('Lançamento não encontrado')
  },

  async deleteLancamento(id: number) {
    await delay(demoConfig.mockDelay)
    const index = mockData.lancamentos.findIndex(l => l.id === id)
    if (index >= 0) {
      mockData.lancamentos.splice(index, 1)
      return { success: true }
    }
    throw new Error('Lançamento não encontrado')
  },

  // Plano de Contas
  async getPlanoContas() {
    await delay(demoConfig.mockDelay)
    return { items: mockData.planoContas }
  },

  async getPlanoContasByTipo(tipo: string) {
    await delay(demoConfig.mockDelay)
    return { items: mockData.planoContas.filter(p => p.tipo === tipo) }
  },

  // Relatórios
  async getDRE(params?: any) {
    await delay(demoConfig.mockDelay)
    const receitas = mockData.lancamentos
      .filter(l => l.tipo === 'receita')
      .reduce((sum, l) => sum + l.valor, 0)
    
    const despesas = mockData.lancamentos
      .filter(l => l.tipo === 'despesa')
      .reduce((sum, l) => sum + l.valor, 0)
    
    return {
      receitas,
      despesas,
      resultado: receitas - despesas,
      resumo: [
        { category: 'Vendas', receitas: 5000, despesas: 0 },
        { category: 'Serviços', receitas: 3000, despesas: 0 },
        { category: 'Fornecedores', receitas: 0, despesas: 2000 }
      ]
    }
  },

  async getBalanco(params?: any) {
    await delay(demoConfig.mockDelay)
    return {
      ativos: 10000,
      passivos: 3000,
      patrimonio: 7000
    }
  },

  // Health check
  async health() {
    await delay(100)
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      version: '1.0.0-demo',
      environment: 'demo'
    }
  }
}
