import { useState, useEffect } from 'react'
import { api } from '../api/client'
import { useToast } from './ui/Toast'
import Card from './ui/Card'
import Button from './ui/Button'
import { Settings, CheckCircle } from 'lucide-react'

interface PlanoContasCheckerProps {
  children: React.ReactNode
}

export default function PlanoContasChecker({ children }: PlanoContasCheckerProps) {
  const [hasPlanoContas, setHasPlanoContas] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()

  const checkPlanoContas = async () => {
    try {
      const client = api()
      const response = await client.get('/api/plano-contas')
      const items = ((response as any).items || []) as Array<any>
      const hasContas = items.length > 0
      setHasPlanoContas(hasContas)
      
      if (!hasContas) {
        console.log('⚠️ Usuário não possui plano de contas')
      }
    } catch (error) {
      console.error('Erro ao verificar plano de contas:', error)
      setHasPlanoContas(false)
    }
  }

  const criarPlanoContasPadrao = async () => {
    setLoading(true)
    try {
      const client = api()
      await client.post('/api/plano-contas/criar-padrao', {})
      
      toast.success(
        'Plano de contas criado!',
        'O plano de contas padrão foi configurado para sua conta.'
      )
      
      setHasPlanoContas(true)
    } catch (error: any) {
      console.error('Erro ao criar plano de contas:', error)
      toast.error(
        'Erro ao criar plano de contas',
        error.message || 'Tente novamente ou entre em contato com o suporte.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPlanoContas()
  }, [])

  // Ainda verificando
  if (hasPlanoContas === null) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Verificando configuração...</p>
        </div>
      </div>
    )
  }

  // Usuário não tem plano de contas
  if (!hasPlanoContas) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <Card variant="elevated" className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="h2 mb-2">Configuração Inicial</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Para começar a usar o Equilibrium, precisamos configurar seu plano de contas contábil.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Estrutura contábil completa (Ativos, Passivos, Receitas, Despesas)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Contas organizadas hierarquicamente</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Pronto para lançamentos contábeis</span>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            onClick={criarPlanoContasPadrao}
          >
            Configurar Plano de Contas
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            Isso criará automaticamente todas as contas contábeis necessárias para sua empresa.
          </p>
        </Card>
      </div>
    )
  }

  // Usuário tem plano de contas, mostrar conteúdo normal
  return <>{children}</>
}