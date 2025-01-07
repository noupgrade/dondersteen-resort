import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar, Hotel, Users, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { ExtendedReservation } from '@/types/reservation'
import { cn } from '@/shared/lib/styles/class-merge'

interface ManageReservationBannerProps {
    reservation: ExtendedReservation
    onClose: () => void
    onAccept?: () => void
    onReject?: () => void
}

export function ManageReservationBanner({ reservation, onClose, onAccept, onReject }: ManageReservationBannerProps) {
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
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {reservation.source === 'external' && (
                                <>
                                    <Button
                                        variant="destructive"
                                        onClick={onReject}
                                        className="gap-2"
                                    >
                                        Rechazar
                                    </Button>
                                    <Button
                                        onClick={onAccept}
                                        className="gap-2"
                                    >
                                        Aceptar
                                    </Button>
                                </>
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