import { useEffect, useState, useMemo, useRef } from 'react'
import { Plus, Filter, Edit, Trash2 } from 'lucide-react'
import AppLayout from '../layouts/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import LancamentoForm from '../components/LancamentoForm'
import { api } from '../api/client'
import CompanySelect from '../components/CompanySelect'
import { useToast } from '../components/ui/Toast'

function fmt(n: number) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

type LancamentoItem = { id: number; date: string; description: string; category: string; tipo: 'receita'|'despesa'; valor: number }

export default function LancamentosPage() {
  const [items, setItems] = useState<LancamentoItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<LancamentoItem | null>(null)
  const { success, error } = useToast()

  // Filtros e período
  const [periodMode, setPeriodMode] = useState<'month' | 'range'>('month')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [tipo, setTipo] = useState<'all' | 'receita' | 'despesa'>('all')
  const [category, setCategory] = useState<string>('')
  const [search, setSearch] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [empresaId, setEmpresaId] = useState<number | null>(null)

  const computedRange = useMemo(() => {
    if (periodMode === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-')
      const lastDay = new Date(Number(year), Number(month), 0).getDate()
      return {
        from: `${year}-${month}-01`,
        to: `${year}-${month}-${String(lastDay).padStart(2, '0')}`,
      }
    }
    return { from: from || '', to: to || '' }
  }, [periodMode, selectedMonth, from, to])

  const loadItemsReqId = useRef(0)
  const loadItems = async () => {
    const client = api()
    const params = new URLSearchParams()
    if (computedRange.from) params.append('from', computedRange.from)
    if (computedRange.to) params.append('to', computedRange.to)
    if (empresaId) params.append('empresaId', String(empresaId))
    const url = `/api/lancamentos${params.toString() ? `?${params.toString()}` : ''}`
    const reqId = ++loadItemsReqId.current
    try {
      const data: { items?: LancamentoItem[] } = await client.get(url)
      if (reqId !== loadItemsReqId.current) return // ignora respostas antigas
      const list: LancamentoItem[] = data.items || []
      setItems(list)
      const cats = Array.from(new Set(list.map((it) => it.category))).sort()
      setCategories(cats)
    } catch (err) {
      console.error('Erro ao buscar lançamentos:', err)
      // Em erro, manter a UI previsível
      if (reqId === loadItemsReqId.current) {
        setItems([])
        setCategories([])
      }
    }
  }

  useEffect(() => {
    void loadItems()
  }, [computedRange.from, computedRange.to, empresaId])

  const filteredItems = useMemo(() => {
    return items.filter((it) => {
      if (tipo !== 'all' && it.tipo !== tipo) return false
      if (category && it.category !== category) return false
      if (search) {
        const s = search.toLowerCase()
        if (!(`${it.description}`.toLowerCase().includes(s) || `${it.category}`.toLowerCase().includes(s))) return false
      }
      return true
    })
  }, [items, tipo, category, search])

  const clearFilters = () => {
    setEmpresaId(null)
    setTipo('all')
    setCategory('')
    setSearch('')
    if (periodMode === 'range') {
      setFrom('')
      setTo('')
    } else {
      const d = new Date()
      setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return
  
    try {
      const client = api()
      await client.delete(`/api/lancamentos/${id}`)
      await loadItems()
      try { window.dispatchEvent(new CustomEvent('lancamentos-updated')) } catch (err) { void err }
      success('Lançamento excluído', 'O item foi removido com sucesso.')
    } catch (err) {
      console.error('Erro ao excluir lançamento:', err)
      error('Erro ao excluir', 'Não foi possível excluir o lançamento.')
      alert('Erro ao excluir lançamento')
    }
  }

  const handleFormSuccess = async () => {
    await loadItems()
    setEditingItem(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  return (
    <AppLayout>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="h2">Lançamentos</h2>
          <p className="subtle mt-1">Cadastre e acompanhe entradas e saídas.</p>
        </div>
        <Button 
          variant="primary" 
          icon={<Plus className="h-4 w-4" />} 
          onClick={() => setShowForm(true)}
        >
          Novo Lançamento
        </Button>
      </div>

      {/* Filtros */}
      <Card variant="elevated" padding="none" className="mb-6 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="h4">Filtros</h3>
          <p className="subtle">Refine os resultados e aplique o período desejado.</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="min-w-0">
              <label className="block text-sm font-medium mb-2">Empresa</label>
              <CompanySelect value={empresaId} onChange={setEmpresaId} hideCreate />
            </div>
            <div className="min-w-0 md:col-span-2">
              <label className="block text-sm font-medium mb-2">Período</label>
              <div className="flex gap-2 flex-wrap sm:flex-nowrap items-center">
                <select className="input w-full" value={periodMode} onChange={(e) => setPeriodMode(e.target.value as any)}>
                  <option value="month">Mês</option>
                  <option value="range">Intervalo</option>
                </select>
                {periodMode === 'month' ? (
                  <input type="month" className="input w-full" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                ) : (
                  <div className="flex gap-2 flex-1">
                    <input type="date" className="input w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
                    <input type="date" className="input w-full" value={to} onChange={(e) => setTo(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <select className="input w-full" value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
                <option value="all">Todos</option>
                <option value="receita">Receita</option>
                <option value="despesa">Despesa</option>
              </select>
            </div>
            <div className="min-w-0">
              <label className="block text-sm font-medium mb-2">Categoria</label>
              <select className="input w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todas</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="min-w-0 md:col-span-2">
              <label className="block text-sm font-medium mb-2">Busca</label>
              <div className="relative">
                <input
                  type="search"
                  className="input w-full pr-8"
                  placeholder="Descrição ou categoria"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  onKeyDown={(e) => { if (e.key === 'Escape') setSearch('') }}
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={() => setSearch('')}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 mt-4">
            <Button variant="primary" onClick={() => loadItems()}>Aplicar</Button>
            <Button variant="outline" icon={<Filter className="h-4 w-4" />} onClick={clearFilters}>Limpar filtros</Button>
          </div>
        </div>
      </Card>

      {/* Tabela */}
      <Card variant="elevated" padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="h4">Lançamentos</h3>
            <p className="subtle">Resultados aplicados</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="table-container border-0 rounded-none">
            <table className="table w-full min-w-[800px]">
              <thead>
                <tr>
                  <th className="th px-2">Data</th>
                  <th className="th px-2">Descrição</th>
                  <th className="th px-2">Categoria</th>
                  <th className="th px-2">Tipo</th>
                  <th className="th px-2 text-right">Valor</th>
                  <th className="th px-2 text-right sticky right-0 bg-white dark:bg-gray-900 z-10">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr className="tr">
                    <td className="td px-2" colSpan={6}>
                      <div className="text-center py-8">
                        <div className="text-gray-400 mb-2">Nenhum lançamento encontrado</div>
                        <p className="text-sm text-gray-500">Ajuste os filtros ou crie um novo lançamento.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((it) => (
                    <tr className="tr" key={it.id}>
                      <td className="td px-2">{new Date(it.date).toLocaleDateString('pt-BR')}</td>
                      <td className="td px-2 truncate" title={it.description}>{it.description}</td>
                      <td className="td px-2">{it.category}</td>
                      <td className="td px-2">
                        <Badge variant={it.tipo === 'receita' ? 'success' : 'error'}>{it.tipo}</Badge>
                      </td>
                      <td className="td px-2 text-right">
                        <span className={it.tipo === 'receita' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>{fmt(it.valor)}</span>
                      </td>
                      <td className="td px-2 text-right sticky right-0 bg-white dark:bg-gray-900">
                        <div className="inline-flex gap-2">
                          <Button size="sm" variant="outline" icon={<Edit className="h-4 w-4" />} onClick={() => { setEditingItem(it); setShowForm(true) }}>Editar</Button>
                          <Button size="sm" variant="outline" icon={<Trash2 className="h-4 w-4" />} onClick={() => handleDelete(it.id)}>Excluir</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      <LancamentoForm
        isOpen={showForm}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        editingItem={editingItem}
        empresaId={empresaId ?? undefined}
      />
    </AppLayout>
  )
}