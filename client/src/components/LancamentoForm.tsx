import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Modal from './ui/Modal'
import CompanySelect from './CompanySelect'
import Button from './ui/Button'

interface LancamentoFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingItem?: {
    id: number
    date: string
    description: string
    category: string
    tipo: 'receita' | 'despesa'
    valor: number
    conta_debito_id?: number | null
    conta_credito_id?: number | null
  } | null
  empresaId?: number
}

type LancamentoPayload = {
  date: string
  description: string
  category: string
  tipo: 'receita' | 'despesa'
  valor: number
  contaDebitoId: number | null
  contaCreditoId: number | null
  empresaId?: number
}

export default function LancamentoForm({ isOpen, onClose, onSuccess, editingItem, empresaId }: LancamentoFormProps) {
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    category: '',
    tipo: 'receita' as 'receita' | 'despesa',
    valor: '',
    contaDebitoId: '' as number | '',
    contaCreditoId: '' as number | ''
  })
  // Novo: modo simples/composto e linhas do composto
  const [modo, setModo] = useState<'simples' | 'composto'>('simples')
  type LinhaComposta = { id: number; accountId: number | ''; valor: string }
  const [linhas, setLinhas] = useState<LinhaComposta[]>([{ id: 1, accountId: '', valor: '' }])
  const [empresaIdLocal, setEmpresaIdLocal] = useState<number | null>(empresaId ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Opções de contas
  type PlanoAccount = { id: number; codigo: string; nome: string; tipo: string; nivel: number }
  const [debitOptions, setDebitOptions] = useState<PlanoAccount[]>([])
  const [creditOptions, setCreditOptions] = useState<PlanoAccount[]>([])
  const [categoryOptions, setCategoryOptions] = useState<PlanoAccount[]>([])

  // Categorias agora vêm do plano de contas conforme o tipo selecionado
  useEffect(() => {
    setEmpresaIdLocal(empresaId ?? null)
  }, [empresaId, isOpen])

  useEffect(() => {
    if (editingItem) {
      setFormData({
        date: editingItem.date,
        description: editingItem.description,
        category: editingItem.category,
        tipo: editingItem.tipo,
        valor: editingItem.valor.toString(),
        contaDebitoId: editingItem.conta_debito_id ?? '',
        contaCreditoId: editingItem.conta_credito_id ?? ''
      })
      setModo('simples') // edição mantém modo simples
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        category: '',
        tipo: 'receita',
        valor: '',
        contaDebitoId: '',
        contaCreditoId: ''
      })
      setModo('simples')
      setLinhas([{ id: 1, accountId: '', valor: '' }])
    }
    setError('')
  }, [editingItem, isOpen])

  // Carregar opções de contas conforme o tipo (receita/despesa)
  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const client = api()
        console.log('🔄 Carregando contas para tipo:', formData.tipo)
        
        if (formData.tipo === 'receita') {
          console.log('📡 Fazendo requisições para receita...')
          const [ativos, receitas] = await Promise.all([
            client.get('/api/plano-contas/tipo/ativo'),
            client.get('/api/plano-contas/tipo/receita'),
          ])
          console.log('📊 Resposta Ativos:', ativos)
          console.log('📊 Resposta Receitas:', receitas)
          console.log('📊 Contas carregadas - Ativos:', (ativos as any).items?.length || 0, 'Receitas:', (receitas as any).items?.length || 0)
          setDebitOptions(((ativos as any).items || []) as any)
          setCreditOptions(((receitas as any).items || []) as any)
          setCategoryOptions(((receitas as any).items || []) as any)
        } else {
          console.log('📡 Fazendo requisições para despesa...')
          const [despesas, ativos, passivos] = await Promise.all([
            client.get('/api/plano-contas/tipo/despesa'),
            client.get('/api/plano-contas/tipo/ativo'),
            client.get('/api/plano-contas/tipo/passivo'),
          ])
          console.log('📊 Resposta Despesas:', despesas)
          console.log('📊 Resposta Ativos:', ativos)
          console.log('📊 Resposta Passivos:', passivos)
          console.log('📊 Contas carregadas - Despesas:', (despesas as any).items?.length || 0, 'Ativos:', (ativos as any).items?.length || 0, 'Passivos:', (passivos as any).items?.length || 0)
          setDebitOptions(((despesas as any).items || []) as any)
          const credit = [
            ...(((ativos as any).items || []) as any), 
            ...(((passivos as any).items || []) as any)
          ]
          setCreditOptions(credit as any)
          setCategoryOptions(((despesas as any).items || []) as any)
        }
      } catch (err) {
        console.error('❌ Erro ao carregar contas do plano de contas:', err)
        setError('Erro ao carregar contas do plano de contas. Verifique se está logado.')
      }
    }
    if (isOpen) loadAccounts()
  }, [formData.tipo, isOpen])

  // Auto-selecionar a primeira categoria/conta quando abrir o formulário ou trocar tipo
  useEffect(() => {
    if (!isOpen || categoryOptions.length === 0) return
    setFormData(prev => {
      if (prev.tipo === 'receita' && prev.contaCreditoId === '') {
        const acc = categoryOptions[0]
        return { ...prev, contaCreditoId: acc.id, category: acc.nome }
      }
      if (prev.tipo === 'despesa' && prev.contaDebitoId === '') {
        const acc = categoryOptions[0]
        return { ...prev, contaDebitoId: acc.id, category: acc.nome }
      }
      return prev
    })
  }, [categoryOptions, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações básicas
    if (!formData.description.trim()) {
      setError('Descrição é obrigatória')
      setLoading(false)
      return
    }

    if (!formData.date) {
      setError('Data é obrigatória')
      setLoading(false)
      return
    }

    try {
      const client = api()

      if (modo === 'simples') {
        const valor = parseFloat(formData.valor)
        if (isNaN(valor) || valor <= 0) {
          setError('Valor deve ser um número positivo')
          setLoading(false)
          return
        }

        const payload: LancamentoPayload = {
          date: formData.date,
          description: formData.description.trim(),
          category: formData.category,
          tipo: formData.tipo,
          valor,
          contaDebitoId: formData.contaDebitoId === '' ? null : Number(formData.contaDebitoId),
          contaCreditoId: formData.contaCreditoId === '' ? null : Number(formData.contaCreditoId),
        }

        if (editingItem) {
          await client.put(`/api/lancamentos/${editingItem.id}`, payload)
        } else {
          if (empresaIdLocal != null) payload.empresaId = empresaIdLocal
          else if (empresaId != null) payload.empresaId = empresaId
          await client.post('/api/lancamentos', payload)
        }
      } else {
        // Composto: várias linhas com mesma data/descrição e tipo
        if (linhas.length === 0) {
          setError('Adicione ao menos uma linha no lançamento composto')
          setLoading(false)
          return
        }
        for (const l of linhas) {
          const v = parseFloat(l.valor)
          if (!l.accountId || isNaN(v) || v <= 0) {
            setError('Todas as linhas devem ter conta e valor positivo')
            setLoading(false)
            return
          }
        }
        const empresaIdFinal = empresaIdLocal != null ? empresaIdLocal : (empresaId != null ? empresaId : null)
        for (const l of linhas) {
          const valor = parseFloat(l.valor)
          const payload: LancamentoPayload = {
            date: formData.date,
            description: formData.description.trim(),
            tipo: formData.tipo,
            valor,
            contaDebitoId: null,
            contaCreditoId: null,
            category: ''
          }
          if (formData.tipo === 'receita') {
            payload.contaCreditoId = typeof l.accountId === 'number' ? l.accountId : null
          } else {
            payload.contaDebitoId = typeof l.accountId === 'number' ? l.accountId : null
          }
          if (empresaIdFinal != null) payload.empresaId = empresaIdFinal
          await client.post('/api/lancamentos', payload)
        }
      }

      try { window.dispatchEvent(new CustomEvent('lancamentos-updated')) } catch (err) { void err }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar lançamento'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Quando selecionar a "categoria" (agora uma conta), atualizamos a conta correspondente
  const handleCategoryAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value ? Number(e.target.value) : ''
    const acc = typeof id === 'number' ? categoryOptions.find(a => a.id === id) : undefined
    setFormData(prev => {
      const updated = { ...prev, category: acc ? acc.nome : '' }
      if (prev.tipo === 'receita') {
        updated.contaCreditoId = id
      } else {
        updated.contaDebitoId = id
      }
      return updated
    })
  }

  // Novo: handlers para lançamento composto
  const addLinha = () => {
    setLinhas(prev => [...prev, { id: (prev.at(-1)?.id || 0) + 1, accountId: '', valor: '' }])
  }
  const removeLinha = (id: number) => {
    setLinhas(prev => prev.filter(l => l.id !== id))
  }
  const handleLinhaChange = (id: number, field: 'accountId' | 'valor', value: string) => {
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, [field]: field === 'accountId' ? (value ? Number(value) : '') : value } : l))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Editar Lançamento' : 'Novo Lançamento'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {!editingItem && (
          <div>
            <CompanySelect value={empresaIdLocal} onChange={setEmpresaIdLocal} />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Data</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Ex: Vendas de produtos"
            className="input w-full"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={(e) => {
                // Reset categoria/conta ao trocar tipo
                handleChange(e)
                setFormData(prev => ({ ...prev, category: '', contaDebitoId: '', contaCreditoId: '' }))
                setLinhas([{ id: 1, accountId: '', valor: '' }])
              }}
              required
              className="input w-full"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          {!editingItem && (
            <div>
              <label className="block text-sm font-medium mb-1">Modo de lançamento</label>
              <div className="flex gap-2">
                <button type="button" className={`btn ${modo === 'simples' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setModo('simples')}>Simples</button>
                <button type="button" className={`btn ${modo === 'composto' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setModo('composto')}>Composto</button>
              </div>
            </div>
          )}
        </div>

        {modo === 'simples' ? (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Categoria (Conta)</label>
              <select
                name="category"
                value={formData.tipo === 'receita' ? formData.contaCreditoId : formData.contaDebitoId}
                onChange={handleCategoryAccountChange}
                className="input w-full"
                required
              >
                <option value="">Selecione</option>
                {(formData.tipo === 'receita' ? creditOptions : debitOptions).map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.nome} ({opt.codigo})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <input
                type="number"
                step="0.01"
                name="valor"
                value={formData.valor}
                onChange={handleChange}
                required
                className="input w-full"
              />
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Linhas do lançamento composto</span>
              <Button type="button" variant="outline" size="sm" onClick={addLinha}>Adicionar linha</Button>
            </div>
            {linhas.map((l) => (
              <div key={l.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-8">
                  <label className="block text-sm font-medium mb-1">Categoria (Conta)</label>
                  <select
                    value={typeof l.accountId === 'number' ? l.accountId : ''}
                    onChange={(e) => handleLinhaChange(l.id, 'accountId', e.target.value)}
                    className="input w-full"
                    required
                  >
                    <option value="">Selecione</option>
                    {(formData.tipo === 'receita' ? creditOptions : debitOptions).map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.nome} ({opt.codigo})</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-medium mb-1">Valor</label>
                  <input
                    type="number"
                    step="0.01"
                    value={l.valor}
                    onChange={(e) => handleLinhaChange(l.id, 'valor', e.target.value)}
                    required
                    className="input w-full"
                  />
                </div>
                <div className="sm:col-span-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => removeLinha(l.id)}>Remover</Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </form>
    </Modal>
  )
}