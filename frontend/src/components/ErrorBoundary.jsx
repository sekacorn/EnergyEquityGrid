import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Something went wrong</h2>
          <p className="mt-3 text-slate-700">
            The page hit an unexpected problem. Refresh the app and try again.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
