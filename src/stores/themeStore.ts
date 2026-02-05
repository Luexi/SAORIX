import { create } from 'zustand'

interface ThemeState {
    isDark: boolean
    toggle: () => void
    setTheme: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
    isDark: false,

    toggle: () => {
        set((state) => {
            const newIsDark = !state.isDark
            // Actualizar clase en el HTML
            if (newIsDark) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
            return { isDark: newIsDark }
        })
    },

    setTheme: (isDark: boolean) => {
        if (isDark) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        set({ isDark })
    },
}))
