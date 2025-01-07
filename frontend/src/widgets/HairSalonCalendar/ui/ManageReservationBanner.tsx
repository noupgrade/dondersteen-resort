import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar, Hotel, Users, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { HairdressingServiceType } from '@/shared/types/additional-services'

interface ManageReservationBannerProps {
    reservation: HairSalonReservation
    onClose: () => void
    onAccept?: () => void
    onReject?: () => void
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

export function ManageReservationBanner({ reservation, onClose, onAccept, onReject }: ManageReservationBannerProps) {
    // Find the hairdressing service and get its services array
    const hairdressingService = reservation.additionalServices.find(service => service.type === 'hairdressing')
    const services = hairdressingService?.services as HairdressingServiceType[] || []

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            {/* Content */}
            <div className="container relative mx-auto p-4">
                <div className="bg-white rounded-lg shadow-xl border p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
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
                                <div className="flex items-center gap-4 text-sm text-muted-foreground/80 mt-2">
                                    <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1 rounded-md shadow-sm">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {format(new Date(reservation.date), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50/80 px-2.5 py-1 rounded-md shadow-sm">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{reservation.time}</span>
                                    </div>
                                </div>
                                {services.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {services.map((service, index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="shadow-sm bg-gray-100/80 text-gray-700 hover:bg-gray-200/80"
                                            >
                                                {getServiceLabel(service)}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
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