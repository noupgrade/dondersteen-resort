import { useDocument } from '../firebase/hooks/useDocument'
import { FSDocument } from '../firebase/types'

export interface HotelPricingConfig extends FSDocument {
    // Base prices
    smallDogPrice: number
    mediumDogPrice: number
    largeDogPrice: number
    daycarePrice: number
    highSeasonIncrease: number
    iva: number

    // Discounts
    vipDogDiscount: number
    employeeDogDiscount: number
    twoPetsDiscount: number
    threePetsDiscount: number

    // Additional services
    driver: {
        pickup: { name: string; price: number }
        delivery: { name: string; price: number }
        complete: { name: string; price: number }
    }
    specialFood: { name: string; price: number }
    medication: {
        once: { name: string; price: number }
        multiple: { name: string; price: number }
    }
    healing: { name: string; price: number }
    outOfHours: { name: string; price: number }
}

const defaultConfig: HotelPricingConfig = {
    // FSDocument fields
    id: 'hotel_pricing',
    createdAt: new Date(),
    updatedAt: new Date(),

    // Base prices
    smallDogPrice: 25,
    mediumDogPrice: 30,
    largeDogPrice: 35,
    daycarePrice: 20,
    highSeasonIncrease: 10,
    iva: 21,

    // Discounts
    vipDogDiscount: 5,
    employeeDogDiscount: 10,
    twoPetsDiscount: 8,
    threePetsDiscount: 12,

    // Additional services
    driver: {
        pickup: { name: 'Recogida', price: 15 },
        delivery: { name: 'Entrega', price: 15 },
        complete: { name: 'Completo', price: 25 },
    },
    specialFood: { name: 'Comida especial', price: 5 },
    medication: {
        once: { name: 'Una vez al día', price: 3 },
        multiple: { name: 'Varias veces al día', price: 5 },
    },
    healing: { name: 'Curas', price: 5 },
    outOfHours: { name: 'Recogida fuera de horario', price: 10 },
}

export const useHotelPricingConfig = () => {
    const {
        document: config,
        setDocument,
        isLoading,
    } = useDocument<HotelPricingConfig>({
        collectionName: 'configs',
        id: 'hotel_pricing',
        defaultValue: defaultConfig,
    })

    const updateConfig = (newConfig: Partial<HotelPricingConfig>) => {
        if (config) {
            setDocument({
                ...config,
                ...newConfig,
                updatedAt: new Date(),
            })
        }
    }

    return {
        config,
        updateConfig,
        loading: isLoading,
    }
}
