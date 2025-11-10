import { useEffect, useMemo, useState } from 'react'
import { Plus, BarChart3, CalendarRange, PieChart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { api } from '../api/client'
import CompanySelect from '../components/CompanySelect'



function fmt(n: number) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function DashboardPage() {
  const navigate = useNavigate()

  // Filtros globais de período
  const [periodMode, setPeriodMode] = useState<'month' | 'range'>('month')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [empresaId, setEmpresaId] = useState<number | null>(null)

  const computedRange = useMemo(() => {
    if (periodMode === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-')
      const lastDay = new Date(Number(year), Number(month), 0).getDate()
      return {
        from: `${year}-${month}-01`,
        to: `${year}-${month}-${String(lastDay).padStart(2, '0')}`
      }
    }
    return { from: from || '', to: to || '' }
  }, [periodMode, selectedMonth, from, to])

  // Dados
  const [dre, setDre] = useState<{ receitas: number; despesas: number; resultado: number; resumo?: Array<{ category: string; receitas: number; despesas: number }> } | null>(null)
  const [ultimos, setUltimos] = useState<Array<{ id: number; date: string; description: string; category: string; tipo: 'receita'|'despesa'; valor: number }>>([])

  async function loadData() {
    try {
      const params = new URLSearchParams()
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)
      if (empresaId) params.set('empresaId', String(empresaId))
      const client = api()
      const [dreRes, ultimosRes] = await Promise.all([
        client.get(`/api/reports/dre?${params.toString()}`),
        client.get(`/api/lancamentos?${params.toString()}`)
      ])
      setDre(dreRes as any)
      setUltimos(((ultimosRes as any)?.items || []) as any)
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error)
      // Manter dados anteriores em caso de erro
    }
  }

  useEffect(() => {
    loadData()
  }, [computedRange.from, computedRange.to, empresaId])

  // Atualiza quando houver lançamentos novos/alterados/excluídos
  useEffect(() => {
    const handler = () => { loadData() }
    window.addEventListener('lancamentos-updated', handler as EventListener)
    return () => window.removeEventListener('lancamentos-updated', handler as EventListener)
  }, [])

  const topCategorias = useMemo(() => {
    const resumo = dre?.resumo || []
    const withTotal = resumo.map((r) => ({ ...r, total: (r.receitas || 0) + (r.despesas || 0) }))
    return withTotal.sort((a, b) => b.total - a.total).slice(0, 5)
  }, [dre])

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="h1">Dashboard</h1>
            <p className="subtitle mt-2">Acompanhe o desempenho financeiro da sua empresa em tempo real</p>
          </div>
          <Button 
            variant="primary" 
            icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate('/lancamentos')}
          >
            Novo Lançamento
          </Button>
        </div>
      </div>

      {/* Filtros de Período */}
      <Card variant="elevated" padding="md" className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg">
              <CalendarRange className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Período de Análise</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {computedRange.from && computedRange.to 
                  ? `${new Date(computedRange.from).toLocaleDateString('pt-BR')} - ${new Date(computedRange.to).toLocaleDateString('pt-BR')}`
                  : 'Selecione um período'
                }
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-end gap-3">
            {/* Empresa */}
            <div className="min-w-0 w-[220px]">
              <CompanySelect value={empresaId} onChange={setEmpresaId} hideCreate />
            </div>
            {/* Modo de período */}
            <select 
              className="select min-w-[120px]" 
              value={periodMode} 
              onChange={(e) => setPeriodMode(e.target.value as any)}
            >
              <option value="month">Por Mês</option>
              <option value="range">Período Customizado</option>
            </select>
            {periodMode === 'month' ? (
              <input 
                type="month" 
                className="input min-w-[150px]" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)} 
              />
            ) : (
              <div className="flex flex-wrap items-end gap-3">
                <input 
                  type="date" 
                  className="input min-w-[150px]" 
                  value={from} 
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Data inicial"
                />
                <input 
                  type="date" 
                  className="input min-w-[150px]" 
                  value={to} 
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Data final"
                />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Cards de destaque */}
      <div className="mt-3 space-y-4">
        {/* Indicadores Principais */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="h3">Indicadores Financeiros</h3>
              <p className="subtitle">Visão geral do desempenho no período selecionado</p>
            </div>
            <Badge variant="info" size="sm">
              {computedRange.from && computedRange.to ? `${computedRange.from} - ${computedRange.to}` : 'Período não definido'}
            </Badge>
          </div>
          
          {/* Indicadores removidos conforme solicitação */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="relative border-l-2 border-brand-600 pl-4">
              <div>
                <p className="subtle">Receitas</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-green-600">{dre ? fmt(dre.receitas || 0) : 'Carregando…'}</p>
              </div>
            </Card>
            <Card className="relative border-l-2 border-brand-600 pl-4">
              <div>
                <p className="subtle">Despesas</p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-red-600">{dre ? fmt(dre.despesas || 0) : 'Carregando…'}</p>
              </div>
            </Card>
            <Card className="relative border-l-2 border-brand-600 pl-4">
              <div>
                <p className="subtle">Resultado</p>
                <p className={`mt-1 text-2xl font-semibold tracking-tight ${dre && (dre.resultado || 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>{dre ? fmt(dre.resultado || 0) : 'Carregando…'}</p>
              </div>
            </Card>
          </div>
        </div>
        {/* Receitas e Despesas */}
        {/* Removido conforme pedido: seção com setas originalmente */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Últimos Lançamentos */}
        <div className="lg:col-span-2">
          <Card variant="elevated" padding="none">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="h4">Lançamentos Recentes</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Últimas movimentações financeiras
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                  onClick={() => navigate('/lancamentos')}
                >
                  Novo Lançamento
                </Button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <div className="table-container border-0 rounded-none">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="th">Data</th>
                      <th className="th">Descrição</th>
                      <th className="th">Categoria</th>
                      <th className="th">Tipo</th>
                      <th className="th text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimos.length === 0 ? (
                      <tr className="tr">
                        <td className="td" colSpan={5}>
                          <div className="text-center py-8">
                            <div className="text-gray-400 mb-2">
                              <BarChart3 className="h-12 w-12 mx-auto" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">Nenhum lançamento encontrado</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                              Comece criando seu primeiro lançamento
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      ultimos.slice(0, 5).map((it) => (
                        <tr key={it.id} className="tr">
                          <td className="td">
                            <span className="text-sm font-medium">
                              {new Date(it.date).toLocaleDateString('pt-BR')}
                            </span>
                          </td>
                          <td className="td">
                            <div className="max-w-[200px]">
                              <p className="font-medium truncate">{it.description}</p>
                            </div>
                          </td>
                          <td className="td">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {it.category}
                            </span>
                          </td>
                          <td className="td">
                            <Badge variant={it.tipo === 'receita' ? 'success' : 'error'}>
                              {it.tipo}
                            </Badge>
                          </td>
                          <td className="td text-right">
                            <span className={`font-semibold ${
                              it.tipo === 'receita' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {fmt(it.valor)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {ultimos.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <Link 
                  to="/lancamentos" 
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Ver todos os lançamentos →
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Resumo por Categoria */}
        <div>
          <Card variant="elevated" padding="none">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="h4">Resumo por Categoria</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Top 5 categorias do período
                  </p>
                </div>
                <Link 
                  to="/dre" 
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-2"
                >
                  <PieChart className="h-4 w-4" /> Detalhar
                </Link>
              </div>
            </div>
            <div className="p-6">
              {topCategorias.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhuma categoria com movimentação
                </div>
              ) : (
                <div className="space-y-4">
                  {topCategorias.map((c, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-medium text-brand-700 dark:text-brand-300">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{c.category}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Receitas: {fmt(c.receitas || 0)} • Despesas: {fmt(c.despesas || 0)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{fmt((c.receitas || 0) - (c.despesas || 0))}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Resultado no período</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}