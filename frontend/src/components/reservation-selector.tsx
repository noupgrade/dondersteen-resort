'use client'

import { useState } from 'react'

import { useReservation } from '@/components/ReservationContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ReservationSelector() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedReservation, setSelectedReservation] = useState<any | null>(null)
    const { reservations } = useReservation()

    const filteredReservations = reservations.filter(
        r => r.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.includes(searchTerm),
    )

    return (
        <div className='space-y-4'>
            <Input
                placeholder='Buscar reserva por nombre de cliente o ID...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <div className='space-y-2'>
                {filteredReservations.map(reservation => (
                    <Button
                        key={reservation.id}
                        variant='outline'
                        className='w-full justify-start'
                        onClick={() => setSelectedReservation(reservation)}
                    >
                        {reservation.client.name} - ID: {reservation.id}
                    </Button>
                ))}
            </div>
            {selectedReservation && (
                <div className='rounded border p-4'>
                    <h3 className='font-bold'>Reserva Seleccionada:</h3>
                    <p>Cliente: {selectedReservation.client.name}</p>
                    <p>ID: {selectedReservation.id}</p>
                    <p>Fecha: {selectedReservation.date}</p>
                </div>
            )}
        </div>
    )
}
