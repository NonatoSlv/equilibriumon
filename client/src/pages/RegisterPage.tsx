import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Eye, EyeOff, User } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; server?: string }>({})

  function validate() {
    const errs: { name?: string; email?: string; password?: string } = {}
    if (!name.trim()) errs.name = 'Informe seu nome'
    if (!email.trim() || !email.includes('@')) errs.email = 'Informe um e-mail válido'
    if (!password.trim() || password.length < 6) errs.password = 'Senha deve ter ao menos 6 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    try {
      setLoading(true)
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setErrors(prev => ({ ...prev, server: (err as Error)?.message || 'Erro ao registrar' }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-700 font-bold">BP</div>
          <div>
            <h1 className="h3">Criar conta</h1>
            <p className="subtle">Preencha os dados para começar</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <Input
            id="name"
            label="Nome"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Seu nome"
            iconLeft={<User className="h-4 w-4" />}
            error={errors.name}
          />
          <Input
            id="email"
            label="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="seu@email.com"
            iconLeft={<Mail className="h-4 w-4" />}
            error={errors.email}
          />
          <div className="grid grid-cols-1 gap-3">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              label="Senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Crie uma senha"
              iconRight={
                <button type="button" className="icon-btn" onClick={() => setShowPassword(s => !s)} aria-label="Alternar visibilidade da senha">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password}
            />
            <Input
              id="password2"
              type={showPassword ? 'text' : 'password'}
              label="Confirmar senha"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              placeholder="Repita a senha"
            />
          </div>

          {errors.server && (
            <div className="text-sm text-red-600 dark:text-red-400">{errors.server}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>Criar conta</Button>
        </form>

        <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">Já tem conta? <a href="/login" className="link">Entrar</a></p>
      </Card>
    </div>
  )
}