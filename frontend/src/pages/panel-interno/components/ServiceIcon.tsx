import { Heart, Pill, Scissors, Truck, UtensilsCrossed } from 'lucide-react'

import { ServiceType } from '@monorepo/functions/src/types/services'

type ServiceIconProps = {
    type: ServiceType
}

export const ServiceIcon = ({ type }: ServiceIconProps) => {
    const iconMap = {
        driver: <Truck className='h-4 w-4 text-blue-500' />,
        special_food: <UtensilsCrossed className='h-4 w-4 text-orange-500' />,
        medication: <Pill className='h-4 w-4 text-red-500' />,
        special_care: <Heart className='h-4 w-4 text-pink-500' />,
        hairdressing: <Scissors className='h-4 w-4 text-purple-500' />,
    }

    return iconMap[type] || null
}

export const formatServiceName = (serviceType: ServiceType) => {
    const serviceNames = {
        driver: 'Servicio de chofer',
        special_food: 'Comida especial',
        medication: 'Medicación',
        special_care: 'Curas',
        hairdressing: 'Peluquería',
    }

    return serviceNames[serviceType] || 'Servicio desconocido'
}
