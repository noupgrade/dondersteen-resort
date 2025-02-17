import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { format } from 'date-fns'
import {
    Clock,
    DollarSign,
    Heart,
    PawPrint,
    Pill,
    PlusCircle,
    Scissors,
    Search,
    Truck,
    UtensilsCrossed,
} from 'lucide-react'

import { useReservation } from '@/components/ReservationContext.tsx'
import { CheckIns } from '@/components/check-ins.tsx'
import { CheckOuts } from '@/components/check-outs.tsx'
import { PendingRequests } from '@/components/pending-requests.tsx'
import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { useClientSearch } from '@/shared/hooks/use-client-search'
import { Badge } from '@/shared/ui/badge.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { ClientSearchModal } from '@/shared/ui/client-search-modal'
import { Input } from '@/shared/ui/input.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'
import { HotelNotificationBanner, useHotelNotificationStore } from '@/widgets/HotelNotificationBanner'
import { HotelReservationsCalendarWidget } from '@/widgets/HotelReservationsCalendar'
import { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'
import { ServiceType } from '@monorepo/functions/src/types/services'

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
    const [bookingType, setBookingType] = useState<'hotel' | 'budget' | null>(null)

    const { isOpen, handleOpen, handleClose, handleClientSelect, redirectPath, requirePetSelection } = useClientSearch({
        onClientSelect: clientId => {
            if (bookingType === 'hotel') {
                window.location.href = `/booking?userId=${clientId}`
            } else if (bookingType === 'budget') {
                window.location.href = `/booking?userId=${clientId}&type=budget`
            }
        },
        redirectPath: bookingType === 'budget' ? '/booking?type=budget' : '/booking',
        requirePetSelection: false,
    })

    useEffect(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        setPendingRequests(reservations.filter(r => r.type === 'hotel' && r.status === 'pending') as HotelReservation[])
        const active = reservations
            .filter(
                r =>
                    r.type === 'hotel' &&
                    new Date(r.checkInDate) <= new Date() &&
                    new Date(r.checkOutDate) > new Date(),
            )
            .sort((a, b) => {
                if (a.type === 'hotel' && b.type === 'hotel') {
                    return new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime()
                }
                return 0
            }) as HotelReservation[]
        setActiveReservations(active)
        setFilteredReservations(active)
        setCheckIns(reservations.filter(r => r.type === 'hotel' && r.checkInDate === today) as HotelReservation[])
        setCheckOuts(reservations.filter(r => r.type === 'hotel' && r.checkOutDate === today) as HotelReservation[])
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
                return <Truck className='h-4 w-4 text-blue-500' />
            case 'special_food':
                return <UtensilsCrossed className='h-4 w-4 text-orange-500' />
            case 'medication':
                return <Pill className='h-4 w-4 text-red-500' />
            case 'special_care':
                return <Heart className='h-4 w-4 text-pink-500' />
            case 'hairdressing':
                return <Scissors className='h-4 w-4 text-purple-500' />
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
                <div className='flex gap-2'>
                    <Button
                        className='bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90'
                        onClick={() => {
                            setBookingType('budget')
                            handleOpen()
                        }}
                    >
                        <PlusCircle className='mr-2 h-4 w-4' /> Nuevo Presupuesto
                    </Button>
                    <Button
                        className='bg-[#34D399] text-white hover:bg-[#34D399]/90'
                        onClick={() => {
                            setBookingType('hotel')
                            handleOpen()
                        }}
                    >
                        <PlusCircle className='mr-2 h-4 w-4' /> Nueva Reserva
                    </Button>
                </div>
            </div>

            <ClientSearchModal
                isOpen={isOpen}
                onClose={handleClose}
                onClientSelect={handleClientSelect}
                redirectPath={redirectPath}
                requirePetSelection={requirePetSelection}
                title={bookingType === 'budget' ? 'Buscar Cliente para Presupuesto' : 'Buscar Cliente para Reserva'}
            />

            <HotelNotificationBanner notifications={notifications} onDismiss={dismissNotification} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-4'>
                <TabsList className='grid w-full grid-cols-5 gap-4 bg-transparent p-0'>
                    <TabsTrigger
                        value='active'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Reservas activas
                        {activeReservations.length > 0 && (
                            <Badge
                                variant='destructive'
                                className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
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
                                variant='destructive'
                                className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
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
                                variant='destructive'
                                className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
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
                                variant='destructive'
                                className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
                            >
                                {checkOuts.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='pending'>
                    <Card>
                        <CardContent>
                            <PendingRequests />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value='active'>
                    <div className='space-y-4'>
                        <div className='flex items-center gap-4'>
                            <div className='relative flex-1'>
                                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Buscar por nombre del cliente o mascota...'
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className='pl-8'
                                />
                            </div>
                        </div>

                        {filteredReservations.map(reservation => (
                            <Card
                                key={reservation.id}
                                className='cursor-pointer overflow-hidden transition-shadow hover:shadow-md'
                                onClick={() => handleViewReservation(reservation)}
                            >
                                <div className='flex'>
                                    <div className='flex w-64 shrink-0 flex-col justify-between space-y-6 bg-[#4B6BFB]/5 p-6'>
                                        <div className='space-y-6'>
                                            <div>
                                                <CardTitle className='text-lg font-semibold'>
                                                    {reservation.client.name}
                                                </CardTitle>
                                                <div className='mt-1 space-y-1 text-sm text-muted-foreground'>
                                                    <p>{reservation.client.phone}</p>
                                                    <p>{reservation.client.email}</p>
                                                </div>
                                            </div>

                                            <div className='space-y-2'>
                                                <div className='flex items-center gap-2'>
                                                    <Clock className='h-4 w-4' />
                                                    <span className='text-sm text-muted-foreground'>
                                                        {format(new Date(reservation.checkInDate), 'dd/MM/yyyy')} -{' '}
                                                        {format(new Date(reservation.checkOutDate), 'dd/MM/yyyy')}
                                                    </span>
                                                </div>
                                                {reservation.additionalServices.some(
                                                    service => service.type === 'driver',
                                                ) && (
                                                    <div className='flex items-center gap-2'>
                                                        <Truck className='h-4 w-4 text-[#4B6BFB]' />
                                                        <span className='text-sm text-muted-foreground'>
                                                            {(() => {
                                                                const transportService =
                                                                    reservation.additionalServices.find(
                                                                        service => service.type === 'driver',
                                                                    )
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

                                        <Badge
                                            variant={reservation.paymentStatus === 'Pagado' ? 'default' : 'destructive'}
                                            className='w-fit'
                                        >
                                            {reservation.paymentStatus}
                                        </Badge>
                                    </div>
                                    <CardContent className='flex-1 p-6'>
                                        <div className='flex h-full flex-col'>
                                            <div className='flex-grow space-y-6'>
                                                {/* Mascotas y sus servicios */}
                                                {reservation.pets.map((pet, petIndex) => {
                                                    // Filtrar servicios para esta mascota
                                                    const petServices = reservation.additionalServices.filter(
                                                        service =>
                                                            service.petIndex === petIndex &&
                                                            (service.type as ServiceType) !== 'driver', // Excluir servicio de transporte
                                                    )

                                                    return (
                                                        <div
                                                            key={petIndex}
                                                            className={`${petIndex < reservation.pets.length - 1 ? 'border-b border-border' : ''}`}
                                                        >
                                                            <div className='py-4'>
                                                                <div className='grid grid-cols-[auto,1fr] gap-6'>
                                                                    <div className='flex items-start gap-2'>
                                                                        <PawPrint className='mt-1 h-4 w-4 text-[#4B6BFB]' />
                                                                        <div>
                                                                            <p className='font-medium'>
                                                                                {pet.name} ({reservation.roomNumber})
                                                                            </p>
                                                                            <p className='text-sm text-muted-foreground'>
                                                                                {pet.breed} · {pet.size} · {pet.weight}
                                                                                kg ·{' '}
                                                                                {pet.sex === 'M'
                                                                                    ? 'Macho'
                                                                                    : 'Hembra'} ·{' '}
                                                                                {pet.isNeutered
                                                                                    ? 'Castrado/a'
                                                                                    : 'No castrado/a'}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className='flex flex-wrap gap-4'>
                                                                        {petServices.map((service, index) => {
                                                                            const icon = getServiceIcon(
                                                                                service.type as ServiceType,
                                                                            )
                                                                            return icon ? (
                                                                                <div
                                                                                    key={index}
                                                                                    className='flex items-center gap-2'
                                                                                >
                                                                                    {icon}
                                                                                    <span className='text-sm text-muted-foreground'>
                                                                                        {formatServiceName(
                                                                                            service.type as ServiceType,
                                                                                        )}
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

                                                <div className='flex items-center justify-between border-t pt-6'>
                                                    <span className='font-semibold'>Precio Total</span>
                                                    <span className='text-lg font-bold'>{reservation.totalPrice}€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>
                        ))}

                        {filteredReservations.length === 0 && searchTerm && (
                            <div className='py-8 text-center text-muted-foreground'>
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
