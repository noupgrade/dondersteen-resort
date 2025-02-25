import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { format } from 'date-fns'

import { addReservation as addReservationApi } from '@/shared/api/reservations'
import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { EXAMPLE_RESERVATIONS } from '@/shared/mocks/example-reservations'
import { getReservationsByDate } from '@/shared/utils/reservations'
import {
    HairSalonReservation,
    HotelReservation,
    PetSize,
    Reservation,
} from '@monorepo/functions/src/types/reservations'

type ReservationDocument = Reservation & FSDocument

export type { ReservationDocument }

type ExampleReservationsContextType = {
    exampleReservations: ReservationDocument[]
    addExampleReservation: (reservation: ReservationDocument) => void
    updateExampleReservation: (id: string, updatedData: Partial<Reservation>) => void
    deleteExampleReservation: (id: string) => void
    exampleHotelReservations: HotelReservation[]
    exampleHairSalonReservations: HairSalonReservation[]
}

const ExampleReservationsContext = createContext<ExampleReservationsContextType | undefined>(undefined)

export const useExampleReservations = () => {
    const context = useContext(ExampleReservationsContext)
    if (!context) {
        throw new Error('useExampleReservations must be used within an ExampleReservationsProvider')
    }
    return context
}

export const ExampleReservationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    console.log('ExampleReservationsProvider')
    const [exampleReservations, setExampleReservations] = useState<ReservationDocument[]>(() => {
        const storedExampleReservations = localStorage.getItem('exampleReservations')
        return storedExampleReservations
            ? (JSON.parse(storedExampleReservations) as ReservationDocument[])
            : EXAMPLE_RESERVATIONS
    })

    const addExampleReservation = useCallback((reservation: ReservationDocument) => {
        setExampleReservations(prev => {
            const updated = [...prev, reservation]
            localStorage.setItem('exampleReservations', JSON.stringify(updated))
            return updated
        })
    }, [])

    const updateExampleReservation = useCallback((id: string, updatedData: Partial<Reservation>) => {
        setExampleReservations(prev => {
            const updated = prev.map(r =>
                r.id === id
                    ? {
                          ...r,
                          ...updatedData,
                          updatedAt: new Date().toISOString(),
                      }
                    : r,
            )
            localStorage.setItem('exampleReservations', JSON.stringify(updated))
            return updated as ReservationDocument[]
        })
    }, [])

    const deleteExampleReservation = useCallback((id: string) => {
        setExampleReservations(prev => {
            const updated = prev.filter(r => r.id !== id)
            localStorage.setItem('exampleReservations', JSON.stringify(updated))
            return updated
        })
    }, [])

    const exampleHotelReservations = useMemo(() => {
        console.log('ExampleReservationsProvider: exampleReservations', exampleReservations)
        return exampleReservations.filter((r): r is HotelReservation => r.type === 'hotel')
    }, [exampleReservations])

    const exampleHairSalonReservations = useMemo(() => {
        return exampleReservations.filter((r): r is HairSalonReservation => r.type === 'peluqueria')
    }, [exampleReservations])

    return (
        <ExampleReservationsContext.Provider
            value={{
                exampleReservations,
                addExampleReservation,
                updateExampleReservation,
                deleteExampleReservation,
                exampleHotelReservations,
                exampleHairSalonReservations,
            }}
        >
            {children}
        </ExampleReservationsContext.Provider>
    )
}

type ReservationContextType = {
    reservations: ReservationDocument[] // TODO REMOVE THIS FIELD, RESERVATIONS SHOULD BE FILTERED IN THE CONTEXT
    unscheduledHairSalonReservations: HairSalonReservation[]
    addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<ReservationDocument>
    updateReservation: (id: string, updatedData: Partial<Reservation>) => Promise<void>
    deleteReservation: (id: string) => Promise<void>
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
    const { exampleHotelReservations } = useExampleReservations()
    const hotelReservations = useMemo(
        () => [...reservations.filter(r => r.type === 'hotel'), ...exampleHotelReservations],
        [reservations, exampleHotelReservations],
    )

    return {
        reservations: hotelReservations,
    }
}

export const useHairSalonReservations = (): { reservations: HairSalonReservation[] } => {
    const { reservations } = useReservation()
    const { exampleHairSalonReservations } = useExampleReservations()
    const hairSalonReservations = useMemo(
        () => [...reservations.filter(r => r.type === 'peluqueria'), ...exampleHairSalonReservations],
        [reservations, exampleHairSalonReservations],
    )

    return {
        reservations: hairSalonReservations,
    }
}

export const useUnscheduledHairSalonReservations = (): { reservations: HairSalonReservation[] } => {
    const { reservations } = useReservation()
    return { reservations: reservations.filter(r => r.type === 'peluqueria') }
}

export const useConfirmedHotelDayReservations = (date: string) => {
    const [whereClauses] = useMemo(() => {
        return [
            [
                ['type', '==', 'hotel'],
                ['status', '==', 'confirmed'],
                ['checkInDate', '<=', date],
                ['checkOutDate', '>=', date],
            ],
        ]
    }, [date])

    const { results: reservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: whereClauses as any,
    })

    const { exampleHotelReservations } = useExampleReservations()

    const allReservations = useMemo(() => {
        return [...reservations, ...getReservationsByDate(exampleHotelReservations, date)]
    }, [reservations, exampleHotelReservations])

    return {
        reservations: allReservations as HotelReservation[],
        isLoading,
    }
}

export const useHotelConfirmedTodayReservations = () => {
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
    const { reservations, isLoading } = useConfirmedHotelDayReservations(today)
    const todayCheckIns = useMemo(() => reservations.filter(r => r.checkInDate === today), [reservations, today])

    return {
        reservations: todayCheckIns,
        isLoading,
    }
}

export const useTodayCheckIns = () => {
    const { reservations, isLoading } = useHotelConfirmedTodayReservations()
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

    const checkIns = useMemo(() => {
        return reservations.filter(r => r.checkInDate === today)
    }, [reservations, today])

    return {
        reservations: checkIns,
        isLoading,
    }
}

export const useCheckIns = () => {
    const { updateReservation } = useReservation()
    const { reservations: checkIns, isLoading } = useTodayCheckIns()

    const handleRoomAssign = useCallback(
        (reservationId: string, petName: string, room: string) => {
            const reservation = checkIns.find(r => r.id === reservationId)
            if (reservation) {
                const updatedPets = reservation.pets.map(p => (p.name === petName ? { ...p, roomNumber: room } : p))
                updateReservation(reservationId, { pets: updatedPets })
            }
        },
        [checkIns, updateReservation],
    )

    const handleSizeChange = useCallback(
        async (reservationId: string, petIndex: number, size: PetSize) => {
            const reservation = checkIns.find(r => r.id === reservationId)
            if (!reservation) return

            const updatedPets = [...reservation.pets]
            const oldSize = updatedPets[petIndex].size
            updatedPets[petIndex] = { ...updatedPets[petIndex], size }

            const priceAdjustments: Record<PetSize, number> = {
                pequeño: 20,
                mediano: 25,
                grande: 30,
            }

            const oldPrice = priceAdjustments[oldSize]
            const newPrice = priceAdjustments[size]
            const priceDifference = newPrice - oldPrice

            const newTotalPrice = reservation.totalPrice + priceDifference
            const updateData = {
                pets: updatedPets,
                totalPrice: newTotalPrice,
            }

            await updateReservation(reservationId, updateData)
        },
        [checkIns, updateReservation],
    )

    return {
        checkIns,
        isLoading,
        handleRoomAssign,
        handleSizeChange,
    }
}

export const useTodayCheckOuts = () => {
    const { reservations, isLoading } = useHotelConfirmedTodayReservations()
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])

    const checkOuts = useMemo(() => {
        return reservations.filter(r => r.checkOutDate === today)
    }, [reservations, today])

    return {
        reservations: checkOuts,
        isLoading,
    }
}
const pendingHotelRequestsWhereClauses = [
    ['type', 'in', ['hotel', 'hotel-budget']],
    ['status', '==', 'pending'],
]
export const usePendingHotelRequests = () => {
    const { results: reservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: pendingHotelRequestsWhereClauses as any,
    })

    const { exampleReservations } = useExampleReservations()
    const activeExampleReservations = useMemo(() => {
        return exampleReservations.filter(
            r => (r.type === 'hotel' && r.status === 'pending') || r.type === 'hotel-budget',
        )
    }, [exampleReservations])

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
    const [whereClauses] = useMemo(() => {
        return [
            [
                ['type', '==', 'hotel'],
                ['status', '==', 'confirmed'],
                ['checkInDate', '<=', date],
                ['checkOutDate', '>=', date],
            ],
        ]
    }, [date])
    const { results: dbReservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: whereClauses as any,
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

export const useHotelWeekReservations = (startDate: string, endDate: string) => {
    const [whereClauses] = useMemo(() => {
        console.log('useHotelWeekReservations: useMemo')
        return [
            [
                ['type', '==', 'hotel'],
                ['status', '==', 'confirmed'],
                ['checkInDate', '<=', endDate], // TODO: Check if this is correct
                ['checkOutDate', '>=', startDate],
            ],
        ]
    }, [startDate, endDate])

    const { results: dbReservations, isLoading } = useCollection<ReservationDocument>({
        path: 'reservations',
        where: whereClauses as any,
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
                r.checkInDate <= endDate &&
                r.checkOutDate >= startDate,
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
    // TODO MAYBE REMOVE
    const { pendingReservations, isLoading } = usePendingHotelRequests()
    const pendingReservation = useMemo(
        () => pendingReservations.find(r => r.id === reservationId),
        [pendingReservations, reservationId],
    )

    return { pendingReservation, isLoading }
}

export const InnerReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {
        results: dbReservations,
        isLoading,
        updateDocument,
        removeDocument,
    } = useCollection<ReservationDocument>({
        path: 'reservations',
        orderBy: ['createdAt', 'desc'],
        limit: 100,
    })
    console.log('dbReservations', dbReservations)

    const { exampleReservations, addExampleReservation, updateExampleReservation, deleteExampleReservation } =
        useExampleReservations()

    const reservations = useMemo(() => {
        return [...dbReservations, ...exampleReservations] as ReservationDocument[]
    }, [dbReservations, exampleReservations])

    const addReservation = useCallback(
        async (reservation: Omit<Reservation, 'id'>) => {
            if (reservation.client?.id?.startsWith('EXAMPLE_')) {
                const newReservation = {
                    ...reservation,
                    id: `EXAMPLE_${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                } as ReservationDocument
                addExampleReservation(newReservation)
                return newReservation
            }
            const result = await addReservationApi(reservation)
            return result.data as ReservationDocument
        },
        [addExampleReservation],
    )

    const updateReservation = useCallback(
        async (id: string, updatedData: Partial<Reservation>) => {
            if (id.startsWith('EXAMPLE_')) {
                updateExampleReservation(id, updatedData)
                return
            }
            await updateDocument(id, {
                ...updatedData,
                updatedAt: new Date().toISOString(),
            })
        },
        [updateDocument, updateExampleReservation],
    )

    const deleteReservation = useCallback(
        async (id: string) => {
            if (id.startsWith('EXAMPLE_')) {
                deleteExampleReservation(id)
                return
            }
            await removeDocument(id)
        },
        [removeDocument, deleteExampleReservation],
    )

    const unscheduledHairSalonReservations = useMemo(() => {
        return reservations.filter(
            (r): r is HairSalonReservation =>
                r.type === 'peluqueria' && r.status === 'confirmed' && (!r.tasks || r.tasks.length === 0),
        )
    }, [reservations])

    return (
        <ReservationContext.Provider
            value={{
                reservations,
                unscheduledHairSalonReservations,
                addReservation,
                updateReservation,
                deleteReservation,
                isLoading,
            }}
        >
            {children}
        </ReservationContext.Provider>
    )
}

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <ExampleReservationsProvider>
            <InnerReservationProvider>{children}</InnerReservationProvider>
        </ExampleReservationsProvider>
    )
}
