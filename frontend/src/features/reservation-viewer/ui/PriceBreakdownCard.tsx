import { type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'

interface PriceBreakdownCardProps {
    reservation: HairSalonReservation | HotelReservation
    isEditMode: boolean
    stayPrice: number
    serviceBasePrice: number
    totalDiscount: number
    onStayPriceChange: (price: number) => void
    onTotalPriceChange: (price: number) => void
}

export function PriceBreakdownCard({
    reservation,
    isEditMode,
    stayPrice,
    serviceBasePrice,
    totalDiscount,
    onStayPriceChange,
    onTotalPriceChange
}: PriceBreakdownCardProps) {
    const calculatePriceBreakdown = () => {
        const IVA = 0.21 // 21% IVA
        let calculatedStayPrice = 0
        let servicesPrice = 0
        let shopPrice = 0

        if (reservation.type === 'hotel') {
            const checkIn = new Date(reservation.checkInDate)
            const checkOut = new Date(reservation.checkOutDate)
            const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            calculatedStayPrice = days * stayPrice
        }

        // Calcular precio de servicios usando los precios individuales
        servicesPrice = reservation.additionalServices
            .filter(service => service.type !== 'driver')
            .reduce((total, service) => total + (service.price || serviceBasePrice), 0)

        // Calcular precio de productos
        if ('shopProducts' in reservation && reservation.shopProducts) {
            shopPrice = reservation.shopProducts.reduce((total, product) => total + product.totalPrice, 0)
        }

        const subtotalSinIVA = calculatedStayPrice + servicesPrice + shopPrice
        const ivaAmount = subtotalSinIVA * IVA
        const total = subtotalSinIVA + ivaAmount

        return {
            stayPrice: calculatedStayPrice,
            servicesPrice,
            shopPrice,
            subtotalSinIVA,
            ivaAmount,
            total
        }
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
                    {totalDiscount > 0 && (
                        <div className="flex items-center justify-between text-green-600">
                            <span>Descuento aplicado:</span>
                            <div className="flex items-center gap-2 justify-end">
                                <span>-€{totalDiscount.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 