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
            name: 'Luna',
            breed: 'Golden Retriever'
        },
        additionalServices: ['corte'],
        status: 'confirmed',
        observations: 'El pelo está muy enredado'
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
            name: 'Rocky',
            breed: 'Yorkshire Terrier'
        },
        additionalServices: ['bano_especial'],
        status: 'confirmed'
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
            name: 'Max',
            breed: 'Schnauzer'
        },
        additionalServices: ['deslanado'],
        status: 'confirmed'
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
            name: 'Bella',
            breed: 'Caniche'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_trim']
            }
        ],
        status: 'confirmed', // Ya aceptada, solo falta asignar hora
        observations: 'Aceptada - Pendiente asignar hora'
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
        status: 'confirmed', // Ya aceptada, solo falta asignar hora
        observations: 'Aceptada - Preferencia horario de mañana'
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
        set((state: any) => ({
            scheduledReservations: state.scheduledReservations.map((r: ExtendedReservation) =>
                r.id === reservation.id ? { ...r, date: newDate, time: newTime } : r
            )
        }))
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