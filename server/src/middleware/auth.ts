import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import config from '../config/env'

export interface AuthRequest extends Request { user?: { id: number; email: string; name: string } }

// Rate limiting simples em memória
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown'
    const now = Date.now()
    
    const record = rateLimitMap.get(ip)
    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
      return next()
    }
    
    if (record.count >= maxRequests) {
      return res.status(429).json({ error: 'too_many_requests', message: 'Muitas tentativas. Tente novamente em alguns minutos.' })
    }
    
    record.count++
    next()
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_token', message: 'Token de autenticação necessário' })
  }
  
  const token = auth.slice(7)
  
  try {
    const payload = jwt.verify(token, config.security.jwtSecret!) as any
    
    // Validar estrutura do payload
    if (!payload.id || !payload.email || !payload.name) {
      return res.status(401).json({ error: 'invalid_token_structure' })
    }
    
    req.user = { id: payload.id, email: payload.email, name: payload.name }
    next()
  } catch (e) {
    const error = e as Error
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'token_expired', message: 'Token expirado. Faça login novamente.' })
    }
    return res.status(401).json({ error: 'invalid_token', message: 'Token inválido' })
  }
}