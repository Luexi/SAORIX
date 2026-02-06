import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthFetch } from '@/stores/authStore'

interface Product {
    id: string
    code: string
    name: string
    price: number
    stock?: number
}

interface CartItem {
    productId: string
    code: string
    name: string
    quantity: number
    price: number
    discount: number
}

interface Customer {
    id: string
    name: string
    email?: string
    phone?: string
}

export default function CotizacionNueva() {
    const authFetch = useAuthFetch()
    const navigate = useNavigate()

    const [products, setProducts] = useState<Product[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [cart, setCart] = useState<CartItem[]>([])
    const [selectedCustomer, setSelectedCustomer] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [validUntil, setValidUntil] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)

    const TAX_RATE = 0.16

    const fetchData = useCallback(async () => {
        try {
            const [productsRes, customersRes] = await Promise.all([
                authFetch('/products'),
                authFetch('/customers'),
            ])

            if (productsRes.ok) {
                const data = await productsRes.json()
                setProducts(Array.isArray(data) ? data : data.products || [])
            }
            if (customersRes.ok) {
                const data = await customersRes.json()
                setCustomers(Array.isArray(data) ? data : data.customers || [])
            }
        } catch (error) {
            console.error('Error fetching data:', error)
        }
    }, [authFetch])

    useEffect(() => {
        fetchData()
        // Set default validity to 15 days
        const defaultValid = new Date()
        defaultValid.setDate(defaultValid.getDate() + 15)
        setValidUntil(defaultValid.toISOString().split('T')[0])
    }, [fetchData])

    const addToCart = (product: Product) => {
        const existing = cart.find(item => item.productId === product.id)
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ))
        } else {
            setCart([...cart, {
                productId: product.id,
                code: product.code,
                name: product.name,
                quantity: 1,
                price: product.price,
                discount: 0
            }])
        }
        setSearchTerm('')
    }

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart(cart.filter(item => item.productId !== productId))
        } else {
            setCart(cart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            ))
        }
    }

    const updateDiscount = (productId: string, discount: number) => {
        setCart(cart.map(item =>
            item.productId === productId ? { ...item, discount: Math.min(100, Math.max(0, discount)) } : item
        ))
    }

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId))
    }

    const subtotal = cart.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity
        const itemDiscount = itemTotal * (item.discount / 100)
        return sum + (itemTotal - itemDiscount)
    }, 0)

    const tax = subtotal * TAX_RATE
    const total = subtotal + tax

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleSubmit = async () => {
        if (cart.length === 0) {
            alert('Agrega al menos un producto')
            return
        }

        setLoading(true)
        try {
            const res = await authFetch('/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    items: cart.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        discount: item.discount
                    })),
                    customerId: selectedCustomer || undefined,
                    notes: notes || undefined,
                    validUntil: validUntil || undefined
                })
            })

            if (res.ok) {
                const data = await res.json()
                alert(`Cotización creada: ${data.quote.folio}`)
                navigate('/cotizaciones')
            } else {
                const error = await res.json()
                alert(error.error || 'Error al crear cotización')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: 'MXN'
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/cotizaciones')}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Nueva Cotización
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Crea una cotización para tu cliente
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Products Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Search */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Agregar Productos
                            </h2>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Buscar producto por nombre o código..."
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            {searchTerm && (
                                <div className="mt-4 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl">
                                    {filteredProducts.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500">No se encontraron productos</div>
                                    ) : (
                                        filteredProducts.slice(0, 10).map(product => (
                                            <button
                                                key={product.id}
                                                onClick={() => addToCart(product)}
                                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b last:border-b-0 border-gray-100 dark:border-gray-600"
                                            >
                                                <div className="text-left">
                                                    <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                                                    <div className="text-sm text-gray-500">{product.code}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-primary">{formatCurrency(product.price)}</div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Cart Items */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Productos en cotización ({cart.length})
                            </h2>

                            {cart.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
                                    <p>Agrega productos a la cotización</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(item => (
                                        <div key={item.productId} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                                <div className="text-sm text-gray-500">{item.code}</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={e => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                                                    className="w-16 text-center p-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white"
                                                />
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-xs text-gray-500">Desc. %</label>
                                                <input
                                                    type="number"
                                                    value={item.discount}
                                                    onChange={e => updateDiscount(item.productId, parseInt(e.target.value) || 0)}
                                                    className="w-full p-1 rounded border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-center"
                                                />
                                            </div>
                                            <div className="w-28 text-right font-medium text-gray-900 dark:text-white">
                                                {formatCurrency(item.price * item.quantity * (1 - item.discount / 100))}
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Cliente
                            </h2>
                            <select
                                value={selectedCustomer}
                                onChange={e => setSelectedCustomer(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="">Sin cliente específico</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Validity */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Vigencia
                            </h2>
                            <input
                                type="date"
                                value={validUntil}
                                onChange={e => setValidUntil(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Notes */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Notas
                            </h2>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="Notas adicionales..."
                                rows={3}
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            />
                        </div>

                        {/* Totals */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Resumen
                            </h2>
                            <div className="space-y-3 text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>IVA (16%)</span>
                                    <span>{formatCurrency(tax)}</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span>{formatCurrency(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || cart.length === 0}
                                className="w-full mt-6 py-4 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Creando...' : 'Crear Cotización'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
