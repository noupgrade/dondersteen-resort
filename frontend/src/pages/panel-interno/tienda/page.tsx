'use client'

import { ProductList } from '@/components/product-list.tsx'
import { SalesHistory } from '@/components/sales-history.tsx'
import { VisualPOS } from '@/components/visual-pos.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'

export default function StorePage() {
    return (
        <div className='container mx-auto p-6'>
            <h1 className='text-3xl font-bold mb-6'>Tienda</h1>

            <Tabs defaultValue='pos' className='space-y-6'>
                <TabsList className='w-full justify-start border-b bg-transparent p-0'>
                    <TabsTrigger
                        value='pos'
                        className='relative rounded-md border-transparent bg-transparent px-4 py-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                    >
                        TPV Visual
                    </TabsTrigger>
                    <TabsTrigger
                        value='products'
                        className='relative rounded-md border-transparent bg-transparent px-4 py-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-blue-500 data-[state=active]:text-white'
                    >
                        Productos
                    </TabsTrigger>
                    <TabsTrigger
                        value='sales'
                        className='relative rounded-md border-transparent bg-transparent px-4 py-2 text-base font-medium text-muted-foreground transition-colors hover:text-foreground data-[state=active]:bg-blue-500 data-[state=active]:text-white'
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
