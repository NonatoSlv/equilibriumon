import { Response, NextFunction } from 'express'
import { AuthRequest } from './auth'
import { usuarioTemPlanoContas, criarPlanoContasPadrao } from '../utils/planoContasPadrao'

/**
 * Middleware que garante que o usuário tenha plano de contas
 * Se não tiver, cria automaticamente
 */
export function ensurePlanoContas(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    
    if (!usuarioTemPlanoContas(userId)) {
      console.log('🔧 Usuário sem plano de contas, criando automaticamente:', userId)
      criarPlanoContasPadrao(userId)
    }
    
    next()
  } catch (error) {
    console.error('Erro no middleware de plano de contas:', error)
    // Não bloqueia a requisição, apenas loga o erro
    next()
  }
}