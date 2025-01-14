'use client'

import { format } from 'date-fns'
import { Clock, PawPrint, Truck, UtensilsCrossed, Pill, Heart, Scissors, CalendarRange } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useMemo } from 'react'

import { HotelReservation, useReservation } from '@/components/ReservationContext'
import { ServiceType } from '@/shared/types/additional-services'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

export function PendingRequests() {
    const { reservations } = useReservation()
    const [searchParams, setSearchParams] = useSearchParams()

    // Filtrar solo las reservas pendientes de hotel
    const pendingRequests = useMemo(() =>
        reservations.filter(r =>
            r.type === 'hotel' &&
            r.status === 'pending'
        ) as HotelReservation[],
        [reservations]
    )

    const handleCheckAvailability = (reservation: HotelReservation) => {
        console.log('Checking availability for reservation:', reservation)
        const checkInDate = new Date(reservation.checkInDate)
        const dateStr = format(checkInDate, 'yyyy-MM-dd')

        // Mantener los parámetros existentes y añadir los nuevos
        const newParams = new URLSearchParams(searchParams)
        newParams.set('pendingReservationId', reservation.id)
        newParams.set('date', dateStr)

        console.log('Setting search params:', Object.fromEntries(newParams.entries()))
        setSearchParams(newParams)
    }

    const getServiceIcon = (serviceType: ServiceType) => {
        switch (serviceType) {
            case 'driver':
                return <Truck className="h-4 w-4 text-blue-500" />
            case 'special_food':
                return <UtensilsCrossed className="h-4 w-4 text-orange-500" />
            case 'medication':
                return <Pill className="h-4 w-4 text-red-500" />
            case 'special_care':
                return <Heart className="h-4 w-4 text-pink-500" />
            case 'hairdressing':
                return <Scissors className="h-4 w-4 text-purple-500" />
            default:
                return null
        }
    }

    const formatServiceName = (serviceType: ServiceType) => {
        switch (serviceType) {
            case 'driver':
                return 'Servicio de chofer'
            case 'special_food':
                return 'Comida especial'
            case 'medication':
                return 'Medicación'
            case 'special_care':
                return 'Curas'
            case 'hairdressing':
                return 'Peluquería'
            default:
                return 'Servicio desconocido'
        }
    }

    return (
        <div className="space-y-4">
            {pendingRequests.map((reservation) => (
                <Card
                    key={reservation.id}
                    className="overflow-hidden"
                >
                    <div className="flex">
                        <div className="w-64 shrink-0 bg-[#4B6BFB]/5 p-6 flex flex-col justify-between space-y-6">
                            <div className="space-y-6">
                                <div>
                                    <CardTitle className="text-lg font-semibold">
                                        {reservation.client.name}
                                    </CardTitle>
                                    <div className="space-y-1 mt-1 text-sm text-muted-foreground">
                                        <p>{reservation.client.phone}</p>
                                        <p>{reservation.client.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm text-muted-foreground">
                                            {format(new Date(reservation.checkInDate), 'dd/MM/yyyy')} - {format(new Date(reservation.checkOutDate), 'dd/MM/yyyy')}
                                        </span>
                                    </div>
                                    {reservation.additionalServices.some(service => service.type === 'driver') && (
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-[#4B6BFB]" />
                                            <span className="text-sm text-muted-foreground">
                                                {(() => {
                                                    const transportService = reservation.additionalServices.find(service => service.type === 'driver')
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

                            <Badge variant={reservation.paymentStatus === 'Pagado' ? 'default' : 'destructive'} className="w-fit">
                                {reservation.paymentStatus}
                            </Badge>
                        </div>
                        <CardContent className="flex-1 p-6">
                            <div className="flex flex-col h-full">
                                <div className="flex-grow space-y-6">
                                    {/* Mascotas y sus servicios */}
                                    {reservation.pets.map((pet, petIndex) => {
                                        // Filtrar servicios para esta mascota
                                        const petServices = reservation.additionalServices
                                            .filter(service =>
                                                service.petIndex === petIndex &&
                                                (service.type as ServiceType) !== 'driver' // Excluir servicio de transporte
                                            )

                                        return (
                                            <div key={petIndex} className={`${petIndex < reservation.pets.length - 1 ? 'border-b border-border' : ''}`}>
                                                <div className="py-4">
                                                    <div className="grid grid-cols-[auto,1fr] gap-6">
                                                        <div className="flex items-start gap-2">
                                                            <PawPrint className="h-4 w-4 mt-1 text-[#4B6BFB]" />
                                                            <div>
                                                                <p className="font-medium">{pet.name} ({reservation.roomNumber})</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {pet.breed} · {pet.size} · {pet.weight}kg · {pet.sex === 'M' ? 'Macho' : 'Hembra'} · {pet.isNeutered ? 'Castrado/a' : 'No castrado/a'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-wrap gap-4">
                                                            {petServices.map((service, index) => {
                                                                const icon = getServiceIcon(service.type as ServiceType)
                                                                return icon ? (
                                                                    <div key={index} className="flex items-center gap-2">
                                                                        {icon}
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {formatServiceName(service.type as ServiceType)}
                                                                        </span>
                                                                    </div>
                                                                ) : null
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    <div className="flex items-center justify-between border-t pt-6">
                                        <span className="font-semibold">Precio Total</span>
                                        <span className="text-lg font-bold">{reservation.totalPrice}€</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                    <div className="flex justify-end gap-2 p-4 bg-gray-50 border-t">
                        <Button
                            className="bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90"
                            onClick={() => handleCheckAvailability(reservation)}
                        >
                            <CalendarRange className="h-4 w-4 mr-2" />
                            Comprobar Disponibilidad
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    )
}
