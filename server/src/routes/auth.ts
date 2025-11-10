import { Router } from 'express'
import { z } from 'zod'
import { db } from '../db'
import bcrypt from 'bcryptjs'
import { sign } from 'jsonwebtoken'
import config from '../config/env'
import { criarPlanoContasPadrao } from '../utils/planoContasPadrao'

const router = Router()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// 7 dias em segundos
const DEFAULT_JWT_EXPIRES_SECONDS = 7 * 24 * 60 * 60

router.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues })
  const { email, password } = parsed.data
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any
  if (!user) return res.status(401).json({ error: 'invalid_credentials' })
  const ok = bcrypt.compareSync(password, user.password_hash)
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' })
  const token = sign(
    { id: user.id, email: user.email, name: user.name },
    config.security.jwtSecret as string,
    { expiresIn: DEFAULT_JWT_EXPIRES_SECONDS }
  )
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } })
})

// Cadastro de novo usuário
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
})

router.post('/register', (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'invalid_payload', issues: parsed.error.issues })
  const { name, email, password } = parsed.data

  // Verificar se email já existe
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any
  if (existing) return res.status(409).json({ error: 'email_in_use' })

  const hash = bcrypt.hashSync(password, config.security.bcryptRounds)
  const info = db.prepare('INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)')
    .run(email, hash, name)
  const newUser = db.prepare('SELECT id, email, name FROM users WHERE id = ?').get(info.lastInsertRowid) as any

  // Criar plano de contas padrão para o novo usuário
  try {
    criarPlanoContasPadrao(newUser.id)
    console.log('✅ Plano de contas criado para novo usuário:', newUser.email)
  } catch (error) {
    console.error('❌ Erro ao criar plano de contas para novo usuário:', error)
    // Não falha o registro se houver erro no plano de contas
  }

  const token = sign(
    { id: newUser.id, email: newUser.email, name: newUser.name },
    config.security.jwtSecret as string,
    { expiresIn: DEFAULT_JWT_EXPIRES_SECONDS }
  )
  return res.status(201).json({ token, user: newUser })
})

export default router