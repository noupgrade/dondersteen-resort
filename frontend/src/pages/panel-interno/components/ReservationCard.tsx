import { format } from 'date-fns'
import { Clock, PawPrint, Truck } from 'lucide-react'

import { Badge } from '@/shared/ui/badge.tsx'
import { Card, CardContent, CardTitle } from '@/shared/ui/card.tsx'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'

import { PetServices } from './PetServices'

type ReservationCardProps = {
    reservation: HotelReservation
    onClick: () => void
}

export const ReservationCard = ({ reservation, onClick }: ReservationCardProps) => (
    <Card className='cursor-pointer overflow-hidden transition-shadow hover:shadow-md' onClick={onClick}>
        <div className='flex'>
            <div className='flex w-64 shrink-0 flex-col justify-between space-y-6 bg-[#4B6BFB]/5 p-6'>
                <div className='space-y-6'>
                    <div>
                        <CardTitle className='text-lg font-semibold'>{reservation.client.name}</CardTitle>
                        <div className='mt-1 space-y-1 text-sm text-muted-foreground'>
                            <p>{reservation.client.phone}</p>
                            <p>{reservation.client.email}</p>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4' />
                            <span className='text-sm text-muted-foreground'>
                                {format(new Date(reservation.checkInDate), 'dd/MM/yyyy')} -{' '}
                                {format(new Date(reservation.checkOutDate), 'dd/MM/yyyy')}
                            </span>
                        </div>
                        {reservation.additionalServices.some(service => service.type === 'driver') && (
                            <div className='flex items-center gap-2'>
                                <Truck className='h-4 w-4 text-[#4B6BFB]' />
                                <span className='text-sm text-muted-foreground'>
                                    {(() => {
                                        const transportService = reservation.additionalServices.find(
                                            service => service.type === 'driver',
                                        )
                                        switch (transportService?.serviceType) {
                                            case 'pickup':
                                                return 'Recogida'
                                            case 'dropoff':
                                                return 'Entrega'
                                            case 'both':
                                                return 'Recogida y entrega'
                                            default:
                                                return 'Transporte'
                                        }
                                    })()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <Badge variant={reservation.paymentStatus === 'Pagado' ? 'default' : 'destructive'} className='w-fit'>
                    {reservation.paymentStatus}
                </Badge>
            </div>
            <CardContent className='flex-1 p-6'>
                <div className='flex h-full flex-col'>
                    <div className='flex-grow space-y-6'>
                        {reservation.pets.map((pet, petIndex) => (
                            <div
                                key={petIndex}
                                className={`${petIndex < reservation.pets.length - 1 ? 'border-b border-border' : ''}`}
                            >
                                <div className='py-4'>
                                    <div className='grid grid-cols-[auto,1fr] gap-6'>
                                        <div className='flex items-start gap-2'>
                                            <PawPrint className='mt-1 h-4 w-4 text-[#4B6BFB]' />
                                            <div>
                                                <p className='font-medium'>
                                                    {pet.name} ({reservation.roomNumber})
                                                </p>
                                                <p className='text-sm text-muted-foreground'>
                                                    {pet.breed} · {pet.size} · {pet.weight}kg ·{' '}
                                                    {pet.sex === 'M' ? 'Macho' : 'Hembra'} ·{' '}
                                                    {pet.isNeutered ? 'Castrado/a' : 'No castrado/a'}
                                                </p>
                                            </div>
                                        </div>
                                        <PetServices services={reservation.additionalServices} petIndex={petIndex} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className='flex items-center justify-between border-t pt-6'>
                            <span className='font-semibold'>Precio Total</span>
                            <span className='text-lg font-bold'>{reservation.totalPrice}€</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </div>
    </Card>
)
