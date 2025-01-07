import { addDays, format, subDays } from 'date-fns'

import { HotelReservation, HairSalonReservation } from '@/components/ReservationContext'

// Example reservations that will be managed in the context
export const EXAMPLE_RESERVATIONS: (HotelReservation | HairSalonReservation)[] = [
    // Pending hair salon reservations from hotel guests
    {
        id: 'EXAMPLE_HAIRSALON_1',
        type: 'peluqueria',
        source: 'hotel',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        client: {
            id: 'EXAMPLE_CLIENT_1',
            name: 'John Example',
            phone: '666555444',
            email: 'john@example.com'
        },
        pet: {
            id: 'PET_1',
            name: 'Max',
            breed: 'Golden Retriever',
            size: 'grande',
            weight: 30
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'deshedding']
            }
        ],
        status: 'pending',
        totalPrice: 75,
        paymentStatus: 'Pendiente',
        observations: 'Cliente del hotel - Habitación HAB.1'
    },
    {
        id: 'EXAMPLE_HAIRSALON_2',
        type: 'peluqueria',
        source: 'hotel',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '15:00',
        client: {
            id: 'EXAMPLE_CLIENT_2',
            name: 'Alice Example',
            phone: '666777888',
            email: 'alice@example.com'
        },
        pet: {
            id: 'PET_2',
            name: 'Luna',
            breed: 'Poodle',
            size: 'pequeño',
            weight: 5
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_trim', 'spa']
            }
        ],
        status: 'pending',
        totalPrice: 65,
        paymentStatus: 'Pendiente',
        observations: 'Cliente del hotel - Habitación HAB.2'
    },
    {
        id: 'EXAMPLE_HAIRSALON_3',
        type: 'peluqueria',
        source: 'hotel',
        date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        time: '11:30',
        client: {
            id: 'EXAMPLE_CLIENT_3',
            name: 'Carlos Example',
            phone: '666999000',
            email: 'carlos@example.com'
        },
        pet: {
            id: 'PET_3',
            name: 'Thor',
            breed: 'Husky',
            size: 'grande',
            weight: 28
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'deshedding', 'spa_ozone']
            }
        ],
        status: 'pending',
        totalPrice: 90,
        paymentStatus: 'Pendiente',
        observations: 'Cliente del hotel - Habitación HAB.3'
    },
    // Check-in today - 3 pets
    {
        id: 'EXAMPLE_CHECKIN_1',
        type: 'hotel',
        checkInDate: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: '10:00',
        checkOutDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_1',
            name: 'John Example',
            phone: '666555444',
            email: 'john@example.com'
        },
        pets: [
            {
                name: 'Max',
                breed: 'Golden Retriever',
                weight: 30,
                size: 'grande',
                sex: 'M'
            },
            {
                name: 'Luna',
                breed: 'Beagle',
                weight: 12,
                size: 'mediano',
                sex: 'F'
            },
            {
                name: 'Coco',
                breed: 'Yorkshire',
                weight: 3,
                size: 'pequeño',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush']
            },
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            }
        ],
        roomNumber: 'HAB.1',
        status: 'confirmed',
        totalPrice: 300,
        paymentStatus: 'Pagado'
    },
    // Check-in today - 2 pets
    {
        id: 'EXAMPLE_CHECKIN_2',
        type: 'hotel',
        checkInDate: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: '12:00',
        checkOutDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_2',
            name: 'Alice Example',
            phone: '666777888',
            email: 'alice@example.com'
        },
        pets: [
            {
                name: 'Nala',
                breed: 'Labrador',
                weight: 25,
                size: 'grande',
                sex: 'F'
            },
            {
                name: 'Rocky',
                breed: 'French Bulldog',
                weight: 12,
                size: 'mediano',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush']
            },
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            },
            {
                type: 'special_care',
                petIndex: 0,
                comment: 'Necesita cuidados especiales'
            }
        ],
        roomNumber: 'HAB.2',
        status: 'confirmed',
        totalPrice: 500,
        paymentStatus: 'Pendiente'
    },
    // Check-in tomorrow - 3 pets
    {
        id: 'EXAMPLE_CHECKIN_3',
        type: 'hotel',
        checkInDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        checkInTime: '14:00',
        checkOutDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_3',
            name: 'Carlos Example',
            phone: '666999000',
            email: 'carlos@example.com'
        },
        pets: [
            {
                name: 'Thor',
                breed: 'German Shepherd',
                weight: 35,
                size: 'grande',
                sex: 'M'
            },
            {
                name: 'Loki',
                breed: 'Border Collie',
                weight: 20,
                size: 'mediano',
                sex: 'M'
            },
            {
                name: 'Freya',
                breed: 'Poodle',
                weight: 5,
                size: 'pequeño',
                sex: 'F'
            }
        ],
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush']
            },
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            },
            {
                type: 'special_care',
                petIndex: 0,
                comment: 'Necesita cuidados especiales'
            }
        ],
        roomNumber: 'HAB.3',
        status: 'pending',
        totalPrice: 600,
        paymentStatus: 'Pendiente'
    },
    // Check-out today - 2 pets
    {
        id: 'EXAMPLE_CHECKOUT_1',
        type: 'hotel',
        checkInDate: format(subDays(new Date(), 3), 'yyyy-MM-dd'),
        checkInTime: '14:00',
        checkOutDate: format(new Date(), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_4',
            name: 'Maria Example',
            phone: '666111222',
            email: 'maria@example.com'
        },
        pets: [
            {
                name: 'Bella',
                breed: 'Poodle',
                weight: 8,
                size: 'pequeño',
                sex: 'F'
            },
            {
                name: 'Charlie',
                breed: 'Schnauzer',
                weight: 15,
                size: 'mediano',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush']
            },
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            },
            {
                type: 'special_care',
                petIndex: 0,
                comment: 'Necesita cuidados especiales'
            }
        ],
        roomNumber: 'HAB.4',
        status: 'confirmed',
        totalPrice: 400,
        paymentStatus: 'Pagado'
    },
    // Check-out today - 3 pets
    {
        id: 'EXAMPLE_CHECKOUT_2',
        type: 'hotel',
        checkInDate: format(subDays(new Date(), 5), 'yyyy-MM-dd'),
        checkInTime: '16:00',
        checkOutDate: format(new Date(), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_5',
            name: 'Pedro Example',
            phone: '666333444',
            email: 'pedro@example.com'
        },
        pets: [
            {
                name: 'Simba',
                breed: 'Husky',
                weight: 28,
                size: 'grande',
                sex: 'M'
            },
            {
                name: 'Nina',
                breed: 'Cocker Spaniel',
                weight: 13,
                size: 'mediano',
                sex: 'F'
            },
            {
                name: 'Toby',
                breed: 'Jack Russell',
                weight: 6,
                size: 'pequeño',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush']
            },
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            }
        ],
        roomNumber: 'HAB.5',
        status: 'confirmed',
        totalPrice: 700,
        paymentStatus: 'Pagado'
    }
] 