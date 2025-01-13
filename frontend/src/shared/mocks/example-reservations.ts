import { addDays, format, subDays } from 'date-fns'
import { HotelReservation, HairSalonReservation } from '@/components/ReservationContext'
import { AdditionalService, HairdressingService, DriverService } from '@/shared/types/additional-services'

// Example reservations that will be managed in the context
export const EXAMPLE_RESERVATIONS: (HotelReservation | HairSalonReservation)[] = [
    {
        id: 'EXAMPLE_HAIRSALON_1',
        type: 'peluqueria',
        source: 'hotel',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
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
            } satisfies HairdressingService,
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'dropoff'
            } satisfies DriverService
        ],
        status: 'pending',
        totalPrice: 75,
        paymentStatus: 'Pendiente',
        observations: 'Cliente del hotel - Habitación HAB.1',
        hotelCheckIn: format(new Date(), 'yyyy-MM-dd'),
        hotelCheckOut: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        hotelCheckOutTime: '12:00',
        hasDriverService: true
    },
    {
        id: 'EXAMPLE_HAIRSALON_2',
        type: 'peluqueria',
        source: 'hotel',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '',
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
            } satisfies HairdressingService
        ],
        status: 'pending',
        totalPrice: 65,
        paymentStatus: 'Pendiente',
        observations: 'Cliente del hotel - Habitación HAB.2',
        hotelCheckIn: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        hotelCheckOut: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        hotelCheckOutTime: '14:00'
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
    },
    // Check-out today - 2 pets with driver service
    {
        id: 'EXAMPLE_CHECKOUT_3',
        type: 'hotel',
        checkInDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
        checkInTime: '15:00',
        checkOutDate: format(new Date(), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_6',
            name: 'Ana Example',
            phone: '666444555',
            email: 'ana@example.com'
        },
        pets: [
            {
                name: 'Milo',
                breed: 'Shih Tzu',
                weight: 5,
                size: 'pequeño',
                sex: 'M'
            },
            {
                name: 'Lola',
                breed: 'Maltese',
                weight: 4,
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
                type: 'driver',
                petIndex: 0,
                serviceType: 'dropoff'
            } as AdditionalService
        ],
        roomNumber: 'HAB.6',
        status: 'confirmed',
        totalPrice: 350,
        paymentStatus: 'Pendiente'
    },
    // External reservations
    {
        id: 'EXAMPLE_EXTERNAL_1',
        type: 'peluqueria',
        source: 'external',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '',
        client: {
            id: 'EXAMPLE_CLIENT_4',
            name: 'María García',
            phone: '666111222',
            email: 'maria@example.com'
        },
        pet: {
            id: 'PET_4',
            name: 'Bella',
            breed: 'Yorkshire Terrier',
            size: 'pequeño',
            weight: 3
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_trim']
            } satisfies HairdressingService
        ],
        status: 'pending',
        totalPrice: 45,
        paymentStatus: 'Pendiente',
        observations: 'Primera visita',
        requestedTime: '10:00'
    },
    {
        id: 'EXAMPLE_EXTERNAL_2',
        type: 'peluqueria',
        source: 'external',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '',
        client: {
            id: 'EXAMPLE_CLIENT_5',
            name: 'Pedro Sánchez',
            phone: '666333444',
            email: 'pedro@example.com'
        },
        pet: {
            id: 'PET_5',
            name: 'Rocky',
            breed: 'Bulldog Francés',
            size: 'mediano',
            weight: 12
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'spa']
            } satisfies HairdressingService
        ],
        status: 'pending',
        totalPrice: 60,
        paymentStatus: 'Pendiente',
        observations: 'Cliente habitual',
        requestedTime: '16:30'
    }
] 