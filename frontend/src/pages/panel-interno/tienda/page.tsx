'use client'

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductList } from '@/components/product-list'
import { SalesHistory } from '@/components/sales-history'
import { VisualPOS } from '@/components/visual-pos'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export default function StorePage() {
    const navigate = useNavigate()

    useEffect(() => {
        // Verificar si hay un empleado seleccionado
        const selectedEmployee = sessionStorage.getItem('selectedEmployee')
        if (!selectedEmployee) {
            navigate('/panel-interno/tienda')
        }
    }, [navigate])

    return (
        <div className='container mx-auto p-6'>
            <h1 className='text-3xl font-bold mb-6'>Tienda</h1>

            <Tabs defaultValue='pos' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-3 gap-4 bg-transparent p-0'>
                    <TabsTrigger
                        value='pos'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        TPV Visual
                    </TabsTrigger>
                    <TabsTrigger
                        value='products'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Productos
                    </TabsTrigger>
                    <TabsTrigger
                        value='sales'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Histórico de Ventas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='pos' className='mt-6'>
                    <VisualPOS />
                </TabsContent>
                <TabsContent value='products' className='mt-6'>
                    <ProductList />
                </TabsContent>
                <TabsContent value='sales' className='mt-6'>
                    <SalesHistory />
                </TabsContent>
            </Tabs>
        </div>
    )
}
