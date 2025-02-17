import { useCallback } from 'react'

import { differenceInDays } from 'date-fns'

import { AdditionalService } from '@monorepo/functions/src/types/services'

import { DateRange, PetFormData } from '../types/booking.types'

export function useBookingCalculations() {
    const calculateTotalPrice = useCallback(
        (dates: DateRange | null, pets: PetFormData[], services: AdditionalService[]) => {
            if (!dates || !dates.from || !dates.to) return 0

            const nights = differenceInDays(dates.to, dates.from)
            let basePrice = 0

            // Calculate base price for each pet
            pets.forEach(pet => {
                let nightlyRate = 0
                switch (pet.size) {
                    case 'pequeño':
                        nightlyRate = 32
                        break
                    case 'mediano':
                        nightlyRate = 35
                        break
                    case 'grande':
                        nightlyRate = 39
                        break
                }

                // Apply 10% discount for all pets if there's more than one
                if (pets.length > 1) {
                    nightlyRate = nightlyRate * 0.9
                }

                basePrice += nightlyRate * nights
            })

            // Calculate service costs
            let additionalCosts = 0
            services.forEach(service => {
                if (service.type === 'medication') {
                    additionalCosts += service.frequency === 'multiple' ? 3.5 * nights : 2.5 * nights
                }
                if (service.type === 'special_care') {
                    additionalCosts += 3 * nights
                }
                if (service.type === 'special_food') {
                    additionalCosts += 2 * nights
                }
                if (service.type === 'hairdressing' && service.petIndex !== undefined) {
                    const pet = pets[service.petIndex]
                    service.services.forEach(hairdressingService => {
                        switch (hairdressingService) {
                            case 'bath_and_brush':
                                additionalCosts += pet.size === 'pequeño' ? 25 : pet.size === 'mediano' ? 30 : 35
                                break
                            case 'bath_and_trim':
                                additionalCosts += pet.size === 'pequeño' ? 35 : pet.size === 'mediano' ? 40 : 45
                                break
                            case 'stripping':
                            case 'deshedding':
                                additionalCosts += pet.size === 'pequeño' ? 50 : pet.size === 'mediano' ? 60 : 70
                                break
                            case 'brushing':
                                additionalCosts += pet.size === 'pequeño' ? 15 : pet.size === 'mediano' ? 20 : 25
                                break
                            case 'spa':
                                additionalCosts += pet.size === 'pequeño' ? 30 : pet.size === 'mediano' ? 35 : 40
                                break
                            case 'spa_ozone':
                                additionalCosts += pet.size === 'pequeño' ? 40 : pet.size === 'mediano' ? 45 : 50
                                break
                        }
                    })
                }
                if (service.type === 'driver') {
                    additionalCosts += 20
                }
            })

            // Apply 10% discount to additional costs if there's more than one pet
            if (pets.length > 1) {
                additionalCosts = additionalCosts * 0.9
            }

            return basePrice + additionalCosts
        },
        [],
    )

    const calculateCapacity = useCallback((pets: PetFormData[]) => {
        return pets.reduce((total, pet) => {
            switch (pet.size) {
                case 'pequeño':
                    return total + 1
                case 'mediano':
                    return total + 1.5
                case 'grande':
                    return total + 2
                default:
                    return total
            }
        }, 0)
    }, [])

    return {
        calculateTotalPrice,
        calculateCapacity,
    }
}
