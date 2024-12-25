'use client'

import { useState } from 'react'

import { Clock, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { useReservation } from '@/components/ReservationContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

type CheckOut = {
    id: string
    clientName: string
    pets: {
        name: string
        breed: string
    }[]
    roomNumber: string
    checkOutTime: string
    paymentStatus: 'Pagado' | 'Pendiente'
    totalAmount: number
}

export function CheckOuts() {
    const router = useRouter()
    const { reservations, updateReservation } = useReservation()
    const [confirmedCheckOuts, setConfirmedCheckOuts] = useState<string[]>([])

    // Filter check-outs for today
    const checkOuts: CheckOut[] = reservations
        .filter(r => r.type === 'hotel' && new Date(r.checkOutDate).toDateString() === new Date().toDateString())
        .map(r => ({
            id: r.id,
            clientName: r.client.name,
            pets: r.pets || [],
            roomNumber: r.roomNumber,
            checkOutTime: r.time,
            paymentStatus: r.paymentStatus || 'Pendiente',
            totalAmount: r.totalPrice || 0,
        }))

    const handleConfirmCheckOut = (id: string) => {
        updateReservation(id, { status: 'completed' })
        setConfirmedCheckOuts([...confirmedCheckOuts, id])
    }

    const handlePaymentAndCheckOut = (id: string) => {
        updateReservation(id, { status: 'completed', paymentStatus: 'Pagado' })
        setConfirmedCheckOuts([...confirmedCheckOuts, id])
    }

    const handleViewDetails = (id: string) => {
        router.push(`/panel-interno/reservas/${id}`)
    }

    return (
        <div className='space-y-4'>
            {checkOuts.map(checkOut => (
                <Card key={checkOut.id} className='overflow-hidden'>
                    <CardHeader className='bg-gray-50'>
                        <CardTitle className='flex items-center justify-between text-lg font-semibold'>
                            <span>
                                {checkOut.clientName} - {checkOut.pets.map(pet => pet.name).join(', ')}
                            </span>
                            <Badge variant={checkOut.paymentStatus === 'Pagado' ? 'default' : 'destructive'}>
                                {checkOut.paymentStatus}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-4'>
                        <div className='space-y-2'>
                            <p className='text-sm text-gray-600'>
                                <strong>Mascota(s):</strong>{' '}
                                {checkOut.pets.map(pet => `${pet.name} (${pet.breed})`).join(', ')}
                            </p>
                            <p className='text-sm text-gray-600'>
                                <strong>Habitación:</strong> {checkOut.roomNumber}
                            </p>
                            <div className='flex items-center text-sm text-gray-600'>
                                <Clock className='mr-2 h-4 w-4' />
                                <strong>Hora de salida:</strong> {checkOut.checkOutTime}
                            </div>
                            {checkOut.paymentStatus === 'Pendiente' && (
                                <div className='flex items-center text-sm text-red-600'>
                                    <DollarSign className='mr-2 h-4 w-4' />
                                    <strong>Importe pendiente:</strong> €{checkOut.totalAmount.toFixed(2)}
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className='flex justify-between bg-gray-50'>
                        <Button variant='outline' onClick={() => handleViewDetails(checkOut.id)}>
                            Ver detalles
                        </Button>
                        {!confirmedCheckOuts.includes(checkOut.id) &&
                            (checkOut.paymentStatus === 'Pagado' ? (
                                <Button onClick={() => handleConfirmCheckOut(checkOut.id)}>Confirmar salida</Button>
                            ) : (
                                <Button onClick={() => handlePaymentAndCheckOut(checkOut.id)}>
                                    Cobrar y confirmar salida
                                </Button>
                            ))}
                        {confirmedCheckOuts.includes(checkOut.id) && (
                            <Badge variant='outline' className='ml-2'>
                                Salida confirmada
                            </Badge>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
    )
}
