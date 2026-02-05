import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'

// Custom render with all providers
export function renderWithProviders(ui: React.ReactElement) {
    return render(
        <BrowserRouter>
            {ui}
        </BrowserRouter>
    )
}

// Mock factories for common data structures
export const getMockUser = (overrides?: Partial<{
    id: string
    name: string
    email: string
    role: string
    branchId: string
}>) => ({
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'VENDEDOR',
    branchId: 'branch-1',
    ...overrides,
})

export const getMockProduct = (overrides?: Partial<{
    productId: string
    code: string
    name: string
    price: number
    category: string
    stock: number
}>) => ({
    productId: 'prod-1',
    code: 'PROD-001',
    name: 'Test Product',
    price: 100,
    category: 'General',
    stock: 50,
    ...overrides,
})

export const getMockSale = (overrides?: Partial<{
    id: string
    folio: string
    total: number
    status: string
    paymentMethod: string
    customerName: string
    userName: string
    createdAt: string
    items: Array<{
        productName: string
        quantity: number
        priceAtSale: number
        subtotal: number
    }>
}>) => ({
    id: 'sale-1',
    folio: 'V-000001',
    total: 1160,
    subtotal: 1000,
    tax: 160,
    status: 'completed',
    paymentMethod: 'cash',
    customerName: null,
    userName: 'Test User',
    createdAt: new Date().toISOString(),
    items: [
        {
            productName: 'Test Product',
            productCode: 'PROD-001',
            quantity: 10,
            priceAtSale: 100,
            discount: 0,
            subtotal: 1000,
        },
    ],
    ...overrides,
})

export const getMockCustomer = (overrides?: Partial<{
    id: string
    name: string
    email: string
    phone: string
    totalOrders: number
}>) => ({
    id: 'customer-1',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '555-0100',
    totalOrders: 5,
    ...overrides,
})

// Mock fetch responses
export function mockFetch(response: unknown, status = 200) {
    return vi.fn().mockResolvedValue({
        ok: status >= 200 && status < 300,
        status,
        json: () => Promise.resolve(response),
    })
}

// Wait helper for async operations
export function waitForLoadingToFinish() {
    return new Promise(resolve => setTimeout(resolve, 0))
}
