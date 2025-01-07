import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar, Hotel, Users, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
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
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/80 backdrop-blur-sm border-t">
            <div className="container mx-auto">
                <Card className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "p-2 rounded-full",
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
                                    <h3 className="font-medium">{reservation.pet.name}</h3>
                                    <Badge variant="outline">
                                        {reservation.source === 'hotel' ? 'Hotel' : 'Externo'}
                                    </Badge>
                                </div>
                                <div className="text-sm text-muted-foreground mt-1">
                                    {reservation.client.name} · {reservation.client.phone}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {format(new Date(reservation.date), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>{reservation.time}</span>
                                    </div>
                                </div>
                                {services.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {services.map((service, index) => (
                                            <Badge key={index} variant="secondary">
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
                                >
                                    Aceptar
                                </Button>
                            )}
                            {onReject && (
                                <Button
                                    variant="destructive"
                                    onClick={onReject}
                                >
                                    Rechazar
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
} 