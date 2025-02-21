import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import { format } from 'date-fns'

import { addReservation as addReservationApi } from '@/shared/api/reservations'
import { useCollection } from '@/shared/firebase/hooks/useCollection'
import { FSDocument } from '@/shared/firebase/types'
import { EXAMPLE_RESERVATIONS } from '@/shared/mocks/example-reservations'
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
    getExampleReservationsByDate: (date: string) => ReservationDocument[]
    getExampleHotelReservations: () => HotelReservation[]
    getExampleHairSalonReservations: () => HairSalonReservation[]
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
            return updated
        })
    }, [])

    const deleteExampleReservation = useCallback((id: string) => {
        setExampleReservations(prev => {
            const updated = prev.filter(r => r.id !== id)
            localStorage.setItem('exampleReservations', JSON.stringify(updated))
            return updated
        })
    }, [])

    const getExampleReservationsByDate = useCallback(
        (date: string) => {
            return exampleReservations.filter(r => {
                if (r.type === 'hotel') {
                    return r.checkInDate <= date && r.checkOutDate >= date
                }
                return r.date === date
            })
        },
        [exampleReservations],
    )

    const getExampleHotelReservations = useCallback(() => {
        return exampleReservations.filter((r): r is HotelReservation => r.type === 'hotel')
    }, [exampleReservations])

    const getExampleHairSalonReservations = useCallback(() => {
        return exampleReservations.filter((r): r is HairSalonReservation => r.type === 'peluqueria')
    }, [exampleReservations])

    return (
        <ExampleReservationsContext.Provider
            value={{
                exampleReservations,
                addExampleReservation,
                updateExampleReservation,
                deleteExampleReservation,
                getExampleReservationsByDate,
                getExampleHotelReservations,
                getExampleHairSalonReservations,
            }}
        >
            {children}
        </ExampleReservationsContext.Provider>
    )
}

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
    const { getExampleHotelReservations } = useExampleReservations()
    const exampleHotelReservations = getExampleHotelReservations()

    return {
        reservations: [...reservations.filter(r => r.type === 'hotel'), ...exampleHotelReservations],
    }
}

export const useHairSalonReservations = (): { reservations: HairSalonReservation[] } => {
    const { reservations } = useReservation()
    const { getExampleHairSalonReservations } = useExampleReservations()
    const exampleHairSalonReservations = getExampleHairSalonReservations()

    return {
        reservations: [...reservations.filter(r => r.type === 'peluqueria'), ...exampleHairSalonReservations],
    }
}

export const useUnscheduledHairSalonReservations = (): { reservations: HairSalonReservation[] } => {
    const { reservations } = useReservation()
    return { reservations: reservations.filter(r => r.type === 'peluqueria') }
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

    const { getExampleReservationsByDate } = useExampleReservations()
    const exampleReservations = getExampleReservationsByDate(date).filter(r => r.type === 'hotel')

    const allReservations = useMemo(() => {
        return [...reservations, ...exampleReservations]
    }, [reservations, exampleReservations])

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
        console.log('reservations', reservations)
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
    const { updateExampleReservation } = useExampleReservations()

    const handleRoomAssign = useCallback(
        (reservationId: string, petName: string, room: string) => {
            const reservation = checkIns.find(r => r.id === reservationId)
            if (reservation) {
                const updatedPets = reservation.pets.map(p => (p.name === petName ? { ...p, roomNumber: room } : p))

                if (reservationId.startsWith('EXAMPLE_')) {
                    updateExampleReservation(reservationId, { pets: updatedPets })
                } else {
                    updateReservation(reservationId, { pets: updatedPets })
                }
            }
        },
        [checkIns, updateReservation, updateExampleReservation],
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

            if (reservationId.startsWith('EXAMPLE_')) {
                updateExampleReservation(reservationId, updateData)
            } else {
                await updateReservation(reservationId, updateData)
            }
        },
        [checkIns, updateReservation, updateExampleReservation],
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

    return (
        <ExampleReservationsProvider>
            <ReservationContext.Provider
                value={{
                    reservations: dbReservations,
                    unscheduledHairSalonReservations: dbReservations.filter(
                        (r): r is HairSalonReservation =>
                            r.type === 'peluqueria' && r.status === 'confirmed' && (!r.tasks || r.tasks.length === 0),
                    ),
                    addReservation: async (reservation: Omit<Reservation, 'id'>) => {
                        if (reservation.client?.id?.startsWith('EXAMPLE_')) {
                            const newReservation = {
                                ...reservation,
                                id: `EXAMPLE_${Date.now()}`,
                                createdAt: new Date().toISOString(),
                                updatedAt: new Date().toISOString(),
                            } as ReservationDocument
                            return newReservation
                        }
                        const result = await addReservationApi(reservation)
                        return result.data as ReservationDocument
                    },
                    updateReservation: async (id: string, updatedData: Partial<Reservation>) => {
                        if (id.startsWith('EXAMPLE_')) {
                            return
                        }
                        await updateDocument(id, updatedData)
                    },
                    deleteReservation: async (id: string) => {
                        if (id.startsWith('EXAMPLE_')) {
                            return
                        }
                        await removeDocument(id)
                    },
                    getReservationsByClientId: (clientId: string) => {
                        return dbReservations.filter(r => r.client.id === clientId)
                    },
                    getReservationsByDate: (date: string) => {
                        return dbReservations.filter(r => {
                            if (r.type === 'hotel') {
                                return r.checkInDate === date
                            }
                            return r.date === date
                        })
                    },
                    isLoading,
                }}
            >
                {children}
            </ReservationContext.Provider>
        </ExampleReservationsProvider>
    )
}
