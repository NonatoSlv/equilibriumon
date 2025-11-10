import { useEffect, useState } from 'react'
import Button from './ui/Button'
import Input from './ui/Input'
import { api } from '../api/client'

interface CompanySelectProps {
  value: number | null
  onChange: (val: number | null) => void
  hideCreate?: boolean
  onlyWithLancamentos?: boolean
}

type Empresa = { id: number; nome: string }
type EmpresasResponse = { items?: Empresa[] }
type LancamentoResumo = { empresa_id: number | null }
type LancamentosResponse = { items?: LancamentoResumo[] }

export default function CompanySelect({ value, onChange, hideCreate = false, onlyWithLancamentos = false }: CompanySelectProps) {
  const [companies, setCompanies] = useState<Array<Empresa>>([])
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const client = api()
      const resEmp = await client.get<EmpresasResponse>('/api/empresas')
      let list: Array<Empresa> = resEmp.items || []

      if (onlyWithLancamentos) {
        const resLanc = await client.get<LancamentosResponse>('/api/lancamentos')
        const ids = new Set<number>((resLanc.items || [])
          .map((it) => it.empresa_id)
          .filter((id): id is number => id != null))
        list = list.filter((c) => ids.has(c.id))
      }

      setCompanies(list)
    } catch (e: unknown) {
      console.error('Erro ao carregar empresas:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    try {
      const client = api()
      const res = await client.post<{ item?: Empresa } | Empresa>('/api/empresas', { nome: newName.trim() })
      const newCompany: Empresa = (res as { item?: Empresa }).item || (res as Empresa)
      setCompanies((prev) => [...prev, newCompany])
      setNewName('')
      onChange(newCompany.id)
    } catch (e: unknown) {
      console.error('Erro ao criar empresa:', e)
      const msg = e instanceof Error ? e.message : 'Erro ao criar empresa'
      alert(msg)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {!hideCreate && (
        <div className="flex items-center gap-2">
          <Input
            label="Nova empresa"
            placeholder="Ex.: Minha Empresa"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button size="sm" onClick={handleCreate}>Adicionar</Button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-700 dark:text-gray-300">Empresa</label>
        <select
          className="input h-8"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
          disabled={loading}
        >
          <option value="">Todas</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>
    </div>
  )
}