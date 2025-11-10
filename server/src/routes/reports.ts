import { Router } from 'express'
import { db } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

router.get('/dre', requireAuth, (req: AuthRequest, res) => {
  const { from, to, tipo, category, empresaId } = req.query as { from?: string; to?: string; tipo?: 'receita'|'despesa'; category?: string; empresaId?: string }

  const clauses: string[] = ['user_id = ?']
  const params: any[] = [req.user!.id]
  if (from && to) { clauses.push('date BETWEEN ? AND ?'); params.push(from, to) }
  else if (from) { clauses.push('date >= ?'); params.push(from) }
  else if (to) { clauses.push('date <= ?'); params.push(to) }
  if (category) { clauses.push('category = ?'); params.push(category) }
  if (tipo) { clauses.push('tipo = ?'); params.push(tipo) }
  if (empresaId) { clauses.push('empresa_id = ?'); params.push(Number(empresaId)) }

  const baseWhere = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''

  const receitasTotal = db.prepare(`SELECT COALESCE(SUM(valor),0) as total FROM lancamentos${baseWhere}${baseWhere ? ' AND ' : ' WHERE '}tipo = 'receita'`).get(...params) as any
  const despesasTotal = db.prepare(`SELECT COALESCE(SUM(valor),0) as total FROM lancamentos${baseWhere}${baseWhere ? ' AND ' : ' WHERE '}tipo = 'despesa'`).get(...params) as any

  const resumo = db.prepare(`
    SELECT category,
           SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as receitas,
           SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as despesas
    FROM lancamentos${baseWhere}
    GROUP BY category
    ORDER BY category
  `).all(...params)

  return res.json({
    receitas: receitasTotal.total,
    despesas: despesasTotal.total,
    resultado: (receitasTotal.total - despesasTotal.total),
    resumo
  })
})

router.get('/balanco', requireAuth, (req: AuthRequest, res) => {
  const { from, to, empresaId } = req.query as { from?: string; to?: string; empresaId?: string }
  const clauses: string[] = ['user_id = ?']
  const params: any[] = [req.user!.id]
  if (from && to) { clauses.push('date BETWEEN ? AND ?'); params.push(from, to) }
  else if (from) { clauses.push('date >= ?'); params.push(from) }
  else if (to) { clauses.push('date <= ?'); params.push(to) }
  if (empresaId) { clauses.push('empresa_id = ?'); params.push(Number(empresaId)) }

  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''
  const whereReceitas = where ? `${where} AND tipo = 'receita'` : ` WHERE tipo = 'receita'`
  const whereDespesas = where ? `${where} AND tipo = 'despesa'` : ` WHERE tipo = 'despesa'`

  const receitas = db.prepare(`SELECT COALESCE(SUM(valor),0) as total FROM lancamentos${whereReceitas}`).get(...params) as any
  const despesas = db.prepare(`SELECT COALESCE(SUM(valor),0) as total FROM lancamentos${whereDespesas}`).get(...params) as any

  const ativos = receitas.total
  const passivos = despesas.total
  const patrimonio = receitas.total - despesas.total

  const resumo = [
    { conta: 'Caixa (simplificado)', grupo: 'Ativos', saldo: ativos },
    { conta: 'Obrigações (simplificado)', grupo: 'Passivos', saldo: passivos },
  ]

  return res.json({ ativos, passivos, patrimonio, resumo })
})

export default router