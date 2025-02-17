import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Building2, Calendar, Car, Clock, Phone, User } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { isHairdressingService } from '@/shared/types/service-checkers'
import { isDriverService } from '@/shared/types/service-checkers'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { HairdressingServiceType } from '@monorepo/functions/src/types/services'

interface ReservationCardProps {
    reservation: HairSalonReservation
    onOrganizeCita: (r: HairSalonReservation) => void
    onShowDetails?: (r: HairSalonReservation) => void
}

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono',
    knots: 'Nudos',
    extremely_dirty: 'Extremadamente sucio',
}

const serviceTypeColors: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'bg-blue-50 text-blue-700 border-blue-200',
    bath_and_trim: 'bg-green-50 text-green-700 border-green-200',
    stripping: 'bg-purple-50 text-purple-700 border-purple-200',
    deshedding: 'bg-orange-50 text-orange-700 border-orange-200',
    brushing: 'bg-pink-50 text-pink-700 border-pink-200',
    spa: 'bg-teal-50 text-teal-700 border-teal-200',
    spa_ozone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    knots: 'bg-red-50 text-red-700 border-red-200',
    extremely_dirty: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export function ReservationCard({ reservation, onOrganizeCita, onShowDetails }: ReservationCardProps) {
    const mainService = reservation.additionalServices.find(isHairdressingService)?.services[0]
    const hasDriverService = reservation.additionalServices.some(isDriverService)

    const handleCardClick = (e: React.MouseEvent) => {
        // Si el clic fue en el botón de organizar o no hay función onShowDetails, no hacemos nada
        if ((e.target as HTMLElement).closest('button') || !onShowDetails) {
            return
        }
        onShowDetails(reservation)
    }

    return (
        <div
            className={cn(
                'flex h-full flex-col rounded-lg border p-3 shadow-sm',
                onShowDetails && 'cursor-pointer transition-shadow hover:shadow-md',
                reservation.source === 'hotel' ? 'border-emerald-200 bg-emerald-50' : 'border-pink-200 bg-pink-50',
            )}
            onClick={handleCardClick}
        >
            {/* Mascota y servicio */}
            <div className='mb-2 flex items-start justify-between'>
                <div className='flex flex-col'>
                    <div className='flex items-center gap-1'>
                        <div className='text-sm font-bold'>{reservation.pet.name}</div>
                        <div className='text-xs text-gray-600'>({reservation.pet.breed})</div>
                    </div>
                    <div className='text-xs text-gray-600'>{reservation.client.name}</div>
                    <div className='flex items-center gap-1 text-xs text-gray-600'>
                        <Phone className='h-3 w-3' />
                        {reservation.client.phone}
                    </div>
                </div>
                <div className='flex flex-col items-end gap-1'>
                    {mainService && (
                        <Badge
                            variant='outline'
                            className={cn(
                                'whitespace-nowrap border-[1.5px] px-1.5 py-0 text-[10px]',
                                serviceTypeColors[mainService],
                            )}
                        >
                            {serviceTypeLabels[mainService]}
                        </Badge>
                    )}
                    {hasDriverService && <Car className='h-4 w-4 text-gray-500' />}
                </div>
            </div>

            {/* Fecha y hora */}
            <div className='mt-auto flex flex-col gap-0.5 text-[11px] text-gray-600'>
                {reservation.source === 'hotel' ? (
                    <>
                        {reservation.hotelCheckIn && (
                            <div className='flex items-center gap-1'>
                                <Clock className='h-3 w-3' />
                                <span>
                                    Entrada: {format(new Date(reservation.hotelCheckIn), "d 'de' MMMM", { locale: es })}
                                </span>
                            </div>
                        )}
                        {reservation.hotelCheckOut && (
                            <div className='pl-4'>
                                Salida: {format(new Date(reservation.hotelCheckOut), "d 'de' MMMM", { locale: es })}
                                {reservation.hotelCheckOutTime && ` - ${reservation.hotelCheckOutTime}`}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {reservation.date && (
                            <div className='flex items-center gap-1'>
                                <Clock className='h-3 w-3' />
                                <span>{format(new Date(reservation.date), "EEEE d 'de' MMMM", { locale: es })}</span>
                            </div>
                        )}
                        {reservation.requestedTime && (
                            <div className='pl-4'>Hora solicitada: {reservation.requestedTime}</div>
                        )}
                    </>
                )}
            </div>

            {/* Botón de organizar */}
            <Button variant='default' className='mt-2 h-8 w-full text-sm' onClick={() => onOrganizeCita(reservation)}>
                Organizar cita
            </Button>
        </div>
    )
}
