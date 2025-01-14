import { Mail, Phone } from 'lucide-react'

import { type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface ClientCardProps {
    reservation: HairSalonReservation | HotelReservation
}

export function ClientCard({ reservation }: ClientCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <div className="font-medium">Nombre:</div>
                    <span>{reservation.client.name}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <div className="font-medium">Teléfono:</div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{reservation.client.phone}</span>
                    </div>
                </div>
                <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                    <div className="font-medium">Email:</div>
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{reservation.client.email}</span>
                    </div>
                </div>
                {reservation.client.address && (
                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                        <div className="font-medium">Dirección:</div>
                        <span>{reservation.client.address}</span>
                    </div>
                )}
                {reservation.client.id && (
                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                        <div className="font-medium">ID Cliente:</div>
                        <span>{reservation.client.id}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 