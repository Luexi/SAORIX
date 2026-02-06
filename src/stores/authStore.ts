import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCallback } from 'react'
import { API_URL } from '@/lib/api'

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
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    refreshAuth: () => Promise<boolean>
    clearError: () => void
    hasPermission: (permission: string) => boolean
    isAdmin: () => boolean
}

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
                        set({ error: data.error || 'Error de autenticacion', isLoading: false })
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
                } catch {
                    set({
                        error: 'No se pudo conectar al servidor local. Verifica que la app este inicializada correctamente.',
                        isLoading: false,
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

export function useAuthFetch() {
    const { token, refreshAuth, logout } = useAuthStore()

    return useCallback(async (url: string, options: RequestInit = {}) => {
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }

        const fetchWithContext = async (requestUrl: string, requestOptions: RequestInit) => {
            try {
                return await fetch(requestUrl, requestOptions)
            } catch {
                throw new Error('No hay conexion con la API local (puerto 3001). Inicia la app con `npm run electron:dev`.')
            }
        }

        let response = await fetchWithContext(`${API_URL}${url}`, { ...options, headers })

        if (response.status === 401) {
            const refreshed = await refreshAuth()
            if (refreshed) {
                const newToken = useAuthStore.getState().token
                response = await fetchWithContext(`${API_URL}${url}`, {
                    ...options,
                    headers: { ...headers, Authorization: `Bearer ${newToken}` },
                })
            } else {
                logout()
            }
        }

        return response
    }, [logout, refreshAuth, token])
}
