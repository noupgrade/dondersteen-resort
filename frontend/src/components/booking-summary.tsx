import { differenceInDays, format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, PawPrint } from 'lucide-react'

import { AdditionalService } from '@/shared/types/additional-services'
import { formatCurrency } from '@/shared/utils/format'
import { ServiceItem } from '@/shared/ui/service-item'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'
import { PetFormData } from '@/features/booking/types/booking.types'

interface BookingSummaryProps {
    dates: {
        from: Date
        to: Date
    } | null
    pets: PetFormData[]
    services: AdditionalService[]
    totalPrice: number
}

const getPricePerNight = (size: string) => {
    switch (size) {
        case 'pequeño':
            return 32
        case 'mediano':
            return 35
        case 'grande':
            return 39
        default:
            return 0
    }
}

const getServicePrice = (service: AdditionalService, petSize: string, nights: number) => {
    switch (service.type) {
        case 'medication':
            return 3.5 * nights
        case 'special_care':
            return 3 * nights
        case 'special_food':
            return 2 * nights
        case 'driver':
            return 20
        case 'hairdressing':
            return service.services.reduce((total, s) => {
                switch (s) {
                    case 'bath_and_brush':
                        return total + (petSize === 'pequeño' ? 25 : petSize === 'mediano' ? 30 : 35)
                    case 'bath_and_trim':
                        return total + (petSize === 'pequeño' ? 35 : petSize === 'mediano' ? 40 : 45)
                    case 'stripping':
                    case 'deshedding':
                        return total + (petSize === 'pequeño' ? 50 : petSize === 'mediano' ? 60 : 70)
                    case 'brushing':
                        return total + (petSize === 'pequeño' ? 15 : petSize === 'mediano' ? 20 : 25)
                    case 'spa':
                        return total + (petSize === 'pequeño' ? 30 : petSize === 'mediano' ? 35 : 40)
                    case 'spa_ozone':
                        return total + (petSize === 'pequeño' ? 40 : petSize === 'mediano' ? 45 : 50)
                    default:
                        return total
                }
            }, 0)
        default:
            return 0
    }
}

export function BookingSummary({
    dates,
    pets,
    services,
    totalPrice,
}: BookingSummaryProps) {
    const nights = dates ? differenceInDays(dates.to, dates.from) : 0
    const hasMultiplePets = pets.length > 1
    const discount = hasMultiplePets ? 0.1 : 0 // 10% discount for multiple pets

    // Group services by pet
    const driverService = services.find(s => s.type === 'driver')
    const servicesByPet = pets.map((pet, index) => ({
        pet,
        services: services.filter(s => s.petIndex === index && s.type !== 'driver')
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
                        <h3 className="font-medium mb-2">Fechas</h3>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <div>
                                <p>
                                    {format(dates.from, 'PPP', { locale: es })} -{' '}
                                    {format(dates.to, 'PPP', { locale: es })}
                                </p>
                                <p className="text-sm">{nights} noches</p>
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
                            <span className="text-sm text-muted-foreground">
                                {formatCurrency(getServicePrice(driverService, '', nights))}
                            </span>
                        </div>
                    </div>
                )}

                {/* Pets and their services */}
                {servicesByPet.map(({ pet, services }, index) => {
                    const basePrice = getPricePerNight(pet.size) * nights * (1 - discount)
                    const servicesTotal = services.reduce((total, service) =>
                        total + getServicePrice(service, pet.size, nights) * (1 - discount), 0
                    )

                    return (
                        <div key={index}>
                            <h3 className="font-medium mb-2">
                                {pet.name} ({pet.breed}, {pet.size})
                            </h3>
                            <div className="space-y-2 pl-4">
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>Estancia ({nights} noches)</span>
                                    <span>{formatCurrency(basePrice)}</span>
                                </div>
                                {services.map((service, serviceIndex) => (
                                    <div key={serviceIndex} className="flex items-center justify-between">
                                        <ServiceItem service={service} />
                                        <span className="text-sm text-muted-foreground">
                                            {formatCurrency(getServicePrice(service, pet.size, nights) * (1 - discount))}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex items-center justify-between font-medium pt-1">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(basePrice + servicesTotal)}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* Total */}
                <div className="border-t pt-4 space-y-2">
                    {hasMultiplePets && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Descuento múltiples mascotas</span>
                            <span>-10%</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="font-medium">Total</span>
                        <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
