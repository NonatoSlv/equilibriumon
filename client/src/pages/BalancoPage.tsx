import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import Card from '../components/ui/Card'
import { api } from '../api/client'
import CompanySelect from '../components/CompanySelect'

function fmt(n: number) { return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function toISO(date: Date) { return date.toISOString().slice(0, 10) }

export default function BalancoPage() {
  const [data, setData] = useState<{ ativos: number; passivos: number; patrimonioLiquido: number; grupos: Array<{ grupo: string; total: number }> } | null>(null)
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

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

  const periodLabel = useMemo(() => {
    if (computedRange.from && computedRange.to) return `${computedRange.from} — ${computedRange.to}`
    return '—'
  }, [computedRange])

  const loadData = () => {
    const client = api()
    const params = new URLSearchParams()
    if (computedRange.from) params.append('from', computedRange.from)
    if (computedRange.to) params.append('to', computedRange.to)
    if (empresaId) params.append('empresaId', String(empresaId))
    const url = `/api/reports/balanco${params.toString() ? `?${params.toString()}` : ''}`
    setLoading(true)
    setErrorMsg(null)
   client.get(url)
   .then((res: any) => {
   const gruposMap = new Map<string, number>()
   if (Array.isArray(res.resumo)) {
   res.resumo.forEach((r: any) => {
   const curr = gruposMap.get(r.grupo) || 0
   const val = typeof r.saldo === 'number' ? r.saldo : Number(r.saldo) || 0
   gruposMap.set(r.grupo, curr + val)
   })
   }
   const grupos = Array.from(gruposMap.entries()).map(([grupo, total]) => ({ grupo, total }))
   setData({
   ativos: res.ativos ?? 0,
   passivos: res.passivos ?? 0,
   patrimonioLiquido: res.patrimonio ?? ((res.ativos ?? 0) - (res.passivos ?? 0)),
   grupos,
   })
   })
       .catch((err) => setErrorMsg(err?.message || 'Erro ao carregar Balanço'))
       .finally(() => setLoading(false))
   }

  useEffect(() => {
    loadData()
  }, [computedRange.from, computedRange.to, empresaId])

  const clearFilters = () => {
    setMonth('')
    setUseCustomRange(false)
    setFrom('')
    setTo('')
    setEmpresaId(null)
    setTimeout(loadData, 0)
  }

  const balanceStatus = useMemo(() => {
    const ativos = data?.ativos ?? 0
    const passivos = data?.passivos ?? 0
    const pl = data?.patrimonioLiquido ?? 0
    const delta = ativos - (passivos + pl)
    const epsilon = 0.01 // tolerância para arredondamento
    const balanced = Math.abs(delta) < epsilon
    return { balanced, delta }
  }, [data])

  return (
    <AppLayout>
      <div className="space-y-1">
        <h2 className="h2">Balanço Patrimonial</h2>
        <p className="subtle">Posição de ativos, passivos e patrimônio líquido.</p>
      </div>

      <Card className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Filtros</h3>
          <div className="text-xs text-gray-600 dark:text-gray-400">Período aplicado: {periodLabel}</div>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Período (mês/ano)</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="input input-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input id="chk-range-b" type="checkbox" checked={useCustomRange} onChange={(e) => setUseCustomRange(e.target.checked)} />
            <label htmlFor="chk-range-b" className="text-sm">Intervalo customizado</label>
          </div>
          {useCustomRange && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Data início</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input input-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data fim</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input input-sm" />
              </div>
            </>
          )}
          <div>
            <CompanySelect value={empresaId} onChange={setEmpresaId} hideCreate />
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="btn btn-primary btn-sm" disabled={loading} aria-busy={loading}>Aplicar</button>
            <button onClick={clearFilters} className="btn btn-ghost btn-sm">Limpar</button>
          </div>
        </div>
        {errorMsg && (
          <div role="alert" className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm">
            {errorMsg}
          </div>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="relative border-l-2 border-brand-600 pl-4">
          <div>
            <p className="subtle">Ativos</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-green-600">{loading ? 'Carregando…' : fmt(data?.ativos ?? 0)}</p>
          </div>
        </Card>
        <Card className="relative border-l-2 border-brand-600 pl-4">
          <div>
            <p className="subtle">Passivos</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-red-600">{loading ? 'Carregando…' : fmt(data?.passivos ?? 0)}</p>
          </div>
        </Card>
        <Card className="relative border-l-2 border-brand-600 pl-4">
          <div>
            <p className="subtle">Patrimônio Líquido</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">{loading ? 'Carregando…' : fmt(data?.patrimonioLiquido ?? 0)}</p>
          </div>
        </Card>
      </div>

      <Card className="mt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold">Status do Balanço</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Verificação de equilíbrio: Ativos = Passivos + Patrimônio Líquido
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              balanceStatus.balanced
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
            }`}
          >
            {loading ? 'Verificando…' : balanceStatus.balanced ? 'Balanceado' : 'Desbalanceado'}
          </span>
        </div>
        <div className="mt-3 text-sm">
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Carregando dados…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
                <p className="subtle">Ativos</p>
                <p className="mt-1 font-medium">{fmt(data?.ativos ?? 0)}</p>
              </div>
              <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
                <p className="subtle">Passivos</p>
                <p className="mt-1 font-medium">{fmt(data?.passivos ?? 0)}</p>
              </div>
              <div className={`p-3 rounded border ${balanceStatus.balanced ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                <p className="subtle">Diferença (Ativos − Passivos)</p>
                <p className={`mt-1 font-medium ${balanceStatus.balanced ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>{fmt((data?.ativos ?? 0) - (data?.passivos ?? 0))}</p>
              </div>
            </div>
          )}
          {!loading && !balanceStatus.balanced && (
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Observação: caso a diferença persista, revise lançamentos e categorias para garantir a consistência.
            </p>
          )}
        </div>
      </Card>

      <Card className="mt-6 overflow-x-auto">
        <h3 className="font-semibold">Grupos</h3>
        <table className="mt-3 table w-full">
          <thead>
            <tr>
              <th className="th px-2">Grupo</th>
              <th className="th px-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="tr odd:bg-gray-50 dark:odd:bg-gray-900"><td className="td px-2" colSpan={2}>Carregando…</td></tr>
            ) : data?.grupos?.length ? data.grupos.map((g) => (
              <tr key={g.grupo} className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                <td className="td px-2">{g.grupo}</td>
                <td className="td px-2 text-right">{fmt(g.total)}</td>
              </tr>
            )) : (
              <tr className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                <td className="td px-2">—</td>
                <td className="td px-2 text-right">—</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </AppLayout>
  )
}