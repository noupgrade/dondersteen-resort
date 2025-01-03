import { differenceInDays, format, isValid } from 'date-fns'
import { es } from 'date-fns/locale'

import { AdditionalService } from '@/shared/types/additional-services'
import { formatCurrency } from '@/shared/utils/format'

interface BookingSummaryProps {
    dates: {
        startDate: Date
        endDate: Date
    } | null
    pets: Array<{
        name: string
        size: string
    }>
    services: AdditionalService[]
    totalPrice: number
    pickupTime?: string
}

const isOutOfHours = (time: string) => {
    const hour = parseInt(time.split(':')[0], 10)
    return hour < 8 || hour >= 19
}

const formatService = (service: AdditionalService) => {
    switch (service.type) {
        case 'driver':
            return `Chofer (${service.serviceType === 'pickup' ? 'Recogida' : service.serviceType === 'dropoff' ? 'Entrega' : 'Recogida y entrega'})`
        case 'special_food':
            return `Comida especial (${service.foodType === 'refrigerated' ? 'Refrigerada' : 'Congelada'})`
        case 'medication':
            return 'Medicación' + (service.comment ? `: ${service.comment}` : '')
        case 'special_care':
            return 'Curas' + (service.comment ? `: ${service.comment}` : '')
        case 'hairdressing':
            return 'Peluquería: ' + service.services.map(s => {
                switch (s) {
                    case 'bath_and_brush': return 'Baño y cepillado'
                    case 'bath_and_trim': return 'Baño y corte'
                    case 'stripping': return 'Stripping'
                    case 'deshedding': return 'Deslanado'
                    case 'brushing': return 'Cepillado'
                    case 'spa': return 'Spa'
                    case 'spa_ozone': return 'Spa con ozono'
                    default: return s
                }
            }).join(', ')
        default:
            return 'Servicio desconocido'
    }
}

export function BookingSummary({
    dates,
    pets,
    services,
    totalPrice,
    pickupTime,
}: BookingSummaryProps) {
    const nights = dates ? differenceInDays(dates.endDate, dates.startDate) : 0

    return (
        <div className='rounded-lg border p-4'>
            <h2 className='mb-4 text-lg font-semibold'>Resumen de la reserva</h2>

            {/* Dates */}
            {dates && isValid(dates.startDate) && isValid(dates.endDate) && (
                <div className='mb-4'>
                    <h3 className='mb-2 font-medium'>Fechas</h3>
                    <p>
                        {format(dates.startDate, 'PPP', { locale: es })} -{' '}
                        {format(dates.endDate, 'PPP', { locale: es })}
                    </p>
                    <p className='text-sm text-gray-500'>{nights} noches</p>
                </div>
            )}

            {/* Pets */}
            {pets.length > 0 && (
                <div className='mb-4'>
                    <h3 className='mb-2 font-medium'>Mascotas</h3>
                    <ul className='list-inside list-disc'>
                        {pets.map((pet, index) => (
                            <li key={index}>
                                {pet.name} ({pet.size})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Services */}
            {services.length > 0 && (
                <div className='mb-4'>
                    <h3 className='mb-2 font-medium'>Servicios adicionales</h3>
                    <ul className='list-inside list-disc'>
                        {services.map((service, index) => (
                            <li key={index}>{formatService(service)}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Total Price */}
            <div className='mt-6 border-t pt-4'>
                <div className='flex justify-between'>
                    <span className='font-medium'>Total</span>
                    <span className='font-semibold'>{formatCurrency(totalPrice)}</span>
                </div>
            </div>
        </div>
    )
}
