import { Pet } from '@monorepo/functions/src/types/reservations'
import { Client } from '@monorepo/functions/src/types/reservations'

export interface ClientProfile {
    client: Client
    pets: Pet[]
}

const mockClientProfile: ClientProfile = {
    client: {
        id: 'client1',
        name: 'John Doe',
        phone: '+34123456789',
        email: 'john.doe@example.com',
        address: 'Calle Principal 123, 28001 Madrid',
    },
    pets: [
        {
            id: 'pet1',
            name: 'Max',
            breed: 'Golden Retriever',
            size: 'grande',
            weight: 30,
            sex: 'M',
            additionalServices: [
                {
                    type: 'special_food',
                    petIndex: 0,
                    foodType: 'refrigerated',
                },
                {
                    type: 'medication',
                    petIndex: 0,
                    comment: 'Antiinflamatorio cada 12h',
                    frequency: 'single',
                },
                {
                    type: 'special_care',
                    petIndex: 0,
                    comment: 'Revisión diaria de articulaciones',
                },
                {
                    type: 'hairdressing',
                    petIndex: 0,
                    services: ['bath_and_brush', 'deshedding', 'spa'],
                },
            ],
        },
        {
            id: 'pet2',
            name: 'Luna',
            breed: 'Yorkshire',
            size: 'pequeño',
            weight: 3,
            sex: 'F',
            additionalServices: [
                {
                    type: 'special_food',
                    petIndex: 1,
                    foodType: 'frozen',
                },
                {
                    type: 'medication',
                    petIndex: 1,
                    comment: 'Vitaminas por la mañana',
                    frequency: 'single',
                },
                {
                    type: 'special_care',
                    petIndex: 1,
                    comment: 'Limpieza de oídos diaria',
                },
                {
                    type: 'hairdressing',
                    petIndex: 1,
                    services: ['bath_and_trim', 'spa_ozone'],
                },
            ],
        },
    ],
}

export function useClientProfile(userId: string): { data: ClientProfile | null; isLoading: boolean } {
    if (userId === '') {
        return {
            data: null,
            isLoading: false,
        }
    }

    // In future iterations, this will fetch data based on userId
    return {
        data: mockClientProfile,
        isLoading: false,
    }
}
