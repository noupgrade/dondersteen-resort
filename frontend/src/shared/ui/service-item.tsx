import { Heart, Pill, Scissors, Truck, UtensilsCrossed } from 'lucide-react'

import { AdditionalService, ServiceType } from '@/shared/types/additional-services'

const getServiceIcon = (serviceType: ServiceType) => {
    switch (serviceType) {
        case 'driver':
            return <Truck className='h-4 w-4 text-blue-500' />
        case 'special_food':
            return <UtensilsCrossed className='h-4 w-4 text-orange-500' />
        case 'medication':
            return <Pill className='h-4 w-4 text-red-500' />
        case 'special_care':
            return <Heart className='h-4 w-4 text-pink-500' />
        case 'hairdressing':
            return <Scissors className='size-4 text-purple-500' />
        default:
            return null
    }
}

const translateService = (service: AdditionalService) => {
    switch (service.type) {
        case 'driver':
            return 'Chofer'
        case 'special_food':
            return `Comida especial (${service.foodType === 'refrigerated' ? 'Refrigerada' : 'Congelada'})`
        case 'medication':
            return 'Medicación'
        case 'special_care':
            return 'Curas'
        case 'hairdressing':
            return (
                'Peluquería: ' +
                service.services
                    .map(s => {
                        switch (s) {
                            case 'bath_and_brush':
                                return 'Baño y cepillado'
                            case 'bath_and_trim':
                                return 'Baño y corte'
                            case 'stripping':
                                return 'Stripping'
                            case 'deshedding':
                                return 'Deslanado'
                            case 'brushing':
                                return 'Cepillado'
                            case 'spa':
                                return 'Spa'
                            case 'spa_ozone':
                                return 'Spa con ozono'
                            case 'knots':
                                return 'Nudos'
                            case 'extremely_dirty':
                                return 'Extremadamente sucio'
                            default:
                                return s
                        }
                    })
                    .join(', ')
            )
        default:
            return 'Servicio desconocido'
    }
}

interface ServiceItemProps {
    service: AdditionalService
    className?: string
}

export function ServiceItem({ service, className = '' }: ServiceItemProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {getServiceIcon(service.type)}
            <span className='flex-1 text-sm text-muted-foreground'>{translateService(service)}</span>
        </div>
    )
}
