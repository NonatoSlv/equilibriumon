// import React from 'react'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-gray-200/60 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md">
      <div className="container max-w-7xl py-3 flex flex-col items-center justify-center gap-1 text-center">
        <div className="h-0.5 w-16 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 opacity-40" aria-hidden="true" />
        <p className="text-xs text-gray-500 dark:text-gray-400">© {year} Equilibrium — Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}