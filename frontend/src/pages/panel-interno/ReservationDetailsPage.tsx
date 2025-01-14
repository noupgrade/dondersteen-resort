import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { useReservation } from '@/components/ReservationContext'
import { type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'

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
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-lg text-gray-600">Cargando...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <ReservationViewer
                reservation={reservation}
                isOpen={true}
                onClose={() => navigate('/panel-interno')}
            />
        </div>
    )
}
