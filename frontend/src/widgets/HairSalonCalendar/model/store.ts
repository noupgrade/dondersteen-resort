import { addDays, format } from 'date-fns'
import { create } from 'zustand'

import type { HairSalonReservation } from '@/components/ReservationContext'
import type { CalendarActions, CalendarState, CalendarView, DraggedReservation } from './types'

interface CalendarStore {
    scheduledReservations: HairSalonReservation[]
    unscheduledReservations: HairSalonReservation[]
    draggedReservation: DraggedReservation | null
    selectedReservation: HairSalonReservation | null
    isTouchMode: boolean
    setDraggedReservation: (reservation: DraggedReservation | null) => void
    setSelectedReservation: (reservation: HairSalonReservation | null) => void
    setIsTouchMode: (isTouchMode: boolean) => void
    moveReservation: (reservation: HairSalonReservation, date: string, time: string) => Promise<void>
    scheduleUnscheduledReservation: (reservation: HairSalonReservation, date: string, time: string) => Promise<void>
    updateReservation: (reservation: HairSalonReservation) => Promise<void>
}

// Mock data for testing
const today = new Date()
const mockReservations: HairSalonReservation[] = [
    {
        id: '1',
        type: 'peluqueria',
        source: 'hotel',
        date: format(today, 'yyyy-MM-dd'),
        time: '10:00',
        client: {
            name: 'Juan Pérez',
            phone: '666555444',
            email: 'juan@example.com'
        },
        pet: {
            id: 'pet1',
            name: 'Luna',
            breed: 'Golden Retriever',
            size: 'grande',
            weight: 25
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_trim']
        }],
        status: 'confirmed',
        observations: 'El pelo está muy enredado',
        totalPrice: 45,
        paymentStatus: 'pending',
        hasDriverService: true
    },
    {
        id: '2',
        type: 'peluqueria',
        source: 'external',
        date: format(today, 'yyyy-MM-dd'),
        time: '11:30',
        client: {
            name: 'María García',
            phone: '677888999',
            email: 'maria@example.com'
        },
        pet: {
            id: 'pet2',
            name: 'Rocky',
            breed: 'Yorkshire Terrier',
            size: 'pequeño',
            weight: 4
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_trim']
        }],
        status: 'confirmed',
        totalPrice: 35,
        paymentStatus: 'pending',
        hasDriverService: false
    }
]

// Mock de citas aceptadas pero pendientes de asignar hora
const mockUnscheduledReservations: HairSalonReservation[] = [
    {
        id: '3',
        type: 'peluqueria',
        source: 'hotel',
        date: format(today, 'yyyy-MM-dd'),
        time: '',
        client: {
            name: 'Pedro Gómez',
            phone: '611222333',
            email: 'pedro@example.com'
        },
        pet: {
            id: 'pet3',
            name: 'Nala',
            breed: 'Pastor Alemán',
            size: 'grande',
            weight: 30
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['deshedding']
        }],
        status: 'confirmed',
        observations: 'Cliente habitual',
        totalPrice: 50,
        paymentStatus: 'pending',
        hasDriverService: true
    },
    {
        id: '4',
        type: 'peluqueria',
        source: 'external',
        date: format(today, 'yyyy-MM-dd'),
        time: '',
        client: {
            name: 'Carmen Rodríguez',
            phone: '644555666',
            email: 'carmen@example.com'
        },
        pet: {
            id: 'pet4',
            name: 'Coco',
            breed: 'Bulldog Francés',
            size: 'mediano',
            weight: 12
        },
        additionalServices: [{
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_trim']
        }],
        status: 'confirmed',
        totalPrice: 40,
        paymentStatus: 'pending',
        hasDriverService: false
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
    scheduledReservations: mockReservations,
    unscheduledReservations: mockUnscheduledReservations,
    draggedReservation: null,
    selectedReservation: null,
    isTouchMode: false,
    setDraggedReservation: (reservation) => set({ draggedReservation: reservation }),
    setSelectedReservation: (reservation) => set({ selectedReservation: reservation }),
    setIsTouchMode: (isTouchMode) => set({ isTouchMode }),

    moveReservation: async (reservation: HairSalonReservation, newDate: string, newTime: string) => {
        // Simulate API call
        set((state) => {
            // Si no hay newTime, mover a unscheduledReservations
            if (!newTime) {
                return {
                    scheduledReservations: state.scheduledReservations.filter((r) => r.id !== reservation.id),
                    unscheduledReservations: [...state.unscheduledReservations, { ...reservation, date: newDate, time: newTime }]
                }
            }
            // Si hay newTime, actualizar en scheduledReservations
            return {
                scheduledReservations: state.scheduledReservations.map((r) =>
                    r.id === reservation.id ? { ...r, date: newDate, time: newTime } : r
                )
            }
        })
    },

    createReservation: async (reservation: Omit<HairSalonReservation, 'id'>) => {
        // Simulate API call
        const newReservation = {
            ...reservation,
            id: Math.random().toString(36).substr(2, 9),
            status: 'confirmed'
        }

        // Si la reserva no tiene hora asignada, va a unscheduledReservations
        set((state) => {
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

    scheduleUnscheduledReservation: async (reservation: HairSalonReservation, date: string, time: string) => {
        // Simulate API call
        set((state) => ({
            unscheduledReservations: state.unscheduledReservations.filter((r) => r.id !== reservation.id),
            scheduledReservations: [...state.scheduledReservations, { ...reservation, date, time }]
        }))
    },

    updateReservation: async (updatedReservation: HairSalonReservation) => {
        // Simulate API call
        set((state) => {
            // Si la reserva no tiene hora asignada, moverla a unscheduledReservations
            if (!updatedReservation.time) {
                return {
                    scheduledReservations: state.scheduledReservations.filter((r) => r.id !== updatedReservation.id),
                    unscheduledReservations: [...state.unscheduledReservations, updatedReservation]
                }
            }
            // Si tiene hora asignada, actualizar en scheduledReservations
            return {
                scheduledReservations: state.scheduledReservations.map((r) =>
                    r.id === updatedReservation.id ? updatedReservation : r
                )
            }
        })
    }
})) 