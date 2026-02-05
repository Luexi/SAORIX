import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

export default function Login() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const success = await login(email, password)
            if (success) {
                navigate('/')
            } else {
                setError('Credenciales incorrectas')
            }
        } catch {
            setError('Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/assets/logo-full.png"
                        alt="Saori ERP"
                        className="h-20 w-auto mb-4 object-contain"
                    />
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
                        Inicia sesión para continuar
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating p-8">
                    {/* Demo credentials notice */}
                    <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-xs text-primary dark:text-primary-light font-medium mb-2">
                            👋 Credenciales de demo:
                        </p>

                        {/* Admin */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Admin</span>
                            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                Puede borrar ventas, cambiar precios, ver logs
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark ml-4">
                            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">admin@saori.local</code> / <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">admin123</code>
                        </p>

                        {/* Empleado */}
                        <div className="flex items-center gap-2 mt-3 mb-2">
                            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">Vendedor</span>
                            <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                Solo ventas y consultas
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark ml-4">
                            <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">empleado@saori.local</code> / <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">empleado123</code>
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Correo electrónico
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light">
                                <span className="material-symbols-outlined text-[20px]">mail</span>
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">
                            Contraseña
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-secondary-light">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[20px]">login</span>
                                Iniciar sesión
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark mt-6">
                    Saori ERP v1.0.0 • © 2026
                </p>
            </div>
        </div>
    )
}
