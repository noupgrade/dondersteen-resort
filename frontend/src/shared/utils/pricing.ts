import { AdditionalService } from '../types/additional-services'
import { PetFormData } from '@/features/booking/types/booking.types'
import { differenceInDays, isValid } from 'date-fns'

type PetSize = 'pequeño' | 'mediano' | 'grande' | 'extra-grande'

const BASE_PRICES: Record<PetSize, number> = {
    pequeño: 32,
    mediano: 35,
    grande: 39,
    'extra-grande': 45
}

const GROOMING_PRICES: Record<string, Record<PetSize, number>> = {
    bath_and_brush: {
        pequeño: 25,
        mediano: 30,
        grande: 35,
        'extra-grande': 40
    },
    bath_and_trim: {
        pequeño: 35,
        mediano: 40,
        grande: 45,
        'extra-grande': 50
    },
    stripping: {
        pequeño: 45,
        mediano: 50,
        grande: 55,
        'extra-grande': 60
    },
    deshedding: {
        pequeño: 45,
        mediano: 50,
        grande: 55,
        'extra-grande': 60
    },
    brushing: {
        pequeño: 15,
        mediano: 20,
        grande: 25,
        'extra-grande': 30
    },
    spa: {
        pequeño: 30,
        mediano: 35,
        grande: 40,
        'extra-grande': 45
    },
    spa_ozone: {
        pequeño: 40,
        mediano: 45,
        grande: 50,
        'extra-grande': 55
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
            return service.outOfHours ? 70 : 20
        case 'hairdressing':
            return service.services.reduce((total, s) => {
                return total + (GROOMING_PRICES[s]?.[petSize] ?? 0)
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
