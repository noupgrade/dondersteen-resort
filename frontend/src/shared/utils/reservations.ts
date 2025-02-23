import { ReservationDocument } from '@/components/ReservationContext'

export const getReservationsByDate = (reservations: ReservationDocument[], date: string) => {
    return reservations.filter(r => {
        if (r.type === 'hotel') {
            return r.checkInDate <= date && r.checkOutDate >= date
        }
        return r.date === date
    })
}
