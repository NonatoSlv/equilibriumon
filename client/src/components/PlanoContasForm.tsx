import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Modal from './ui/Modal'

interface PlanoContasFormProps {
  item?: {
    id: number
    codigo: string
    nome: string
    tipo: 'ativo' | 'passivo' | 'patrimonio_liquido' | 'receita' | 'despesa'
    nivel: number
    conta_pai_id: number | null
    ativo: boolean
  } | null
  onClose: () => void
  onSuccess: () => void
}

type PlanoContasItem = {
  id: number
  codigo: string
  nome: string
  tipo: 'ativo' | 'passivo' | 'patrimonio_liquido' | 'receita' | 'despesa'
  nivel: number
  conta_pai_id: number | null
  ativo: boolean
}

export default function PlanoContasForm({ item, onClose, onSuccess }: PlanoContasFormProps) {
  const [formData, setFormData] = useState({
    codigo: '',
    nome: '',
    tipo: 'ativo' as 'ativo' | 'passivo' | 'patrimonio_liquido' | 'receita' | 'despesa',
    conta_pai_id: null as number | null,
    ativo: true
  })
  const [loading, setLoading] = useState(false)
  const [loadingAccounts, setLoadingAccounts] = useState(false)
  const [error, setError] = useState('')
  const [parentAccounts, setParentAccounts] = useState<PlanoContasItem[]>([])

  const tipoOptions = [
    { value: 'ativo', label: 'Ativo' },
    { value: 'passivo', label: 'Passivo' },
    { value: 'patrimonio_liquido', label: 'Patrimônio Líquido' },
    { value: 'receita', label: 'Receita' },
    { value: 'despesa', label: 'Despesa' }
  ]

  useEffect(() => {
    if (item) {
      setFormData({
        codigo: item.codigo,
        nome: item.nome,
        tipo: item.tipo,
        conta_pai_id: item.conta_pai_id,
        ativo: item.ativo
      })
    } else {
      setFormData({
        codigo: '',
        nome: '',
        tipo: 'ativo',
        conta_pai_id: null,
        ativo: true
      })
    }
    setError('')
    loadParentAccounts()
  }, [item])

  const loadParentAccounts = async () => {
    setLoadingAccounts(true)
    try {
      const client = api()
      const data = await client.get('/api/plano-contas')
      // Filter out the current item to prevent circular references
      const accounts = (((data as any).items || []) as PlanoContasItem[]).filter((acc: PlanoContasItem) =>
        !item || acc.id !== item.id
      )
      setParentAccounts(accounts)
    } catch (err) {
      console.error('Erro ao carregar contas pai:', err)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações básicas
    if (!formData.codigo.trim()) {
      setError('Código é obrigatório')
      setLoading(false)
      return
    }
    if (!formData.nome.trim()) {
      setError('Nome da conta é obrigatório')
      setLoading(false)
      return
    }

    try {
      const client = api()
      const payload = {
        ...formData,
        codigo: formData.codigo.trim(),
        nome: formData.nome.trim(),
        conta_pai_id: formData.conta_pai_id || null
      }

      if (item) {
        await client.put(`/api/plano-contas/${item.id}`, payload)
      } else {
        await client.post('/api/plano-contas', payload)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Erro ao salvar conta:', err)
      if (err.code === 'codigo_exists') {
        setError('Este código já está em uso. Escolha um código diferente.')
      } else if (err.code === 'circular_reference') {
        setError('Não é possível criar uma referência circular entre contas.')
      } else {
        setError(err.message || 'Erro ao salvar conta. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Filter parent accounts by type for better UX
  const filteredParentAccounts = parentAccounts.filter(acc =>
    acc.tipo === formData.tipo && acc.nivel < 4 // Limit hierarchy depth
  )

  return (
    <Modal isOpen={true} onClose={onClose} title={item ? 'Editar Conta' : 'Nova Conta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Código <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              value={formData.codigo}
              onChange={(e) => handleChange('codigo', e.target.value)}
              placeholder="Ex: 1.1.01"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use formato hierárquico (ex: 1.1.01, 2.1.01)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              className="input w-full"
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              required
            >
              {tipoOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Nome da Conta <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="input w-full"
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Ex: Caixa, Bancos, Fornecedores"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Conta Pai (Opcional)
          </label>
          <select
            className="input w-full"
            value={formData.conta_pai_id || ''}
            onChange={(e) => handleChange('conta_pai_id', e.target.value ? Number(e.target.value) : null)}
            disabled={loadingAccounts}
          >
            <option value="">Nenhuma (conta raiz)</option>
            {filteredParentAccounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.codigo} - {account.nome}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Selecione uma conta pai para criar uma subconta
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="ativo"
            className="mr-2"
            checked={formData.ativo}
            onChange={(e) => handleChange('ativo', e.target.checked)}
          />
          <label htmlFor="ativo" className="text-sm font-medium">
            Conta ativa
          </label>
          <p className="text-xs text-gray-500 ml-2">
            Contas inativas não aparecem nos lançamentos
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Salvando...' : (item ? 'Atualizar' : 'Criar')}
          </button>
        </div>
      </form>
    </Modal>
  )
}