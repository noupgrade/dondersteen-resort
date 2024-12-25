import React, { createContext, useCallback, useContext, useState } from 'react'

import { addDays, format } from 'date-fns'

type Reservation = {
    id: string
    type: 'hotel' | 'peluqueria'
    date: string
    time: string
    checkOutDate?: string
    client: {
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
    pets: { name: string; size: 'pequeño' | 'mediano' | 'grande'; breed: string; weight: number }[]
    additionalServices: string[]
    roomNumber: string
    status:
        | 'pending'
        | 'confirmed'
        | 'completed'
        | 'cancelled'
        | 'propuesta peluqueria'
        | 'servicio solicitado'
        | 'cancelacion solicitada'
    totalPrice: number
    specialNeeds?: string
    paymentStatus: 'Pagado' | 'Pendiente'
}

type CalendarAvailability = {
    [date: string]: number
}

type ReservationContextType = {
    reservations: Reservation[]
    addReservation: (reservation: Partial<Reservation>) => Promise<void>
    updateReservation: (id: string, updatedData: Partial<Reservation>) => Promise<void>
    deleteReservation: (id: string) => Promise<void>
    getReservationsByClientId: (clientId: string) => Reservation[]
    getReservationsByDate: (date: string) => Reservation[]
    getCalendarAvailability: (type: 'hotel' | 'peluqueria') => CalendarAvailability
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
    const [reservations, setReservations] = useState<Reservation[]>([])

    const addReservation = useCallback(async (reservation: Partial<Reservation>) => {
        const newReservation: Reservation = {
            id: Date.now().toString(),
            type: reservation.type || 'hotel',
            date: reservation.date || format(new Date(), 'yyyy-MM-dd'),
            time: reservation.time || '12:00',
            checkOutDate: reservation.checkOutDate,
            client: reservation.client || { name: '', phone: '', email: '' },
            pet: reservation.pet || { name: '', breed: '', weight: 0, size: 'pequeño' },
            pets: reservation.pets || [{ name: '', breed: '', weight: 0, size: 'pequeño' }],
            additionalServices: reservation.additionalServices || [],
            roomNumber: reservation.roomNumber || '',
            status: reservation.status || 'pending',
            totalPrice: reservation.totalPrice || 0,
            paymentStatus: reservation.paymentStatus || 'Pendiente',
        }

        setReservations(prev => [...prev, newReservation])
    }, [])

    const updateReservation = useCallback(async (id: string, updatedData: Partial<Reservation>) => {
        console.log('Updating reservation:', { id, updatedData })
        setReservations(prev => {
            const newReservations = prev.map(reservation =>
                reservation.id === id ? { ...reservation, ...updatedData } : reservation,
            )
            console.log('New reservations state:', newReservations)
            return newReservations
        })
    }, [])

    const deleteReservation = useCallback(async (id: string) => {
        setReservations(prev => prev.filter(reservation => reservation.id !== id))
    }, [])

    const getReservationsByDate = useCallback(
        (date: string) => {
            return reservations.filter(r => r.date === date)
        },
        [reservations],
    )

    const getReservationsByClientId = useCallback(
        (id: string) => {
            return reservations.filter(r => r.client.id === id)
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
                        if (reservation.date && reservation.checkOutDate) {
                            let currentDate = new Date(reservation.date)
                            const endDate = new Date(reservation.checkOutDate)

                            while (currentDate <= endDate) {
                                const dateStr = format(currentDate, 'yyyy-MM-dd')
                                availability[dateStr] = (availability[dateStr] || 0) + 1
                                currentDate = addDays(currentDate, 1)
                            }
                        }
                    })
            } else {
                // Handle peluqueria availability if needed
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
            }}
        >
            {children}
        </ReservationContext.Provider>
    )
}
