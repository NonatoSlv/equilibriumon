import { Router } from 'express'
import { db } from '../db'
import { requireAuth, AuthRequest } from '../middleware/auth'

const router = Router()

// Listar plano de contas do usuário logado (hierárquico)
router.get('/', requireAuth, (req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, codigo, nome, tipo, nivel, conta_pai_id 
      FROM plano_contas 
      WHERE user_id = ? 
      ORDER BY codigo ASC
    `).all(req.user!.id)
    
    res.json({ items: rows })
  } catch (err) {
    console.error('Erro ao listar plano de contas:', err)
    res.status(500).json({ error: 'Erro ao listar plano de contas' })
  }
})

// Listar plano de contas hierárquico
router.get('/hierarchical', requireAuth, (req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`
      SELECT id, codigo, nome, tipo, nivel, conta_pai_id, ativo 
      FROM plano_contas 
      WHERE user_id = ? 
      ORDER BY codigo ASC
    `).all(req.user!.id) as any[]
    
    // Construir hierarquia
    const buildHierarchy = (items: any[], parentId: number | null = null): any[] => {
      return items
        .filter(item => item.conta_pai_id === parentId)
        .map(item => ({
          ...item,
          children: buildHierarchy(items, item.id)
        }))
    }
    
    const hierarchical = buildHierarchy(rows)
    res.json({ items: hierarchical })
  } catch (err) {
    console.error('Erro ao listar plano de contas hierárquico:', err)
    res.status(500).json({ error: 'Erro ao listar plano de contas hierárquico' })
  }
})

// Listar contas por tipo (para formulários)
router.get('/tipo/:tipo', requireAuth, (req: AuthRequest, res) => {
  const { tipo } = req.params
  const tiposValidos = ['ativo', 'passivo', 'patrimonio_liquido', 'receita', 'despesa']
  
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de conta inválido' })
  }
  
  try {
    const rows = db.prepare(`
      SELECT id, codigo, nome, tipo, nivel 
      FROM plano_contas 
      WHERE user_id = ? AND tipo = ? 
      ORDER BY codigo ASC
    `).all(req.user!.id, tipo)
    
    res.json({ items: rows })
  } catch (err) {
    console.error('Erro ao listar contas por tipo:', err)
    res.status(500).json({ error: 'Erro ao listar contas por tipo' })
  }
})

// Criar nova conta contábil
router.post('/', requireAuth, (req: AuthRequest, res) => {
  const { codigo, nome, tipo, conta_pai_id, ativo = true } = req.body
  
  if (!codigo || !nome || !tipo) {
    return res.status(400).json({ error: 'Campos obrigatórios: codigo, nome, tipo' })
  }
  
  const tiposValidos = ['ativo', 'passivo', 'patrimonio_liquido', 'receita', 'despesa']
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de conta inválido' })
  }
  
  try {
    // Verificar se código já existe
    const existingConta = db.prepare('SELECT id FROM plano_contas WHERE codigo = ? AND user_id = ?').get(codigo.trim(), req.user!.id)
    if (existingConta) {
      return res.status(409).json({ error: 'codigo_exists' })
    }
    
    // Calcular nível automaticamente
    let nivel = 1
    if (conta_pai_id) {
      const contaPai = db.prepare('SELECT nivel FROM plano_contas WHERE id = ? AND user_id = ?').get(conta_pai_id, req.user!.id) as any
      if (!contaPai) {
        return res.status(400).json({ error: 'Conta pai não encontrada' })
      }
      nivel = contaPai.nivel + 1
    }
    
    const stmt = db.prepare(`
      INSERT INTO plano_contas (codigo, nome, tipo, nivel, conta_pai_id, ativo, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    const info = stmt.run(codigo.trim(), nome.trim(), tipo, nivel, conta_pai_id || null, ativo, req.user!.id)
    
    const conta = db.prepare(`
      SELECT id, codigo, nome, tipo, nivel, conta_pai_id, ativo 
      FROM plano_contas 
      WHERE id = ? AND user_id = ?
    `).get(info.lastInsertRowid, req.user!.id)
    
    res.status(201).json({ item: conta })
  } catch (err: any) {
    if (String(err.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Código de conta já existe' })
    }
    console.error('Erro ao criar conta:', err)
    res.status(500).json({ error: 'Erro ao criar conta' })
  }
})

// Atualizar conta contábil
router.put('/:id', requireAuth, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' })
  }
  
  const { codigo, nome, tipo, nivel, conta_pai_id } = req.body
  
  if (!codigo || !nome || !tipo || !nivel) {
    return res.status(400).json({ error: 'Campos obrigatórios: codigo, nome, tipo, nivel' })
  }
  
  const tiposValidos = ['ativo', 'passivo', 'patrimonio_liquido', 'receita', 'despesa']
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: 'Tipo de conta inválido' })
  }
  
  try {
    const stmt = db.prepare(`
      UPDATE plano_contas 
      SET codigo = ?, nome = ?, tipo = ?, nivel = ?, conta_pai_id = ? 
      WHERE id = ? AND user_id = ?
    `)
    const info = stmt.run(codigo.trim(), nome.trim(), tipo, nivel, conta_pai_id || null, id, req.user!.id)
    
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }
    
    const conta = db.prepare(`
      SELECT id, codigo, nome, tipo, nivel, conta_pai_id 
      FROM plano_contas 
      WHERE id = ? AND user_id = ?
    `).get(id, req.user!.id)
    
    res.json({ item: conta })
  } catch (err: any) {
    if (String(err.message || '').includes('UNIQUE')) {
      return res.status(409).json({ error: 'Código de conta já existe' })
    }
    console.error('Erro ao atualizar conta:', err)
    res.status(500).json({ error: 'Erro ao atualizar conta' })
  }
})

// Criar plano de contas padrão para o usuário atual (se não existir)
router.post('/criar-padrao', requireAuth, (req: AuthRequest, res) => {
  try {
    const { criarPlanoContasPadrao, usuarioTemPlanoContas } = require('../utils/planoContasPadrao')
    
    if (usuarioTemPlanoContas(req.user!.id)) {
      return res.status(400).json({ 
        error: 'user_already_has_accounts',
        message: 'Usuário já possui plano de contas configurado'
      })
    }
    
    criarPlanoContasPadrao(req.user!.id)
    
    // Retornar as contas criadas
    const contas = db.prepare(`
      SELECT id, codigo, nome, tipo, nivel, conta_pai_id 
      FROM plano_contas 
      WHERE user_id = ? 
      ORDER BY codigo ASC
    `).all(req.user!.id)
    
    res.status(201).json({ 
      message: 'Plano de contas padrão criado com sucesso',
      items: contas
    })
  } catch (err) {
    console.error('Erro ao criar plano de contas padrão:', err)
    res.status(500).json({ error: 'Erro ao criar plano de contas padrão' })
  }
})

// Deletar conta contábil (se não houver lançamentos ou contas filhas)
router.delete('/:id', requireAuth, (req: AuthRequest, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' })
  }
  
  try {
    // Verificar se há contas filhas
    const hasFilhas = db.prepare('SELECT COUNT(1) as c FROM plano_contas WHERE conta_pai_id = ? AND user_id = ?').get(id, req.user!.id) as { c: number }
    if (hasFilhas.c > 0) {
      return res.status(400).json({ error: 'Conta possui contas filhas e não pode ser removida' })
    }
    
    // Verificar se há lançamentos
    const hasLanc = db.prepare('SELECT COUNT(1) as c FROM lancamentos WHERE (conta_debito_id = ? OR conta_credito_id = ?) AND user_id = ?').get(id, id, req.user!.id) as { c: number }
    if (hasLanc.c > 0) {
      return res.status(400).json({ error: 'Conta possui lançamentos e não pode ser removida' })
    }
    
    const info = db.prepare('DELETE FROM plano_contas WHERE id = ? AND user_id = ?').run(id, req.user!.id)
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }
    
    res.json({ message: 'Conta removida com sucesso' })
  } catch (err) {
    console.error('Erro ao deletar conta:', err)
    res.status(500).json({ error: 'Erro ao deletar conta' })
  }
})

export default router