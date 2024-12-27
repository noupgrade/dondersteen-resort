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
    additionalServices: string[]
    observations?: string
    status: ReservationStatus
    beforePhoto?: string
    afterPhoto?: string
    finalPrice?: number
    priceNote?: string
}

export interface ExtendedReservation extends BaseReservation {
    source: ReservationSource
} 