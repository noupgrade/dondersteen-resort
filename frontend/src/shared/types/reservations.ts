import { AdditionalService } from './additional-services'
import { Client } from './client'
import { Discount } from './discounts'
import { Pet } from './pets'
import { ShopProduct } from './shop'

export interface BaseReservation {
    id: string
    client: Client
    status: 'confirmed' | 'pending' | 'cancelled'
    totalPrice: number
    paymentStatus: string
    shopProducts?: ShopProduct[]
    observations?: string
}

export interface HotelReservation extends BaseReservation {
    type: 'hotel'
    checkInDate: string
    checkInTime: string
    checkOutDate: string
    checkOutTime: string
    pets: Pet[]
    additionalServices: AdditionalService[]
    roomNumber: string
    discounts?: Discount[]
}

export interface HotelBudget extends Omit<HotelReservation, 'type'> {
    type: 'hotel-budget'
}

export interface HairSalonTask {
    id: string
    reservationId: string
    service: AdditionalService
    date: string
    time: string
}

export interface HairSalonReservation extends BaseReservation {
    type: 'peluqueria'
    source: 'hotel' | 'external'
    date: string
    time: string
    pet: Pet
    additionalServices: AdditionalService[]
    tasks?: HairSalonTask[]
    precioEstimado?: number
    horaDefinitiva?: string
    finalPrice?: number
    priceNote?: string
    // Campos para reservas de hotel
    hotelCheckIn?: string
    hotelCheckOut?: string
    hotelCheckOutTime?: string
    hasDriverService?: boolean
    // Campo para asignar peluquera
    hairdresser?: 'hairdresser1' | 'hairdresser2'
    duration?: number
    // Campo para hora solicitada en reservas externas
    requestedTime?: string
    // Campo para hora asignada
    assignedTime?: string
    // Campo para foto del resultado
    resultImage?: string
    // Campos para cambios de checkout
    checkoutChangeAccepted?: boolean
    checkoutChangeRejected?: boolean
}

export type Reservation = HotelReservation | HairSalonReservation | HotelBudget 