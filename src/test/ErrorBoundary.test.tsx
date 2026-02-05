import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'

// Componente que lanza error para testing
const ErrorThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
    if (shouldThrow) {
        throw new Error('Test error')
    }
    return <div>No error</div>
}

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // Silenciar console.error para estos tests
        vi.spyOn(console, 'error').mockImplementation(() => { })
    })

    it('renders children when there is no error', () => {
        render(
            <ErrorBoundary>
                <div>Test content</div>
            </ErrorBoundary>
        )

        expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('renders fallback UI when there is an error', () => {
        render(
            <ErrorBoundary>
                <ErrorThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('¡Oops! Algo salió mal')).toBeInTheDocument()
        expect(screen.getByText('Recargar página')).toBeInTheDocument()
        expect(screen.getByText('Ir al inicio')).toBeInTheDocument()
    })

    it('renders custom fallback when provided', () => {
        render(
            <ErrorBoundary fallback={<div>Custom fallback</div>}>
                <ErrorThrowingComponent shouldThrow={true} />
            </ErrorBoundary>
        )

        expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    })
})
