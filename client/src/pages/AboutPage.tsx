import { BarChart3, Shield, Layers, Rocket, Cpu, Users, CheckCircle } from 'lucide-react'
import Card from '../components/ui/Card'
import AppLayout from '../layouts/AppLayout'

export default function AboutPage() {
  return (
    <AppLayout>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-brand-50 to-blue-50 dark:from-gray-900 dark:to-gray-950 p-6">
        <div className="relative z-10">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-brand-100 text-brand-700 font-bold">BP</div>
          <h2 className="mt-3 h2">Sobre a Balance Pro</h2>
          <p className="subtle mt-1">Gestão financeira moderna, simples e confiável para o seu negócio.</p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">DRE e Balanço</span>
            <span className="px-2 py-1 rounded bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Multi-empresa</span>
            <span className="px-2 py-1 rounded bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Segurança com JWT</span>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-200/40 dark:bg-brand-600/20 blur-2xl" aria-hidden="true" />
      </div>

      {/* O que oferecemos */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold tracking-tight">O que oferecemos</h3>
        <p className="subtle">Uma plataforma web intuitiva com recursos essenciais para controlar suas finanças.</p>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <BarChart3 className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium">Relatórios Profissionais</p>
                <p className="subtle mt-1">DRE e Balanço gerados automaticamente com clareza e precisão.</p>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Layers className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium">Plano de Contas Estruturado</p>
                <p className="subtle mt-1">Organização contábil padronizada para lançamentos consistentes.</p>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium">Segurança</p>
                <p className="subtle mt-1">Autenticação segura com JWT e boas práticas de proteção.</p>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Cpu className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium">Indicadores em Tempo Real</p>
                <p className="subtle mt-1">Acompanhe receitas, despesas e resultados sem fricção.</p>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium">Multi-empresa</p>
                <p className="subtle mt-1">Gerencie várias empresas em uma única plataforma.</p>
              </div>
            </div>
          </Card>
          <Card className="border border-gray-200 dark:border-gray-800">
            <div className="flex items-start gap-3">
              <Rocket className="h-5 w-5 text-brand-600" />
              <div>
                <p className="font-medium">Simplicidade que ajuda a crescer</p>
                <p className="subtle mt-1">Interface moderna e objetiva para decisões rápidas.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tecnologias */}
      <Card className="mt-6 border border-gray-200 dark:border-gray-800">
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="mt-0">Tecnologias</h3>
          <p className="subtle">Construído com ferramentas modernas para performance e confiabilidade:</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">React 19</span>
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Vite</span>
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">TypeScript</span>
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Tailwind CSS</span>
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Express</span>
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">SQLite</span>
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">JWT</span>
          </div>
        </div>
      </Card>

      {/* Valores e missão resumidos */}
      <Card className="mt-4 border border-gray-200 dark:border-gray-800">
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="mt-0">Missão e valores</h3>
          <ul className="grid gap-2 list-none p-0">
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-brand-600" /> Simplicidade: poderosa e fácil de usar.</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-brand-600" /> Transparência: dados claros e confiáveis.</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-brand-600" /> Acessibilidade: tecnologia ao alcance de PMEs.</li>
            <li className="flex items-start gap-2"><CheckCircle className="h-5 w-5 text-brand-600" /> Confiabilidade: segurança e precisão.</li>
          </ul>
        </div>
      </Card>

      {/* CTA */}
      <Card className="mt-4 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium">Pronto para organizar suas finanças?</p>
            <p className="subtle mt-1">Explore os lançamentos e gere seu DRE em minutos.</p>
          </div>
          <a href="/dashboard" className="btn btn-primary btn-sm">Ir para o Dashboard</a>
        </div>
      </Card>
    </AppLayout>
  )
}