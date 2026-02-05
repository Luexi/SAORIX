import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Configuracion from '../pages/Configuracion'

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
    useAuthStore: vi.fn().mockImplementation((selector) => {
        const state = {
            user: { id: '1', name: 'Admin User', role: 'ADMIN', email: 'admin@test.com' },
            isAuthenticated: true,
        }
        return selector ? selector(state) : state
    }),
}))

describe('Configuracion', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('Rendering', () => {
        it('should render the page header', () => {
            render(
                <BrowserRouter>
                    <Configuracion />
                </BrowserRouter>
            )

            expect(screen.getByText('Configuración')).toBeInTheDocument()
            expect(screen.getByText('Personaliza tu experiencia y configura tu negocio')).toBeInTheDocument()
        })

        it('should render sidebar navigation items', () => {
            render(
                <BrowserRouter>
                    <Configuracion />
                </BrowserRouter>
            )

            // Check for sidebar menu items (these appear as buttons)
            expect(screen.getAllByText('General')[0]).toBeInTheDocument()
            expect(screen.getByText('Negocio')).toBeInTheDocument()
        })

        it('should show General section by default with description', () => {
            render(
                <BrowserRouter>
                    <Configuracion />
                </BrowserRouter>
            )

            // The description for General section
            expect(screen.getByText('Configuración general de la aplicación')).toBeInTheDocument()
        })

        it('should have a save button', () => {
            render(
                <BrowserRouter>
                    <Configuracion />
                </BrowserRouter>
            )

            expect(screen.getByText('Guardar Cambios')).toBeInTheDocument()
        })
    })

    describe('Section Navigation', () => {
        it('should switch to Business section when clicked', () => {
            render(
                <BrowserRouter>
                    <Configuracion />
                </BrowserRouter>
            )

            const negocioBtn = screen.getByText('Negocio')
            fireEvent.click(negocioBtn)

            // After clicking, we should see the business description
            expect(screen.getByText('Datos de tu empresa')).toBeInTheDocument()
        })

        it('should show POS fields after clicking POS section', () => {
            render(
                <BrowserRouter>
                    <Configuracion />
                </BrowserRouter>
            )

            const posBtn = screen.getByText('Punto de Venta')
            fireEvent.click(posBtn)

            // After clicking, we should see POS-specific content
            expect(screen.getByText('Tasa de IVA (%)')).toBeInTheDocument()
        })
    })
})
