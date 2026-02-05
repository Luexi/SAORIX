import { NavLink } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

// Helper para mostrar rol en español
const roleLabels: Record<string, string> = {
    ADMIN: 'Administrador',
    SUPERVISOR: 'Supervisor',
    VENDEDOR: 'Vendedor',
}

interface NavItem {
    icon: string
    label: string
    path: string
    filled?: boolean
}

const navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', path: '/', filled: true },
    { icon: 'point_of_sale', label: 'Punto de Venta', path: '/pos' },
    { icon: 'trending_up', label: 'Ventas', path: '/ventas' },
    { icon: 'groups', label: 'Clientes', path: '/clientes' },
    { icon: 'inventory_2', label: 'Inventario', path: '/productos' },
    { icon: 'credit_card', label: 'Finanzas', path: '/finanzas' },
    { icon: 'badge', label: 'Personal', path: '/personal' },
    { icon: 'description', label: 'Reportes', path: '/reportes' },
    { icon: 'local_shipping', label: 'Proveedores', path: '/proveedores' },
]

const bottomItems: NavItem[] = [
    { icon: 'manage_accounts', label: 'Usuarios', path: '/usuarios' },
    { icon: 'settings', label: 'Configuración', path: '/configuracion' },
]

export default function Sidebar() {
    const user = useAuthStore((state) => state.user)
    const logout = useAuthStore((state) => state.logout)
    const isAdmin = useAuthStore((state) => state.isAdmin)

    // Filtrar items según rol
    const visibleNavItems = navItems.filter(item => {
        // Finanzas, Personal y Logs solo para Admin
        if (item.path === '/finanzas' || item.path === '/personal' || item.path === '/logs') {
            return isAdmin()
        }
        return true
    })

    return (
        <aside className="flex w-[80px] lg:w-[280px] flex-col bg-surface-light dark:bg-surface-dark transition-all duration-300 shadow-sm z-50">
            {/* Logo */}
            <div className="h-[80px] flex items-center justify-center lg:justify-start px-2 lg:px-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 w-full justify-center lg:justify-start">
                    <img
                        src="/assets/logo-icon.png"
                        alt="Saori"
                        className="size-10 object-contain lg:hidden"
                    />
                    <img
                        src="/assets/logo-full.png"
                        alt="Saori ERP"
                        className="h-16 w-auto hidden lg:block object-contain"
                    />
                </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-1 flex-col justify-between py-2 px-4 overflow-y-auto scrollbar-hide">
                <nav className="flex flex-col gap-1.5">
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 hidden lg:block">
                        Menu Principal
                    </p>
                    {visibleNavItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-full px-4 py-3.5 transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 font-semibold translate-x-1'
                                    : 'text-text-secondary-light hover:bg-gray-50 dark:text-text-secondary-dark dark:hover:bg-gray-800 hover:text-primary transition-colors'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`material-symbols-outlined text-[22px] transition-transform ${isActive ? '' : 'group-hover:scale-110'}`}>
                                        {item.filled && isActive ? item.icon : item.icon}
                                    </span>
                                    <span className="hidden lg:block text-[15px]">{item.label}</span>
                                    {isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white hidden lg:block" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <div className="my-4 border-t border-gray-100 dark:border-gray-800 lg:mx-4" />

                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 hidden lg:block">
                        General
                    </p>
                    {bottomItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-full px-4 py-3.5 transition-all duration-200 ${isActive
                                    ? 'bg-primary text-white shadow-lg shadow-primary/25 font-semibold'
                                    : 'text-text-secondary-light hover:bg-gray-50 dark:text-text-secondary-dark dark:hover:bg-gray-800 hover:text-primary'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                            <span className="hidden lg:block text-[15px]">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Support Card (Visual Only - Oripio style) */}
                <div className="mt-6 mb-2 hidden lg:block">
                    <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-5 text-white shadow-xl shadow-primary/20 relative overflow-hidden group cursor-pointer">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:bg-white/20 transition-all" />
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black/5 rounded-full blur-xl" />

                        <div className="relative z-10">
                            <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
                                <span className="material-symbols-outlined text-white">support_agent</span>
                            </div>
                            <h4 className="font-bold text-lg mb-1">¿Necesitas Ayuda?</h4>
                            <p className="text-white/80 text-xs mb-4 leading-relaxed">
                                Contacta a soporte técnico si tienes problemas.
                            </p>
                            <button className="w-full bg-white text-primary font-bold py-2.5 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all text-sm">
                                Contactar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-primary to-primary-light text-white flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden lg:block flex-1 min-w-0">
                        <p className="text-sm font-bold text-text-primary-light dark:text-white truncate">
                            {user?.name || 'Usuario'}
                        </p>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                            {user?.role ? roleLabels[user.role] : 'Sin rol'}
                        </p>
                    </div>
                    <button
                        onClick={logout}
                        className="hidden lg:block p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all"
                        title="Cerrar sesión"
                    >
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}
