import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import Layout from '@/components/layout/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import POS from '@/pages/POS'
import Inventario from '@/pages/Inventario'
import Clientes from '@/pages/Clientes'
import Finanzas from '@/pages/Finanzas'
import Personal from '@/pages/Personal'
import Reportes from '@/pages/Reportes'
import Logs from '@/pages/Logs'
import Proximamente from '@/pages/Proximamente'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const isAdmin = useAuthStore((state) => state.isAdmin)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (!isAdmin()) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* Rutas protegidas */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Dashboard />} />
                    <Route path="ventas" element={<Proximamente titulo="Historial Ventas" />} />
                    <Route path="pos" element={<POS />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="productos" element={<Inventario />} />
                    <Route path="finanzas" element={<AdminRoute><Finanzas /></AdminRoute>} />
                    <Route path="personal" element={<AdminRoute><Personal /></AdminRoute>} />
                    <Route path="reportes" element={<Reportes />} />
                    <Route path="proveedores" element={<Proximamente titulo="Proveedores" />} />
                    <Route path="usuarios" element={<Proximamente titulo="Usuarios" />} />
                    <Route path="logs" element={<AdminRoute><Logs /></AdminRoute>} />
                    <Route path="facturacion" element={<Proximamente titulo="Facturación Electrónica" proximamente />} />
                    <Route path="nomina" element={<Proximamente titulo="Nómina" proximamente />} />
                    <Route path="contabilidad" element={<Proximamente titulo="Contabilidad" proximamente />} />
                    <Route path="configuracion" element={<Proximamente titulo="Configuración" />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
