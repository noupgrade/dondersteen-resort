import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar, Hotel, Users, X, Phone, Car, Weight, Ruler } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/utils'
import { HairdressingServiceType, isDriverService, isHairdressingService } from '@/shared/types/additional-services'
import { Separator } from '@/shared/ui/separator'

interface ManageReservationBannerProps {
    reservation: HairSalonReservation
    onClose: () => void
    onAccept?: () => void
    onReject?: () => void
}

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono'
}

const serviceTypeColors: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'bg-blue-50 text-blue-700 border-blue-200',
    bath_and_trim: 'bg-green-50 text-green-700 border-green-200',
    stripping: 'bg-purple-50 text-purple-700 border-purple-200',
    deshedding: 'bg-orange-50 text-orange-700 border-orange-200',
    brushing: 'bg-pink-50 text-pink-700 border-pink-200',
    spa: 'bg-teal-50 text-teal-700 border-teal-200',
    spa_ozone: 'bg-indigo-50 text-indigo-700 border-indigo-200'
}

export function ManageReservationBanner({ reservation, onClose, onAccept, onReject }: ManageReservationBannerProps) {
    // Find the hairdressing service and get its services array
    const hairdressingService = reservation.additionalServices.find(isHairdressingService)
    const services = hairdressingService?.services || []
    const hasDriverService = reservation.additionalServices.some(isDriverService)

    const formatDateDisplay = (dateString: string | undefined) => {
        if (!dateString) return ''
        return format(new Date(dateString), 'dd MMM', { locale: es })
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div className="container relative mx-auto p-4">
                <div className="bg-white rounded-lg shadow-xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                        {/* Left side - Main info */}
                        <div className="flex items-start gap-4">
                            {/* Source icon */}
                            <div className={cn(
                                "p-2 rounded-full shadow-sm",
                                reservation.source === 'hotel' ? "bg-primary/10" : "bg-violet-100"
                            )}>
                                {reservation.source === 'hotel' ? (
                                    <Hotel className="h-5 w-5 text-primary" />
                                ) : (
                                    <Users className="h-5 w-5 text-violet-600" />
                                )}
                            </div>

                            {/* Info sections */}
                            <div className="space-y-3">
                                {/* Pet and client info */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900">{reservation.pet.name}</h3>
                                        <Badge variant="outline" className="shadow-sm">
                                            {reservation.source === 'hotel' ? 'Hotel' : 'Externo'}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground/90 mt-1">
                                        {reservation.client.name} · {reservation.client.phone}
                                    </div>
                                </div>

                                {/* Pet details */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Weight className="h-3.5 w-3.5" />
                                        <span>{reservation.pet.weight}kg</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Ruler className="h-3.5 w-3.5" />
                                        <span>{reservation.pet.size}</span>
                                    </div>
                                    <div className="text-sm">
                                        {reservation.pet.breed}
                                    </div>
                                </div>

                                {/* Dates and times */}
                                <div className="flex items-center gap-4">
                                    {reservation.source === 'hotel' ? (
                                        <>
                                            {reservation.hotelCheckIn && (
                                                <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1 rounded-md shadow-sm">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        Check-in: {formatDateDisplay(reservation.hotelCheckIn)}
                                                    </span>
                                                </div>
                                            )}
                                            {reservation.hotelCheckOut && (
                                                <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1 rounded-md shadow-sm">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>
                                                        Check-out: {formatDateDisplay(reservation.hotelCheckOut)}
                                                        {reservation.hotelCheckOutTime && ` - ${reservation.hotelCheckOutTime}`}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1 rounded-md shadow-sm">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {format(new Date(reservation.date), 'dd MMM yyyy', { locale: es })}
                                                </span>
                                            </div>
                                            {reservation.requestedTime && (
                                                <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1 rounded-md shadow-sm">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span>Solicitado: {reservation.requestedTime}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Services */}
                                <div className="flex flex-wrap gap-2">
                                    {services.map((service, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className={cn(
                                                "text-xs px-2 py-0.5 border-[1.5px] whitespace-nowrap",
                                                serviceTypeColors[service]
                                            )}
                                        >
                                            {serviceTypeLabels[service]}
                                        </Badge>
                                    ))}
                                    {hasDriverService && (
                                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                                            <Car className="h-3 w-3 mr-1" />
                                            Recogida
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-2">
                            {onAccept && (
                                <Button
                                    variant="default"
                                    onClick={onAccept}
                                    className="shadow-sm"
                                >
                                    Aceptar
                                </Button>
                            )}
                            {onReject && (
                                <Button
                                    variant="destructive"
                                    onClick={onReject}
                                    className="shadow-sm"
                                >
                                    Rechazar
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="hover:bg-gray-100/80"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 