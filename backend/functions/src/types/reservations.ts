import { AdditionalService } from './services'

export interface Discount {
    id: string
    concept: string
    amount: number
}

export type PetSize = 'pequeño' | 'mediano' | 'grande'
export interface BaseReservation {
    id: string
    client: Client
    status: 'confirmed' | 'pending' | 'cancelled' | 'propuesta peluqueria'
    totalPrice: number
    paymentStatus: string
    shopProducts?: ShopProduct[]
    observations?: string
    createdAt?: string
    updatedAt?: string
}

export type HotelReservation = BaseReservation & {
    type: 'hotel'
    checkInDate: string
    checkInTime: string
    checkOutDate: string
    checkOutTime?: string
    pets: Pet[]
    additionalServices: AdditionalService[]
    roomNumber?: string
    discounts?: Discount[]
}
export type ShopProduct = {
    id: string
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
}
export type Client = {
    id?: string
    name: string
    phone: string
    email: string
    address?: string
}
export type Pet = {
    id?: string
    name: string
    breed: string
    size: PetSize
    weight: number
    sex: 'M' | 'F'
    isNeutered: boolean
    // TODO DO NOT USE THIS UNTIL WE MIGRATE FROM THE RESERVATION TYPE.
    // THIS IS JUST TO BE USED IN THE CUSTOMER PROFILE
    additionalServices?: AdditionalService[]
    roomNumber?: string
}
export type HotelBudget = Omit<HotelReservation, 'type'> & {
    type: 'hotel-budget'
}
export type HairSalonTask = {
    id: string
    reservationId: string
    service: AdditionalService
    date: string
    time: string
    duration: number
}
export type HairSalonReservation = BaseReservation & {
    type: 'peluqueria'
    source: 'hotel' | 'external'
    date: string
    time: string
    client: Client
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
