import { format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { Bed, Clock } from 'lucide-react'

import { AdditionalService } from '@/shared/types/additional-services'
import { formatCurrency } from '@/shared/utils/format'
import { ServiceItem } from '@/shared/ui/service-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PetFormData } from '@/features/booking/types/booking.types'
import { calculateNights, calculateTotalPrice } from '@/shared/utils/pricing'

interface BookingSummaryProps {
    dates: {
        from: Date
        to: Date
    } | null
    pets: PetFormData[]
    services: AdditionalService[]
}

export function BookingSummary({
    dates,
    pets,
    services,
}: BookingSummaryProps) {
    const nights = calculateNights(dates)
    const priceBreakdown = calculateTotalPrice(dates, pets, services)
    const hasMultiplePets = pets.length > 1

    // Group services by pet
    const driverService = services.find(s => s.type === 'driver')
    const servicesByPet = pets.map((pet, index) => ({
        pet,
        services: services.filter(s => s.petIndex === index && s.type !== 'driver'),
        breakdown: priceBreakdown.petsBreakdown[index]
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen de la reserva</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Dates */}
                {dates && isValid(dates.from) && isValid(dates.to) && (
                    <div>
                        <div className="space-y-2 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <p>Entrada: {format(dates.from, 'PPP', { locale: es })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <p>Salida: {format(dates.to, 'PPP', { locale: es })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Bed className="h-4 w-4" />
                                <p className="text-sm">
                                    {nights === 0 ? 'Guardería' : `${nights} noches`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Driver Service */}
                {driverService && (
                    <div>
                        <h3 className="font-medium mb-2">Servicio de transporte</h3>
                        <div className="flex items-center justify-between">
                            <ServiceItem service={driverService} />
                            <span className="text-sm text-yellow-600">
                                Desde 40€
                            </span>
                        </div>
                    </div>
                )}

                {/* Pets and their services */}
                {servicesByPet.map(({ pet, services, breakdown }, index) => (
                    <div key={index}>
                        <h3 className="font-medium mb-2">
                            {pet.name} ({pet.breed})
                        </h3>
                        <div className="space-y-2 pl-4">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Bed className="h-4 w-4" />
                                    <span>
                                        {nights === 0 ? 'Guardería' : `Estancia (${pet.size})`}
                                    </span>
                                </div>
                                <span>{formatCurrency(breakdown.basePrice)}</span>
                            </div>
                            {services.map((service, serviceIndex) => (
                                <div key={serviceIndex} className="flex items-center justify-between">
                                    <ServiceItem service={service} />
                                    <span className="text-sm text-muted-foreground">
                                        {formatCurrency(breakdown.services.find(s => s.name === service.type)?.price ?? 0)}
                                    </span>
                                </div>
                            ))}
                            <div className="flex items-center justify-between font-medium pt-1">
                                <span>Subtotal</span>
                                <span>{formatCurrency(breakdown.subtotal)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Total */}
                <div className="border-t pt-4 space-y-2">
                    {hasMultiplePets && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Descuento múltiples mascotas</span>
                            <span>-10%</span>
                        </div>
                    )}
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between">
                            <span className="font-medium">Total</span>
                            <span className="font-semibold">{formatCurrency(priceBreakdown.total)}</span>
                        </div>
                        {driverService && (
                            <span className="text-sm text-yellow-600 text-right">+ servicio de chofer</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
