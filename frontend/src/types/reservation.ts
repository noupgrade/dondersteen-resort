import { AdditionalService } from '@/shared/types/additional-services'

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
    additionalServices: AdditionalService[]
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
    date?: string
    time?: string
    client: {
        name: string
        phone: string
    }
    pet: {
        id: string
        name: string
        breed: string
    }
    additionalServices: AdditionalService[]
    status: ReservationStatus
    duration?: number
    precioEstimado?: number
    observations?: string
    subcitas?: Array<{
        fecha: string
        descripcion: string
    }>
} 