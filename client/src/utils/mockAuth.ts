// Sistema de autenticação simulado para demonstração
// Funciona sem backend!

const MOCK_USER = {
  id: 1,
  email: 'admin@balancepro.local',
  name: 'Administrador'
}

const MOCK_PASSWORD = 'admin123'

export const mockAuth = {
  login: async (email: string, password: string) => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
      const token = btoa(JSON.stringify({ ...MOCK_USER, timestamp: Date.now() }))
      return {
        token,
        user: MOCK_USER
      }
    }
    
    throw new Error('Email ou senha incorretos')
  },
  
  register: async (name: string, email: string, _password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const token = btoa(JSON.stringify({ id: 2, email, name, timestamp: Date.now() }))
    return {
      token,
      user: { id: 2, email, name }
    }
  },
  
  verifyToken: async (token: string) => {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    try {
      const decoded = JSON.parse(atob(token))
      return { user: decoded }
    } catch {
      throw new Error('Token inválido')
    }
  }
}

// Dados mockados para demonstração
export const mockData = {
  empresas: [
    { id: 1, nome: 'Empresa Demo 1' },
    { id: 2, nome: 'Empresa Demo 2' }
  ],
  
  lancamentos: [
    {
      id: 1,
      date: '2025-01-15',
      description: 'Venda de Produtos',
      category: 'Vendas',
      tipo: 'receita' as const,
      valor: 5000,
      empresa_id: 1
    },
    {
      id: 2,
      date: '2025-01-14',
      description: 'Pagamento Fornecedor',
      category: 'Fornecedores',
      tipo: 'despesa' as const,
      valor: 2000,
      empresa_id: 1
    },
    {
      id: 3,
      date: '2025-01-13',
      description: 'Serviços Prestados',
      category: 'Serviços',
      tipo: 'receita' as const,
      valor: 3000,
      empresa_id: 1
    }
  ],
  
  planoContas: [
    { id: 1, codigo: '1.1', nome: 'Ativo Circulante', tipo: 'ativo', nivel: 1, ativo: true },
    { id: 2, codigo: '1.1.01', nome: 'Caixa', tipo: 'ativo', nivel: 2, ativo: true },
    { id: 3, codigo: '2.1', nome: 'Passivo Circulante', tipo: 'passivo', nivel: 1, ativo: true },
    { id: 4, codigo: '3.1', nome: 'Receitas', tipo: 'receita', nivel: 1, ativo: true },
    { id: 5, codigo: '4.1', nome: 'Despesas', tipo: 'despesa', nivel: 1, ativo: true }
  ]
}
