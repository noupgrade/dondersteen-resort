export type ServiceType = 'driver' | 'special_food' | 'medication' | 'special_care' | 'hairdressing'

export interface BaseService {
    type: ServiceType
    petIndex: number
    price?: number
}

export interface DriverService extends BaseService {
    type: 'driver'
    serviceType: 'pickup' | 'dropoff' | 'both'
    pickupTime?: string
    dropoffTime?: string
    isOutOfHours?: boolean
}

export interface SpecialFoodService extends BaseService {
    type: 'special_food'
    foodType: 'refrigerated' | 'frozen'
}

export interface MedicationService extends BaseService {
    type: 'medication'
    comment?: string
    frequency: 'single' | 'multiple'
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
    | 'knots'
    | 'extremely_dirty'

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