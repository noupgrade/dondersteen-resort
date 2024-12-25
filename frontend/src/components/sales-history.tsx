'use client'

import { useMemo, useState } from 'react'

import { Search } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProductContext } from '@/context/ProductContext'

export function SalesHistory() {
    const { sales } = useProductContext()
    const [clientSearch, setClientSearch] = useState('')
    const [productSearch, setProductSearch] = useState('')

    const filteredSales = useMemo(() => {
        return sales.filter(
            sale =>
                sale.clientName.toLowerCase().includes(clientSearch.toLowerCase()) &&
                sale.productName.toLowerCase().includes(productSearch.toLowerCase()),
        )
    }, [sales, clientSearch, productSearch])

    // Group sales by product and client
    const groupedSales = useMemo(() => {
        return filteredSales.reduce(
            (acc, sale) => {
                const key = `${sale.productName}-${sale.clientName}`
                if (!acc[key]) {
                    acc[key] = { ...sale, totalSold: 0, quantity: 0 }
                }
                acc[key].totalSold += sale.price
                acc[key].quantity += 1 // Assuming each sale represents one unit
                return acc
            },
            {} as Record<string, any>,
        )
    }, [filteredSales])

    const sortedSales = useMemo(() => {
        return Object.values(groupedSales).sort((a, b) => b.totalSold - a.totalSold)
    }, [groupedSales])

    // Calculate totals for the searched product
    const productTotals = useMemo(() => {
        if (!productSearch) return null

        const totals = filteredSales.reduce(
            (acc, sale) => {
                if (sale.productName.toLowerCase().includes(productSearch.toLowerCase())) {
                    acc.totalUnits += 1
                    acc.totalRevenue += sale.price
                }
                return acc
            },
            { totalUnits: 0, totalRevenue: 0 },
        )

        return {
            productName: productSearch,
            ...totals,
        }
    }, [filteredSales, productSearch])

    return (
        <div className='space-y-4'>
            <div className='flex flex-wrap items-center gap-4'>
                <div className='flex flex-1 flex-col gap-4 sm:flex-row'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
                        <Input
                            placeholder='Buscar por cliente'
                            value={clientSearch}
                            onChange={e => setClientSearch(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
                        <Input
                            placeholder='Buscar por producto'
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                </div>
            </div>
            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-gray-100'>
                            <TableHead className='font-bold'>Producto</TableHead>
                            <TableHead className='font-bold'>Total Vendido</TableHead>
                            <TableHead className='font-bold'>Cliente</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedSales.map((sale, index) => (
                            <TableRow
                                key={`${sale.productName}-${sale.clientName}`}
                                className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                                <TableCell>{sale.productName}</TableCell>
                                <TableCell>{sale.totalSold.toFixed(2)} €</TableCell>
                                <TableCell>{sale.clientName}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {productTotals && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resumen de Producto Buscado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell className='font-bold'>Producto</TableCell>
                                    <TableCell>{productTotals.productName}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className='font-bold'>Total Vendido</TableCell>
                                    <TableCell>{productTotals.totalUnits} unidades</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className='font-bold'>Total Ingresos</TableCell>
                                    <TableCell>{productTotals.totalRevenue.toFixed(2)} €</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
