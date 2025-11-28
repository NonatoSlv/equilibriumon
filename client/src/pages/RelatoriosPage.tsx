import { useEffect, useMemo, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import CompanySelect from '../components/CompanySelect'
import { api } from '../api/client'
import { useToast } from '../components/ui/Toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type DreResumoItem = { category: string; receitas: number; despesas: number }
type DreResponse = { receitas: number; despesas: number; resultado: number; resumo: DreResumoItem[] }
type BalancoItem = { conta: string; grupo: string; saldo: number }
type BalancoResponse = { ativos: number; passivos: number; patrimonio: number; resumo: BalancoItem[] }
type LancamentoItem = { id: number; date: string; description: string; category: string; tipo: 'receita'|'despesa'; valor: number }

export default function RelatoriosPage() {
  const [empresaId, setEmpresaId] = useState<number | null>(null)
  const [exporting, setExporting] = useState(false)
  const { success, error, warning } = useToast()
  const [empresaNome, setEmpresaNome] = useState<string>('')
  const [periodMode, setPeriodMode] = useState<'month' | 'range'>('month')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [drePreview, setDrePreview] = useState<{ receitas: number; despesas: number; resultado: number } | null>(null)
  const [balancoPreview, setBalancoPreview] = useState<{ ativos: number; passivos: number; patrimonio: number } | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

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

  // canExport removido por não uso; a lógica de exportação já valida empresaId/exporting diretamente

  useEffect(() => {
    const loadEmpresaNome = async () => {
      if (!empresaId) { setEmpresaNome(''); return }
      try {
        const client = api()
        const res = await client.get<{ items?: Array<{ id: number; nome: string }> }>(`/api/empresas`)
        const found = (res.items || []).find((e) => e.id === empresaId)
        setEmpresaNome(found?.nome || `Empresa ${empresaId}`)
      } catch (e) {
        console.error('Erro ao buscar empresas:', e)
        setEmpresaNome(`Empresa ${empresaId}`)
      }
    }
    loadEmpresaNome()
  }, [empresaId])

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0)
  const periodoLabel = () => {
    const f = computedRange.from
    const t = computedRange.to
    if (f && t) return `${f} a ${t}`
    if (f) return `A partir de ${f}`
    if (t) return `Até ${t}`
    return 'Sem período definido'
  }

  const loadPreviewData = async () => {
    if (!empresaId) { setDrePreview(null); setBalancoPreview(null); return }
    try {
      setLoadingPreview(true)
      const client = api()
      const params = new URLSearchParams({ empresaId: String(empresaId) })
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)
      const [dre, balanco] = await Promise.all([
        client.get<DreResponse>(`/api/reports/dre?${params.toString()}`),
        client.get<BalancoResponse>(`/api/reports/balanco?${params.toString()}`),
      ])
      setDrePreview({ receitas: dre.receitas ?? 0, despesas: dre.despesas ?? 0, resultado: dre.resultado ?? 0 })
      setBalancoPreview({ ativos: balanco.ativos ?? 0, passivos: balanco.passivos ?? 0, patrimonio: balanco.patrimonio ?? 0 })
    } catch (e) {
      console.error('Erro ao carregar prévia de relatórios:', e)
      setDrePreview(null)
      setBalancoPreview(null)
    } finally {
      setLoadingPreview(false)
    }
  }

  useEffect(() => {
    loadPreviewData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId, computedRange.from, computedRange.to])

  async function handleExportCsv() {
    if (!empresaId) {
      warning('Selecione a empresa', 'Escolha uma empresa para exportar a DRE.')
      return
    }
    try {
      setExporting(true)
      const params = new URLSearchParams({ empresaId: String(empresaId) })
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)
      const client = api()
      const dre = await client.get<DreResponse>(`/api/reports/dre?${params.toString()}`)

      const headers = ['Categoria', 'Receitas', 'Despesas', 'Resultado']
      const rows = dre.resumo.map((r) => [
        r.category || '—',
        (r.receitas ?? 0).toFixed(2),
        (r.despesas ?? 0).toFixed(2),
        ((r.receitas ?? 0) - (r.despesas ?? 0)).toFixed(2),
      ])
      const totals = ['Totais', (dre.receitas ?? 0).toFixed(2), (dre.despesas ?? 0).toFixed(2), (dre.resultado ?? 0).toFixed(2)]
      const csv = [headers, ...rows, totals]
        .map((row) => row.map((cell) => String(cell)).join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `dre_${empresaId}_${date}.csv`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      success('Exportação concluída', 'Arquivo CSV da DRE baixado com sucesso.')
    } catch (e) {
      console.error('Erro ao exportar CSV:', e)
      error('Falha na exportação', (e as Error)?.message || 'Não foi possível gerar o CSV.')
    } finally {
      setExporting(false)
    }
  }

  async function handleExportBalancoCsv() {
    if (!empresaId) {
      warning('Selecione a empresa', 'Escolha uma empresa para exportar o Balanço.')
      return
    }
    try {
      setExporting(true)
      const params = new URLSearchParams({ empresaId: String(empresaId) })
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)
      const client = api()
      const balanco = await client.get<BalancoResponse>(`/api/reports/balanco?${params.toString()}`)

      const headers = ['Conta', 'Grupo', 'Saldo']
      const rows = (balanco.resumo || []).map((r) => [
        r.conta || '—',
        r.grupo || '—',
        (r.saldo ?? 0).toFixed(2),
      ])
      const totals = ['Totais', '—', (balanco.ativos - balanco.passivos).toFixed(2)]
      const csv = [headers, ...rows, ['', '', ''], ['Ativos', '—', (balanco.ativos ?? 0).toFixed(2)], ['Passivos', '—', (balanco.passivos ?? 0).toFixed(2)], ['Patrimônio Líquido', '—', (balanco.patrimonio ?? 0).toFixed(2)], ['', '', ''], totals]
        .map((row) => row.map((cell) => String(cell)).join(','))
        .join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      a.href = url
      a.download = `balanco_${empresaId}_${date}.csv`
      a.style.display = 'none'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      success('Exportação concluída', 'Arquivo CSV do Balanço baixado com sucesso.')
    } catch (e) {
      console.error('Erro ao exportar CSV de Balanço:', e)
      error('Falha na exportação', (e as Error)?.message || 'Não foi possível gerar o CSV de Balanço.')
    } finally {
      setExporting(false)
    }
  }

  async function handleExportDrePdf() {
    if (!empresaId) {
      warning('Selecione a empresa', 'Escolha uma empresa para exportar a DRE em PDF.')
      return
    }
    try {
      setExporting(true)
      const params = new URLSearchParams({ empresaId: String(empresaId) })
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)
      const client = api()
      const dre = await client.get<DreResponse>(`/api/reports/dre?${params.toString()}`)

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      const drawHeader = (d: jsPDF) => {
        d.setFillColor(33, 150, 243)
        d.rect(0, 0, pageWidth, 56, 'F')
        d.setTextColor(255)
        d.setFontSize(15)
        d.text('Demonstração do Resultado (DRE)', 40, 32)
        d.setFontSize(11)
        d.text((empresaNome || `Empresa ${empresaId}`).trim(), pageWidth - 40, 32, { align: 'right' })
        d.setTextColor(60)
        d.setFontSize(10)
        d.text(`Período: ${periodoLabel()}`, 40, 70)
      }

      const body = dre.resumo.map((r) => [
        r.category || '—',
        formatCurrency(r.receitas ?? 0),
        formatCurrency(r.despesas ?? 0),
        formatCurrency((r.receitas ?? 0) - (r.despesas ?? 0)),
      ])

      autoTable(doc, {
        margin: { top: 90, right: 40, bottom: 60, left: 40 },
        head: [['Categoria', 'Receitas', 'Despesas', 'Resultado']],
        body,
        foot: [['Totais', formatCurrency(dre.receitas ?? 0), formatCurrency(dre.despesas ?? 0), formatCurrency(dre.resultado ?? 0)]],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.6, lineColor: [225, 225, 225] },
        headStyles: { fillColor: [24, 95, 180], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        footStyles: { fillColor: [240, 244, 252], textColor: [20, 20, 20], fontStyle: 'bold' },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
        },
        theme: 'striped',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
      })

      // Resumo do período - cartão/tabela compacta
      autoTable(doc, {
        startY: (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 90,
        margin: { right: 40, left: 40 },
        head: [['Resumo do período', 'Valor']],
        body: [
          ['Receitas', formatCurrency(dre.receitas ?? 0)],
          ['Despesas', formatCurrency(dre.despesas ?? 0)],
          ['Resultado', formatCurrency(dre.resultado ?? 0)],
        ],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.4, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        theme: 'grid',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
        didParseCell: (data) => {
          const { row, column, cell } = data
          if (row.section === 'body' && column.index === 0) {
            if (row.index === 0) { cell.styles.fillColor = [232, 245, 233]; cell.styles.textColor = [27, 94, 32] }
            else if (row.index === 1) { cell.styles.fillColor = [252, 235, 233]; cell.styles.textColor = [165, 42, 42] }
            else { cell.styles.fillColor = [232, 241, 252]; cell.styles.textColor = [24, 95, 180] }
          }
          if (column.index === 1) cell.styles.halign = 'right'
        },
      })

      // Indicadores (margem, etc.)
      const receitasTotal = dre.receitas ?? 0
      const despesasTotal = dre.despesas ?? 0
      const resultado = dre.resultado ?? (receitasTotal - despesasTotal)
      const margemPct = receitasTotal > 0 ? ((resultado / receitasTotal) * 100) : 0
      const lastYIndicators = (doc as any).lastAutoTable?.finalY || 90
      autoTable(doc, {
        startY: lastYIndicators + 20,
        margin: { right: 40, left: 40 },
        head: [['Indicadores', 'Valor']],
        body: [
          ['Receita total', formatCurrency(receitasTotal)],
          ['Despesa total', formatCurrency(despesasTotal)],
          ['Resultado', formatCurrency(resultado)],
          ['Margem (%)', `${margemPct.toFixed(2)}%`],
        ],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.4, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [33, 150, 243], textColor: 255 },
        theme: 'grid',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
        didParseCell: (data) => {
          const { row, column, cell } = data
          if (row.section === 'body' && column.index === 0) {
            if (row.index === 0) { cell.styles.fillColor = [232, 245, 233]; cell.styles.textColor = [27, 94, 32] }
            else if (row.index === 1) { cell.styles.fillColor = [252, 235, 233]; cell.styles.textColor = [165, 42, 42] }
            else if (row.index === 2) { cell.styles.fillColor = [232, 241, 252]; cell.styles.textColor = [24, 95, 180] }
            else { cell.styles.fillColor = [245, 245, 245]; cell.styles.textColor = [60, 60, 60] }
          }
          if (column.index === 1) cell.styles.halign = 'right'
        },
      })

      // Rodapé com paginação e carimbo de data
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setTextColor(120)
        doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 40, pageHeight - 30)
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 40, pageHeight - 30, { align: 'right' })
      }

      const date = new Date().toISOString().slice(0, 10)
      doc.save(`dre_${empresaId}_${date}.pdf`)
      success('Exportação concluída', 'PDF da DRE gerado com sucesso.')
    } catch (e) {
      console.error('Erro ao exportar PDF DRE:', e)
      error('Falha na exportação', (e as Error)?.message || 'Não foi possível gerar o PDF da DRE.')
    } finally {
      setExporting(false)
    }
  }

  async function handleExportBalancoPdf() {
    if (!empresaId) {
      warning('Selecione a empresa', 'Escolha uma empresa para exportar o Balanço em PDF.')
      return
    }
    try {
      setExporting(true)
      const params = new URLSearchParams({ empresaId: String(empresaId) })
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)
      const client = api()
      const balanco = await client.get<BalancoResponse>(`/api/reports/balanco?${params.toString()}`)

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      const drawHeader = (d: jsPDF) => {
        d.setFillColor(33, 150, 243)
        d.rect(0, 0, pageWidth, 56, 'F')
        d.setTextColor(255)
        d.setFontSize(15)
        d.text('Balanço Patrimonial', 40, 32)
        d.setFontSize(11)
        d.text((empresaNome || `Empresa ${empresaId}`).trim(), pageWidth - 40, 32, { align: 'right' })
        d.setTextColor(60)
        d.setFontSize(10)
        d.text(`Período: ${periodoLabel()}`, 40, 70)
      }

      const body = (balanco.resumo || []).map((r) => [
        r.conta || '—',
        r.grupo || '—',
        formatCurrency(r.saldo ?? 0),
      ])

      autoTable(doc, {
        margin: { top: 90, right: 40, bottom: 60, left: 40 },
        head: [['Conta', 'Grupo', 'Saldo']],
        body,
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.6, lineColor: [225, 225, 225] },
        headStyles: { fillColor: [24, 95, 180], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          2: { halign: 'right' },
        },
        theme: 'striped',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
      })

      const lastY = (doc as any).lastAutoTable?.finalY || 90
      autoTable(doc, {
        startY: lastY + 20,
        margin: { right: 40, left: 40 },
        head: [['Resumo']],
        body: [
          ['Ativos', formatCurrency(balanco.ativos ?? 0)],
          ['Passivos', formatCurrency(balanco.passivos ?? 0)],
          ['Patrimônio Líquido', formatCurrency(balanco.patrimonio ?? 0)],
        ],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.4, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        theme: 'grid',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
        didParseCell: (data) => {
          const { row, column, cell } = data
          if (row.section === 'body' && column.index === 0) {
            if (row.index === 0) { cell.styles.fillColor = [232, 245, 233]; cell.styles.textColor = [27, 94, 32] }
            else if (row.index === 1) { cell.styles.fillColor = [252, 235, 233]; cell.styles.textColor = [165, 42, 42] }
            else { cell.styles.fillColor = [232, 241, 252]; cell.styles.textColor = [24, 95, 180] }
          }
          if (column.index === 1) cell.styles.halign = 'right'
        },
      })

      // Seção de Equilíbrio
      const ativos = balanco.ativos ?? 0
      const passivos = balanco.passivos ?? 0
      const patrimonio = balanco.patrimonio ?? (ativos - passivos)
      const delta = ativos - (passivos + patrimonio)
      const diferencaAP = ativos - passivos
      const balanced = Math.abs(delta) < 0.01
      const lastYEquilibrio = (doc as any).lastAutoTable?.finalY || 90
      autoTable(doc, {
        startY: lastYEquilibrio + 20,
        margin: { right: 40, left: 40 },
        head: [['Equilíbrio', 'Valor']],
        body: [
          ['Verificação', 'Ativos = Passivos + Patrimônio Líquido'],
          ['Diferença de equilíbrio', formatCurrency(delta)],
          ['Diferença (Ativos - Passivos)', formatCurrency(diferencaAP)],
          ['Status do balanço', balanced ? 'Balanceado' : 'Desbalanceado'],
        ],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.4, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [33, 150, 243], textColor: 255 },
        theme: 'grid',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
        didParseCell: (data) => {
          const { row, column, cell } = data
          if (row.section === 'body') {
            if (row.index === 1 || row.index === 2) {
              // números
              if (column.index === 1) cell.styles.halign = 'right'
              cell.styles.textColor = balanced ? [27, 94, 32] : [165, 42, 42]
            }
            if (row.index === 3 && column.index === 1) {
              cell.styles.fillColor = balanced ? [232, 245, 233] : [252, 235, 233]
              cell.styles.textColor = balanced ? [27, 94, 32] : [165, 42, 42]
              cell.styles.fontStyle = 'bold'
            }
          }
        },
      })

      // Rodapé com paginação e carimbo de data
      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setTextColor(120)
        doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 40, pageHeight - 30)
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 40, pageHeight - 30, { align: 'right' })
      }

      const date = new Date().toISOString().slice(0, 10)
      doc.save(`balanco_${empresaId}_${date}.pdf`)
      success('Exportação concluída', 'PDF do Balanço gerado com sucesso.')
    } catch (e) {
      console.error('Erro ao exportar PDF Balanço:', e)
      error('Falha na exportação', (e as Error)?.message || 'Não foi possível gerar o PDF do Balanço.')
    } finally {
      setExporting(false)
    }
  }

  async function handleExportFluxoPdf() {
    if (!empresaId) {
      warning('Selecione a empresa', 'Escolha uma empresa para exportar o Fluxo de Caixa em PDF.')
      return
    }
    try {
      setExporting(true)
      const params = new URLSearchParams({ empresaId: String(empresaId) })
      if (computedRange.from) params.set('from', computedRange.from)
      if (computedRange.to) params.set('to', computedRange.to)
      const client = api()
      const resp = await client.get<{ items?: LancamentoItem[] }>(`/api/lancamentos?${params.toString()}`)
      const items = resp.items || []

      const entradasByCat = new Map<string, number>()
      const saidasByCat = new Map<string, number>()
      let entradasTotal = 0
      let saidasTotal = 0
      for (const it of items) {
        const cat = it.category || 'Sem categoria'
        const val = typeof it.valor === 'number' ? it.valor : Number(it.valor) || 0
        if (it.tipo === 'receita') {
          entradasTotal += val
          entradasByCat.set(cat, (entradasByCat.get(cat) || 0) + val)
        } else if (it.tipo === 'despesa') {
          saidasTotal += val
          saidasByCat.set(cat, (saidasByCat.get(cat) || 0) + val)
        }
      }

      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      const drawHeader = (d: jsPDF) => {
        d.setFillColor(33, 150, 243)
        d.rect(0, 0, pageWidth, 56, 'F')
        d.setTextColor(255)
        d.setFontSize(15)
        d.text('Fluxo de Caixa', 40, 32)
        d.setFontSize(11)
        d.text((empresaNome || `Empresa ${empresaId}`).trim(), pageWidth - 40, 32, { align: 'right' })
        d.setTextColor(60)
        d.setFontSize(10)
        d.text(`Período: ${periodoLabel()}`, 40, 70)
      }

      const entradasRows = Array.from(entradasByCat.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([cat, val]) => [cat, formatCurrency(val)])
      const saidasRows = Array.from(saidasByCat.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([cat, val]) => [cat, formatCurrency(val)])

      autoTable(doc, {
        margin: { top: 90, right: 40, bottom: 60, left: 40 },
        head: [['Entradas por Categoria', 'Valor']],
        body: entradasRows.length ? entradasRows : [['Sem dados', formatCurrency(0)]],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.6, lineColor: [225, 225, 225] },
        headStyles: { fillColor: [24, 95, 180], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 1: { halign: 'right' } },
        theme: 'striped',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
      })

      const lastY1 = (doc as any).lastAutoTable?.finalY || 90
      autoTable(doc, {
        startY: lastY1 + 20,
        margin: { right: 40, left: 40 },
        head: [['Saídas por Categoria', 'Valor']],
        body: saidasRows.length ? saidasRows : [['Sem dados', formatCurrency(0)]],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.6, lineColor: [225, 225, 225] },
        headStyles: { fillColor: [200, 60, 60], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: { 1: { halign: 'right' } },
        theme: 'striped',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
      })

      const lastY2 = (doc as any).lastAutoTable?.finalY || 90
      autoTable(doc, {
        startY: lastY2 + 20,
        margin: { right: 40, left: 40 },
        head: [['Resumo do período', 'Valor']],
        body: [
          ['Entradas', formatCurrency(entradasTotal)],
          ['Saídas', formatCurrency(saidasTotal)],
          ['Saldo', formatCurrency(entradasTotal - saidasTotal)],
        ],
        styles: { fontSize: 10, cellPadding: 6, lineWidth: 0.4, lineColor: [220, 220, 220] },
        headStyles: { fillColor: [76, 175, 80], textColor: 255 },
        theme: 'grid',
        didDrawPage: ({ doc }) => drawHeader(doc as unknown as jsPDF),
        didParseCell: (data) => {
          const { row, column, cell } = data
          if (row.section === 'body' && column.index === 0) {
            if (row.index === 0) { cell.styles.fillColor = [232, 245, 233]; cell.styles.textColor = [27, 94, 32] }
            else if (row.index === 1) { cell.styles.fillColor = [252, 235, 233]; cell.styles.textColor = [165, 42, 42] }
            else { cell.styles.fillColor = [232, 241, 252]; cell.styles.textColor = [24, 95, 180] }
          }
          if (column.index === 1) cell.styles.halign = 'right'
        },
      })

      const pageCount = doc.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setTextColor(120)
        doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 40, pageHeight - 30)
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - 40, pageHeight - 30, { align: 'right' })
      }

      const date = new Date().toISOString().slice(0, 10)
      doc.save(`fluxo_${empresaId}_${date}.pdf`)
      success('Exportação concluída', 'PDF de Fluxo de Caixa gerado com sucesso.')
    } catch (e) {
      console.error('Erro ao exportar PDF Fluxo:', e)
      error('Falha na exportação', (e as Error)?.message || 'Não foi possível gerar o PDF de Fluxo de Caixa.')
    } finally {
      setExporting(false)
    }
  }
  return (
    <AppLayout>
      <div className="space-y-1">
        <h2 className="h2">Relatórios</h2>
        <p className="subtle">Gere e exporte relatórios gerenciais.</p>
      </div>

      <Card className="mt-4">
        <h3 className="font-semibold mb-3">Empresa</h3>
        <CompanySelect value={empresaId} onChange={setEmpresaId} />
        {!empresaId && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Selecione uma empresa para habilitar exportações.</p>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="h4">Relatórios disponíveis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gere relatórios gerenciais conforme a empresa selecionada</p>
          </div>
          <div className="p-6 overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="th px-2">Relatório</th>
                  <th className="th px-2">Descrição</th>
                  <th className="th px-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                  <td className="td px-2">Balanço Patrimonial</td>
                  <td className="td px-2">Visão de ativos, passivos e patrimônio</td>
                  <td className="td px-2 text-right"><Button size="sm" onClick={handleExportBalancoPdf} disabled={exporting}>Gerar</Button></td>
                </tr>
                <tr className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                  <td className="td px-2">DRE</td>
                  <td className="td px-2">Apuração de resultados por período</td>
                  <td className="td px-2 text-right"><Button size="sm" onClick={handleExportDrePdf} disabled={exporting}>Gerar</Button></td>
                </tr>
                <tr className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                  <td className="td px-2">Fluxo de Caixa</td>
                  <td className="td px-2">Entradas e saídas agrupadas</td>
                  <td className="td px-2 text-right"><Button size="sm" onClick={handleExportFluxoPdf} disabled={exporting}>Gerar</Button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="h4">Exportações</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Escolha o formato e o período para exportação</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-end">
              <div>
                <label className="block text-sm font-medium mb-2">Modo de período</label>
                <select className="input w-full" value={periodMode} onChange={(e) => setPeriodMode(e.target.value as any)}>
                  <option value="month">Mês</option>
                  <option value="range">Intervalo</option>
                </select>
              </div>
              {periodMode === 'month' ? (
                <div>
                  <label className="block text-sm font-medium mb-2">Mês</label>
                  <input type="month" className="input w-full" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data início</label>
                    <input type="date" className="input w-full" value={from} onChange={(e) => setFrom(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data fim</label>
                    <input type="date" className="input w-full" value={to} onChange={(e) => setTo(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc ml-4">
              <li>PDF</li>
              <li>Excel (XLSX)</li>
              <li>CSV</li>
            </ul>
            <div className="mt-4">
              <h4 className="font-medium mb-2">Prévia de Totais</h4>
              {!empresaId ? (
                <p className="text-sm text-gray-500">Selecione uma empresa para ver a prévia.</p>
              ) : loadingPreview ? (
                <p className="text-sm text-gray-500">Carregando prévia…</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
                    <div className="font-semibold mb-1">DRE</div>
                    {drePreview ? (
                      <ul className="space-y-1">
                        <li>Receitas: <span className="font-medium">{formatCurrency(drePreview.receitas)}</span></li>
                        <li>Despesas: <span className="font-medium">{formatCurrency(drePreview.despesas)}</span></li>
                        <li>Resultado: <span className="font-medium">{formatCurrency(drePreview.resultado)}</span></li>
                      </ul>
                    ) : (
                      <p className="text-gray-500">Sem dados para o período.</p>
                    )}
                  </div>
                  <div className="p-3 rounded border border-gray-200 dark:border-gray-800">
                    <div className="font-semibold mb-1">Balanço</div>
                    {balancoPreview ? (
                      <ul className="space-y-1">
                        <li>Ativos: <span className="font-medium">{formatCurrency(balancoPreview.ativos)}</span></li>
                        <li>Passivos: <span className="font-medium">{formatCurrency(balancoPreview.passivos)}</span></li>
                        <li>Patrimônio Líquido: <span className="font-medium">{formatCurrency(balancoPreview.patrimonio)}</span></li>
                      </ul>
                    ) : (
                      <p className="text-gray-500">Sem dados para o período.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button 
                variant="primary" 
                disabled={exporting}
                title={!empresaId ? 'Selecione a empresa' : undefined}
                onClick={handleExportCsv}
              >
                {exporting ? 'Exportando…' : 'Exportar CSV (DRE)'}
              </Button>
              <Button 
                variant="outline" 
                disabled={exporting}
                title={!empresaId ? 'Selecione a empresa' : undefined}
                onClick={handleExportBalancoCsv}
              >
                {exporting ? 'Exportando…' : 'Exportar CSV (Balanço)'}
              </Button>
              <Button 
                variant="primary" 
                disabled={exporting}
                title={!empresaId ? 'Selecione a empresa' : undefined}
                onClick={handleExportDrePdf}
              >
                {exporting ? 'Exportando…' : 'Exportar PDF (DRE)'}
              </Button>
              <Button 
                variant="outline" 
                disabled={exporting}
                title={!empresaId ? 'Selecione a empresa' : undefined}
                onClick={handleExportBalancoPdf}
              >
                {exporting ? 'Exportando…' : 'Exportar PDF (Balanço)'}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}