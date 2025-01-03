import React, { createContext, useCallback, useContext, useMemo } from 'react'

import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { addDays, format } from 'date-fns'
import { EXAMPLE_RESERVATIONS } from '@/shared/mocks/example-reservations'
import { AdditionalService } from '@/shared/types/additional-services'

export type HotelReservation = {
    id: string
    type: 'hotel'
    checkInDate: string
    checkInTime: string
    checkOutDate: string
    client: {
        id?: string
        name: string
        phone: string
        email: string
    }
    pets: {
        name: string
        breed: string
        weight: number
        size: 'pequeño' | 'mediano' | 'grande'
        sex: 'M' | 'F'
        roomNumber?: string
    }[]
    additionalServices: AdditionalService[]
    roomNumber: string
    status:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    totalPrice: number
    paymentStatus: 'Pagado' | 'Pendiente'
    specialNeeds?: string
}

export type HairSalonReservation = {
    id: string
    type: 'peluqueria'
    date: string
    time: string
    client: {
        id?: string
        name: string
        phone: string
        email: string
    }
    pet: {
        name: string
        breed: string
        weight: number
        size: 'pequeño' | 'mediano' | 'grande'
    }
    additionalServices: AdditionalService[]
    status:
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'propuesta peluqueria'
    | 'servicio solicitado'
    | 'cancelacion solicitada'
    totalPrice: number
    paymentStatus: 'Pagado' | 'Pendiente'
    beforePhoto?: string
    afterPhoto?: string
    priceNote?: string
    source: 'hotel' | 'external'
    observations?: string
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

export const useHotelReservations = () => {
    const { reservations } = useReservation()
    return { reservations: reservations.filter(r => r.type === 'hotel') }
}

export const useHairSalonReservations = () => {
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

        // Only add example reservations if they don't conflict with existing ones
        EXAMPLE_RESERVATIONS.forEach(example => {
            if (!allReservations.some(r => r.id === example.id)) {
                allReservations.push(example as ReservationDocument)
            }
        })

        return allReservations
    }, [dbReservations])

    const addReservation = useCallback(async (reservation: Omit<HotelReservation, 'id'> | Omit<HairSalonReservation, 'id'>) => {
        // If it's an example reservation (you could add a flag or check the ID pattern)
        if (reservation.client?.id?.startsWith('EXAMPLE_')) {
            const newReservation = {
                ...reservation,
                id: `EXAMPLE_${Date.now()}`,
                createdAt: new Date(),
                updatedAt: new Date()
            } as ReservationDocument
            return newReservation
        }
        return await addDocument(reservation)
    }, [addDocument])

    const updateReservation = useCallback(async (id: string, updatedData: Partial<HotelReservation | HairSalonReservation>) => {
        // If it's an example reservation, just return
        if (id.startsWith('EXAMPLE_')) {
            return
        }
        await updateDocument(id, updatedData)
    }, [updateDocument])

    const deleteReservation = useCallback(async (id: string) => {
        // If it's an example reservation, just return
        if (id.startsWith('EXAMPLE_')) {
            return
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
