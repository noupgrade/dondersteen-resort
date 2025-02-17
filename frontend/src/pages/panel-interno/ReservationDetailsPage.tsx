import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useReservation } from '@/components/ReservationContext'
import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { type HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { type HotelReservation } from '@monorepo/functions/src/types/reservations'

export default function ReservationDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { reservations } = useReservation()
    const [reservation, setReservation] = useState<HairSalonReservation | HotelReservation | null>(null)

    useEffect(() => {
        const foundReservation = reservations.find(r => r.id === id)
        if (foundReservation) {
            setReservation(foundReservation)
        } else {
            // Si no se encuentra la reserva, redirigir al panel interno
            navigate('/panel-interno')
        }
    }, [id, reservations, navigate])

    if (!reservation) {
        return (
            <div className='flex min-h-screen items-center justify-center bg-gray-100'>
                <p className='text-lg text-gray-600'>Cargando...</p>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-gray-100'>
            <ReservationViewer reservation={reservation} isOpen={true} onClose={() => navigate('/panel-interno')} />
        </div>
    )
}
