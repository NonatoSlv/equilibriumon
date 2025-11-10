import { Moon, Sun, LogOut, User, Settings, Bell } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { useAuth } from '../hooks/useAuth'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Header() {
  const { theme, toggle } = useTheme()
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="container h-16 flex items-center justify-between">
        {/* Logo e Marca */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-bold text-lg shadow-lg">
              BP
            </div>
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-950"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">BalancePro</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Gestão Financeira</p>
          </div>
        </div>

        {/* Navegação Central - Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink 
            to="/dashboard" 
            className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/lancamentos" 
            className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Lançamentos
          </NavLink>
          <NavLink 
            to="/dre" 
            className={({isActive}) => `px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActive 
                ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Relatórios
          </NavLink>
        </nav>

        {/* Ações do Usuário */}
        <div className="flex items-center gap-2">
          {/* Notificações */}
          <button className="btn btn-ghost btn-sm relative" aria-label="Notificações">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Toggle Tema */}
          <button className="btn btn-ghost btn-sm" onClick={toggle} aria-label="Alternar tema">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {/* Menu do Usuário */}
          <div className="relative">
            <button 
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200/60 dark:border-gray-800/60 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                </div>
                
                <NavLink 
                  to="/conta" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="h-4 w-4" />
                  Minha Conta
                </NavLink>
                
                <NavLink 
                  to="/sobre" 
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="h-4 w-4" />
                  Sobre
                </NavLink>
                
                <div className="border-t border-gray-200 dark:border-gray-800 mt-2 pt-2">
                  <button 
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}