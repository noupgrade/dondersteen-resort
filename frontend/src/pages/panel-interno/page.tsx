import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { format } from 'date-fns'
import { PawPrint, PlusCircle, PillIcon, Stethoscope, UtensilsCrossed, Truck, Scissors, Dumbbell, Pill, Heart } from 'lucide-react'

import { HotelReservation, useReservation } from '@/components/ReservationContext.tsx'
import { CheckIns } from '@/components/check-ins.tsx'
import { CheckOuts } from '@/components/check-outs.tsx'
import { PendingRequests } from '@/components/pending-requests.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'
import { Badge } from '@/shared/ui/badge.tsx'
import { ServiceType } from '@/shared/types/additional-services'
import { HotelReservationsCalendarWidget } from '@/widgets/HotelReservationsCalendar'

export default function PanelInterno() {
    const { reservations, getReservationsByDate } = useReservation()
    const [pendingRequests, setPendingRequests] = useState<HotelReservation[]>([])
    const [activeReservations, setActiveReservations] = useState<HotelReservation[]>([])
    const [checkIns, setCheckIns] = useState<HotelReservation[]>([])
    const [checkOuts, setCheckOuts] = useState<HotelReservation[]>([])

    useEffect(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        setPendingRequests(
            reservations.filter(r => r.type === 'hotel' && r.status === 'pending') as HotelReservation[]
        )
        setActiveReservations(
            reservations.filter(
                r => r.type === 'hotel' && new Date(r.checkInDate) <= new Date() && new Date(r.checkOutDate) > new Date(),
            ) as HotelReservation[]
        )
        setCheckIns(
            reservations.filter(r => r.type === 'hotel' && r.checkInDate === today) as HotelReservation[]
        )
        setCheckOuts(
            reservations.filter(r => r.type === 'hotel' && r.checkOutDate === today) as HotelReservation[]
        )
    }, [reservations])

    const occupancy = activeReservations.length > 0 ? (activeReservations.length / 20) * 100 : 0

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
        <div className='container mx-auto space-y-6 p-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-4xl font-bold text-[#101828]'>Hotel</h1>
                <Button asChild className='bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90'>
                    <Link to='/booking'>
                        <PlusCircle className='mr-2 h-4 w-4' /> Nueva Reserva
                    </Link>
                </Button>
            </div>

            <Tabs defaultValue='active' className='space-y-4'>
                <TabsList className='grid w-full grid-cols-5 gap-4 bg-transparent p-0'>
                    <TabsTrigger
                        value='active'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Reservas activas
                        {activeReservations.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                                {activeReservations.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value='calendar'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Calendario
                    </TabsTrigger>
                    <TabsTrigger
                        value='pending'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Solicitudes pendientes
                        {pendingRequests.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                                {pendingRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value='check-ins'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Entradas
                        {checkIns.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                                {checkIns.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value='check-outs'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Salidas
                        {checkOuts.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                                {checkOuts.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='pending'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Solicitudes Pendientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <PendingRequests />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value='active'>
                    <div className="space-y-4">
                        {activeReservations.map((reservation) => (
                            <Card key={reservation.id} className="overflow-hidden">
                                <div className="flex">
                                    <div className="w-64 shrink-0 bg-[#4B6BFB]/5 p-6 flex flex-col justify-between space-y-6">
                                        <div className="space-y-6">
                                            <div>
                                                <CardTitle className="text-lg font-semibold">
                                                    Habitación {reservation.roomNumber}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {format(new Date(reservation.checkInDate), 'dd/MM/yyyy')} - {format(new Date(reservation.checkOutDate), 'dd/MM/yyyy')}
                                                </p>
                                            </div>

                                            <div>
                                                <h4 className="mb-2 font-semibold">Cliente</h4>
                                                <div className="space-y-1 text-sm">
                                                    <p>{reservation.client.name}</p>
                                                    <p className="text-muted-foreground">{reservation.client.phone}</p>
                                                    <p className="text-muted-foreground">{reservation.client.email}</p>
                                                </div>
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
                                                        .filter(service => service.petIndex === petIndex);

                                                    return (
                                                        <div key={petIndex} className="space-y-4 pb-4 border-b last:border-b-0">
                                                            <div className="grid grid-cols-[auto,1fr] gap-6">
                                                                <div className="flex items-start gap-2">
                                                                    <PawPrint className="h-4 w-4 mt-1 text-[#4B6BFB]" />
                                                                    <div>
                                                                        <p className="font-medium">{pet.name}</p>
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {pet.breed} · {pet.size} · {pet.weight}kg
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                {/* Servicios de esta mascota */}
                                                                {petServices.length > 0 && (
                                                                    <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(150px,1fr))]">
                                                                        {petServices.map((service, index) => {
                                                                            const icon = getServiceIcon(service.type);
                                                                            let formattedName = formatServiceName(service.type);

                                                                            // Add extra details based on service type
                                                                            switch (service.type) {
                                                                                case 'medication':
                                                                                    if (service.comment) {
                                                                                        formattedName += `: ${service.comment}`;
                                                                                    }
                                                                                    break;
                                                                                case 'special_care':
                                                                                    if (service.comment) {
                                                                                        formattedName += `: ${service.comment}`;
                                                                                    }
                                                                                    break;
                                                                                case 'special_food':
                                                                                    formattedName += ` (${service.foodType === 'refrigerated' ? 'Refrigerada' : 'Congelada'})`;
                                                                                    break;
                                                                                case 'hairdressing':
                                                                                    formattedName += `: ${service.services.map(s => {
                                                                                        switch (s) {
                                                                                            case 'bath_and_brush': return 'Baño y cepillado';
                                                                                            case 'bath_and_trim': return 'Baño y corte';
                                                                                            case 'stripping': return 'Stripping';
                                                                                            case 'deshedding': return 'Deslanado';
                                                                                            case 'brushing': return 'Cepillado';
                                                                                            case 'spa': return 'Spa';
                                                                                            case 'spa_ozone': return 'Spa con ozono';
                                                                                            default: return s;
                                                                                        }
                                                                                    }).join(', ')}`;
                                                                                    break;
                                                                            }

                                                                            return (
                                                                                <div key={index} className="flex items-center gap-2">
                                                                                    {icon}
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                        {formattedName}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Servicios generales */}
                                                {reservation.additionalServices.some(service => service.type === 'driver') && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold">Servicios Generales</h4>
                                                        <div className="space-y-2">
                                                            {reservation.additionalServices
                                                                .filter(service => service.type === 'driver')
                                                                .map((service, index) => {
                                                                    const icon = getServiceIcon(service.type);
                                                                    let formattedName = formatServiceName(service.type);

                                                                    // Add driver service details
                                                                    formattedName += ` (${service.serviceType === 'pickup' ? 'Recogida' :
                                                                        service.serviceType === 'dropoff' ? 'Entrega' :
                                                                            'Recogida y entrega'
                                                                        })`;

                                                                    return (
                                                                        <div key={index} className="flex items-center gap-2">
                                                                            {icon}
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {formattedName}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Necesidades Especiales */}
                                                {reservation.specialNeeds && (
                                                    <div>
                                                        <h4 className="mb-2 font-semibold">Necesidades Especiales</h4>
                                                        <p className="text-sm text-muted-foreground">{reservation.specialNeeds}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Precio Total */}
                                            <div className="flex items-center justify-between pt-2 border-t mt-6">
                                                <span className="font-semibold">Precio Total</span>
                                                <span className="text-lg font-bold">{reservation.totalPrice}€</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
                <TabsContent value='check-ins'>
                    <CheckIns />
                </TabsContent>
                <TabsContent value='check-outs'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Salidas del Día</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CheckOuts />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value='calendar'>
                    <HotelReservationsCalendarWidget />
                </TabsContent>
            </Tabs>
        </div>
    )
}
