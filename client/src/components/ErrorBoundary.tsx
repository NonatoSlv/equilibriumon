import React from 'react'

type ErrorBoundaryState = { hasError: boolean; error?: Error }

type EmptyProps = Record<string, unknown>

export default class ErrorBoundary extends React.Component<React.PropsWithChildren<EmptyProps>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<EmptyProps>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled UI error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="max-w-md text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-brand-100 text-brand-700 font-bold">BP</div>
            <h1 className="mt-4 text-xl font-semibold">Falha ao renderizar a interface</h1>
            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Ocorreu um erro inesperado. Atualize a página ou tente novamente mais tarde.</p>
            <pre className="mt-3 text-xs text-gray-500 overflow-auto max-h-32">
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}