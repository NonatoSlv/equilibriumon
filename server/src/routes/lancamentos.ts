import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/', requireAuth, (req: AuthRequest, res) => {
  const { from, to, empresaId, page = '1', limit = '50' } = req.query as { 
    from?: string; 
    to?: string; 
    empresaId?: string;
    page?: string;
    limit?: string;
  }
  
  const pageNum = Math.max(1, parseInt(page) || 1)
  const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50)) // Máximo 100 itens por página
  const offset = (pageNum - 1) * limitNum
  
  const clauses: string[] = ['l.user_id = ?']
  const params: any[] = [req.user!.id]
  
  if (from && to) { clauses.push('l.date BETWEEN ? AND ?'); params.push(from, to) }
  else if (from) { clauses.push('l.date >= ?'); params.push(from) }
  else if (to) { clauses.push('l.date <= ?'); params.push(to) }
  if (empresaId) { clauses.push('l.empresa_id = ?'); params.push(Number(empresaId)) }
  
  const whereClause = clauses.length ? ' WHERE ' + clauses.join(' AND ') : ''
  
  // Contar total de registros
  const countSql = `SELECT COUNT(*) as total FROM lancamentos l${whereClause}`
  const countResult = db.prepare(countSql).get(...params) as { total: number }
  const total = countResult.total
  
  // Buscar itens paginados
  let sql = `
    SELECT l.*, 
           cd.codigo as conta_debito_codigo, cd.nome as conta_debito_nome,
           cc.codigo as conta_credito_codigo, cc.nome as conta_credito_nome
    FROM lancamentos l
    LEFT JOIN plano_contas cd ON l.conta_debito_id = cd.id
    LEFT JOIN plano_contas cc ON l.conta_credito_id = cc.id
    ${whereClause}
    ORDER BY l.date DESC, l.id DESC
    LIMIT ? OFFSET ?
  `
  
  const items = db.prepare(sql).all(...params, limitNum, offset)
  
  const totalPages = Math.ceil(total / limitNum)
  
  return res.json({ 
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    }
  })
})

const createSchema = z.object({
  date: z.string(),
  description: z.string().min(1),
  category: z.string().min(1),
  tipo: z.enum(['receita','despesa']),
  valor: z.number().positive(),
  empresaId: z.number().int().optional().nullable(),
  contaDebitoId: z.number().int().optional().nullable(),
  contaCreditoId: z.number().int().optional().nullable()
})

router.post('/', requireAuth, (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues })
  const { date, description, category, tipo, valor, empresaId, contaDebitoId, contaCreditoId } = parsed.data
  const info = db.prepare(`
    INSERT INTO lancamentos (date, description, category, tipo, valor, empresa_id, user_id, conta_debito_id, conta_credito_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(date, description, category, tipo, valor, empresaId ?? null, req.user!.id, contaDebitoId ?? null, contaCreditoId ?? null)
  
  const item = db.prepare(`
    SELECT l.*, 
           cd.codigo as conta_debito_codigo, cd.nome as conta_debito_nome,
           cc.codigo as conta_credito_codigo, cc.nome as conta_credito_nome
    FROM lancamentos l
    LEFT JOIN plano_contas cd ON l.conta_debito_id = cd.id
    LEFT JOIN plano_contas cc ON l.conta_credito_id = cc.id
    WHERE l.id = ? AND l.user_id = ?
  `).get(info.lastInsertRowid, req.user!.id) as any
  return res.status(201).json({ item })
})

router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' })
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues })

  const existing = db.prepare('SELECT * FROM lancamentos WHERE id = ? AND user_id = ?').get(id, req.user!.id) as any
  if (!existing) return res.status(404).json({ error: 'not_found' })

  const { date, description, category, tipo, valor, empresaId, contaDebitoId, contaCreditoId } = parsed.data
  const newEmpresaId = typeof empresaId === 'number' ? empresaId : existing.empresa_id ?? null
  const newContaDebitoId = typeof contaDebitoId === 'number' ? contaDebitoId : existing.conta_debito_id ?? null
  const newContaCreditoId = typeof contaCreditoId === 'number' ? contaCreditoId : existing.conta_credito_id ?? null

  db.prepare(`
    UPDATE lancamentos 
    SET date = ?, description = ?, category = ?, tipo = ?, valor = ?, empresa_id = ?, conta_debito_id = ?, conta_credito_id = ? 
    WHERE id = ? AND user_id = ?
  `).run(date, description, category, tipo, valor, newEmpresaId, newContaDebitoId, newContaCreditoId, id, req.user!.id)
  
  const item = db.prepare(`
    SELECT l.*, 
           cd.codigo as conta_debito_codigo, cd.nome as conta_debito_nome,
           cc.codigo as conta_credito_codigo, cc.nome as conta_credito_nome
    FROM lancamentos l
    LEFT JOIN plano_contas cd ON l.conta_debito_id = cd.id
    LEFT JOIN plano_contas cc ON l.conta_credito_id = cc.id
    WHERE l.id = ? AND l.user_id = ?
  `).get(id, req.user!.id)
  return res.json({ item })
})

router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'invalid_id' })
  const info = db.prepare('DELETE FROM lancamentos WHERE id = ? AND user_id = ?').run(id, req.user!.id)
  if (info.changes === 0) return res.status(404).json({ error: 'not_found' })
  return res.status(204).end()
})

export default router