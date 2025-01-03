import { AdditionalService } from '@/shared/types/additional-services'
import { Reservation } from '@/components/reservation-card'

export const mockReservations: Reservation[] = [
    // Confirmed Hotel Reservations
    {
        id: '1',
        type: 'hotel',
        date: '2023-11-20',
        time: '10:00',
        startDate: '2023-11-20',
        endDate: '2023-11-24',
        services: [
            {
                type: 'driver',
                serviceType: 'both',
                pickupTime: '10:00',
                dropoffTime: '14:00'
            },
            {
                type: 'medication',
                petIndex: 0,
                comment: 'Medicación diaria'
            },
            {
                type: 'special_care',
                petIndex: 0,
                comment: 'Cuidados especiales diarios'
            }
        ] as AdditionalService[],
        status: 'confirmed',
        estimatedPrice: 300,
        pets: [
            {
                name: 'Luna',
                breed: 'Labrador',
                size: 'grande',
                weight: 25
            }
        ]
    },
    {
        id: '2',
        type: 'hotel',
        date: '2023-11-22',
        time: '15:00',
        startDate: '2023-11-22',
        endDate: '2023-11-27',
        services: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            },
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'spa']
            }
        ] as AdditionalService[],
        status: 'confirmed',
        estimatedPrice: 400,
        pets: [
            {
                name: 'Rocky',
                breed: 'German Shepherd',
                size: 'grande',
                weight: 35
            }
        ]
    },
    // Requested Hotel Reservations (Pending Approval)
    {
        id: '3',
        type: 'hotel',
        date: '2023-11-25',
        time: '09:00',
        startDate: '2023-11-25',
        endDate: '2023-11-30',
        services: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush']
            }
        ] as AdditionalService[],
        status: 'servicio solicitado',
        estimatedPrice: 350,
        pets: [
            {
                name: 'Max',
                breed: 'Beagle',
                size: 'mediano',
                weight: 15
            }
        ]
    },
    {
        id: '4',
        type: 'hotel',
        date: '2023-12-01',
        time: '11:00',
        startDate: '2023-12-01',
        endDate: '2023-12-05',
        services: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            }
        ] as AdditionalService[],
        status: 'servicio solicitado',
        estimatedPrice: 450,
        pets: [
            {
                name: 'Toby',
                breed: 'Border Collie',
                size: 'mediano',
                weight: 20
            }
        ]
    },
    // Grooming Proposals (Pending Accept/Reject)
    {
        id: '5',
        type: 'peluqueria',
        date: '2023-11-20',
        time: '10:00',
        services: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'bath_and_trim']
            }
        ] as AdditionalService[],
        status: 'propuesta peluqueria',
        estimatedPrice: 65,
        pets: [
            {
                name: 'Bella',
                breed: 'Poodle',
                size: 'pequeño',
                weight: 5
            }
        ]
    },
    {
        id: '6',
        type: 'peluqueria',
        date: '2023-11-22',
        time: '15:30',
        services: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'deshedding']
            }
        ] as AdditionalService[],
        status: 'propuesta peluqueria',
        estimatedPrice: 80,
        pets: [
            {
                name: 'Thor',
                breed: 'Husky',
                size: 'grande',
                weight: 28
            }
        ]
    },
    // Confirmed Grooming Reservations
    {
        id: '7',
        type: 'peluqueria',
        date: '2023-11-24',
        time: '11:00',
        services: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'bath_and_trim']
            }
        ] as AdditionalService[],
        status: 'confirmed',
        estimatedPrice: 55,
        pets: [
            {
                name: 'Nina',
                breed: 'Shih Tzu',
                size: 'pequeño',
                weight: 4
            }
        ]
    },
    {
        id: '8',
        type: 'peluqueria',
        date: '2023-11-26',
        time: '14:30',
        services: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'deshedding']
            }
        ] as AdditionalService[],
        status: 'confirmed',
        estimatedPrice: 75,
        pets: [
            {
                name: 'Zeus',
                breed: 'Chow Chow',
                size: 'grande',
                weight: 30
            }
        ]
    },
    // Requested Grooming Reservations (Pending Approval)
    {
        id: '9',
        type: 'peluqueria',
        date: '2023-11-28',
        time: '14:00',
        services: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'bath_and_trim']
            }
        ] as AdditionalService[],
        status: 'servicio solicitado',
        estimatedPrice: 45,
        pets: [
            {
                name: 'Charlie',
                breed: 'Yorkshire Terrier',
                size: 'pequeño',
                weight: 3
            }
        ]
    },
    {
        id: '10',
        type: 'peluqueria',
        date: '2023-11-30',
        time: '11:30',
        services: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'bath_and_trim', 'deshedding']
            }
        ] as AdditionalService[],
        status: 'servicio solicitado',
        estimatedPrice: 90,
        pets: [
            {
                name: 'Lola',
                breed: 'Golden Retriever',
                size: 'grande',
                weight: 32
            }
        ]
    }
] 