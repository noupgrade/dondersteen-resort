import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { addDays, format } from 'date-fns'
import { EXAMPLE_RESERVATIONS } from '@/shared/mocks/example-reservations'
import { AdditionalService } from '@/shared/types/additional-services'

export type ShopProduct = {
    id: string
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export type Client = {
    id?: string
    name: string
    phone: string
    email: string
    address?: string
}

export type Pet = {
    id?: string
    name: string
    breed: string
    size: 'pequeño' | 'mediano' | 'grande'
    weight: number
    sex?: 'M' | 'F'
    isNeutered?: boolean
    additionalServices?: AdditionalService[] // TODO DO NOT USE THIS UNTIL WE MIGRATE FROM THE RESERVATION TYPE. THIS IS JUST TO BE USED IN THE CUSTOMER PROFILE
}

export type HotelReservation = {
    id: string
    type: 'hotel'
    checkInDate: string
    checkInTime: string
    checkOutDate: string
    checkOutTime?: string
    client: Client
    pets: Pet[]
    additionalServices: AdditionalService[]
    shopProducts?: ShopProduct[]
    status: 'confirmed' | 'pending' | 'cancelled' | 'propuesta peluqueria'
    totalPrice: number
    paymentStatus: string
    roomNumber?: string
    createdAt?: string
    updatedAt?: string
}

export type HairSalonReservation = {
    id: string
    type: 'peluqueria'
    source: 'hotel' | 'external'
    date: string
    time: string
    client: Client
    pet: Pet
    additionalServices: AdditionalService[]
    shopProducts?: ShopProduct[]
    status: 'confirmed' | 'pending' | 'cancelled' | 'propuesta peluqueria'
    totalPrice: number
    paymentStatus: string
    observations?: string
    subcitas?: {
        fecha: string
        hora: string
        descripcion: string
    }[]
    precioEstimado?: number
    horaDefinitiva?: string
    finalPrice?: number
    priceNote?: string
    // Campos para reservas de hotel
    hotelCheckIn?: string
    hotelCheckOut?: string
    hotelCheckOutTime?: string
    hasDriverService?: boolean
    // Campo para asignar peluquera
    hairdresser?: 'hairdresser1' | 'hairdresser2'
    duration?: number
    // Campo para hora solicitada en reservas externas
    requestedTime?: string
}

export type Reservation = HotelReservation | HairSalonReservation

type CalendarAvailability = {
    [date: string]: number
}

type ReservationDocument = Reservation & FSDocument

type ReservationContextType = {
    reservations: ReservationDocument[]
    addReservation: (reservation: Omit<HotelReservation, 'id'> | Omit<HairSalonReservation, 'id'>) => Promise<ReservationDocument>
    updateReservation: (id: string, updatedData: Partial<HotelReservation | HairSalonReservation>) => Promise<void>
    deleteReservation: (id: string) => Promise<void>
    getReservationsByClientId: (clientId: string) => ReservationDocument[]
    getReservationsByDate: (date: string) => ReservationDocument[]
    getCalendarAvailability: (type: 'hotel' | 'peluqueria') => CalendarAvailability
    isLoading: boolean
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined)

export const useReservation = () => {
    const context = useContext(ReservationContext)
    if (!context) {
        throw new Error('useReservation must be used within a ReservationProvider')
    }
    return context
}

export const useHotelReservations = (): { reservations: HotelReservation[] } => {
    const { reservations } = useReservation()
    return { reservations: reservations.filter(r => r.type === 'hotel') }
}

export const useHairSalonReservations = (): { reservations: HairSalonReservation[] } => {
    const { reservations } = useReservation()
    return { reservations: reservations.filter(r => r.type === 'peluqueria') }
}

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        results: dbReservations,
        isLoading,
        addDocument,
        updateDocument,
        removeDocument,
    } = useCollection<ReservationDocument>({
        path: 'reservations',
        orderBy: ['createdAt', 'desc'],
        limit: 100,
    })

    // Combine database reservations with example reservations
    const reservations = useMemo(() => {
        const allReservations = [...dbReservations]

        // Add example reservations and update them if they exist in local storage
        const storedExampleReservations = localStorage.getItem('exampleReservations')
        const parsedExampleReservations = storedExampleReservations
            ? JSON.parse(storedExampleReservations) as ReservationDocument[]
            : EXAMPLE_RESERVATIONS as ReservationDocument[]

        parsedExampleReservations.forEach(example => {
            if (!allReservations.some(r => r.id === example.id)) {
                allReservations.push(example)
            }
        })

        return allReservations
    }, [dbReservations])

    const addReservation = useCallback(async (reservation: Omit<HotelReservation, 'id'> | Omit<HairSalonReservation, 'id'>) => {
        // If it's an example reservation
        if (reservation.client?.id?.startsWith('EXAMPLE_')) {
            const newReservation: ReservationDocument = {
                ...reservation,
                id: `EXAMPLE_${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const storedExampleReservations = localStorage.getItem('exampleReservations')
            const parsedExampleReservations = storedExampleReservations
                ? JSON.parse(storedExampleReservations) as ReservationDocument[]
                : EXAMPLE_RESERVATIONS as ReservationDocument[]

            const updatedReservations = [...parsedExampleReservations, newReservation]
            localStorage.setItem('exampleReservations', JSON.stringify(updatedReservations))
            return newReservation
        }
        return await addDocument(reservation)
    }, [addDocument])

    const updateReservation = useCallback(async (id: string, updatedData: Partial<HotelReservation | HairSalonReservation>) => {
        // If it's an example reservation, update it in local storage
        if (id.startsWith('EXAMPLE_')) {
            const storedExampleReservations = localStorage.getItem('exampleReservations')
            const parsedExampleReservations = storedExampleReservations
                ? JSON.parse(storedExampleReservations) as ReservationDocument[]
                : EXAMPLE_RESERVATIONS as ReservationDocument[]

            const updatedReservations = parsedExampleReservations.map(r =>
                r.id === id
                    ? {
                        ...r,
                        ...updatedData,
                        updatedAt: new Date().toISOString()
                    }
                    : r
            )
            localStorage.setItem('exampleReservations', JSON.stringify(updatedReservations))
            return Promise.resolve()
        }
        await updateDocument(id, updatedData)
    }, [updateDocument])

    const deleteReservation = useCallback(async (id: string) => {
        // If it's an example reservation, remove it from local storage
        if (id.startsWith('EXAMPLE_')) {
            const storedExampleReservations = localStorage.getItem('exampleReservations')
            const parsedExampleReservations = storedExampleReservations
                ? JSON.parse(storedExampleReservations) as ReservationDocument[]
                : EXAMPLE_RESERVATIONS as ReservationDocument[]

            const updatedReservations = parsedExampleReservations.filter(r => r.id !== id)
            localStorage.setItem('exampleReservations', JSON.stringify(updatedReservations))
            return Promise.resolve()
        }
        await removeDocument(id)
    }, [removeDocument])

    const getReservationsByClientId = useCallback(
        (clientId: string) => {
            return reservations.filter(r => r.client.id === clientId)
        },
        [reservations],
    )

    const getReservationsByDate = useCallback(
        (date: string) => {
            return reservations.filter(r => {
                if (r.type === 'hotel') {
                    return r.checkInDate === date
                } else {
                    return r.date === date
                }
            })
        },
        [reservations],
    )

    const getCalendarAvailability = useCallback(
        (type: 'hotel' | 'peluqueria') => {
            const availability: CalendarAvailability = {}

            if (type === 'hotel') {
                reservations
                    .filter(res => res.type === 'hotel' && res.status !== 'cancelled')
                    .forEach(reservation => {
                        const hotelReservation = reservation as HotelReservation
                        if (hotelReservation.checkInDate && hotelReservation.checkOutDate) {
                            let currentDate = new Date(hotelReservation.checkInDate)
                            const endDate = new Date(hotelReservation.checkOutDate)

                            while (currentDate <= endDate) {
                                const dateStr = format(currentDate, 'yyyy-MM-dd')
                                availability[dateStr] = (availability[dateStr] || 0) + 1
                                currentDate = addDays(currentDate, 1)
                            }
                        }
                    })
            } else {
                reservations
                    .filter(res => res.type === 'peluqueria' && res.status !== 'cancelled')
                    .forEach(reservation => {
                        const dateStr = reservation.date
                        availability[dateStr] = (availability[dateStr] || 0) + 1
                    })
            }

            return availability
        },
        [reservations],
    )

    return (
        <ReservationContext.Provider
            value={{
                reservations,
                addReservation,
                updateReservation,
                deleteReservation,
                getReservationsByDate,
                getReservationsByClientId,
                getCalendarAvailability,
                isLoading,
            }}
        >
            {children}
        </ReservationContext.Provider>
    )
}
