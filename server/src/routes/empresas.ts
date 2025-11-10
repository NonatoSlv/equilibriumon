import { Router } from 'express'
import { db } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// Listar empresas do usuário logado
router.get('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const rows = db.prepare('SELECT * FROM empresas WHERE user_id = ? ORDER BY nome ASC').all(req.user!.id)
    res.json({ items: rows })
  } catch (err) {
    console.error('Erro ao listar empresas:', err)
    res.status(500).json({ error: 'Erro ao listar empresas' })
  }
})

// Criar empresa para o usuário atual
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const { nome } = req.body
  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({ error: 'Nome inválido' })
  }
  try {
    const stmt = db.prepare('INSERT INTO empresas (nome, user_id) VALUES (?, ?)')
    const info = stmt.run(nome.trim(), req.user!.id)
    const empresa = db.prepare('SELECT * FROM empresas WHERE id = ? AND user_id = ?').get(info.lastInsertRowid, req.user!.id)
    res.status(201).json({ item: empresa })
  } catch (err: any) {
    if (String(err.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Nome de empresa já existe' })
    }
    console.error('Erro ao criar empresa:', err)
    res.status(500).json({ error: 'Erro ao criar empresa' })
  }
})

// Deletar empresa do usuário atual (se não houver lançamentos)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' })
  }
  try {
    const hasLanc = db.prepare('SELECT COUNT(1) as c FROM lancamentos WHERE empresa_id = ? AND user_id = ?').get(id, req.user!.id) as { c: number }
    if (hasLanc.c > 0) {
      return res.status(400).json({ error: 'Empresa possui lançamentos e não pode ser removida' })
    }
    const info = db.prepare('DELETE FROM empresas WHERE id = ? AND user_id = ?').run(id, req.user!.id)
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Empresa não encontrada' })
    }
    res.status(204).send()
  } catch (err) {
    console.error('Erro ao deletar empresa:', err)
    res.status(500).json({ error: 'Erro ao deletar empresa' })
  }
})

export default router