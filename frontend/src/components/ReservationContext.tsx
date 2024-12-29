import React, { createContext, useCallback, useContext } from 'react'

import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { addDays, format } from 'date-fns'

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
    }[]
    additionalServices: string[]
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
    additionalServices: string[]
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

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        results: reservations,
        isLoading,
        addDocument,
        updateDocument,
        removeDocument,
    } = useCollection<ReservationDocument>({
        path: 'reservations',
        orderBy: ['createdAt', 'desc'],
        limit: 100,
    })

    const addReservation = useCallback(async (reservation: Omit<HotelReservation, 'id'> | Omit<HairSalonReservation, 'id'>) => {
        return await addDocument(reservation)
    }, [addDocument])

    const updateReservation = useCallback(async (id: string, updatedData: Partial<HotelReservation | HairSalonReservation>) => {
        await updateDocument(id, updatedData)
    }, [updateDocument])

    const deleteReservation = useCallback(async (id: string) => {
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
