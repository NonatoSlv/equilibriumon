import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { registerSW } from 'virtual:pwa-register'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)

// Registro do Service Worker do PWA (auto update)
registerSW({
  onNeedRefresh() {
    // Podemos exibir um toast informando que há atualização disponível
    // e atualizar automaticamente
  },
  onOfflineReady() {
    // Podemos sinalizar que o app está pronto para uso offline
  },
})
