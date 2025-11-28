import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import lancRoutes from './routes/lancamentos'
import reportRoutes from './routes/reports'
import { requireAuth, AuthRequest, rateLimit } from './middleware/auth'
import { ensurePlanoContas } from './middleware/planoContas'
import { db } from './db'
import empRoutes from './routes/empresas'
import planoContasRoutes from './routes/plano-contas'
import config from './config/env'

const app = express()

// Trust proxy para rate limiting correto
app.set('trust proxy', 1)

// CORS mais restritivo
const serverOrigin = `http://${config.server.host === '0.0.0.0' ? 'localhost' : config.server.host}:${config.server.port}`
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)
    // Permitir mesma origem (frontend servido pelo próprio backend)
    if (origin === serverOrigin) return callback(null, true)
    
    if (config.cors.origins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Não permitido pelo CORS'))
    }
  },
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400 // Cache preflight por 24h
}

// Aplicar CORS apenas nas rotas da API
app.use('/api', cors(corsOptions))
app.options('/api/*', cors(corsOptions))

// Middleware de segurança
app.use(express.json({ limit: '10mb' })) // Limitar tamanho do payload
// Configuração de desenvolvimento
const isDev = config.server.env === 'development'

// Rate limiting mais permissivo em desenvolvimento
app.use(rateLimit(isDev ? 1000 : config.rateLimit.maxRequests, config.rateLimit.windowMs))

// Middleware de logging básico
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    version: config.app.version,
    environment: config.server.env
  })
})

// Rotas da API - Rate limiting mais permissivo em desenvolvimento
app.use('/api/auth', rateLimit(isDev ? 100 : config.rateLimit.authMaxRequests, config.rateLimit.windowMs), authRoutes)
app.use('/api/lancamentos', requireAuth, ensurePlanoContas, lancRoutes)
app.use('/api/empresas', requireAuth, empRoutes)
app.use('/api/plano-contas', requireAuth, ensurePlanoContas, planoContasRoutes)
app.use('/api/reports', requireAuth, ensurePlanoContas, reportRoutes)

app.get('/api/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ user: req.user })
})

// Middleware de erro global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err)
  res.status(500).json({ 
    error: 'internal_server_error', 
    message: 'Erro interno do servidor' 
  })
})

// 404 handler para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'not_found', message: 'Endpoint não encontrado' })
})

app.listen(config.server.port, config.server.host, () => {
  const displayHost = config.server.host === '0.0.0.0' ? 'localhost' : config.server.host
  console.log(`🚀 ${config.app.name} v${config.app.version}`)
  console.log(`📡 Server: http://${displayHost}:${config.server.port}`)
  console.log(`📊 Health: http://${displayHost}:${config.server.port}/api/health`)
  console.log(`🔒 CORS: ${config.cors.origins.join(', ')}`)
  console.log(`🌍 Environment: ${config.server.env}`)
})