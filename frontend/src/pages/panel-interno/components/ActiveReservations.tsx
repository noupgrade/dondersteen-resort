import { HotelReservation } from '@monorepo/functions/src/types/reservations'

import { ReservationCard } from './ReservationCard'
import { SearchBar } from './SearchBar'

type ActiveReservationsProps = {
    filteredReservations: HotelReservation[]
    searchTerm: string
    onSearch: (value: string) => void
    onViewReservation: (reservation: HotelReservation) => void
}

export const ActiveReservations = ({
    filteredReservations,
    searchTerm,
    onSearch,
    onViewReservation,
}: ActiveReservationsProps) => (
    <div className='space-y-4'>
        <SearchBar value={searchTerm} onChange={onSearch} />

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
    </div>
)
