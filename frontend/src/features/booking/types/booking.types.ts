import { z } from 'zod'

import { AdditionalService } from '@monorepo/functions/src/types/services'

export interface DateRange {
    from: Date
    to: Date
}

export interface PetFormData {
    name: string
    breed: string
    weight: string
    size: 'pequeño' | 'mediano' | 'grande'
    age: string
    personality: string
    sex: 'M' | 'F'
    isNeutered: boolean
}

export type PetData = {
    name: string
    breed: string
    weight: number
    size: 'pequeño' | 'mediano' | 'grande'
    sex: 'M' | 'F'
    isNeutered: boolean
}

export const petFormSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    breed: z.string().min(1, 'La raza es requerida'),
    weight: z.string().min(1, 'El peso es requerido'),
    size: z.enum(['pequeño', 'mediano', 'grande']),
    age: z.string().min(1, 'La edad es requerida'),
    personality: z.string(),
    sex: z.enum(['M', 'F']),
    isNeutered: z.boolean(),
})

export const bookingFormSchema = z.object({
    pets: z.array(petFormSchema),
    dates: z.any(),
    services: z.array(z.any()),
    clientName: z.string().min(1, 'El nombre es requerido'),
    clientLastName: z.string().min(1, 'El apellido es requerido'),
    clientEmail: z.string().email('Email inválido'),
    clientPhone: z.string().regex(/^\+?[0-9]{9,}$/, 'El teléfono debe contener al menos 9 números'),
})

export type BookingFormData = z.infer<typeof bookingFormSchema>

export interface BookingState {
    currentStep: number
    selectedDates: DateRange | null
    totalPrice: number
    dateError: string
    formError: string
    groomingUnavailable: boolean
    checkInTime: string
    checkOutTime: string
    confirmedReservationId: string
}

export const BASE_PRICE_PER_DAY = 25
export const LARGE_DOG_SURCHARGE = 5
export const MEDIUM_DOG_SURCHARGE = 3
