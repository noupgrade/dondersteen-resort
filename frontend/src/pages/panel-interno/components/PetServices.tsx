import { ServiceType } from '@monorepo/functions/src/types/services'

import { ServiceIcon, formatServiceName } from './ServiceIcon'

type PetServicesProps = {
    services: Array<{ type: ServiceType; serviceType?: string; petIndex: number }>
    petIndex: number
}

export const PetServices = ({ services, petIndex }: PetServicesProps) => {
    const petServices = services.filter(service => service.petIndex === petIndex && service.type !== 'driver')

    return (
        <div className='flex flex-wrap gap-4'>
            {petServices.map((service, index) => (
                <div key={index} className='flex items-center gap-2'>
                    <ServiceIcon type={service.type} />
                    <span className='text-sm text-muted-foreground'>{formatServiceName(service.type)}</span>
                </div>
            ))}
        </div>
    )
}
