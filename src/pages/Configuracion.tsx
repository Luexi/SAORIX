import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface SettingsSection {
    id: string
    title: string
    icon: string
    description: string
}

const sections: SettingsSection[] = [
    { id: 'general', title: 'General', icon: 'settings', description: 'Configuración general de la aplicación' },
    { id: 'business', title: 'Negocio', icon: 'storefront', description: 'Datos de tu empresa' },
    { id: 'pos', title: 'Punto de Venta', icon: 'point_of_sale', description: 'Configuración del POS' },
    { id: 'notifications', title: 'Notificaciones', icon: 'notifications', description: 'Alertas y avisos' },
    { id: 'security', title: 'Seguridad', icon: 'security', description: 'Contraseña y acceso' },
]

export default function Configuracion() {
    const user = useAuthStore((state) => state.user)
    const [activeSection, setActiveSection] = useState('general')
    const [saved, setSaved] = useState(false)

    // General settings
    const [darkMode, setDarkMode] = useState(false)
    const [language, setLanguage] = useState('es')

    // Business settings
    const [businessName, setBusinessName] = useState('Mi Negocio')
    const [businessRfc, setBusinessRfc] = useState('')
    const [businessAddress, setBusinessAddress] = useState('')
    const [businessPhone, setBusinessPhone] = useState('')

    // POS settings
    const [taxRate, setTaxRate] = useState(16)
    const [currency, setCurrency] = useState('MXN')
    const [printReceipt, setPrintReceipt] = useState(true)
    const [showStock, setShowStock] = useState(true)

    // Notification settings
    const [lowStockAlert, setLowStockAlert] = useState(true)
    const [lowStockThreshold, setLowStockThreshold] = useState(10)
    const [salesNotifications, setSalesNotifications] = useState(true)

    const handleSave = () => {
        // Aquí se guardarían los settings al backend
        console.log('Saving settings...')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const renderSection = () => {
        switch (activeSection) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-text-primary-light dark:text-white">Modo Oscuro</h4>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    Cambiar entre tema claro y oscuro
                                </p>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <label className="block font-medium text-text-primary-light dark:text-white mb-2">
                                Idioma
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary"
                            >
                                <option value="es">Español</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                )

            case 'business':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Nombre del Negocio</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => setBusinessName(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">RFC</label>
                            <input
                                type="text"
                                value={businessRfc}
                                onChange={(e) => setBusinessRfc(e.target.value)}
                                placeholder="XAXX010101000"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Dirección</label>
                            <textarea
                                value={businessAddress}
                                onChange={(e) => setBusinessAddress(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Teléfono</label>
                            <input
                                type="tel"
                                value={businessPhone}
                                onChange={(e) => setBusinessPhone(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                )

            case 'pos':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Tasa de IVA (%)</label>
                                <input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    min={0}
                                    max={100}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Moneda</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                >
                                    <option value="MXN">MXN - Peso Mexicano</option>
                                    <option value="USD">USD - Dólar Americano</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-text-primary-light dark:text-white">
                                    Imprimir Ticket
                                </h4>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    Imprimir ticket automáticamente
                                </p>
                            </div>
                            <button
                                onClick={() => setPrintReceipt(!printReceipt)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${printReceipt ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${printReceipt ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-text-primary-light dark:text-white">
                                    Mostrar Stock
                                </h4>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    Mostrar stock en las tarjetas de producto
                                </p>
                            </div>
                            <button
                                onClick={() => setShowStock(!showStock)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${showStock ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${showStock ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                )

            case 'notifications':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-text-primary-light dark:text-white">
                                    Alertas de Stock Bajo
                                </h4>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    Recibir notificación cuando el stock esté bajo
                                </p>
                            </div>
                            <button
                                onClick={() => setLowStockAlert(!lowStockAlert)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${lowStockAlert ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${lowStockAlert ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>

                        {lowStockAlert && (
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Umbral de Stock Bajo
                                </label>
                                <input
                                    type="number"
                                    value={lowStockThreshold}
                                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                                    min={1}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <div>
                                <h4 className="font-medium text-text-primary-light dark:text-white">
                                    Notificaciones de Ventas
                                </h4>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    Resumen diario de ventas
                                </p>
                            </div>
                            <button
                                onClick={() => setSalesNotifications(!salesNotifications)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${salesNotifications ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${salesNotifications ? 'translate-x-6' : ''
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                )

            case 'security':
                return (
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <h4 className="font-medium text-text-primary-light dark:text-white mb-2">
                                Usuario Actual
                            </h4>
                            <div className="flex items-center gap-3">
                                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-medium text-text-primary-light dark:text-white">
                                        {user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                        {user?.email || 'email@ejemplo.com'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Contraseña Actual</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Nueva Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Confirmar Contraseña</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary-light dark:text-white">
                        Configuración
                    </h1>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Personaliza tu experiencia y configura tu negocio
                    </p>
                </div>
            </div>

            {saved && (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined">check_circle</span>
                    Configuración guardada correctamente
                </div>
            )}

            <div className="flex gap-6">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${activeSection === section.id
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">{section.icon}</span>
                                <div>
                                    <p className="font-medium">{section.title}</p>
                                </div>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 bg-surface-light dark:bg-surface-dark rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-text-primary-light dark:text-white">
                            {sections.find((s) => s.id === activeSection)?.title}
                        </h2>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                            {sections.find((s) => s.id === activeSection)?.description}
                        </p>
                    </div>

                    {renderSection()}

                    {/* Save Button */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
