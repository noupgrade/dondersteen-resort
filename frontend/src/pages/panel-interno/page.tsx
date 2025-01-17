import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { format } from 'date-fns'
import { PawPrint, PlusCircle, UtensilsCrossed, Truck, Scissors, Pill, Heart, Clock, DollarSign, Search } from 'lucide-react'

import { HotelReservation, HairSalonReservation, useReservation } from '@/components/ReservationContext.tsx'
import { CheckIns } from '@/components/check-ins.tsx'
import { CheckOuts } from '@/components/check-outs.tsx'
import { PendingRequests } from '@/components/pending-requests.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'
import { Badge } from '@/shared/ui/badge.tsx'
import { Input } from '@/shared/ui/input.tsx'
import { ServiceType } from '@/shared/types/additional-services'
import { HotelReservationsCalendarWidget } from '@/widgets/HotelReservationsCalendar'
import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { HotelNotificationBanner, useHotelNotificationStore } from '@/widgets/HotelNotificationBanner'

export default function PanelInterno() {
    const { reservations } = useReservation()
    const [searchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState('active')
    const [pendingRequests, setPendingRequests] = useState<HotelReservation[]>([])
    const [activeReservations, setActiveReservations] = useState<HotelReservation[]>([])
    const [filteredReservations, setFilteredReservations] = useState<HotelReservation[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [checkIns, setCheckIns] = useState<HotelReservation[]>([])
    const [checkOuts, setCheckOuts] = useState<HotelReservation[]>([])
    const [selectedReservation, setSelectedReservation] = useState<HotelReservation | null>(null)
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const { notifications, dismissNotification } = useHotelNotificationStore()

    useEffect(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        setPendingRequests(
            reservations.filter(r => r.type === 'hotel' && r.status === 'pending') as HotelReservation[]
        )
        const active = reservations
            .filter(
                r => r.type === 'hotel' &&
                    new Date(r.checkInDate) <= new Date() &&
                    new Date(r.checkOutDate) > new Date()
            )
            .sort((a: HotelReservation | HairSalonReservation, b: HotelReservation | HairSalonReservation) =>
                new Date(a.type === 'hotel' ? a.checkOutDate : '').getTime() -
                new Date(b.type === 'hotel' ? b.checkOutDate : '').getTime()
            ) as HotelReservation[]
        setActiveReservations(active)
        setFilteredReservations(active)
        setCheckIns(
            reservations.filter(r => r.type === 'hotel' && r.checkInDate === today) as HotelReservation[]
        )
        setCheckOuts(
            reservations.filter(r => r.type === 'hotel' && r.checkOutDate === today) as HotelReservation[]
        )
    }, [reservations])

    useEffect(() => {
        if (searchTerm) {
            const filtered = activeReservations.filter(reservation => {
                const clientName = reservation.client.name.toLowerCase()
                const petNames = reservation.pets.map(pet => pet.name.toLowerCase())
                const search = searchTerm.toLowerCase()

                return clientName.includes(search) || petNames.some(name => name.includes(search))
            })
            setFilteredReservations(filtered)
        } else {
            setFilteredReservations(activeReservations)
        }
    }, [searchTerm, activeReservations])

    useEffect(() => {
        const pendingReservationId = searchParams.get('pendingReservationId')
        if (pendingReservationId) {
            setActiveTab('calendar')
        }
    }, [searchParams])

    const handleViewReservation = (reservation: HotelReservation) => {
        setSelectedReservation(reservation)
        setIsViewerOpen(true)
    }

    const handleCloseViewer = () => {
        setIsViewerOpen(false)
        setSelectedReservation(null)
    }

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

            <HotelNotificationBanner
                notifications={notifications}
                onDismiss={dismissNotification}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
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
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nombre del cliente o mascota..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-8"
                                />
                            </div>
                        </div>

                        {filteredReservations.map((reservation) => (
                            <Card
                                key={reservation.id}
                                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => handleViewReservation(reservation)}
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
                                                        );

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
                            </Card>
                        ))}

                        {filteredReservations.length === 0 && searchTerm && (
                            <div className="text-center py-8 text-muted-foreground">
                                No se encontraron reservas que coincidan con la búsqueda
                            </div>
                        )}
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

            {/* Reservation Viewer Modal */}
            {selectedReservation && (
                <ReservationViewer
                    reservation={selectedReservation}
                    isOpen={isViewerOpen}
                    onClose={handleCloseViewer}
                />
            )}
        </div>
    )
}

