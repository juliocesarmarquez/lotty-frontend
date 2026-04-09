'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-500 rounded-lg m-4">
                    <h2 className="text-red-700 font-bold mb-2">React Render Error</h2>
                    <pre className="text-xs text-red-600 whitespace-pre-wrap">
                        {this.state.error?.message}
                    </pre>
                    <button
                        className="mt-2 text-sm bg-red-100 px-2 py-1 rounded"
                        onClick={() => this.setState({ hasError: false })}
                    >
                        Try again
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
