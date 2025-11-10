import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import Card from '../components/ui/Card'

import { api } from '../api/client'
import CompanySelect from '../components/CompanySelect'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LabelList } from 'recharts'

function fmt(n: number) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function toISO(date: Date) { return date.toISOString().slice(0, 10) }
const truncateLabel = (s: string) => (s?.length ?? 0) > 18 ? `${s.slice(0, 16)}…` : s

// Tipagens mínimas para respostas de API
type LancamentoItem = { id: number; date: string; description: string; category: string; tipo: 'receita'|'despesa'; valor: number }
type LancamentosResponse = { items?: LancamentoItem[] }
type BalancoResponse = { ativos?: number; passivos?: number; patrimonio?: number }

export default function DREPage() {
  // Removido: estado 'data' não utilizado
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [month, setMonth] = useState('') // YYYY-MM
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [tipo, setTipo] = useState<'all'|'receita'|'despesa'>('all')
  const [category, setCategory] = useState<string>('')
  const [categories, setCategories] = useState<string[]>([])
  const [empresaId, setEmpresaId] = useState<number | null>(null)

  const [details, setDetails] = useState<Array<LancamentoItem>>([])
  const [loadingData] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Foco visual (ambos/receitas/despesas)


  // Comparação com período anterior
  // Removido: const [data, setData] = useState<...>(null)
  // Removido: const [prevData, setPrevData] = useState<...>(null)
  // Removido: const [loadingPrev, setLoadingPrev] = useState(false)

  // Dados de Balanço para cards na DRE
  const [balanco, setBalanco] = useState<{ ativos: number; passivos: number; patrimonioLiquido: number } | null>(null)
  const [loadingBalanco, setLoadingBalanco] = useState(false)


  const computedRange = useMemo(() => {
    if (useCustomRange) return { from, to }
    if (month) {
      const [y, m] = month.split('-').map(Number)
      const start = new Date(y, m - 1, 1)
      const end = new Date(y, m, 0)
      return { from: toISO(start), to: toISO(end) }
    }
    return { from: '', to: '' }
  }, [useCustomRange, month, from, to])

  // Removido: prevRange (não utilizado)

  // Removido: função loadData não utilizada

  // Removido: função loadPrevData não utilizada

  const loadDetails = () => {
    const client = api()
    const params = new URLSearchParams()
    if (computedRange.from) params.append('from', computedRange.from)
    if (computedRange.to) params.append('to', computedRange.to)
    if (empresaId) params.append('empresaId', String(empresaId))
    const url = `/api/lancamentos${params.toString() ? `?${params.toString()}` : ''}`
    setLoadingDetails(true)
    setErrorMsg(null)
    client.get(url)
      .then((res) => setDetails(((res as LancamentosResponse).items || []) as any))
      .catch((err: unknown) => setErrorMsg((err as Error)?.message || 'Erro ao carregar itens'))
      .finally(() => setLoadingDetails(false))
  }

  const filteredDetails = useMemo(() => {
    return details.filter((it) => {
      if (tipo !== 'all' && it.tipo !== tipo) return false
      if (category && it.category !== category) return false
      return true
    })
  }, [details, tipo, category])

  const chartData = useMemo(() => {
    const byCat = new Map<string, { category: string; receitas: number; despesas: number }>()
    for (const it of filteredDetails) {
      const key = it.category || 'Sem categoria'
      if (!byCat.has(key)) byCat.set(key, { category: key, receitas: 0, despesas: 0 })
      const row = byCat.get(key)!
      if (it.tipo === 'receita') row.receitas += it.valor || 0
      else if (it.tipo === 'despesa') row.despesas += it.valor || 0
    }
    // Ordenar por total e pegar top 10 para legibilidade
    return Array.from(byCat.values())
      .map(r => ({ ...r, total: r.receitas + r.despesas }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
  }, [filteredDetails])

  const totals = useMemo(() => {
    let receitas = 0
    let despesas = 0
    for (const it of filteredDetails) {
      if (it.tipo === 'receita') receitas += it.valor || 0
      else if (it.tipo === 'despesa') despesas += it.valor || 0
    }
    return { receitas, despesas, saldo: receitas - despesas }
  }, [filteredDetails])

  useEffect(() => {
    const client = api()
    client.get('/api/lancamentos')
      .then((res) => {
        const cats = Array.from(new Set(((res as LancamentosResponse).items || []).map((it) => it.category))).sort()
        setCategories(cats as string[])
      })
      .catch(() => setCategories([]))
  }, [])

  // Carregar dados de Balanço para os cards
  const loadBalanco = () => {
    const client = api()
    const params = new URLSearchParams()
    if (computedRange.from) params.append('from', computedRange.from)
    if (computedRange.to) params.append('to', computedRange.to)
    if (empresaId) params.append('empresaId', String(empresaId))
    const url = `/api/reports/balanco${params.toString() ? `?${params.toString()}` : ''}`
    setLoadingBalanco(true)
    client.get(url)
      .then((res) => {
        const r = res as BalancoResponse
        const ativos = r.ativos ?? 0
        const passivos = r.passivos ?? 0
        const patrimonioLiquido = r.patrimonio ?? (ativos - passivos)
        setBalanco({ ativos, passivos, patrimonioLiquido })
      })
      .catch(() => setBalanco({ ativos: 0, passivos: 0, patrimonioLiquido: 0 }))
      .finally(() => setLoadingBalanco(false))
  }

  useEffect(() => {
    // Removido: loadData()
    loadDetails()
    // Removido: loadPrevData()
    loadBalanco()
    return () => {}
  }, [computedRange.from, computedRange.to, tipo, category, empresaId])

  const clearFilters = () => {
    setMonth('')
    setUseCustomRange(false)
    setFrom('')
    setTo('')
    setTipo('all')
    // Removido: setViewFocus('ambos')
  }

  // Presets rápidos de período
  const applyPreset = (preset: 'mes_atual' | 'ultimo_mes' | 'ano_atual') => {
    const now = new Date()
    if (preset === 'mes_atual') {
      const y = now.getFullYear()
      const m = String(now.getMonth() + 1).padStart(2, '0')
      setMonth(`${y}-${m}`)
      setUseCustomRange(false)
    } else if (preset === 'ultimo_mes') {
      const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      setMonth(`${y}-${m}`)
      setUseCustomRange(false)
    } else {
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      setUseCustomRange(true)
      setFrom(toISO(start))
      setTo(toISO(end))
    }
    setTimeout(() => { /* Removido: loadData(); */ loadDetails(); /* Removido: loadPrevData() */ }, 0)
  }

  // KPI/variáveis não utilizadas removidas para atender noUnusedLocals

  const periodLabel = useMemo(() => {
    if (computedRange.from && computedRange.to) return `${computedRange.from} — ${computedRange.to}`
    return '—'
  }, [computedRange])

  return (
    <AppLayout>
      <div className="space-y-1">
        <h2 className="h2">DRE</h2>
        <p className="subtle">Demonstrativo de Resultados por período.</p>
      </div>

      {/* Ações principais */}
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>Imprimir</button>
        {/* Removidos botões de exportação CSV */}
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Filtros</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400">Período aplicado: {periodLabel}</div>
        </div>
        {/* Presets de período */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button className="btn btn-ghost btn-xs" onClick={() => applyPreset('mes_atual')}>Mês atual</button>
          <button className="btn btn-ghost btn-xs" onClick={() => applyPreset('ultimo_mes')}>Último mês</button>
          <button className="btn btn-ghost btn-xs" onClick={() => applyPreset('ano_atual')}>Ano atual</button>
        </div>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-sm font-medium mb-2">Período (mês/ano)</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input input-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input id="chk-range" type="checkbox" checked={useCustomRange} onChange={(e) => setUseCustomRange(e.target.checked)} />
            <label htmlFor="chk-range" className="text-sm">Intervalo customizado</label>
          </div>
          {useCustomRange && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Data início</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input input-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data fim</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input input-sm" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input input-sm">
              <option value="">Todas</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as 'all'|'receita'|'despesa')}
              className="input input-sm"
            >
              <option value="all">Todos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div>
            <CompanySelect value={empresaId} onChange={setEmpresaId} hideCreate />
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => { /* Removido: loadData(); */ loadDetails(); /* Removido: loadPrevData() */ }} className="btn btn-primary btn-sm" disabled={loadingData || loadingDetails} aria-busy={loadingData || loadingDetails}>Aplicar</button>
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">Limpar</button>
          </div>
        </div>

        {errorMsg && (
          <div role="alert" className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {errorMsg}
          </div>
        )}
      </Card>

      {/* KPIs removidos conforme solicitação */}
      <div className="hidden"></div>

      {/* Resumo por categoria removido conforme solicitação */}
      <div className="hidden"></div>

      {/* Cards de Balanço na DRE */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="relative border-l-2 border-brand-600 pl-4">
          <div>
            <p className="subtle">Ativos</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-green-600">{loadingBalanco ? 'Carregando…' : fmt(balanco?.ativos ?? 0)}</p>
          </div>
        </Card>
        <Card className="relative border-l-2 border-brand-600 pl-4">
          <div>
            <p className="subtle">Passivos</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-red-600">{loadingBalanco ? 'Carregando…' : fmt(balanco?.passivos ?? 0)}</p>
          </div>
        </Card>
        <Card className="relative border-l-2 border-brand-600 pl-4">
          <div>
            <p className="subtle">Patrimônio Líquido</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{loadingBalanco ? 'Carregando…' : fmt((balanco?.patrimonioLiquido ?? (balanco?.ativos ?? 0) - (balanco?.passivos ?? 0)) || 0)}</p>
          </div>
        </Card>
      </div>

      {/* Gráfico: Receitas vs Despesas por Categoria */}
      <Card className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Receitas vs Despesas por Categoria</h3>
          <p className="text-sm text-gray-500">Top 10 categorias do período</p>
        </div>
        <div className="w-full h-[420px]">
          {chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 24, right: 32, left: 8, bottom: 24 }} barCategoryGap={20} barGap={12}>
                <defs>
                  {/* Sombra sutil para as barras */}
                  <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.12" />
                  </filter>
                  <linearGradient id="receitasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="despesasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 4" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  interval={0}
                  angle={-18}
                  height={64}
                  tickMargin={10}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  tickFormatter={truncateLabel}
                />
                <YAxis
                  tickFormatter={(v: number) => fmt(v)}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  width={80}
                  domain={[0, 'dataMax']}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, name) => [fmt(value), name === 'receitas' ? 'Receitas' : 'Despesas']}
                  labelFormatter={(label: string) => `Categoria: ${label}`}
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                  itemStyle={{ padding: '6px 0' }}
                  cursor={{ fill: 'rgba(31,41,55,0.06)' }}
                />
                <Legend verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: 8 }} />
                <Bar dataKey="receitas" name="Receitas" fill="url(#receitasGrad)" radius={[8,8,0,0]} barSize={26} background={{ fill: '#f3f4f6' }} filter="url(#barShadow)">
                  <LabelList dataKey="receitas" position="top" formatter={(label: any) => typeof label === 'number' ? fmt(label) : label} style={{ fill: '#0f766e', fontSize: 11 }} />
                </Bar>
                <Bar dataKey="despesas" name="Despesas" fill="url(#despesasGrad)" radius={[8,8,0,0]} barSize={26} background={{ fill: '#f3f4f6' }} filter="url(#barShadow)">
                  <LabelList dataKey="despesas" position="top" formatter={(label: any) => typeof label === 'number' ? fmt(label) : label} style={{ fill: '#b91c1c', fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">Sem dados para o período selecionado</div>
          )}
        </div>
      </Card>

      {/* Tabela de Entradas e Saídas */}
      <Card className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Entradas e Saídas</h3>
          <p className="text-sm text-gray-500">Itens do período filtrado</p>
        </div>
        {loadingDetails ? (
          <div className="p-4 text-sm text-gray-600">Carregando…</div>
        ) : filteredDetails.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">Nenhum lançamento encontrado para os filtros selecionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2">Data</th>
                  <th className="px-3 py-2">Descrição</th>
                  <th className="px-3 py-2">Categoria</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.map((it) => (
                  <tr key={it.id} className="border-t border-gray-100">
                    <td className="px-3 py-2 whitespace-nowrap">{it.date}</td>
                    <td className="px-3 py-2">{it.description}</td>
                    <td className="px-3 py-2">{it.category || 'Sem categoria'}</td>
                    <td className="px-3 py-2 capitalize">{it.tipo}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={it.tipo === 'receita' ? 'text-green-600' : 'text-red-600'}>
                        {fmt(it.valor || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 font-medium">
                  <td className="px-3 py-2" colSpan={3}>Totais</td>
                  <td className="px-3 py-2">Saldo</td>
                  <td className="px-3 py-2 text-right">{fmt(totals.saldo)}</td>
                </tr>
                <tr className="text-xs text-gray-600">
                  <td className="px-3 py-2" colSpan={4}>Receitas</td>
                  <td className="px-3 py-2 text-right text-green-700">{fmt(totals.receitas)}</td>
                </tr>
                <tr className="text-xs text-gray-600">
                  <td className="px-3 py-2" colSpan={4}>Despesas</td>
                  <td className="px-3 py-2 text-right text-red-700">{fmt(totals.despesas)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>
    </AppLayout>
  )
}

