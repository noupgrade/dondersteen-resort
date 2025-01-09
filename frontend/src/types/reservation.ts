import { HairdressingServiceType } from '@/shared/types/additional-services'

export type ReservationSource = 'hotel' | 'external'
export type ReservationStatus = 'pending' | 'pending_client_confirmation' | 'confirmed' | 'completed'

export interface BaseReservation {
    id: string
    type: 'peluqueria'
    date: string
    time: string
    client: {
        name: string
        phone: string
    }
    pet: {
        name: string
        breed: string
    }
    additionalServices: HairdressingServiceType[]
    observations?: string
    status: ReservationStatus
    beforePhoto?: string
    afterPhoto?: string
    finalPrice?: number
    priceNote?: string
}

export interface ExtendedReservation {
    id: string
    type: 'peluqueria'
    source: 'hotel' | 'external'
    date: string
    time: string
    client: {
        name: string
        phone: string
        email?: string
    }
    pet: {
        id: string
        name: string
        breed: string
        size?: 'pequeño' | 'mediano' | 'grande'
        weight?: number
    }
    additionalServices: {
        type: string
        petIndex: number
        services?: string[]
        comment?: string
        price?: number
    }[]
    status: 'confirmed' | 'pending' | 'cancelled' | 'propuesta peluqueria'
    duration?: number
    precioEstimado?: number
    observations?: string
    subcitas?: Array<{
        fecha: string
        descripcion: string
    }>
    hairdresser?: 'hairdresser1' | 'hairdresser2'
    totalPrice: number
    paymentStatus: string
    // Campos para reservas de hotel
    hotelCheckIn?: string
    hotelCheckOut?: string
    hotelCheckOutTime?: string
    hasDriverService?: boolean
    // Campo para hora solicitada en reservas externas
    requestedTime?: string
} 