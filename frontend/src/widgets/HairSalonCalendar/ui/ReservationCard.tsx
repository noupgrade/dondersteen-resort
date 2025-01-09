import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Hotel, Users, Car } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { HairdressingServiceType } from '@/shared/types/additional-services'
import { HairSalonReservationModal } from './HairSalonReservationModal'
import { useCalendarStore } from '../model/store'

interface ReservationCardProps {
    reservation: HairSalonReservation
    onOrganizeCita: (r: HairSalonReservation) => void
    isPending?: boolean
}

const getServiceLabel = (service: HairdressingServiceType) => {
    switch (service) {
        case 'bath_and_brush':
            return 'Baño y cepillado'
        case 'bath_and_trim':
            return 'Baño y corte'
        case 'stripping':
            return 'Stripping'
        case 'deshedding':
            return 'Deslanado'
        case 'brushing':
            return 'Cepillado'
        case 'spa':
            return 'Spa'
        case 'spa_ozone':
            return 'Spa con ozono'
        default:
            return service
    }
}

const getServiceStyle = (service: HairdressingServiceType) => {
    switch (service) {
        case 'bath_and_brush':
            return 'border-blue-200 bg-blue-50 text-blue-700'
        case 'bath_and_trim':
            return 'border-green-200 bg-green-50 text-green-700'
        case 'stripping':
            return 'border-purple-200 bg-purple-50 text-purple-700'
        case 'deshedding':
            return 'border-orange-200 bg-orange-50 text-orange-700'
        case 'brushing':
            return 'border-pink-200 bg-pink-50 text-pink-700'
        case 'spa':
            return 'border-teal-200 bg-teal-50 text-teal-700'
        case 'spa_ozone':
            return 'border-indigo-200 bg-indigo-50 text-indigo-700'
        default:
            return 'border-gray-200 bg-gray-50 text-gray-700'
    }
}

export function ReservationCard({
    reservation,
    onOrganizeCita,
    isPending = false
}: ReservationCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { updateReservation } = useCalendarStore()

    const mainServiceType = (() => {
        const service = reservation.additionalServices[0]
        if (service && typeof service === 'object' && 'services' in service && Array.isArray(service.services)) {
            return service.services[0] as HairdressingServiceType
        }
        return null
    })()

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return ''
        try {
            return format(new Date(dateStr), 'dd MMM', { locale: es })
        } catch (error) {
            console.error('Error formatting date:', error)
            return ''
        }
    }

    const handleCardClick = () => {
        if (!isPending) {
            setIsModalOpen(true)
        }
    }

    const handleSaveReservation = async (updatedReservation: HairSalonReservation) => {
        try {
            await updateReservation(updatedReservation)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error al guardar los cambios:', error)
        }
    }

    const handleDeleteReservation = async (reservation: HairSalonReservation) => {
        // Aquí podrías implementar la lógica para eliminar la reserva
        setIsModalOpen(false)
    }

    return (
        <>
            <Card 
                className={cn(
                    "h-full flex flex-col bg-white hover:shadow-lg transition-shadow duration-200",
                    !isPending && "cursor-pointer"
                )}
                onClick={handleCardClick}
            >
                <CardHeader className="flex-none pb-4">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                            {reservation.source === 'hotel' ? (
                                <div className="p-2 bg-primary/10 rounded-full">
                                    <Hotel className="h-5 w-5 text-primary" />
                                </div>
                            ) : (
                                <div className="p-2 bg-violet-100 rounded-full">
                                    <Users className="h-5 w-5 text-violet-600" />
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{reservation.client.name}</p>
                                <p className="text-sm text-muted-foreground">{reservation.client.phone}</p>
                            </div>
                        </div>
                        {mainServiceType && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "px-3 py-1.5 whitespace-nowrap font-medium",
                                    getServiceStyle(mainServiceType)
                                )}
                            >
                                {getServiceLabel(mainServiceType)}
                            </Badge>
                        )}
                    </div>
                </CardHeader>

                {!isPending && (
                    <CardContent className="flex-grow">
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className='text-xl font-semibold text-gray-900'>
                                        {reservation.pet.name}
                                    </h3>
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                        {reservation.pet.breed}
                                    </span>
                                </div>
                                <div className='flex flex-col gap-2 text-sm text-muted-foreground mt-3'>
                                    {reservation.source === 'hotel' ? (
                                        <>
                                            <div className="flex items-center gap-4">
                                                {reservation.hotelCheckIn && (
                                                    <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md'>
                                                        <Calendar className='h-4 w-4 text-emerald-600' />
                                                        <span>
                                                            Entrada: {formatDate(reservation.hotelCheckIn)}
                                                        </span>
                                                    </div>
                                                )}
                                                {reservation.hotelCheckOut && (
                                                    <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md'>
                                                        <Calendar className='h-4 w-4 text-red-600' />
                                                        <span>
                                                            Salida: {formatDate(reservation.hotelCheckOut)}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {reservation.hotelCheckOutTime && (
                                                    <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md'>
                                                        <Clock className='h-4 w-4 text-gray-500' />
                                                        <span>Hora de salida: {reservation.hotelCheckOutTime}</span>
                                                    </div>
                                                )}
                                                {reservation.hasDriverService && (
                                                    <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md'>
                                                        <Car className='h-4 w-4 text-gray-500' />
                                                        <span>Con servicio de chofer</span>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            {reservation.date && (
                                                <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md'>
                                                    <Calendar className='h-4 w-4 text-gray-500' />
                                                    <span>
                                                        {formatDate(reservation.date)}
                                                    </span>
                                                </div>
                                            )}
                                            {reservation.time && (
                                                <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md w-fit'>
                                                    <Clock className='h-4 w-4 text-gray-500' />
                                                    <span>{reservation.time}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                )}

                <CardContent className="flex-none pt-0">
                    <Button
                        className="w-full flex items-center justify-center gap-2"
                        onClick={(e) => {
                            e.stopPropagation()
                            onOrganizeCita(reservation)
                        }}
                    >
                        <Calendar className="h-4 w-4" />
                        Organizar cita
                    </Button>
                </CardContent>
            </Card>

            {isModalOpen && !isPending && (
                <HairSalonReservationModal
                    reservation={reservation}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveReservation}
                    onDelete={handleDeleteReservation}
                />
            )}
        </>
    )
} 