import React, { createContext, useCallback, useContext, useState } from 'react'

type Product = {
    id: string
    name: string
    price: number
    category?: string
}

type Category = {
    id: string
    name: string
}

type Sale = {
    id: string
    date: string
    productId: string
    productName: string
    price: number
    clientName: string
    reservationId: string
}

type ProductContextType = {
    products: Product[]
    categories: Category[]
    sales: Sale[]
    addProduct: (product: Omit<Product, 'id'>) => void
    updateProduct: (id: string, product: Partial<Product>) => void
    deleteProduct: (id: string) => void
    getProductById: (id: string) => Product | undefined
    addCategory: (category: Omit<Category, 'id'>) => void
    updateCategory: (id: string, category: Partial<Category>) => void
    deleteCategory: (id: string) => void
    addSale: (sale: Omit<Sale, 'id'>) => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export const useProductContext = () => {
    const context = useContext(ProductContext)
    if (!context) {
        throw new Error('useProductContext must be used within a ProductProvider')
    }
    return context
}

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [products, setProducts] = useState<Product[]>([
        { id: '1', name: 'Collar Básico', price: 15.99, category: 'Accesorios' },
        { id: '2', name: 'Correa Extendible', price: 25.5, category: 'Accesorios' },
        { id: '3', name: 'Arnés Ajustable', price: 19.99, category: 'Accesorios' },
        { id: '4', name: 'Placa de Identificación', price: 8.99, category: 'Accesorios' },
        { id: '5', name: 'Cama para Mascotas', price: 39.99, category: 'Accesorios' },
        { id: '6', name: 'Comida Seca Premium', price: 29.99, category: 'Alimentos' },
        { id: '7', name: 'BARF Diet', price: 34.99, category: 'Alimentos' },
        { id: '8', name: 'Snacks Naturales', price: 12.99, category: 'Alimentos' },
        { id: '9', name: 'Suplementos Vitaminados', price: 19.99, category: 'Alimentos' },
        { id: '10', name: 'Comida Húmeda Gourmet', price: 2.99, category: 'Alimentos' },
        { id: '11', name: 'Pelota de Goma', price: 7.99, category: 'Juguetes' },
        { id: '12', name: 'Mordedor de Caucho', price: 9.99, category: 'Juguetes' },
        { id: '13', name: 'Disco Volador', price: 11.99, category: 'Juguetes' },
        { id: '14', name: 'Peluche Interactivo', price: 14.99, category: 'Juguetes' },
        { id: '15', name: 'Juguete Dispensador de Premios', price: 16.99, category: 'Juguetes' },
    ])

    const [categories, setCategories] = useState<Category[]>([
        { id: '1', name: 'Accesorios' },
        { id: '2', name: 'Alimentos' },
        { id: '3', name: 'Juguetes' },
    ])

    const [sales, setSales] = useState<Sale[]>([
        {
            id: '1',
            date: '2024-01-15',
            productId: '1',
            productName: 'Collar Básico',
            price: 31.98,
            clientName: 'Juan Pérez',
            reservationId: 'RES001',
        },
        {
            id: '2',
            date: '2024-01-15',
            productId: '11',
            productName: 'Pelota de Goma',
            price: 15.98,
            clientName: 'Juan Pérez',
            reservationId: 'RES001',
        },
        {
            id: '3',
            date: '2024-01-16',
            productId: '6',
            productName: 'Comida Seca Premium',
            price: 59.98,
            clientName: 'María López',
            reservationId: 'RES002',
        },
        {
            id: '4',
            date: '2024-01-16',
            productId: '8',
            productName: 'Snacks Naturales',
            price: 25.98,
            clientName: 'María López',
            reservationId: 'RES002',
        },
        {
            id: '5',
            date: '2024-01-17',
            productId: '9',
            productName: 'Suplementos Vitaminados',
            price: 39.98,
            clientName: 'Ana García',
            reservationId: 'RES003',
        },
        {
            id: '6',
            date: '2024-01-17',
            productId: '3',
            productName: 'Arnés Ajustable',
            price: 19.99,
            clientName: 'Ana García',
            reservationId: 'RES003',
        },
    ])

    const addProduct = useCallback((product: Omit<Product, 'id'>) => {
        const newProduct = { ...product, id: Date.now().toString() }
        setProducts(prev => [...prev, newProduct])
    }, [])

    const updateProduct = useCallback((id: string, updatedProduct: Partial<Product>) => {
        setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updatedProduct } : p)))
    }, [])

    const deleteProduct = useCallback((id: string) => {
        setProducts(prevProducts => {
            const updatedProducts = prevProducts.filter(p => p.id !== id)
            console.log('Products after deletion:', updatedProducts) // Para depuración
            return updatedProducts
        })
        setSales(prevSales => {
            const updatedSales = prevSales.filter(s => s.productId !== id)
            console.log('Sales after product deletion:', updatedSales) // Para depuración
            return updatedSales
        })
    }, [])

    const getProductById = useCallback(
        (id: string) => {
            return products.find(p => p.id === id)
        },
        [products],
    )

    const addCategory = useCallback((category: Omit<Category, 'id'>) => {
        const newCategory = { ...category, id: Date.now().toString() }
        setCategories(prev => [...prev, newCategory])
    }, [])

    const updateCategory = useCallback((id: string, updatedCategory: Partial<Category>) => {
        setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updatedCategory } : c)))
    }, [])

    const deleteCategory = useCallback((id: string) => {
        setCategories(prev => prev.filter(c => c.id !== id))
    }, [])

    const addSale = useCallback((sale: Omit<Sale, 'id'>) => {
        const newSale = { ...sale, id: Date.now().toString() }
        setSales(prev => [...prev, newSale])
    }, [])

    return (
        <ProductContext.Provider
            value={{
                products,
                categories,
                sales,
                addProduct,
                updateProduct,
                deleteProduct,
                getProductById,
                addCategory,
                updateCategory,
                deleteCategory,
                addSale,
            }}
        >
            {children}
        </ProductContext.Provider>
    )
}
