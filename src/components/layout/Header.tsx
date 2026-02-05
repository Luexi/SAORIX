import { useThemeStore } from '@/stores/themeStore'
import { useAuthStore } from '@/stores/authStore'

export default function Header() {
    const { isDark, toggle } = useThemeStore()
    const user = useAuthStore((state) => state.user)

    return (
        <header className="flex-none px-6 py-5 lg:px-10 bg-[#F5F7FA] dark:bg-background-dark z-30">
            <div className="flex items-center justify-between gap-8">
                {/* Left: Mobile Menu Trigger (Hidden on Desktop) */}
                <button className="lg:hidden p-2 -ml-2 text-gray-400">
                    <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Center/Left: Search Bar (Oripio Style) */}
                <div className="flex-1 max-w-xl">
                    <div className="relative group">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 group-focus-within:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[22px]">search</span>
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full bg-white dark:bg-surface-dark pl-11 pr-12 py-3 rounded-full border-none shadow-soft text-sm text-text-primary-light dark:text-white placeholder:text-gray-400/80 focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <span className="text-xs">⌘</span> K
                            </kbd>
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <button className="p-2.5 bg-white dark:bg-surface-dark rounded-full text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm">
                        <span className="material-symbols-outlined text-[20px] block">help</span>
                    </button>

                    <button className="p-2.5 bg-white dark:bg-surface-dark rounded-full text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm relative">
                        <span className="material-symbols-outlined text-[20px] block">mail</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border border-white dark:border-surface-dark" />
                    </button>

                    <button className="p-2.5 bg-white dark:bg-surface-dark rounded-full text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm relative">
                        <span className="material-symbols-outlined text-[20px] block">notifications</span>
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-primary rounded-full border border-white dark:border-surface-dark" />
                    </button>

                    <button
                        onClick={toggle}
                        className="p-2.5 bg-white dark:bg-surface-dark rounded-full text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px] block">
                            {isDark ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* User Avatar Tiny */}
                    <div className="ml-2 pl-4 border-l border-gray-200 dark:border-gray-700 hidden sm:flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white p-0.5 shadow-sm overflow-hidden cursor-pointer">
                            <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-emerald-300 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
