// Configuração do Modo Demo
// Ative isso quando não tiver backend disponível

export const DEMO_MODE = true // true = modo demo (sem backend necessário)

export const demoConfig = {
  enabled: DEMO_MODE,
  showBanner: true, // Mostrar aviso de modo demo
  autoLogin: false, // Login automático ao carregar
  mockDelay: 500 // Delay para simular requisições (ms)
}
