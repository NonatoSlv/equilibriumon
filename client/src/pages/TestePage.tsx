import { useState, useEffect } from 'react'
import { api } from '../api/client'
import AppLayout from '../layouts/AppLayout'
import Card from '../components/ui/Card'

export default function TestePage() {
  const [contas, setContas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadContas = async () => {
    setLoading(true)
    setError('')
    try {
      const client = api()
      const response = await client.get('/api/plano-contas')
      console.log('Resposta da API:', response)
      setContas((response as any).items || [])
    } catch (err: any) {
      console.error('Erro:', err)
      setError(err.message || 'Erro ao carregar contas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContas()
  }, [])

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="h1">Teste - Plano de Contas</h1>
          <p className="subtitle">Verificando se as contas estão sendo carregadas corretamente</p>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="h3">Contas Carregadas</h2>
            <button 
              onClick={loadContas}
              className="btn btn-primary btn-sm"
              disabled={loading}
            >
              {loading ? 'Carregando...' : 'Recarregar'}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total de contas: {contas.length}
            </p>
            
            {contas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th className="th">Código</th>
                      <th className="th">Nome</th>
                      <th className="th">Tipo</th>
                      <th className="th">Nível</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contas.map((conta) => (
                      <tr key={conta.id} className="tr">
                        <td className="td font-mono">{conta.codigo}</td>
                        <td className="td">{conta.nome}</td>
                        <td className="td">
                          <span className={`badge ${
                            conta.tipo === 'ativo' ? 'badge-info' :
                            conta.tipo === 'passivo' ? 'badge-warning' :
                            conta.tipo === 'receita' ? 'badge-success' :
                            conta.tipo === 'despesa' ? 'badge-error' :
                            'badge-neutral'
                          }`}>
                            {conta.tipo}
                          </span>
                        </td>
                        <td className="td">{conta.nivel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                {loading ? 'Carregando contas...' : 'Nenhuma conta encontrada'}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="h4 mb-3">Teste por Tipo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['ativo', 'passivo', 'receita', 'despesa', 'patrimonio_liquido'].map(tipo => (
              <TesteTipo key={tipo} tipo={tipo} />
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}

function TesteTipo({ tipo }: { tipo: string }) {
  const [contas, setContas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadContas = async () => {
    setLoading(true)
    try {
      const client = api()
      const response = await client.get(`/api/plano-contas/tipo/${tipo}`)
      setContas((response as any).items || [])
    } catch (err) {
      console.error(`Erro ao carregar ${tipo}:`, err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContas()
  }, [tipo])

  return (
    <div className="p-3 border rounded-lg">
      <h4 className="font-medium text-sm mb-2 capitalize">{tipo}</h4>
      <p className="text-xs text-gray-500 mb-2">
        {loading ? 'Carregando...' : `${contas.length} contas`}
      </p>
      <div className="space-y-1">
        {contas.slice(0, 3).map(conta => (
          <div key={conta.id} className="text-xs">
            <span className="font-mono">{conta.codigo}</span> - {conta.nome}
          </div>
        ))}
        {contas.length > 3 && (
          <div className="text-xs text-gray-400">
            +{contas.length - 3} mais...
          </div>
        )}
      </div>
    </div>
  )
}