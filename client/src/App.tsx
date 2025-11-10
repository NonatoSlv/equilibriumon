import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import { PageLoading } from './components/ui/LoadingSpinner'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LancamentosPage from './pages/LancamentosPage'
import DREPage from './pages/DREPage'
import BalancoPage from './pages/BalancoPage'
import RelatoriosPage from './pages/RelatoriosPage'
import ContaPage from './pages/ContaPage'
import RegisterPage from './pages/RegisterPage'
import AboutPage from './pages/AboutPage'
import TestePage from './pages/TestePage'
import LoginSimples from './pages/LoginSimples'
import LoginTest from './pages/LoginTest'

function Private({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoading text="Verificando autenticação..." />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-simples" element={<LoginSimples />} />
      <Route path="/login-test" element={<LoginTest />} />
      <Route path="/register" element={<RegisterPage />} />
      {/* Página Sobre movida para área autenticada */}
      <Route path="/sobre" element={<Private><AboutPage /></Private>} />
      <Route path="/teste" element={<Private><TestePage /></Private>} />
      <Route path="/dashboard" element={<Private><DashboardPage /></Private>} />
      <Route path="/lancamentos" element={<Private><LancamentosPage /></Private>} />
      <Route path="/dre" element={<Private><DREPage /></Private>} />
      <Route path="/balanco" element={<Private><BalancoPage /></Private>} />
      <Route path="/relatorios" element={<Private><RelatoriosPage /></Private>} />
      <Route path="/conta" element={<Private><ContaPage /></Private>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  )
}
