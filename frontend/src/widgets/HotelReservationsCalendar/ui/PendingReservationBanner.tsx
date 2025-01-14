'use client'

import { X, Check, Clock, PawPrint } from 'lucide-react'
import { HotelReservation } from '@/components/ReservationContext'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Badge } from '@/shared/ui/badge'

interface PendingReservationBannerProps {
    reservation: HotelReservation | null
    onAccept: (reservation: HotelReservation) => void
    onReject: (reservation: HotelReservation) => void
}

export function PendingReservationBanner({
    reservation,
    onAccept,
    onReject,
}: PendingReservationBannerProps) {
    if (!reservation) return null

    return (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 p-4 w-[80%]">
            <Card className="overflow-hidden">
                <div className="flex">
                    <div className="w-64 shrink-0 bg-[#4B6BFB]/5 p-4 flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-semibold">{reservation.client.name}</h3>
                            <div className="space-y-0.5 mt-1 text-sm text-muted-foreground">
                                <p>{reservation.client.phone}</p>
                                <p>{reservation.client.email}</p>
                            </div>
                        </div>
                        <Badge variant={reservation.paymentStatus === 'Pagado' ? 'default' : 'destructive'} className="w-fit mt-2">
                            {reservation.paymentStatus}
                        </Badge>
                    </div>

                    <div className="w-52 p-4 border-l">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="text-sm text-muted-foreground">
                                    {format(new Date(reservation.checkInDate), 'dd/MM/yyyy')} - {format(new Date(reservation.checkOutDate), 'dd/MM/yyyy')}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-semibold">{reservation.totalPrice}€</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 p-4 border-l">
                        <div className="grid gap-3 place-items-center">
                            {reservation.pets.map((pet, index) => (
                                <div key={index} className="flex items-center gap-2 w-full max-w-[300px]">
                                    <PawPrint className="h-4 w-4 text-[#4B6BFB] shrink-0" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{pet.name} ({reservation.roomNumber})</p>
                                        <p className="text-xs text-muted-foreground">
                                            {pet.breed} · {pet.size} · {pet.weight}kg
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-40 p-4 border-l flex flex-col gap-2 bg-card">
                        <Button
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50 w-full"
                            onClick={() => onReject(reservation)}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Rechazar
                        </Button>
                        <Button
                            className="bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90 w-full"
                            onClick={() => onAccept(reservation)}
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Aceptar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
} 