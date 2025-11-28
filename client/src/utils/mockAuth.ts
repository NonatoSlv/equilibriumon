// Sistema de autenticação simulado para demonstração
// Funciona sem backend!

// Armazena usuários registrados (persiste durante a sessão)
const registeredUsers = new Map<string, { email: string; password: string; name: string; id: number }>()

// Usuário admin padrão
registeredUsers.set('admin@balancepro.local', {
  email: 'admin@balancepro.local',
  password: 'admin123',
  name: 'Administrador',
  id: 1
})

let nextUserId = 2

export const mockAuth = {
  login: async (email: string, password: string) => {
    // Simula delay de rede
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const user = registeredUsers.get(email)
    if (user && user.password === password) {
      const token = btoa(JSON.stringify({ id: user.id, email: user.email, name: user.name, timestamp: Date.now() }))
      return {
        token,
        user: { id: user.id, email: user.email, name: user.name }
      }
    }
    
    throw new Error('Email ou senha incorretos')
  },
  
  register: async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Verifica se email já existe
    if (registeredUsers.has(email)) {
      throw new Error('Este email já está em uso')
    }
    
    const newUser = {
      id: nextUserId++,
      email,
      password,
      name
    }
    
    registeredUsers.set(email, newUser)
    
    const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, name: newUser.name, timestamp: Date.now() }))
    return {
      token,
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
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
    // Ativos
    { id: 1, codigo: '1.1', nome: 'Ativo Circulante', tipo: 'ativo', nivel: 1, ativo: true },
    { id: 2, codigo: '1.1.01', nome: 'Caixa', tipo: 'ativo', nivel: 2, ativo: true },
    { id: 3, codigo: '1.1.02', nome: 'Bancos', tipo: 'ativo', nivel: 2, ativo: true },
    { id: 4, codigo: '1.1.03', nome: 'Contas a Receber', tipo: 'ativo', nivel: 2, ativo: true },
    
    // Passivos
    { id: 5, codigo: '2.1', nome: 'Passivo Circulante', tipo: 'passivo', nivel: 1, ativo: true },
    { id: 6, codigo: '2.1.01', nome: 'Fornecedores', tipo: 'passivo', nivel: 2, ativo: true },
    { id: 7, codigo: '2.1.02', nome: 'Contas a Pagar', tipo: 'passivo', nivel: 2, ativo: true },
    
    // Receitas
    { id: 8, codigo: '3.1', nome: 'Receitas Operacionais', tipo: 'receita', nivel: 1, ativo: true },
    { id: 9, codigo: '3.1.01', nome: 'Vendas', tipo: 'receita', nivel: 2, ativo: true },
    { id: 10, codigo: '3.1.02', nome: 'Serviços', tipo: 'receita', nivel: 2, ativo: true },
    { id: 11, codigo: '3.1.03', nome: 'Outras Receitas', tipo: 'receita', nivel: 2, ativo: true },
    
    // Despesas
    { id: 12, codigo: '4.1', nome: 'Despesas Operacionais', tipo: 'despesa', nivel: 1, ativo: true },
    { id: 13, codigo: '4.1.01', nome: 'Salários', tipo: 'despesa', nivel: 2, ativo: true },
    { id: 14, codigo: '4.1.02', nome: 'Aluguel', tipo: 'despesa', nivel: 2, ativo: true },
    { id: 15, codigo: '4.1.03', nome: 'Energia Elétrica', tipo: 'despesa', nivel: 2, ativo: true },
    { id: 16, codigo: '4.1.04', nome: 'Telefone/Internet', tipo: 'despesa', nivel: 2, ativo: true },
    { id: 17, codigo: '4.1.05', nome: 'Material de Escritório', tipo: 'despesa', nivel: 2, ativo: true }
  ]
}
