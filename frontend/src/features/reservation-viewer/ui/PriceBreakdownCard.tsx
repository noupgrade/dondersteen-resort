import { type Discount } from '@/shared/types/discounts'
import { Reservation } from '@/shared/types/reservations'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface PriceBreakdownCardProps {
    reservation: Reservation
    isEditMode: boolean
    stayPrice: number
    serviceBasePrice: number
    onStayPriceChange: (price: number) => void
    onTotalPriceChange: (price: number) => void
    onDiscountsChange?: (discounts: Discount[]) => void
}

export function PriceBreakdownCard({
    reservation,
    isEditMode,
    stayPrice,
    serviceBasePrice,
    onStayPriceChange,
    onTotalPriceChange,
    onDiscountsChange
}: PriceBreakdownCardProps) {
    const [newDiscount, setNewDiscount] = useState<{ concept: string, amount: number }>({ concept: '', amount: 0 })

    const calculatePriceBreakdown = () => {
        const IVA = 0.21 // 21% IVA
        let calculatedStayPrice = 0
        let servicesPrice = 0
        let shopPrice = 0
        let totalDiscounts = 0

        if (reservation.type === 'hotel') {
            const checkIn = new Date(reservation.checkInDate)
            const checkOut = new Date(reservation.checkOutDate)
            const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            calculatedStayPrice = days * stayPrice

            // Calculate total discounts
            if (reservation.discounts) {
                totalDiscounts = reservation.discounts.reduce((total, discount) => total + discount.amount, 0)
            }
        }

        // Calcular precio de servicios usando los precios individuales
        servicesPrice = reservation.additionalServices
            .filter(service => service.type !== 'driver')
            .reduce((total, service) => total + (service.price || serviceBasePrice), 0)

        // Calcular precio de productos
        if ('shopProducts' in reservation && reservation.shopProducts) {
            shopPrice = reservation.shopProducts.reduce((total, product) => total + product.totalPrice, 0)
        }

        const subtotalSinIVA = calculatedStayPrice + servicesPrice + shopPrice - totalDiscounts
        const ivaAmount = subtotalSinIVA * IVA
        const total = subtotalSinIVA + ivaAmount

        return {
            stayPrice: calculatedStayPrice,
            servicesPrice,
            shopPrice,
            totalDiscounts,
            subtotalSinIVA,
            ivaAmount,
            total
        }
    }

    const handleAddDiscount = () => {
        console.log("Add discount")
        if (reservation.type !== 'hotel' || !onDiscountsChange) return
        console.log("Add discount 2")
        if (!newDiscount.concept || newDiscount.amount <= 0) return

        console.log("Add discoun3")
        const newDiscounts = [
            ...(reservation.discounts || []),
            {
                id: crypto.randomUUID(),
                concept: newDiscount.concept,
                amount: newDiscount.amount
            }
        ]

        onDiscountsChange(newDiscounts)
        setNewDiscount({ concept: '', amount: 0 })
    }

    const handleRemoveDiscount = (discountId: string) => {
        if (reservation.type === 'hotel' || !onDiscountsChange || !reservation.discounts) return

        const newDiscounts = reservation.discounts.filter(d => d.id !== discountId)
        onDiscountsChange(newDiscounts)
    }

    const priceBreakdown = calculatePriceBreakdown()

    return (
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="text-base font-medium">Desglose de Precio</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reservation.type === 'hotel' && (
                        <div className="flex items-center justify-between">
                            <span>Estancia:</span>
                            <div className="flex items-center gap-2 justify-end">
                                {isEditMode ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            value={stayPrice}
                                            onChange={(e) => onStayPriceChange(Number(e.target.value))}
                                            className="w-24 text-right"
                                            placeholder="€/día"
                                        />
                                        <span>€/día</span>
                                    </div>
                                ) : (
                                    <span>€{priceBreakdown.stayPrice.toFixed(2)}</span>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span>Servicios:</span>
                        <div className="flex items-center gap-2 justify-end">
                            <span>€{priceBreakdown.servicesPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    {'shopProducts' in reservation && (
                        <div className="flex items-center justify-between">
                            <span>Productos:</span>
                            <div className="flex items-center gap-2 justify-end">
                                <span>€{priceBreakdown.shopPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {/* Discounts section */}
                    {reservation.type === 'hotel' && reservation.discounts && reservation.discounts.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-2">
                                <span className="text-sm font-medium">Descuentos:</span>
                                {reservation.discounts.map((discount) => (
                                    <div key={discount.id} className="flex items-center justify-between text-green-600">
                                        <span>{discount.concept}:</span>
                                        <div className="flex items-center gap-2">
                                            <span>-€{discount.amount.toFixed(2)}</span>
                                            {isEditMode && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveDiscount(discount.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Add discount form */}
                    {isEditMode && reservation.type === 'hotel' && (
                        <div className="flex items-end gap-2 pt-2">
                            <div className="flex-1">
                                <Input
                                    placeholder="Concepto"
                                    value={newDiscount.concept}
                                    onChange={(e) => setNewDiscount(prev => ({ ...prev, concept: e.target.value }))}
                                />
                            </div>
                            <div className="w-24">
                                <Input
                                    type="number"
                                    placeholder="€"
                                    value={newDiscount.amount || ''}
                                    onChange={(e) => setNewDiscount(prev => ({ ...prev, amount: Number(e.target.value) }))}
                                />
                            </div>
                            <Button variant="outline" size="icon" onClick={handleAddDiscount}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <Separator />
                    <div className="flex items-center justify-between">
                        <span>Base Imponible:</span>
                        <div className="flex items-center gap-2 justify-end">
                            <span>€{priceBreakdown.subtotalSinIVA.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>IVA (21%):</span>
                        <div className="flex items-center gap-2 justify-end">
                            <span>€{priceBreakdown.ivaAmount.toFixed(2)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between font-bold">
                        <span>Total:</span>
                        <div className="flex items-center gap-2 justify-end">
                            {isEditMode ? (
                                <Input
                                    type="number"
                                    value={reservation.totalPrice}
                                    onChange={(e) => {
                                        const newTotal = Number(e.target.value)
                                        onTotalPriceChange(newTotal)
                                    }}
                                    className="w-24 text-right"
                                />
                            ) : (
                                <span>€{reservation.totalPrice.toFixed(2)}</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 