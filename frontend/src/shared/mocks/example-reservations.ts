import { addDays, format, subDays } from 'date-fns'
import { Reservation } from '@/components/ReservationContext'
import { AdditionalService, HairdressingService, DriverService } from '@/shared/types/additional-services'

// Example reservations that will be managed in the context
export const EXAMPLE_RESERVATIONS: (Reservation)[] = [
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
    },
    // Active reservations with different transport services
    {
        id: 'EXAMPLE_ACTIVE_1',
        type: 'hotel',
        checkInDate: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: '14:00',
        checkOutDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_7',
            name: 'Luis Transport',
            phone: '666777888',
            email: 'luis@example.com'
        },
        pets: [
            {
                name: 'Zeus',
                breed: 'German Shepherd',
                weight: 35,
                size: 'grande',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'pickup'
            } as AdditionalService
        ],
        roomNumber: 'HAB.7',
        status: 'confirmed',
        totalPrice: 400,
        paymentStatus: 'Pendiente'
    },
    {
        id: 'EXAMPLE_ACTIVE_2',
        type: 'hotel',
        checkInDate: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: '15:00',
        checkOutDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_8',
            name: 'Carmen Transport',
            phone: '666999000',
            email: 'carmen@example.com'
        },
        pets: [
            {
                name: 'Luna',
                breed: 'Husky',
                weight: 28,
                size: 'grande',
                sex: 'F'
            }
        ],
        additionalServices: [
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'dropoff'
            } as AdditionalService
        ],
        roomNumber: 'HAB.8',
        status: 'confirmed',
        totalPrice: 350,
        paymentStatus: 'Pendiente'
    },
    {
        id: 'EXAMPLE_ACTIVE_3',
        type: 'hotel',
        checkInDate: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: '16:00',
        checkOutDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_9',
            name: 'Sofia Transport',
            phone: '666444333',
            email: 'sofia@example.com'
        },
        pets: [
            {
                name: 'Rocky',
                breed: 'Golden Retriever',
                weight: 32,
                size: 'grande',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'both'
            } as AdditionalService
        ],
        roomNumber: 'HAB.9',
        status: 'confirmed',
        totalPrice: 450,
        paymentStatus: 'Pendiente'
    },
    // Ejemplos de guardería (mismo día de check-in y check-out)
    {
        id: 'EXAMPLE_DAYCARE_1',
        type: 'hotel',
        checkInDate: format(new Date(), 'yyyy-MM-dd'),
        checkInTime: '09:00',
        checkOutDate: format(new Date(), 'yyyy-MM-dd'),
        checkOutTime: '19:00',
        client: {
            id: 'EXAMPLE_CLIENT_10',
            name: 'Laura Daycare',
            phone: '666123456',
            email: 'laura@example.com'
        },
        pets: [
            {
                name: 'Toby',
                breed: 'French Bulldog',
                weight: 12,
                size: 'mediano',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'special_care',
                petIndex: 0,
                comment: 'Necesita supervisión constante'
            }
        ],
        roomNumber: 'HAB.10',
        status: 'confirmed',
        totalPrice: 25,
        paymentStatus: 'Pendiente'
    },
    {
        id: 'EXAMPLE_DAYCARE_2',
        type: 'hotel',
        checkInDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        checkInTime: '08:00',
        checkOutDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        checkOutTime: '20:00',
        client: {
            id: 'EXAMPLE_CLIENT_11',
            name: 'Carlos Daycare',
            phone: '666234567',
            email: 'carlos.d@example.com'
        },
        pets: [
            {
                name: 'Luna',
                breed: 'Poodle',
                weight: 5,
                size: 'pequeño',
                sex: 'F'
            }
        ],
        additionalServices: [
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'both'
            } as AdditionalService
        ],
        roomNumber: 'HAB.11',
        status: 'confirmed',
        totalPrice: 35,
        paymentStatus: 'Pendiente'
    },
    {
        id: 'EXAMPLE_DAYCARE_3',
        type: 'hotel',
        checkInDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        checkInTime: '10:00',
        checkOutDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        checkOutTime: '18:00',
        client: {
            id: 'EXAMPLE_CLIENT_12',
            name: 'Ana Daycare',
            phone: '666345678',
            email: 'ana.d@example.com'
        },
        pets: [
            {
                name: 'Max',
                breed: 'Beagle',
                weight: 15,
                size: 'mediano',
                sex: 'M'
            },
            {
                name: 'Rocky',
                breed: 'Beagle',
                weight: 14,
                size: 'mediano',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            },
            {
                type: 'special_food',
                petIndex: 1,
                foodType: 'refrigerated'
            }
        ],
        roomNumber: 'HAB.12',
        status: 'confirmed',
        totalPrice: 50,
        paymentStatus: 'Pendiente'
    },
    // Reserva pendiente de hotel 1
    {
        id: 'EXAMPLE_PENDING_HOTEL_1',
        type: 'hotel',
        checkInDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        checkInTime: '14:00',
        checkOutDate: format(addDays(new Date(), 8), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_PENDING_1',
            name: 'María Ejemplo',
            phone: '666111222',
            email: 'maria@example.com'
        },
        pets: [
            {
                name: 'Bella',
                breed: 'Cavalier King Charles',
                weight: 8,
                size: 'pequeño',
                sex: 'F'
            },
            {
                name: 'Charlie',
                breed: 'Cavalier King Charles',
                weight: 9,
                size: 'pequeño',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            }
        ],
        roomNumber: 'HAB.4',
        status: 'pending',
        totalPrice: 240,
        paymentStatus: 'Pendiente'
    },
    // Reserva pendiente de hotel 2
    {
        id: 'EXAMPLE_PENDING_HOTEL_2',
        type: 'hotel',
        checkInDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
        checkInTime: '12:00',
        checkOutDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_PENDING_2',
            name: 'Pedro Example',
            phone: '666333444',
            email: 'pedro@example.com'
        },
        pets: [
            {
                name: 'Simba',
                breed: 'Maine Coon',
                weight: 7,
                size: 'mediano',
                sex: 'M'
            },
            {
                name: 'Nina',
                breed: 'Siamese',
                weight: 4,
                size: 'pequeño',
                sex: 'F'
            },
            {
                name: 'Toby',
                breed: 'Persian',
                weight: 5,
                size: 'pequeño',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'special_care',
                petIndex: 0,
                comment: 'Medicación diaria'
            }
        ],
        roomNumber: 'HAB.5',
        status: 'pending',
        totalPrice: 400,
        paymentStatus: 'Pendiente'
    },
    // Reserva pendiente de hotel 3
    {
        id: 'EXAMPLE_PENDING_HOTEL_3',
        type: 'hotel',
        checkInDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        checkInTime: '12:00',
        checkOutDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
        client: {
            id: 'EXAMPLE_CLIENT_PENDING_3',
            name: 'Ana Example',
            phone: '666555666',
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
                breed: 'Shih Tzu',
                weight: 4,
                size: 'pequeño',
                sex: 'F'
            }
        ],
        additionalServices: [
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'both'
            }
        ],
        roomNumber: 'HAB.6',
        status: 'pending',
        totalPrice: 320,
        paymentStatus: 'Pendiente'
    },
    // Presupuestos de hotel
    {
        id: 'EXAMPLE_BUDGET_1',
        type: 'hotel-budget',
        checkInDate: format(addDays(new Date(), 10), 'yyyy-MM-dd'),
        checkInTime: '14:00',
        checkOutDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
        checkOutTime: '12:00',
        client: {
            id: 'EXAMPLE_CLIENT_BUDGET_1',
            name: 'Laura Presupuesto',
            phone: '666777999',
            email: 'laura.p@example.com'
        },
        pets: [
            {
                name: 'Coco',
                breed: 'Labrador',
                weight: 30,
                size: 'grande',
                sex: 'M',
                isNeutered: true
            },
            {
                name: 'Luna',
                breed: 'Labrador',
                weight: 28,
                size: 'grande',
                sex: 'F',
                isNeutered: true
            }
        ],
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'deshedding']
            },
            {
                type: 'hairdressing',
                petIndex: 1,
                services: ['bath_and_brush', 'deshedding']
            },
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'both'
            }
        ],
        status: 'pending',
        totalPrice: 750,
        paymentStatus: 'Pendiente'
    },
    {
        id: 'EXAMPLE_BUDGET_2',
        type: 'hotel-budget',
        checkInDate: format(addDays(new Date(), 15), 'yyyy-MM-dd'),
        checkInTime: '12:00',
        checkOutDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'),
        checkOutTime: '12:00',
        client: {
            id: 'EXAMPLE_CLIENT_BUDGET_2',
            name: 'Carlos Presupuesto',
            phone: '666888000',
            email: 'carlos.p@example.com'
        },
        pets: [
            {
                name: 'Rocky',
                breed: 'German Shepherd',
                weight: 35,
                size: 'grande',
                sex: 'M',
                isNeutered: false
            }
        ],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            },
            {
                type: 'medication',
                petIndex: 0,
                comment: 'Medicación diaria para las articulaciones',
                frequency: 'multiple'
            }
        ],
        status: 'pending',
        totalPrice: 500,
        paymentStatus: 'Pendiente'
    },
    {
        id: 'EXAMPLE_BUDGET_3',
        type: 'hotel-budget',
        checkInDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'),
        checkInTime: '15:00',
        checkOutDate: format(addDays(new Date(), 23), 'yyyy-MM-dd'),
        checkOutTime: '11:00',
        client: {
            id: 'EXAMPLE_CLIENT_BUDGET_3',
            name: 'Ana Presupuesto',
            phone: '666999111',
            email: 'ana.p@example.com'
        },
        pets: [
            {
                name: 'Bella',
                breed: 'Yorkshire',
                weight: 3,
                size: 'pequeño',
                sex: 'F',
                isNeutered: true
            },
            {
                name: 'Max',
                breed: 'Yorkshire',
                weight: 3.5,
                size: 'pequeño',
                sex: 'M',
                isNeutered: true
            },
            {
                name: 'Nina',
                breed: 'Yorkshire',
                weight: 2.8,
                size: 'pequeño',
                sex: 'F',
                isNeutered: true
            }
        ],
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_trim', 'spa']
            },
            {
                type: 'hairdressing',
                petIndex: 1,
                services: ['bath_and_trim', 'spa']
            },
            {
                type: 'hairdressing',
                petIndex: 2,
                services: ['bath_and_trim', 'spa']
            }
        ],
        status: 'pending',
        totalPrice: 450,
        paymentStatus: 'Pendiente'
    }
] 