import { useEffect, useState } from 'react'
import AppLayout from '../layouts/AppLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import CompanySelect from '../components/CompanySelect'
import { api } from '../api/client'

export default function ContaPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [empresaId, setEmpresaId] = useState<number | null>(null)

  // Empresas para gerenciamento
  const [companies, setCompanies] = useState<Array<{ id: number; nome: string }>>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [companiesError, setCompaniesError] = useState<string | null>(null)
  const [companiesVersion, setCompaniesVersion] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (password && password !== password2) {
      setMessage('As senhas não coincidem.')
      return
    }
    // Placeholder: sem backend para atualizar perfil/senha ainda
    setMessage('Configurações salvas localmente (exemplo).')
  }

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    setCompaniesError(null)
    try {
      const client = api()
      const res = await client.get('/api/empresas')
      setCompanies(((res as any).items || []) as any)
    } catch (e: any) {
      setCompaniesError(e?.message || 'Erro ao carregar empresas')
    } finally {
      setLoadingCompanies(false)
    }
  }

  useEffect(() => { loadCompanies() }, [])

  const handleDeleteCompany = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return
    try {
      const client = api()
      await client.delete(`/api/empresas/${id}`)
      await loadCompanies()
      // Forçar recarga do CompanySelect
      setCompaniesVersion((v) => v + 1)
    } catch (e: any) {
      const msg = e?.message || 'Erro ao excluir empresa'
      if (msg === 'empresa_has_lancamentos') {
        alert('Não é possível excluir: existem lançamentos associados a esta empresa.')
      } else {
        alert(msg)
      }
    }
  }

  return (
    <AppLayout>
      <div className="space-y-1">
        <h2 className="h2">Conta</h2>
        <p className="subtle">Configure sua conta e preferências de login.</p>
      </div>

      <Card className="mt-4">
        <h3 className="font-semibold mb-3">Empresa</h3>
        <CompanySelect key={companiesVersion} value={empresaId} onChange={setEmpresaId} />
      </Card>

      <Card className="mt-4">
        <h3 className="font-semibold mb-3">Gerenciar empresas</h3>
        {companiesError && (
          <div className="text-sm text-red-600">{companiesError}</div>
        )}
        <div className="mt-3 overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="th px-2">ID</th>
                <th className="th px-2">Nome</th>
                <th className="th px-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loadingCompanies ? (
                <tr className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                  <td className="td px-2" colSpan={3}>Carregando…</td>
                </tr>
              ) : companies.length === 0 ? (
                <tr className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                  <td className="td px-2" colSpan={3}>Nenhuma empresa cadastrada</td>
                </tr>
              ) : (
                companies.map((c) => (
                  <tr key={c.id} className="tr odd:bg-gray-50 dark:odd:bg-gray-900">
                    <td className="td px-2">{c.id}</td>
                    <td className="td px-2">{c.nome}</td>
                    <td className="td px-2 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        onClick={() => handleDeleteCompany(c.id)}
                      >
                        Excluir
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold">Perfil</h3>
          <form onSubmit={handleSave} className="mt-3 space-y-3">
            <Input
              label="Email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Nova senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirmar nova senha"
              type="password"
              placeholder="••••••••"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />
            {message && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" variant="primary">Salvar alterações</Button>
              <Button type="button" variant="outline" onClick={() => { setEmail(user?.email || ''); setPassword(''); setPassword2(''); setMessage(null) }}>Cancelar</Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="font-semibold">Sessão</h3>
          <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <p><span className="font-medium">Usuário:</span> {user?.email || '—'}</p>
            <p><span className="font-medium">Status:</span> Logado</p>
          </div>
          <div className="mt-3">
            <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleLogout}>
              Encerrar sessão
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}