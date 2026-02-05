import { useState, useEffect } from 'react'
import { useAuthFetch } from '@/stores/authStore'

interface User {
    id: string
    name: string
    email: string
    role: string
    branchName?: string
    active: boolean
    createdAt: string
}

interface Employee {
    id: string
    name: string
    email: string
    code: string
}

export default function Usuarios() {
    const authFetch = useAuthFetch()
    const [users, setUsers] = useState<User[]>([])
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'VENDEDOR',
        branchId: '', // Ideally fetched from branches
    })

    const fetchUsers = async () => {
        try {
            const res = await authFetch(`/users?search=${search}`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchEmployees = async () => {
        try {
            const res = await authFetch('/employees')
            if (res.ok) {
                const data = await res.json()
                setEmployees(data)
            }
        } catch (error) {
            console.error('Error fetching employees:', error)
        }
    }

    useEffect(() => {
        fetchUsers()
        fetchEmployees()
    }, [search])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = editingUser ? `/users/${editingUser.id}` : '/users'
            const method = editingUser ? 'PUT' : 'POST'

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(formData),
            })

            if (res.ok) {
                setShowModal(false)
                fetchUsers()
                setFormData({ name: '', email: '', password: '', role: 'VENDEDOR', branchId: '' })
                setEditingUser(null)
            } else {
                const err = await res.json()
                alert(err.error || 'Error al guardar usuario')
            }
        } catch (error) {
            console.error('Error saving user:', error)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return

        try {
            const res = await authFetch(`/users/${id}`, { method: 'DELETE' })
            if (res.ok) fetchUsers()
        } catch (error) {
            console.error('Error deleting user:', error)
        }
    }

    const handleEdit = (user: User) => {
        setEditingUser(user)
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Don't show password
            role: user.role,
            branchId: '', // Backend doesn't return ID in list always, simplify for now
        })
        setShowModal(true)
    }

    // Auto-fill from Employee selection
    const handleEmployeeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const empId = e.target.value
        const emp = employees.find(e => e.id === empId)
        if (emp) {
            setFormData(prev => ({
                ...prev,
                name: emp.name,
                email: emp.email || prev.email,
            }))
        }
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
                        Usuarios del Sistema
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gestiona el acceso y roles del personal.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null)
                        setFormData({ name: '', email: '', password: '', role: 'VENDEDOR', branchId: '' })
                        setShowModal(true)
                    }}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl font-medium shadow-soft transition-all flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Usuario
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <span className="material-symbols-outlined">search</span>
                </span>
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border-none shadow-soft bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary/20"
                />
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                {user.name.charAt(0)}
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                user.role === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {user.active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="size-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="size-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-floating w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Vincular con Empleado (Opcional)
                                    </label>
                                    <select
                                        onChange={handleEmployeeSelect}
                                        className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="">Seleccionar empleado...</option>
                                        {employees.map(e => (
                                            <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    {editingUser ? 'Nueva Contraseña (dejar en blanco para mantener)' : 'Contraseña'}
                                </label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary/20"
                                >
                                    <option value="VENDEDOR">Vendedor</option>
                                    <option value="SUPERVISOR">Supervisor</option>
                                    <option value="ADMIN">Administrador</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
