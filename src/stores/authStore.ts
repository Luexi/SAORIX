import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Tipos
export interface User {
    id: string
    email: string
    name: string
    role: 'ADMIN' | 'SUPERVISOR' | 'VENDEDOR'
    branchId: string | null
    branchName?: string
    permissions: string[]
}

interface AuthState {
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    refreshAuth: () => Promise<boolean>
    clearError: () => void

    // Permission helpers
    hasPermission: (permission: string) => boolean
    isAdmin: () => boolean
}

const API_URL = 'http://localhost:3001/api'

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ isLoading: true, error: null })

                try {
                    const response = await fetch(`${API_URL}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                    })

                    const data = await response.json()

                    if (!response.ok) {
                        set({ error: data.error || 'Error de autenticación', isLoading: false })
                        return false
                    }

                    set({
                        user: data.user,
                        token: data.token,
                        refreshToken: data.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    })

                    return true
                } catch (error) {
                    // Fallback para desarrollo sin backend
                    console.warn('Backend no disponible, usando modo demo')

                    // Mock login para desarrollo
                    if (email === 'admin@saori.local' && password === 'admin123') {
                        set({
                            user: {
                                id: 'admin-1',
                                email: 'admin@saori.local',
                                name: 'Carlos Admin',
                                role: 'ADMIN',
                                branchId: 'main-branch',
                                branchName: 'Sucursal Principal',
                                permissions: [
                                    'sales:create', 'sales:read', 'sales:delete',
                                    'products:create', 'products:read', 'products:update', 'products:delete',
                                    'users:create', 'users:read', 'users:update', 'users:delete',
                                    'logs:read', 'reports:read',
                                ],
                            },
                            token: 'mock-token-admin',
                            refreshToken: 'mock-refresh-admin',
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        })
                        return true
                    } else if (email === 'empleado@saori.local' && password === 'empleado123') {
                        set({
                            user: {
                                id: 'empleado-1',
                                email: 'empleado@saori.local',
                                name: 'María Vendedora',
                                role: 'VENDEDOR',
                                branchId: 'main-branch',
                                branchName: 'Sucursal Principal',
                                permissions: ['sales:create', 'sales:read', 'products:read'],
                            },
                            token: 'mock-token-empleado',
                            refreshToken: 'mock-refresh-empleado',
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        })
                        return true
                    }

                    set({
                        error: 'Credenciales incorrectas',
                        isLoading: false
                    })
                    return false
                }
            },

            logout: () => {
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                })
            },

            refreshAuth: async () => {
                const { refreshToken } = get()
                if (!refreshToken) return false

                try {
                    const response = await fetch(`${API_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    })

                    if (!response.ok) {
                        get().logout()
                        return false
                    }

                    const data = await response.json()
                    set({ token: data.token })
                    return true
                } catch {
                    return false
                }
            },

            clearError: () => set({ error: null }),

            // Permission helpers
            hasPermission: (permission: string) => {
                const { user } = get()
                return user?.permissions?.includes(permission) ?? false
            },

            isAdmin: () => {
                const { user } = get()
                return user?.role === 'ADMIN'
            },
        }),
        {
            name: 'saori-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

// Hook helper para fetch autenticado
export function useAuthFetch() {
    const { token, refreshAuth, logout } = useAuthStore()

    return async (url: string, options: RequestInit = {}) => {
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }

        let response = await fetch(`${API_URL}${url}`, { ...options, headers })

        // Si el token expiró, intentar refresh
        if (response.status === 401) {
            const refreshed = await refreshAuth()
            if (refreshed) {
                const newToken = useAuthStore.getState().token
                response = await fetch(`${API_URL}${url}`, {
                    ...options,
                    headers: { ...headers, 'Authorization': `Bearer ${newToken}` },
                })
            } else {
                logout()
            }
        }

        return response
    }
}
