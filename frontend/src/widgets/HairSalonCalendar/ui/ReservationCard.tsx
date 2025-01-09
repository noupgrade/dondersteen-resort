import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Hotel, Users } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { HairdressingServiceType } from '@/shared/types/additional-services'
import { HairSalonReservationModal } from './HairSalonReservationModal'

interface ReservationCardProps {
    reservation: HairSalonReservation
    onAccept: (r: HairSalonReservation) => void
    onReject: (r: HairSalonReservation) => void
    onOrganizeCita: (r: HairSalonReservation) => void
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
    onAccept,
    onReject,
    onOrganizeCita
}: ReservationCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Encontrar el servicio de peluquería y obtener el tipo de servicio
    const mainServiceType = (() => {
        const service = reservation.additionalServices[0]
        if (typeof service === 'string') {
            return service as HairdressingServiceType
        }
        if (typeof service === 'object' && 'type' in service && service.type === 'hairdressing' && 'services' in service && Array.isArray(service.services)) {
            return service.services[0] as HairdressingServiceType
        }
        return null
    })()

    const handleCardClick = () => {
        setIsModalOpen(true)
    }

    const handleSaveReservation = (updatedReservation: HairSalonReservation) => {
        // Aquí podrías implementar la lógica para guardar los cambios
        setIsModalOpen(false)
    }

    const handleDeleteReservation = (reservation: HairSalonReservation) => {
        onReject(reservation)
        setIsModalOpen(false)
    }

    return (
        <>
            <Card 
                className="h-full flex flex-col bg-white hover:shadow-lg transition-shadow duration-200 cursor-pointer"
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
                            <div className='flex items-center gap-4 text-sm text-muted-foreground mt-3'>
                                <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md'>
                                    <Calendar className='h-4 w-4 text-gray-500' />
                                    <span>
                                        {format(new Date(reservation.date), 'dd MMM', {
                                            locale: es,
                                        })}
                                    </span>
                                </div>
                                {reservation.time && (
                                    <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md'>
                                        <Clock className='h-4 w-4 text-gray-500' />
                                        <span>{reservation.time}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardContent className="flex-none pt-0">
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="default"
                            onClick={(e) => {
                                e.stopPropagation()
                                onAccept(reservation)
                            }}
                            className="w-full"
                        >
                            Aceptar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation()
                                onReject(reservation)
                            }}
                            className="w-full"
                        >
                            Rechazar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation()
                                onOrganizeCita(reservation)
                            }}
                            className="w-full"
                        >
                            Organizar Cita
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {isModalOpen && (
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