'use client'

import { ProductList } from '@/components/product-list'
import { SalesHistory } from '@/components/sales-history'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VisualPOS } from '@/components/visual-pos'

export default function StorePage() {
    return (
        <div className='container mx-auto space-y-6 p-6'>
            <h1 className='text-3xl font-bold'>Gestor de Artículos de la Tienda</h1>

            <Tabs defaultValue='pos' className='space-y-4'>
                <TabsList className='rounded-lg bg-gray-100 p-1'>
                    <TabsTrigger
                        value='pos'
                        className='rounded-md px-4 py-2 transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                    >
                        TPV Visual
                    </TabsTrigger>
                    <TabsTrigger
                        value='products'
                        className='rounded-md px-4 py-2 transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                    >
                        Productos
                    </TabsTrigger>
                    <TabsTrigger
                        value='sales'
                        className='rounded-md px-4 py-2 transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                    >
                        Histórico de Ventas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='pos'>
                    <Card>
                        <CardHeader>
                            <CardTitle>TPV Visual</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <VisualPOS />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='products'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Productos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProductList />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='sales'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Histórico de Ventas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SalesHistory />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
