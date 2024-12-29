import React, { createContext, useCallback, useContext, useEffect } from 'react'
import { useDocument } from '@/shared/firebase/hooks/useDocument'
import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { Timestamp, setDoc, doc, collection } from 'firebase/firestore'
import { firestore } from '@/shared/firebase/firebase'

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
    productId: string
    productName: string
    price: number
    clientName: string
    reservationId: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

type StoreConfigDocument = {
    id: string
    products: Product[]
    categories: Category[]
} & FSDocument

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
    addSale: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
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
    const { document: storeConfig, setDocument: setStoreConfig } = useDocument<StoreConfigDocument>({
        collectionName: 'configs',
        id: 'store'
    })

    const { results: sales } = useCollection<Sale>({
        path: 'sales',
        orderBy: ['createdAt', 'desc']
    })

    const products = storeConfig?.products || []
    const categories = storeConfig?.categories || []

    const addProduct = useCallback((product: Omit<Product, 'id'>) => {
        const newProduct = { ...product, id: Date.now().toString() }
        setStoreConfig({ id: 'store', products: [...products, newProduct], categories })
    }, [products, categories, setStoreConfig])

    const updateProduct = useCallback((id: string, updatedProduct: Partial<Product>) => {
        const updatedProducts = products.map(p => (p.id === id ? { ...p, ...updatedProduct } : p))
        setStoreConfig({ id: 'store', products: updatedProducts, categories })
    }, [products, categories, setStoreConfig])

    const deleteProduct = useCallback((id: string) => {
        const updatedProducts = products.filter(p => p.id !== id)
        setStoreConfig({ id: 'store', products: updatedProducts, categories })
    }, [products, categories, setStoreConfig])

    const getProductById = useCallback(
        (id: string) => {
            return products.find(p => p.id === id)
        },
        [products],
    )

    const addCategory = useCallback((category: Omit<Category, 'id'>) => {
        const newCategory = { ...category, id: Date.now().toString() }
        setStoreConfig({ id: 'store', products, categories: [...categories, newCategory] })
    }, [products, categories, setStoreConfig])

    const updateCategory = useCallback((id: string, updatedCategory: Partial<Category>) => {
        const updatedCategories = categories.map(c => (c.id === id ? { ...c, ...updatedCategory } : c))
        setStoreConfig({ id: 'store', products, categories: updatedCategories })
    }, [products, categories, setStoreConfig])

    const deleteCategory = useCallback((id: string) => {
        const updatedCategories = categories.filter(c => c.id !== id)
        setStoreConfig({ id: 'store', products, categories: updatedCategories })
    }, [products, categories, setStoreConfig])

    const addSale = useCallback(async (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = Timestamp.now()
        const id = Date.now().toString()
        const newSale: Sale = {
            ...sale,
            id,
            createdAt: now,
            updatedAt: now
        }
        const saleRef = doc(collection(firestore, 'sales'), id)
        await setDoc(saleRef, newSale)
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
