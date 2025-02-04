import { AdditionalService } from '../types/additional-services'
import { PetFormData } from '@/features/booking/types/booking.types'
import { differenceInDays, isValid } from 'date-fns'
import { PetSize } from '@/shared/types/pet.types'

const BASE_PRICES: Record<PetSize, number> = {
    pequeño: 32,
    mediano: 35,
    grande: 39
}

const GROOMING_PRICES: Record<string, Record<PetSize, { min: number, max: number }>> = {
    bath_and_brush: {
        pequeño: { min: 25, max: 30 },
        mediano: { min: 30, max: 35 },
        grande: { min: 35, max: 40 }
    },
    bath_and_trim: {
        pequeño: { min: 35, max: 40 },
        mediano: { min: 40, max: 45 },
        grande: { min: 45, max: 50 }
    },
    stripping: {
        pequeño: { min: 45, max: 50 },
        mediano: { min: 50, max: 55 },
        grande: { min: 55, max: 60 }
    },
    deshedding: {
        pequeño: { min: 45, max: 50 },
        mediano: { min: 50, max: 55 },
        grande: { min: 55, max: 60 }
    },
    brushing: {
        pequeño: { min: 15, max: 20 },
        mediano: { min: 20, max: 25 },
        grande: { min: 25, max: 30 }
    },
    spa: {
        pequeño: { min: 30, max: 35 },
        mediano: { min: 35, max: 40 },
        grande: { min: 40, max: 45 }
    },
    spa_ozone: {
        pequeño: { min: 40, max: 45 },
        mediano: { min: 45, max: 50 },
        grande: { min: 50, max: 55 }
    },
    knots: {
        pequeño: { min: 12, max: 15 },
        mediano: { min: 15, max: 18 },
        grande: { min: 18, max: 21 }
    },
    extremely_dirty: {
        pequeño: { min: 35, max: 40 },
        mediano: { min: 40, max: 45 },
        grande: { min: 45, max: 50 }
    }
}

export const calculateNights = (dates: { from: Date; to: Date } | null): number => {
    if (!dates || !isValid(dates.from) || !isValid(dates.to)) return 0
    return differenceInDays(dates.to, dates.from)
}

export const calculateBasePrice = (size: PetSize, nights: number): number => {
    if (nights === 0) {
        return 20
    }
    return BASE_PRICES[size] * nights
}

export const calculateMultiplePetsDiscount = (pets: PetFormData[]): number => {
    return pets.length > 1 ? 0.1 : 0 // 10% discount for multiple pets
}

export const calculateServicePrice = (
    service: AdditionalService,
    petSize: PetSize,
    nights: number
): number => {
    switch (service.type) {
        case 'medication':
            return service.frequency === 'multiple' ? 3.5 * nights : 2.5 * nights
        case 'special_care':
            return 3 * nights
        case 'special_food':
            return 2 * nights
        case 'driver':
            return 0 // Driver service price will be determined later
        case 'hairdressing':
            return service.services.reduce((total, s) => {
                return total + (GROOMING_PRICES[s]?.[petSize]?.max ?? 0)
            }, 0)
        default:
            return 0
    }
}

export interface PetPriceBreakdown {
    basePrice: number
    servicesPrice: number
    subtotal: number
    discount: number
    total: number
    services: Array<{
        name: string
        price: number
    }>
}

export interface TotalPriceBreakdown {
    petsBreakdown: Record<number, PetPriceBreakdown>
    totalBeforeDiscount: number
    discount: number
    total: number
}

export const calculateTotalPrice = (
    dates: { from: Date; to: Date } | null,
    pets: PetFormData[],
    services: AdditionalService[]
): TotalPriceBreakdown => {
    const nights = calculateNights(dates)
    const discount = calculateMultiplePetsDiscount(pets)

    // Group services by pet
    const driverService = services.find(s => s.type === 'driver')
    const servicesByPet = pets.map((_, index) => ({
        services: services.filter(s => s.petIndex === index && s.type !== 'driver')
    }))

    const petsBreakdown: Record<number, PetPriceBreakdown> = {}
    let totalBeforeDiscount = 0

    // Calculate price for each pet
    pets.forEach((pet, index) => {
        const basePrice = calculateBasePrice(pet.size as PetSize, nights)
        const petServices = servicesByPet[index].services

        const servicesBreakdown = petServices.map(service => ({
            name: service.type,
            price: calculateServicePrice(service, pet.size as PetSize, nights)
        }))

        const servicesPrice = servicesBreakdown.reduce((total, service) => total + service.price, 0)
        const subtotal = basePrice + servicesPrice
        const petDiscount = subtotal * discount
        const total = subtotal - petDiscount

        petsBreakdown[index] = {
            basePrice,
            servicesPrice,
            subtotal,
            discount: petDiscount,
            total,
            services: servicesBreakdown
        }

        totalBeforeDiscount += subtotal
    })

    // Add driver service if exists
    if (driverService) {
        const driverPrice = calculateServicePrice(driverService, 'pequeño', nights)
        totalBeforeDiscount += driverPrice
    }

    const totalDiscount = totalBeforeDiscount * discount
    const finalTotal = totalBeforeDiscount - totalDiscount

    return {
        petsBreakdown,
        totalBeforeDiscount,
        discount: totalDiscount,
        total: finalTotal
    }
}
