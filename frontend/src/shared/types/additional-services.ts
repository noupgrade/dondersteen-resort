export type ServiceType = 'driver' | 'special_food' | 'medication' | 'special_care' | 'hairdressing'

export interface BaseService {
    type: ServiceType
    petIndex?: number
}

export interface DriverService extends BaseService {
    type: 'driver'
    serviceType: 'pickup' | 'dropoff' | 'both'
}

export interface SpecialFoodService extends BaseService {
    type: 'special_food'
    foodType: 'refrigerated' | 'frozen'
}

export interface MedicationService extends BaseService {
    type: 'medication'
    comment?: string
}

export interface SpecialCareService extends BaseService {
    type: 'special_care'
    comment?: string
}

export type HairdressingServiceType =
    | 'bath_and_brush'
    | 'bath_and_trim'
    | 'stripping'
    | 'deshedding'
    | 'brushing'
    | 'spa'
    | 'spa_ozone'

export interface HairdressingService extends BaseService {
    type: 'hairdressing'
    services: HairdressingServiceType[]
}

export type AdditionalService =
    | DriverService
    | SpecialFoodService
    | MedicationService
    | SpecialCareService
    | HairdressingService

export const isDriverService = (service: AdditionalService): service is DriverService =>
    service.type === 'driver'

export const isSpecialFoodService = (service: AdditionalService): service is SpecialFoodService =>
    service.type === 'special_food'

export const isMedicationService = (service: AdditionalService): service is MedicationService =>
    service.type === 'medication'

export const isSpecialCareService = (service: AdditionalService): service is SpecialCareService =>
    service.type === 'special_care'

export const isHairdressingService = (service: AdditionalService): service is HairdressingService =>
    service.type === 'hairdressing' 