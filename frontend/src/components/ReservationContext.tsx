import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

import { addDays, format } from 'date-fns'

import { addReservation as addReservationApi } from '@/shared/api/reservations'
import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { EXAMPLE_RESERVATIONS } from '@/shared/mocks/example-reservations'
import { HairSalonReservation, HotelReservation, Reservation } from '@monorepo/functions/src/types/reservations'

type CalendarAvailability = {
    [date: string]: number
}

type ReservationDocument = Reservation & FSDocument

export type { ReservationDocument }

type ReservationContextType = {
    reservations: ReservationDocument[]
    unscheduledHairSalonReservations: HairSalonReservation[]
    addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<ReservationDocument>
    updateReservation: (id: string, updatedData: Partial<Reservation>) => Promise<void>
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

export const useUnscheduledHairSalonReservations = (): { reservations: HairSalonReservation[] } => {
    const { unscheduledHairSalonReservations } = useReservation()
    return { reservations: unscheduledHairSalonReservations }
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

        EXAMPLE_RESERVATIONS.forEach(example => {
            if (!allReservations.some(r => r.id === example.id)) {
                allReservations.push(example)
            }
        })

        return allReservations
    }, [dbReservations])

    const unscheduledHairSalonReservations = useMemo(() => {
        return reservations.filter(
            (r): r is HairSalonReservation =>
                r.type === 'peluqueria' && r.status === 'confirmed' && (!r.tasks || r.tasks.length === 0),
        )
    }, [reservations])

    const addReservation = useCallback(async (reservation: Omit<Reservation, 'id'>) => {
        // If it's an example reservation
        if (reservation.client?.id?.startsWith('EXAMPLE_')) {
            const newReservation = {
                ...reservation,
                id: `EXAMPLE_${Date.now()}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            } as ReservationDocument

            const storedExampleReservations = localStorage.getItem('exampleReservations')
            const parsedExampleReservations = storedExampleReservations
                ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
                : (EXAMPLE_RESERVATIONS as ReservationDocument[])

            const updatedReservations = [...parsedExampleReservations, newReservation]
            localStorage.setItem('exampleReservations', JSON.stringify(updatedReservations))
            return newReservation
        }

        // Call the backend function
        const result = await addReservationApi(reservation)
        return result.data as ReservationDocument
    }, [])

    const updateReservation = useCallback(
        async (id: string, updatedData: Partial<Reservation>) => {
            // If it's an example reservation, update it in local storage
            if (id.startsWith('EXAMPLE_')) {
                const storedExampleReservations = localStorage.getItem('exampleReservations')
                const parsedExampleReservations = storedExampleReservations
                    ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
                    : (EXAMPLE_RESERVATIONS as ReservationDocument[])

                const updatedReservations = parsedExampleReservations.map(r =>
                    r.id === id
                        ? {
                              ...r,
                              ...updatedData,
                              updatedAt: new Date().toISOString(),
                          }
                        : r,
                )
                localStorage.setItem('exampleReservations', JSON.stringify(updatedReservations))
                return Promise.resolve()
            }
            await updateDocument(id, updatedData)
        },
        [updateDocument],
    )

    const deleteReservation = useCallback(
        async (id: string) => {
            // If it's an example reservation, remove it from local storage
            if (id.startsWith('EXAMPLE_')) {
                const storedExampleReservations = localStorage.getItem('exampleReservations')
                const parsedExampleReservations = storedExampleReservations
                    ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
                    : (EXAMPLE_RESERVATIONS as ReservationDocument[])

                const updatedReservations = parsedExampleReservations.filter(r => r.id !== id)
                localStorage.setItem('exampleReservations', JSON.stringify(updatedReservations))
                return Promise.resolve()
            }
            await removeDocument(id)
        },
        [removeDocument],
    )

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
                unscheduledHairSalonReservations,
                addReservation,
                updateReservation,
                deleteReservation,
                getReservationsByClientId,
                getReservationsByDate,
                getCalendarAvailability,
                isLoading,
            }}
        >
            {children}
        </ReservationContext.Provider>
    )
}
