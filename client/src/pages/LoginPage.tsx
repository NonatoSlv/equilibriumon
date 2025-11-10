import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'


export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ email?: string; password?: string }>({})
  const { user, login, loading, error, clearError } = useAuth()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  useEffect(() => {
    // Limpar erro quando o usuário começar a digitar
    if (error) {
      clearError()
    }
  }, [email, password])

  const validate = () => {
    const e: typeof validationErrors = {}
    if (!email.trim()) {
      e.email = 'Email é obrigatório'
    } else if (!email.includes('@') || !email.includes('.')) {
      e.email = 'Email inválido'
    }
    
    if (!password.trim()) {
      e.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      e.password = 'A senha deve ter ao menos 6 caracteres'
    }
    
    setValidationErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    
    try {
      await login(email.trim(), password)
      navigate('/dashboard')
    } catch (err) {
      // Erro já é tratado no hook useAuth
      console.error('Erro no login:', err)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-5 bg-gradient-to-br from-gray-50 via-white to-brand-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Painel de marca à esquerda para telas grandes */}
      <div className="hidden lg:flex lg:col-span-2 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10 max-w-md text-white">
           
           
           <h1 className="text-4xl font-bold tracking-tight mb-4">
             BalancePro
           </h1>
          <p className="text-xl text-brand-100 mb-8 leading-relaxed">
            Transforme a gestão financeira da sua empresa com inteligência e simplicidade.
          </p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-300"></div>
              <span className="text-brand-100">Dashboard inteligente com insights em tempo real</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-300"></div>
              <span className="text-brand-100">Relatórios DRE e Balanço automatizados</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-brand-300"></div>
              <span className="text-brand-100">Controle multi-empresa integrado</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20">
            <p className="text-sm text-brand-100">
              "Desde que começamos a usar o BalancePro, nossa gestão financeira ficou muito mais organizada e eficiente."
            </p>
            <p className="text-xs text-brand-200 mt-2 font-medium">— Cliente Satisfeito</p>
          </div>
        </div>
      </div>

      {/* Área de login à direita */}
      <div className="lg:col-span-3 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Cabeçalho em telas pequenas */}
          <div className="mb-8 text-center lg:hidden">
             
             <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">BalancePro</h1>
             <p className="text-gray-600 dark:text-gray-400 mt-2">Entre para gerenciar suas finanças</p>
          </div>

          {/* Cabeçalho para desktop */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Acesse sua conta para continuar gerenciando suas finanças
            </p>
          </div>

          <Card variant="elevated" className="border-0 shadow-xl">
            <form onSubmit={onSubmit} className="space-y-6">
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                iconRight={<Mail className="h-5 w-5" />}
                error={validationErrors.email}
                required
              />

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                iconRight={
                  <button 
                    type="button" 
                    onClick={() => setShowPassword((v) => !v)} 
                    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                }
                error={validationErrors.password}
                required
              />

              {error && (
                <div role="alert" className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Erro no login</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                  />
                  Lembrar-me
                </label>
                <a href="#" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                  Esqueci a senha
                </a>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                variant="primary" 
                className="w-full" 
                loading={loading}
              >
                Entrar na minha conta
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                    Novo por aqui?
                  </span>
                </div>
              </div>

              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full">
                  Criar nova conta
                </Button>
              </Link>
            </form>
          </Card>


        </div>
      </div>
    </div>
  )
}