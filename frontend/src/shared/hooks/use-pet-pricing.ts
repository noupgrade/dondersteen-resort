import { PetSize } from '@monorepo/functions/src/types/reservations'
import { useHotelPricingConfig } from './use-hotel-pricing-config'

export function usePetPricing() {
    const { config } = useHotelPricingConfig()

    const getPriceBySize = (size: PetSize): number => {
        if (!config) return 0

        switch (size) {
            case 'pequeño':
                return config.smallDogPrice
            case 'mediano':
                return config.mediumDogPrice
            case 'grande':
                return config.largeDogPrice
            default:
                return 0
        }
    }

    const getSizeFromWeight = (weight: number): PetSize => {
        if (weight <= 10) return 'pequeño'
        if (weight <= 20) return 'mediano'
        return 'grande'
    }

    const BASE_PRICES = config
        ? {
              pequeño: config.smallDogPrice,
              mediano: config.mediumDogPrice,
              grande: config.largeDogPrice,
          }
        : {
              pequeño: 0,
              mediano: 0,
              grande: 0,
          }

    return {
        getPriceBySize,
        getSizeFromWeight,
        BASE_PRICES,
    }
}
