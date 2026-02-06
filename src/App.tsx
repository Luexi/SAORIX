import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const Layout = lazy(() => import('@/components/layout/Layout'))
const Login = lazy(() => import('@/pages/Login'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const POS = lazy(() => import('@/pages/POS'))
const Inventario = lazy(() => import('@/pages/Inventario'))
const Clientes = lazy(() => import('@/pages/Clientes'))
const Finanzas = lazy(() => import('@/pages/Finanzas'))
const Personal = lazy(() => import('@/pages/Personal'))
const Reportes = lazy(() => import('@/pages/Reportes'))
const Logs = lazy(() => import('@/pages/Logs'))
const Proximamente = lazy(() => import('@/pages/Proximamente'))
const HistorialVentas = lazy(() => import('@/pages/HistorialVentas'))
const Proveedores = lazy(() => import('@/pages/Proveedores'))
const Compras = lazy(() => import('@/pages/Compras'))
const Usuarios = lazy(() => import('@/pages/Usuarios'))
const Configuracion = lazy(() => import('@/pages/Configuracion'))
const Cotizaciones = lazy(() => import('@/pages/Cotizaciones'))
const CotizacionNueva = lazy(() => import('@/pages/CotizacionNueva'))
const PipelineCRM = lazy(() => import('@/pages/PipelineCRM'))

function RouteFallback() {
    return <div className="p-6 text-sm text-gray-500">Cargando modulo...</div>
}

function ProtectedRoute({ children }: { children: ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

function AdminRoute({ children }: { children: ReactNode }) {
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
            <Suspense fallback={<RouteFallback />}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Layout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<Dashboard />} />
                        <Route path="ventas" element={<HistorialVentas />} />
                        <Route path="pos" element={<POS />} />
                        <Route path="clientes" element={<Clientes />} />
                        <Route path="productos" element={<Inventario />} />
                        <Route path="finanzas" element={<AdminRoute><Finanzas /></AdminRoute>} />
                        <Route path="personal" element={<AdminRoute><Personal /></AdminRoute>} />
                        <Route path="reportes" element={<Reportes />} />
                        <Route path="proveedores" element={<Proveedores />} />
                        <Route path="compras" element={<Compras />} />
                        <Route path="crm-pipeline" element={<PipelineCRM />} />
                        <Route path="cotizaciones" element={<Cotizaciones />} />
                        <Route path="cotizaciones/nueva" element={<CotizacionNueva />} />
                        <Route path="usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
                        <Route path="logs" element={<AdminRoute><Logs /></AdminRoute>} />
                        <Route path="facturacion" element={<Proximamente titulo="Facturacion Electronica" proximamente />} />
                        <Route path="nomina" element={<Proximamente titulo="Nomina" proximamente />} />
                        <Route path="contabilidad" element={<Proximamente titulo="Contabilidad" proximamente />} />
                        <Route path="configuracion" element={<Configuracion />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default App
