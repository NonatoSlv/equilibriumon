// Configurações de ambiente do cliente
export const config = {
  // URL da API
  // Em produção: usa mesma origem (string vazia) se VITE_API_URL não estiver definido
  // Em desenvolvimento: fallback para http://localhost:3002
  apiUrl: (typeof import.meta !== 'undefined' && import.meta.env.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : ((typeof import.meta !== 'undefined' && import.meta.env.PROD) ? '' : 'http://localhost:3002'),
  
  // Ambiente atual
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Configurações da aplicação
  app: {
    name: 'Equilibrium',
    version: '1.0.0',
    description: 'Sistema de gestão financeira empresarial'
  },
  
  // Configurações de paginação
  pagination: {
    defaultLimit: 50,
    maxLimit: 100
  },
  
  // Configurações de timeout
  timeouts: {
    api: 30000, // 30 segundos
    auth: 10000 // 10 segundos para auth
  },
  
  // Configurações de cache
  cache: {
    tokenKey: 'equilibrium_token',
    userKey: 'equilibrium_user'
  }
} as const

// Em produção, permitir apiUrl vazio para usar mesma origem
// Em desenvolvimento, alertar quando apiUrl não estiver definido
if (typeof import.meta !== 'undefined' && import.meta.env.DEV && !config.apiUrl) {
  console.warn('Aviso: VITE_API_URL não está definido; usando fallback de desenvolvimento')
}

export default config