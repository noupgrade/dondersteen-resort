import React, { createContext, useCallback, useContext, useMemo } from 'react'

import { format } from 'date-fns'

import { addReservation as addReservationApi } from '@/shared/api/reservations'
import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { EXAMPLE_RESERVATIONS } from '@/shared/mocks/example-reservations'
import { HairSalonReservation, HotelReservation, Reservation } from '@monorepo/functions/src/types/reservations'

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

export const useConfirmedHotelDayReservations = (date: string) => {
    const { results: reservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: [
            ['type', '==', 'hotel'],
            ['status', '==', 'confirmed'],
            ['checkInDate', '<=', date],
            ['checkOutDate', '>=', date],
        ],
    })

    const activeExampleReservations = useMemo(() => {
        const storedExampleReservations = localStorage.getItem('exampleReservations')
        const exampleReservations = storedExampleReservations
            ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
            : EXAMPLE_RESERVATIONS

        return exampleReservations.filter(r => r.type === 'hotel' && r.checkInDate <= date && r.checkOutDate >= date)
    }, [date])

    const allReservations = useMemo(() => {
        return [...reservations, ...activeExampleReservations]
    }, [reservations, activeExampleReservations])

    return {
        reservations: allReservations as HotelReservation[],
        isLoading,
    }
}

export const useHotelConfirmedTodayReservations = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const { reservations, isLoading } = useConfirmedHotelDayReservations(today)
    const todayCheckIns = reservations.filter(r => r.checkInDate === today)

    return {
        reservations: todayCheckIns,
        isLoading,
    }
}

export const useTodayCheckIns = () => {
    const { reservations, isLoading } = useHotelConfirmedTodayReservations()
    const today = format(new Date(), 'yyyy-MM-dd')

    const checkIns = useMemo(() => {
        return reservations.filter(r => r.checkInDate === today)
    }, [reservations, today])

    return {
        reservations: checkIns,
        isLoading,
    }
}

export const useTodayCheckOuts = () => {
    const { reservations, isLoading } = useHotelConfirmedTodayReservations()
    const today = format(new Date(), 'yyyy-MM-dd')

    const checkOuts = useMemo(() => {
        return reservations.filter(r => r.checkOutDate === today)
    }, [reservations, today])

    return {
        reservations: checkOuts,
        isLoading,
    }
}

export const usePendingHotelRequests = () => {
    const { results: reservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: [
            ['type', 'in', ['hotel', 'hotel-budget']],
            ['status', '==', 'pending'],
        ],
    })

    const activeExampleReservations = useMemo(() => {
        const storedExampleReservations = localStorage.getItem('exampleReservations')
        const exampleReservations = storedExampleReservations
            ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
            : EXAMPLE_RESERVATIONS

        return exampleReservations.filter(
            r => (r.type === 'hotel' && r.status === 'pending') || r.type === 'hotel-budget',
        )
    }, [])

    const allReservations = useMemo(() => {
        return [...reservations, ...activeExampleReservations]
    }, [reservations, activeExampleReservations])

    const pendingReservations = useMemo(() => {
        return allReservations.filter((r): r is HotelReservation => r.type === 'hotel' && r.status === 'pending')
    }, [allReservations])

    const budgets = useMemo(() => {
        return allReservations.filter((r): r is HotelReservation => r.type === 'hotel-budget')
    }, [allReservations])

    return {
        pendingReservations,
        budgets,
        isLoading,
    }
}

export const useHotelDayReservations = (date: string) => {
    const { results: dbReservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: [
            ['type', '==', 'hotel'],
            ['status', '==', 'confirmed'],
            ['checkInDate', '<=', date],
            ['checkOutDate', '>=', date],
        ],
    })

    const activeExampleReservations = useMemo(() => {
        const storedExampleReservations = localStorage.getItem('exampleReservations')
        const exampleReservations = storedExampleReservations
            ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
            : EXAMPLE_RESERVATIONS

        return exampleReservations.filter(
            r => r.type === 'hotel' && r.status === 'confirmed' && r.checkInDate <= date && r.checkOutDate >= date,
        )
    }, [date])

    const allReservations = useMemo(() => {
        return [...dbReservations, ...activeExampleReservations] as HotelReservation[]
    }, [dbReservations, activeExampleReservations])

    const stats = useMemo(() => {
        const petsBySize = allReservations.reduce(
            (sizes, reservation) => {
                reservation.pets.forEach(pet => {
                    sizes[pet.size]++
                })
                return sizes
            },
            { grande: 0, mediano: 0, pequeño: 0 },
        )

        return {
            reservations: allReservations,
            totalPets: allReservations.reduce((total, reservation) => total + reservation.pets.length, 0),
            petsBySize,
        }
    }, [allReservations])

    return { ...stats, isLoading }
}

export const useHotelWeekReservations = (startDate: Date, endDate: Date) => {
    const { results: dbReservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: [
            ['type', '==', 'hotel'],
            ['status', '==', 'confirmed'],
            ['checkInDate', '<=', format(endDate, 'yyyy-MM-dd')],
            ['checkOutDate', '>=', format(startDate, 'yyyy-MM-dd')],
        ],
    })

    const activeExampleReservations = useMemo(() => {
        const storedExampleReservations = localStorage.getItem('exampleReservations')
        const exampleReservations = storedExampleReservations
            ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
            : EXAMPLE_RESERVATIONS

        return exampleReservations.filter(
            r =>
                r.type === 'hotel' &&
                r.status === 'confirmed' &&
                r.checkInDate <= format(endDate, 'yyyy-MM-dd') &&
                r.checkOutDate >= format(startDate, 'yyyy-MM-dd'),
        )
    }, [startDate, endDate])

    const allReservations = useMemo(() => {
        return [...dbReservations, ...activeExampleReservations] as HotelReservation[]
    }, [dbReservations, activeExampleReservations])

    const stats = useMemo(() => {
        const petsBySize = allReservations.reduce(
            (sizes, reservation) => {
                reservation.pets.forEach(pet => {
                    sizes[pet.size]++
                })
                return sizes
            },
            { grande: 0, mediano: 0, pequeño: 0 },
        )

        return {
            reservations: allReservations,
            totalPets: allReservations.reduce((total, reservation) => total + reservation.pets.length, 0),
            petsBySize,
        }
    }, [allReservations])

    return { ...stats, isLoading }
}

export const usePendingHotelReservation = (reservationId: string | null) => {
    const { results: dbReservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: [
            ['type', '==', 'hotel'],
            ['status', '==', 'pending'],
            ['id', '==', reservationId],
        ],
        enabled: !!reservationId,
    })

    const activeExampleReservations = useMemo(() => {
        if (!reservationId) return []

        const storedExampleReservations = localStorage.getItem('exampleReservations')
        const exampleReservations = storedExampleReservations
            ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
            : EXAMPLE_RESERVATIONS

        return exampleReservations.filter(r => r.type === 'hotel' && r.status === 'pending' && r.id === reservationId)
    }, [reservationId])

    const pendingReservation = useMemo(() => {
        const allReservations = [...dbReservations, ...activeExampleReservations]
        return allReservations.find((r): r is HotelReservation => r.type === 'hotel' && r.status === 'pending') || null
    }, [dbReservations, activeExampleReservations])

    return { pendingReservation, isLoading }
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
                isLoading,
            }}
        >
            {children}
        </ReservationContext.Provider>
    )
}
