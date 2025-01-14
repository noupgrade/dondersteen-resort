import { type AdditionalService, isDriverService } from '@/shared/types/additional-services'

export interface ServicesByPet {
    [petIndex: string]: AdditionalService[]
}

export function getServicesByPet(services: AdditionalService[]): ServicesByPet {
    return services
        .filter(service => !isDriverService(service))
        .reduce<ServicesByPet>((acc, service) => {
            const petIndex = service.petIndex.toString()
            if (!acc[petIndex]) {
                acc[petIndex] = []
            }
            acc[petIndex].push(service)
            return acc
        }, {})
}

interface TransportServiceResult {
    service: AdditionalService
    text: string
}

export function getTransportService(services: AdditionalService[]): TransportServiceResult | null {
    const transportService = services.find(isDriverService)
    if (!transportService) return null

    const serviceTypeText = {
        pickup: 'Recogida',
        dropoff: 'Entrega',
        both: 'Recogida y entrega'
    }

    return {
        service: transportService,
        text: serviceTypeText[transportService.serviceType]
    }
}
