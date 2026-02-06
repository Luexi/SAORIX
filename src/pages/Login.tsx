import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { API_URL } from '@/lib/api'

interface SetupStatusResponse {
    requiresSetup: boolean
}

interface FirstUserForm {
    branchName: string
    name: string
    email: string
    password: string
    confirmPassword: string
}

const initialFirstUserForm: FirstUserForm = {
    branchName: 'Sucursal Principal',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
}

export default function Login() {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [checkingSetup, setCheckingSetup] = useState(true)
    const [requiresSetup, setRequiresSetup] = useState(false)
    const [setupLoading, setSetupLoading] = useState(false)
    const [setupError, setSetupError] = useState('')
    const [setupForm, setSetupForm] = useState<FirstUserForm>(initialFirstUserForm)

    useEffect(() => {
        void checkSetupStatus()
    }, [])

    async function checkSetupStatus() {
        setCheckingSetup(true)
        try {
            const response = await fetch(`${API_URL}/setup/status`)
            if (!response.ok) {
                setRequiresSetup(false)
                return
            }

            const data = (await response.json()) as SetupStatusResponse
            setRequiresSetup(Boolean(data.requiresSetup))
        } catch {
            setRequiresSetup(false)
        } finally {
            setCheckingSetup(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
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
            setError('Error al iniciar sesion')
        } finally {
            setLoading(false)
        }
    }

    const handleFirstUserSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSetupError('')

        const safeName = setupForm.name.trim()
        const safeEmail = setupForm.email.trim().toLowerCase()
        const safeBranchName = setupForm.branchName.trim()

        if (!safeName || !safeEmail || !safeBranchName) {
            setSetupError('Sucursal, nombre y email son obligatorios')
            return
        }

        if (setupForm.password.length < 8) {
            setSetupError('La contrasena debe tener al menos 8 caracteres')
            return
        }

        if (setupForm.password !== setupForm.confirmPassword) {
            setSetupError('Las contrasenas no coinciden')
            return
        }

        setSetupLoading(true)
        try {
            const response = await fetch(`${API_URL}/setup/first-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    branchName: safeBranchName,
                    name: safeName,
                    email: safeEmail,
                    password: setupForm.password,
                }),
            })

            const responseData = await response.json().catch(() => ({}))
            if (!response.ok) {
                setSetupError(responseData.error || 'No se pudo crear el primer usuario')
                await checkSetupStatus()
                return
            }

            const success = await login(safeEmail, setupForm.password)
            if (success) {
                navigate('/')
                return
            }

            setSetupError('Usuario creado, pero no se pudo iniciar sesion automaticamente.')
        } catch {
            setSetupError('No se pudo conectar al backend local para crear el primer usuario')
        } finally {
            setSetupLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/assets/logo-full.png"
                        alt="Saori ERP"
                        className="h-20 w-auto mb-4 object-contain"
                    />
                    <p className="text-text-secondary-light dark:text-text-secondary-dark mt-2">
                        {requiresSetup ? 'Configuracion inicial del sistema' : 'Inicia sesion para continuar'}
                    </p>
                </div>

                {checkingSetup ? (
                    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating p-8 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        Validando instalacion...
                    </div>
                ) : requiresSetup ? (
                    <form onSubmit={handleFirstUserSubmit} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating p-8">
                        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            No hay usuarios registrados. Crea el primer administrador para iniciar la app.
                        </div>

                        {setupError && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                                {setupError}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">Sucursal principal</label>
                            <input
                                value={setupForm.branchName}
                                onChange={(event) => setSetupForm((prev) => ({ ...prev, branchName: event.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">Nombre del administrador</label>
                            <input
                                value={setupForm.name}
                                onChange={(event) => setSetupForm((prev) => ({ ...prev, name: event.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">Email del administrador</label>
                            <input
                                type="email"
                                value={setupForm.email}
                                onChange={(event) => setSetupForm((prev) => ({ ...prev, email: event.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">Contrasena</label>
                            <input
                                type="password"
                                value={setupForm.password}
                                onChange={(event) => setSetupForm((prev) => ({ ...prev, password: event.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">Confirmar contrasena</label>
                            <input
                                type="password"
                                value={setupForm.confirmPassword}
                                onChange={(event) => setSetupForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                                className="w-full px-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={setupLoading}
                            className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {setupLoading ? 'Creando primer usuario...' : 'Crear primer usuario'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-floating p-8">
                        <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-xs text-primary dark:text-primary-light font-medium mb-2">Credenciales de demo:</p>

                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">Admin</span>
                                <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                    Puede borrar ventas, cambiar precios y ver logs
                                </span>
                            </div>
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark ml-4">
                                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">admin@saori.local</code> / <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">admin123</code>
                            </p>

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

                        {error && (
                            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">Correo electronico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-primary-light dark:text-white mb-2">Contrasena</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="********"
                                className="w-full px-4 py-3 text-sm rounded-lg border-0 bg-background-light dark:bg-background-dark ring-1 ring-inset ring-gray-200 dark:ring-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-medium py-3 px-4 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
                        </button>
                    </form>
                )}

                <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark mt-6">
                    Saori ERP v1.0.0 - 2026
                </p>
            </div>
        </div>
    )
}
