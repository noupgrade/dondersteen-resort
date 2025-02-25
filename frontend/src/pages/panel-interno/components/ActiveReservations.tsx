import { useEffect, useMemo, useState } from 'react'

import { format } from 'date-fns'

import { useConfirmedHotelDayReservations } from '@/components/ReservationContext'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'

import { ReservationCard } from './ReservationCard'
import { SearchBar } from './SearchBar'

type ActiveReservationsProps = {
    onViewReservation: (reservation: HotelReservation) => void
}

export const ActiveReservations = ({ onViewReservation }: ActiveReservationsProps) => {
    console.log('ActiveReservations')
    const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
    const { reservations, isLoading } = useConfirmedHotelDayReservations(today)
    console.log('ActiveReservations: reservations', reservations)
    const [filteredReservations, setFilteredReservations] = useState<HotelReservation[]>([])
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        console.log('mounted')
        return () => {
            console.log('unmounted')
        }
    }, [])

    useEffect(() => {
        console.log('reservations', reservations)
    }, [reservations])

    useEffect(() => {
        console.log('filteredReservations', filteredReservations)
    }, [filteredReservations])

    useEffect(() => {
        console.log('searchTerm', searchTerm)
    }, [searchTerm])

    useEffect(() => {
        if (searchTerm) {
            const filtered = reservations.filter(reservation => {
                const clientName = reservation.client.name.toLowerCase()
                const petNames = reservation.pets.map(pet => pet.name.toLowerCase())
                const search = searchTerm.toLowerCase()

                return clientName.includes(search) || petNames.some(name => name.includes(search))
            })
            setFilteredReservations(filtered)
        } else {
            setFilteredReservations(reservations)
        }
    }, [searchTerm, reservations])

    if (isLoading) {
        return <div className='py-8 text-center text-muted-foreground'>Cargando reservas activas...</div>
    }

    return (
        <div className='space-y-4'>
            <SearchBar value={searchTerm} onChange={setSearchTerm} />

            {filteredReservations.map(reservation => (
                <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onClick={() => onViewReservation(reservation)}
                />
            ))}

            {filteredReservations.length === 0 && searchTerm && (
                <div className='py-8 text-center text-muted-foreground'>
                    No se encontraron reservas que coincidan con la búsqueda
                </div>
            )}

            {filteredReservations.length === 0 && !searchTerm && (
                <div className='py-8 text-center text-muted-foreground'>No hay reservas activas para hoy</div>
            )}
        </div>
    )
}
