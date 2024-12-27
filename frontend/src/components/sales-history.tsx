'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search } from 'lucide-react'

import { useProductContext } from '@/components/ProductContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function SalesHistory() {
    const { sales } = useProductContext()
    const [searchQuery, setSearchQuery] = useState('')

    // Filtrar ventas basado en la búsqueda unificada
    const filteredSales = useMemo(() => {
        const query = searchQuery.toLowerCase()
        return sales.filter(sale => 
            sale.productName.toLowerCase().includes(query) ||
            sale.clientName.toLowerCase().includes(query)
        )
    }, [sales, searchQuery])

    // Calcular totalizaciones
    const totals = useMemo(() => {
        return filteredSales.reduce((acc, sale) => ({
            totalQuantity: acc.totalQuantity + 1,
            totalAmount: acc.totalAmount + sale.price
        }), { totalQuantity: 0, totalAmount: 0 })
    }, [filteredSales])

    return (
        <div className="space-y-6">
            {/* Buscador unificado */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por producto o cliente..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Tarjetas de totalización */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Ventas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totals.totalQuantity}</div>
                        <p className="text-xs text-muted-foreground">
                            {searchQuery 
                                ? `Productos encontrados para "${searchQuery}"`
                                : "Total de productos vendidos"}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Importe Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totals.totalAmount.toFixed(2)} €
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {searchQuery 
                                ? `Importe total para "${searchQuery}"`
                                : "Importe total de ventas"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabla de ventas */}
            <Card>
                <CardHeader>
                    <CardTitle>Historial de Ventas</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Producto</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead className="text-right">Importe</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        No se encontraron ventas
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSales.map((sale, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {format(new Date(sale.date), 'dd MMM yyyy HH:mm', { locale: es })}
                                        </TableCell>
                                        <TableCell>{sale.productName}</TableCell>
                                        <TableCell>{sale.clientName}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {sale.price.toFixed(2)} €
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
