'use client'

import { useEffect, useState } from 'react'

import { useReservation } from '@/components/ReservationContext'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

type Pet = {
    name: string
    breed: string
    weight: number
    size: string
}

type PendingRequest = {
    id: string
    clientName: string
    pets: Pet[]
    checkIn: string
    checkOut: string
    totalPrice: number
    additionalServices: string[]
    specialNeeds?: {
        [petName: string]: string
    }
    status: 'pending' | 'confirmed' | 'rejected'
}

export function PendingRequests() {
    const [expandedRequest, setExpandedRequest] = useState<string | null>(null)
    const { reservations, updateReservation } = useReservation()
    const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([])

    useEffect(() => {
        const filteredRequests = reservations
            .filter(r => r.type === 'hotel' && r.status === 'pending')
            .map(r => ({
                id: r.id,
                clientName: r.client.name,
                pets: r.pets || [],
                checkIn: r.checkInDate,
                checkOut: r.checkOutDate,
                totalPrice: r.totalPrice || 0,
                additionalServices: r.additionalServices,
                specialNeeds: r.specialNeeds
                    ? typeof r.specialNeeds === 'string'
                        ? { [r.pets?.[0]?.name || '']: r.specialNeeds }
                        : r.specialNeeds
                    : {},
                status: r.status || 'pending',
            }))
        setPendingRequests(filteredRequests)
    }, [reservations])

    const toggleRequest = (id: string) => {
        setExpandedRequest(expandedRequest === id ? null : id)
    }

    const handleAccept = async (id: string) => {
        try {
            await updateReservation(id, { status: 'confirmed' })
            setPendingRequests(prev => prev.filter(request => request.id !== id))
        } catch (error) {
            console.error('Error al aceptar la reserva:', error)
        }
    }

    const handleReject = async (id: string) => {
        try {
            await updateReservation(id, { status: 'rejected' })
            setPendingRequests(prev => prev.filter(request => request.id !== id))
        } catch (error) {
            console.error('Error al rechazar la reserva:', error)
        }
    }

    if (pendingRequests.length === 0) {
        return (
            <Card>
                <CardContent className='py-6 text-center'>
                    <p>No hay solicitudes pendientes en este momento.</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className='space-y-4'>
            {pendingRequests.map(request => (
                <Card key={request.id} className='overflow-hidden shadow-md'>
                    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                        <CardTitle className='text-lg font-semibold'>
                            {request.clientName} - {request.pets.map(pet => pet.name).join(' y ')}
                        </CardTitle>
                        <div className='flex items-center space-x-2'>
                            <Badge variant='outline'>Pendiente</Badge>
                            {request.additionalServices.length > 0 && (
                                <Badge variant='secondary'>Extras incluidos</Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className='cursor-pointer space-y-2' onClick={() => toggleRequest(request.id)}>
                            <div className='space-y-1 text-sm'>
                                <div>
                                    <span className='font-medium'>Check-in:</span> {request.checkIn}
                                </div>
                                <div>
                                    <span className='font-medium'>Check-out:</span> {request.checkOut}
                                </div>
                            </div>
                            <div className='text-sm'>
                                Mascotas: {request.pets.map(pet => `${pet.name} (${pet.breed})`).join(', ')}
                            </div>
                            {expandedRequest === request.id && (
                                <div className='mt-4 space-y-4 rounded-lg bg-gray-50 p-4'>
                                    {/* Pet Details Section */}
                                    {request.pets.slice(0, 2).map((pet, index) => (
                                        <div key={index} className='rounded-lg bg-white p-4 shadow-sm'>
                                            <h4 className='mb-2 text-lg font-semibold'>
                                                {pet.name} ({pet.breed})
                                            </h4>
                                            <div className='mb-2 grid grid-cols-2 gap-4'>
                                                <div>
                                                    <span className='text-sm text-gray-500'>Peso:</span>
                                                    <span className='ml-2 font-medium'>{pet.weight}kg</span>
                                                </div>
                                                <div>
                                                    <span className='text-sm text-gray-500'>Tamaño:</span>
                                                    <span className='ml-2 font-medium'>{pet.size}</span>
                                                </div>
                                            </div>
                                            {request.specialNeeds?.[pet.name] && (
                                                <div className='mt-2'>
                                                    <span className='text-sm text-gray-500'>
                                                        Necesidades especiales:
                                                    </span>
                                                    <p className='mt-1 text-sm'>{request.specialNeeds[pet.name]}</p>
                                                </div>
                                            )}
                                            {request.additionalServices.length > 0 && (
                                                <div className='mt-2'>
                                                    <span className='text-sm text-gray-500'>
                                                        Servicios adicionales:
                                                    </span>
                                                    <p className='mt-1 text-sm'>
                                                        {request.additionalServices.join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                            {index < request.pets.length - 1 && <Separator className='my-4' />}
                                        </div>
                                    ))}

                                    {/* Price Section */}
                                    <div className='rounded-lg bg-white p-4 shadow-sm'>
                                        <h4 className='text-lg font-semibold'>Precio Total: {request.totalPrice}€</h4>
                                    </div>
                                </div>
                            )}
                            <div className='mt-4 flex items-center justify-end'>
                                <div className='flex space-x-2'>
                                    <Button
                                        size='sm'
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleAccept(request.id)
                                        }}
                                    >
                                        Aceptar
                                    </Button>
                                    <Button
                                        size='sm'
                                        variant='destructive'
                                        onClick={e => {
                                            e.stopPropagation()
                                            handleReject(request.id)
                                        }}
                                    >
                                        Rechazar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
