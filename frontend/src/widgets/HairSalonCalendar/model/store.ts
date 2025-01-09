import { create } from 'zustand'
import type { StateCreator } from 'zustand'
import { addDays, format } from 'date-fns'

import type { CalendarState, CalendarActions, CalendarView, DraggedReservation } from './types'
import type { ExtendedReservation } from '@/types/reservation'

interface CalendarStore extends CalendarState, CalendarActions { }

// Mock data for testing
const today = new Date()
const mockReservations: ExtendedReservation[] = [
    {
        id: '1',
        type: 'peluqueria',
        source: 'hotel',
        date: format(today, 'yyyy-MM-dd'),
        time: '10:00',
        client: {
            name: 'Juan Pérez',
            phone: '666555444'
        },
        pet: {
            id: 'pet1',
            name: 'Luna',
            breed: 'Golden Retriever'
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_trim']
        }],
        status: 'confirmed',
        observations: 'El pelo está muy enredado',
        totalPrice: 45,
        paymentStatus: 'pending'
    },
    {
        id: '2',
        type: 'peluqueria',
        source: 'external',
        date: format(today, 'yyyy-MM-dd'),
        time: '11:30',
        client: {
            name: 'María García',
            phone: '677888999'
        },
        pet: {
            id: 'pet2',
            name: 'Rocky',
            breed: 'Yorkshire Terrier'
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_trim']
        }],
        status: 'confirmed',
        totalPrice: 35,
        paymentStatus: 'pending'
    },
    {
        id: '3',
        type: 'peluqueria',
        source: 'hotel',
        date: format(addDays(today, 1), 'yyyy-MM-dd'),
        time: '09:00',
        client: {
            name: 'Carlos Ruiz',
            phone: '644333222'
        },
        pet: {
            id: 'pet3',
            name: 'Max',
            breed: 'Schnauzer'
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['deshedding']
        }],
        status: 'confirmed',
        totalPrice: 40,
        paymentStatus: 'pending'
    }
]

// Mock de citas aceptadas pero pendientes de asignar hora
const mockUnscheduledReservations: ExtendedReservation[] = [
    {
        id: '4',
        type: 'peluqueria',
        source: 'hotel',
        date: format(today, 'yyyy-MM-dd'),
        time: '',
        client: {
            name: 'Ana Martínez',
            phone: '655444333'
        },
        pet: {
            id: 'pet4',
            name: 'Bella',
            breed: 'Caniche'
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_trim']
        }],
        status: 'confirmed',
        observations: 'Aceptada - Pendiente asignar hora',
        hotelCheckIn: format(today, 'yyyy-MM-dd'),
        hotelCheckOut: format(addDays(today, 3), 'yyyy-MM-dd'),
        hotelCheckOutTime: '12:00',
        hasDriverService: true,
        totalPrice: 45,
        paymentStatus: 'pending'
    },
    {
        id: '5',
        type: 'peluqueria',
        source: 'external',
        date: format(addDays(today, 2), 'yyyy-MM-dd'),
        time: '',
        client: {
            name: 'Laura Sánchez',
            phone: '688777666'
        },
        pet: {
            id: 'pet5',
            name: 'Toby',
            breed: 'Shih Tzu'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['spa']
            }
        ],
        status: 'confirmed',
        observations: 'Aceptada - Preferencia horario de mañana',
        requestedTime: '10:00',
        totalPrice: 35,
        paymentStatus: 'pending'
    },
    {
        id: '8',
        type: 'peluqueria',
        source: 'hotel',
        date: format(today, 'yyyy-MM-dd'),
        time: '',
        client: {
            name: 'Roberto Díaz',
            phone: '677888999'
        },
        pet: {
            id: 'pet8',
            name: 'Thor',
            breed: 'Husky Siberiano'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['deshedding']
            }
        ],
        status: 'confirmed',
        observations: 'Cliente habitual - Necesita deslanado completo',
        hotelCheckIn: format(today, 'yyyy-MM-dd'),
        hotelCheckOut: format(addDays(today, 5), 'yyyy-MM-dd'),
        hotelCheckOutTime: '14:00',
        hasDriverService: false,
        totalPrice: 55,
        paymentStatus: 'pending'
    },
    {
        id: '9',
        type: 'peluqueria',
        source: 'external',
        date: format(today, 'yyyy-MM-dd'),
        time: '',
        client: {
            name: 'Isabel Torres',
            phone: '644555777'
        },
        pet: {
            id: 'pet9',
            name: 'Luna',
            breed: 'Pomerania'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_trim']
            }
        ],
        status: 'confirmed',
        observations: 'Primera visita',
        requestedTime: '16:30',
        totalPrice: 40,
        paymentStatus: 'pending'
    }
]

// Ejemplo de citas que NO deberían aparecer en el calendario todavía
const pendingReservations = [
    {
        id: '6',
        type: 'peluqueria',
        source: 'hotel',
        date: '',
        time: '',
        client: {
            name: 'Pedro Gómez',
            phone: '611222333'
        },
        pet: {
            name: 'Nala',
            breed: 'Pastor Alemán'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['deshedding']
            }
        ],
        status: 'pending', // Pendiente de aceptar
        observations: 'Pendiente de aceptar'
    },
    {
        id: '7',
        type: 'peluqueria',
        source: 'external',
        date: '',
        time: '',
        client: {
            name: 'Carmen Rodríguez',
            phone: '644555666'
        },
        pet: {
            name: 'Coco',
            breed: 'Bulldog Francés'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_trim']
            }
        ],
        status: 'pending', // Pendiente de aceptar
        observations: 'Pendiente de proponer fecha'
    }
]

export const useCalendarStore = create<CalendarStore>((set, get) => ({
    view: 'week',
    selectedDate: new Date(),
    draggedReservation: null,
    unscheduledReservations: mockUnscheduledReservations,
    scheduledReservations: mockReservations,

    setView: (view: CalendarView) => set({ view }),
    setSelectedDate: (date: Date) => set({ selectedDate: date }),
    setDraggedReservation: (reservation: DraggedReservation | null) => set({ draggedReservation: reservation }),

    moveReservation: async (reservation: ExtendedReservation, newDate: string, newTime: string) => {
        // Simulate API call
        set((state: any) => {
            // Si no hay newTime, mover a unscheduledReservations
            if (!newTime) {
                return {
                    scheduledReservations: state.scheduledReservations.filter((r: ExtendedReservation) => r.id !== reservation.id),
                    unscheduledReservations: [...state.unscheduledReservations, { ...reservation, date: newDate, time: newTime }]
                }
            }
            // Si hay newTime, actualizar en scheduledReservations
            return {
                scheduledReservations: state.scheduledReservations.map((r: ExtendedReservation) =>
                    r.id === reservation.id ? { ...r, date: newDate, time: newTime } : r
                )
            }
        })
    },

    createReservation: async (reservation: Omit<ExtendedReservation, 'id'>) => {
        // Simulate API call
        const newReservation = {
            ...reservation,
            id: Math.random().toString(36).substr(2, 9),
            status: 'confirmed'
        }

        // Si la reserva no tiene hora asignada, va a unscheduledReservations
        set((state: any) => {
            if (!newReservation.time) {
                return {
                    unscheduledReservations: [...state.unscheduledReservations, newReservation]
                }
            }
            return {
                scheduledReservations: [...state.scheduledReservations, newReservation]
            }
        })
    },

    scheduleUnscheduledReservation: async (reservation: ExtendedReservation, date: string, time: string) => {
        // Simulate API call
        set((state: any) => ({
            unscheduledReservations: state.unscheduledReservations.filter((r: ExtendedReservation) => r.id !== reservation.id),
            scheduledReservations: [...state.scheduledReservations, { ...reservation, date, time }]
        }))
    },

    updateReservation: async (updatedReservation: ExtendedReservation) => {
        // Simulate API call
        set((state: any) => ({
            scheduledReservations: state.scheduledReservations.map((r: ExtendedReservation) =>
                r.id === updatedReservation.id ? updatedReservation : r
            )
        }))
    }
})) 