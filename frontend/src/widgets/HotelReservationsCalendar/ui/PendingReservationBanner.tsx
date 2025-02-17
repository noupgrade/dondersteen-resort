'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Check, Clock, PawPrint, X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'

interface PendingReservationBannerProps {
    reservation: HotelReservation | null
    onAccept: (reservation: HotelReservation) => void
    onReject: (reservation: HotelReservation) => void
}

export function PendingReservationBanner({ reservation, onAccept, onReject }: PendingReservationBannerProps) {
    if (!reservation) return null

    return (
        <div className='fixed bottom-0 left-1/2 z-50 w-[80%] -translate-x-1/2 p-4'>
            <Card className='overflow-hidden'>
                <div className='flex'>
                    <div className='flex w-64 shrink-0 flex-col justify-between bg-[#4B6BFB]/5 p-4'>
                        <div>
                            <h3 className='text-base font-semibold'>{reservation.client.name}</h3>
                            <div className='mt-1 space-y-0.5 text-sm text-muted-foreground'>
                                <p>{reservation.client.phone}</p>
                                <p>{reservation.client.email}</p>
                            </div>
                        </div>
                        <Badge
                            variant={reservation.paymentStatus === 'Pagado' ? 'default' : 'destructive'}
                            className='mt-2 w-fit'
                        >
                            {reservation.paymentStatus}
                        </Badge>
                    </div>

                    <div className='w-52 border-l p-4'>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4 shrink-0 text-muted-foreground' />
                                <span className='text-sm text-muted-foreground'>
                                    {format(new Date(reservation.checkInDate), 'dd/MM/yyyy')} -{' '}
                                    {format(new Date(reservation.checkOutDate), 'dd/MM/yyyy')}
                                </span>
                            </div>
                            <div className='text-right'>
                                <span className='text-lg font-semibold'>{reservation.totalPrice}€</span>
                            </div>
                        </div>
                    </div>

                    <div className='flex-1 border-l p-4'>
                        <div className='grid place-items-center gap-3'>
                            {reservation.pets.map((pet, index) => (
                                <div key={index} className='flex w-full max-w-[300px] items-center gap-2'>
                                    <PawPrint className='h-4 w-4 shrink-0 text-[#4B6BFB]' />
                                    <div className='flex-1'>
                                        <p className='text-sm font-medium'>
                                            {pet.name} ({reservation.roomNumber})
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            {pet.breed} · {pet.size} · {pet.weight}kg
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='flex w-40 flex-col gap-2 border-l bg-card p-4'>
                        <Button
                            variant='outline'
                            className='w-full border-red-500 text-red-500 hover:bg-red-50'
                            onClick={() => onReject(reservation)}
                        >
                            <X className='mr-2 h-4 w-4' />
                            Rechazar
                        </Button>
                        <Button
                            className='w-full bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90'
                            onClick={() => onAccept(reservation)}
                        >
                            <Check className='mr-2 h-4 w-4' />
                            Aceptar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
