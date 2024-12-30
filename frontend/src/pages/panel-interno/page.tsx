import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { format } from 'date-fns'
import { Clock, PawPrint, PlusCircle, Users, PillIcon, Stethoscope, UtensilsCrossed, Truck, Scissors, Dumbbell } from 'lucide-react'

import { HotelReservation, useReservation } from '@/components/ReservationContext.tsx'
import { CheckIns } from '@/components/check-ins.tsx'
import { CheckOuts } from '@/components/check-outs.tsx'
import { PendingRequests } from '@/components/pending-requests.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Progress } from '@/shared/ui/progress.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'
import { Badge } from '@/shared/ui/badge.tsx'

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

    const formatServiceName = (service: string) => {
        // Remove index numbers and underscores
        const baseName = service.replace(/_\d+$/, '').replace('Details', '');

        // Format specific service names
        switch (baseName) {
            case 'transport':
                return 'Transporte';
            case 'medication':
                return 'Medicación';
            case 'specialCare':
                return 'Curas';
            case 'customFood':
                return 'Comida';
            case 'grooming':
                return 'Peluquería';
            case 'groomingService':
                return 'Peluquería';
            case 'bath':
                return 'Baño';
            case 'food':
                return 'Comida';
            case 'training':
                return 'Adiestramiento';
            default:
                return baseName;
        }
    }

    const getServiceIcon = (service: string) => {
        const baseName = service.replace(/_\d+$/, '').replace('Details', '');
        switch (baseName) {
            case 'medication':
                return <PillIcon className="h-4 w-4 text-[#4B6BFB]" />;
            case 'specialCare':
                return <Stethoscope className="h-4 w-4 text-[#4B6BFB]" />;
            case 'customFood':
            case 'food':
                return <UtensilsCrossed className="h-4 w-4 text-[#4B6BFB]" />;
            case 'transport':
                return <Truck className="h-4 w-4 text-[#4B6BFB]" />;
            case 'grooming':
            case 'groomingService':
            case 'bath':
                return <Scissors className="h-4 w-4 text-[#4B6BFB]" />;
            case 'training':
                return <Dumbbell className="h-4 w-4 text-[#4B6BFB]" />;
            default:
                return null;
        }
    }

    return (
        <div className='container space-y-8 p-8'>
            <div className='flex items-center justify-between'>
                <h1 className='text-4xl font-bold text-[#101828]'>Hotel</h1>
                <Button asChild className='bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90'>
                    <Link to='/booking'>
                        <PlusCircle className='mr-2 h-4 w-4' /> Nueva Reserva
                    </Link>
                </Button>
            </div>

            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                <Card className='bg-gradient-to-br from-[#4B6BFB] to-[#4B6BFB]/80 text-white'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-lg font-medium'>Reservas Activas</CardTitle>
                        <PawPrint className='h-5 w-5 text-[#E5E7EB]' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{activeReservations.length}</div>
                        <p className='text-xs text-[#E5E7EB]'>Estancias en curso</p>
                    </CardContent>
                </Card>

                <Card className='bg-gradient-to-br from-[#12B76A] to-[#12B76A]/80 text-white'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-lg font-medium'>Solicitudes Pendientes</CardTitle>
                        <Clock className='h-5 w-5 text-[#E5E7EB]' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{pendingRequests.length}</div>
                        <p className='text-xs text-[#E5E7EB]'>Solicitudes por revisar</p>
                    </CardContent>
                </Card>

                <Card className='bg-gradient-to-br from-[#F79009] to-[#F79009]/80 text-white'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-lg font-medium'>Ocupación Actual</CardTitle>
                        <Users className='h-5 w-5 text-[#E5E7EB]' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{occupancy.toFixed(0)}%</div>
                        <Progress value={occupancy} className='mt-2 bg-[#E5E7EB]/30 [&>div]:bg-[#E5E7EB]' />
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue='pending' className='space-y-4'>
                <TabsList className='grid w-full grid-cols-4 gap-4 bg-transparent p-0'>
                    <TabsTrigger
                        value='pending'
                        className='relative flex items-center justify-center gap-2 data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        <span>Solicitudes pendientes</span>
                        {pendingRequests.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs shrink-0"
                            >
                                {pendingRequests.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value='active'
                        className='relative flex items-center justify-center gap-2 data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        <span>Reservas activas</span>
                        {activeReservations.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs shrink-0"
                            >
                                {activeReservations.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value='check-ins'
                        className='relative flex items-center justify-center gap-2 data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        <span>Entradas</span>
                        {checkIns.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs shrink-0"
                            >
                                {checkIns.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger
                        value='check-outs'
                        className='relative flex items-center justify-center gap-2 data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        <span>Salidas</span>
                        {checkOuts.length > 0 && (
                            <Badge
                                variant="destructive"
                                className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs shrink-0"
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
                                                        .filter(service => {
                                                            if (!service.includes('_')) return false;
                                                            const serviceIndex = service.split('_').pop();
                                                            return serviceIndex === petIndex.toString() && !service.includes('frequency');
                                                        });

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
                                                                            const icon = getServiceIcon(service);
                                                                            const formattedName = formatServiceName(service);

                                                                            // Add frequency information for medication
                                                                            let extraInfo = '';
                                                                            if (service.startsWith('medication_')) {
                                                                                const frequency = reservation.additionalServices.find(
                                                                                    s => s === `medication_frequency_${petIndex}`
                                                                                );
                                                                                if (frequency) {
                                                                                    extraInfo = ` (${frequency === 'once' ? '1 vez al día' : 'Varias veces al día'})`;
                                                                                }
                                                                            }

                                                                            return (
                                                                                <div key={index} className="flex items-center gap-2">
                                                                                    {icon}
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                        {formattedName}{extraInfo}
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
                                                {reservation.additionalServices.some(service => !service.includes('_')) && (
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold">Servicios Generales</h4>
                                                        <div className="space-y-2">
                                                            {reservation.additionalServices
                                                                .filter(service => !service.includes('_'))
                                                                .map((service, index) => {
                                                                    const icon = getServiceIcon(service);
                                                                    const formattedName = formatServiceName(service);
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
            </Tabs>
        </div>
    )
}
