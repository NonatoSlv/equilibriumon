import dotenv from 'dotenv'

dotenv.config()

// Configurações de ambiente do servidor
export const config = {
  // Servidor
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT) || 3001,
    env: process.env.NODE_ENV || 'development'
  },
  
  // Segurança
  security: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10
  },
  
  // CORS
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:5176,http://localhost:5174,http://localhost:5173,http://localhost:5175')
      .split(',')
      .map(o => o.trim())
  },
  
  // Banco de dados
  database: {
    file: process.env.DB_FILE || './server/db.sqlite'
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    authMaxRequests: Number(process.env.RATE_LIMIT_AUTH_MAX_REQUESTS) || 20
  },
  
  // Aplicação
  app: {
    name: 'Equilibrium API',
    version: '1.0.0'
  }
} as const

// Validações críticas
const requiredEnvVars = ['JWT_SECRET']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('ERRO CRÍTICO: Variáveis de ambiente obrigatórias não definidas:')
  missingVars.forEach(varName => {
    console.error(`  - ${varName}`)
  })
  console.error('Verifique o arquivo .env')
  process.exit(1)
}

export default config