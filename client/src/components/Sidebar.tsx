import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  Scale, 
  FileText, 
  User, 
  Info
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Lançamentos', href: '/lancamentos', icon: Receipt },
  { name: 'DRE', href: '/dre', icon: BarChart3 },
  { name: 'Balanço', href: '/balanco', icon: Scale },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
]

const secondaryNavigation = [
  { name: 'Minha Conta', href: '/conta', icon: User },
  { name: 'Sobre', href: '/sobre', icon: Info },
]

export default function Sidebar() {
  return (
    <aside className="hidden lg:block fixed top-16 left-0 h-[calc(100vh-64px)] w-64 shrink-0 border-r border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="flex flex-col h-full">
        {/* Navegação Principal */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="mb-6">
            <h3 className="caption mb-3">Financeiro</h3>
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/30 dark:to-brand-800/30 text-brand-700 dark:text-brand-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 transition-colors text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Resumo Rápido removido do menu conforme solicitação */}
        </nav>

        {/* Navegação Secundária */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-4">
          <h3 className="caption mb-3">Configurações</h3>
          <div className="space-y-1">
            {secondaryNavigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                  }`
                }
              >
                <item.icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}