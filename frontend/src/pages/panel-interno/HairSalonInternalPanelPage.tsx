import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '@/shared/ui/button'
import { PlusCircle } from 'lucide-react'

import {
    Hotel,
    Users
} from 'lucide-react'

import { HairSalonReservation, useHairSalonReservations, useReservation } from '@/components/ReservationContext.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'
import { useToast } from '@/shared/ui/use-toast.ts'
import { HairSalonCalendarWidget } from '@/widgets/HairSalonCalendar'
import { ReservationCard } from '@/widgets/HairSalonCalendar/ui/ReservationCard'
import { HairSalonReservationModal } from '@/widgets/HairSalonCalendar/ui/HairSalonReservationModal'
import { ManageReservationBanner } from '@/widgets/HairSalonCalendar/ui/ManageReservationBanner'
import { CheckoutChangesNotificationBanner, type CheckoutChange } from '@/widgets/HairSalonCalendar/ui/CheckoutChangesNotificationBanner'
import { useCalendarStore } from '@/widgets/HairSalonCalendar/model/store'
import { useHotelNotificationStore } from '@/widgets/HotelNotificationBanner'
import { ClientSearchModal } from '@/shared/ui/client-search-modal'
import { useClientSearch } from '@/shared/hooks/use-client-search'

// Mock de cambios de checkout - Esto vendría de tu backend
const mockCheckoutChanges: CheckoutChange[] = [
    {
        id: '1',
        petName: 'Luna',
        clientName: 'Alice Example',
        roomNumber: 'HAB.2',
        currentDate: '2024-03-20',
        currentTime: '12:00',
        newDate: '2024-03-21',
        newTime: '14:00',
        timestamp: new Date().toISOString(),
        services: ['bath_and_trim', 'spa'],
        reservationId: 'EXAMPLE_HAIRSALON_2'
    },
    {
        id: '2',
        petName: 'Thor',
        clientName: 'Carlos Example',
        roomNumber: 'HAB.3',
        currentDate: '2024-03-22',
        currentTime: '11:00',
        newDate: '2024-03-23',
        newTime: '10:00',
        timestamp: new Date().toISOString(),
        services: ['bath_and_brush', 'deshedding', 'spa_ozone'],
        reservationId: 'EXAMPLE_HAIRSALON_3'
    }
]

export default function HairSalonInternalPanelPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { reservations } = useHairSalonReservations()
    const { updateReservation } = useReservation()
    const { updateReservation: updateCalendarReservation } = useCalendarStore()
    const pendingReservations = reservations.filter(res => res.status === 'pending')
    const [selectedReservation, setSelectedReservation] = useState<HairSalonReservation | null>(null)
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [reservationToReject, setReservationToReject] = useState<HairSalonReservation | null>(null)
    const { toast } = useToast()
    const { addNotification } = useHotelNotificationStore()

    // Estado para los cambios de checkout
    const [checkoutChanges, setCheckoutChanges] = useState<CheckoutChange[]>(mockCheckoutChanges)
    const [selectedChange, setSelectedChange] = useState<CheckoutChange | null>(null)

    // Get the active tab from the URL
    const activeTab = searchParams.get('view') || 'pending'
    const managingReservationId = searchParams.get('reservationId')

    // Initialize URL params only once on mount
    useEffect(() => {
        const view = searchParams.get('view')
        if (!view) {
            const newParams = new URLSearchParams(searchParams)
            newParams.set('view', 'pending')
            setSearchParams(newParams)
        }
    }, [])

    const handleTabChange = (value: string) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.set('view', value)
            if (value === 'pending') {
                newParams.delete('reservationId')
            }
            return newParams
        })
    }

    const handleOrganizeCita = (reservation: HairSalonReservation) => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.set('view', 'calendar')
            newParams.set('reservationId', reservation.id)
            return newParams
        })
    }

    const handleShowDetails = (reservation: HairSalonReservation) => {
        setSelectedReservation(reservation)
    }

    const handleSaveReservation = async (updatedReservation: HairSalonReservation) => {
        // Aquí implementarías la lógica para guardar los cambios
        setSelectedReservation(null)
        setSelectedChange(null)
    }

    const handleDeleteReservation = async (reservation: HairSalonReservation) => {
        // Aquí implementarías la lógica para eliminar la reserva
        setSelectedReservation(null)
        setSelectedChange(null)
    }

    const handleViewChange = (change: CheckoutChange) => {
        setSelectedChange(change)

        // Buscar la reserva correspondiente
        const reservation = reservations.find(r => r.id === change.reservationId)

        if (reservation) {
            setSelectedReservation(reservation)
            // Actualizar los parámetros de URL
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev)
                newParams.set('view', 'calendar')
                newParams.set('reservationId', reservation.id)
                return newParams
            })
        } else {
            toast({
                title: "Error",
                description: "No se encontró la reserva correspondiente",
                variant: "destructive"
            })
        }
    }

    const handleAcceptChange = async () => {
        if (!selectedChange || !selectedReservation) return

        try {
            // Actualizar el estado de la reserva
            const updatedReservation: HairSalonReservation = {
                ...selectedReservation,
                status: 'pending',
                date: selectedChange.newDate,
                time: '', // Quitar la hora para que vaya a sin hora asignada
                requestedTime: selectedChange.newTime,
                checkoutChangeAccepted: true
            }

            // Actualizar en el contexto de reservas
            await updateReservation(selectedReservation.id, updatedReservation)

            // Actualizar en el store del calendario
            await updateCalendarReservation(updatedReservation)

            toast({
                title: "Cambios aceptados",
                description: "Los cambios han sido aceptados. La cita se ha movido a citas sin hora asignada."
            })

            // Eliminar el cambio de la lista
            setCheckoutChanges(prev => prev.filter(c => c.id !== selectedChange.id))
            setSelectedChange(null)
            setSelectedReservation(null)

            // Volver a la vista de pendientes
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev)
                newParams.set('view', 'pending')
                newParams.delete('reservationId')
                return newParams
            })
        } catch (error) {
            console.error('Error al actualizar la reserva:', error)
            toast({
                title: "Error",
                description: "No se pudieron aplicar los cambios. Por favor, inténtalo de nuevo.",
                variant: "destructive"
            })
        }
    }

    const handleRejectChange = async () => {
        if (!selectedChange || !selectedReservation) return

        try {
            // Actualizar el estado de la reserva
            const updatedReservation: HairSalonReservation = {
                ...selectedReservation,
                checkoutChangeRejected: true
            }

            // Actualizar en el contexto de reservas
            await updateReservation(selectedReservation.id, updatedReservation)

            // Añadir notificación para hotel
            addNotification({
                type: 'rejected_checkout_change',
                message: 'La peluquería ha rechazado un cambio de horario solicitado por checkout.',
                metadata: {
                    clientName: selectedChange.clientName,
                    petName: selectedChange.petName,
                    roomNumber: selectedChange.roomNumber,
                    currentDate: selectedChange.currentDate,
                    currentTime: selectedChange.currentTime
                }
            })

            toast({
                title: "Cambios rechazados",
                description: "Los cambios han sido rechazados. La cita mantiene su horario original."
            })

            // Eliminar el cambio de la lista
            setCheckoutChanges(prev => prev.filter(c => c.id !== selectedChange.id))
            setSelectedChange(null)
            setSelectedReservation(null)

            // Volver a la vista de pendientes
            setSearchParams(prev => {
                const newParams = new URLSearchParams(prev)
                newParams.set('view', 'pending')
                newParams.delete('reservationId')
                return newParams
            })
        } catch (error) {
            console.error('Error al rechazar los cambios:', error)
            toast({
                title: "Error",
                description: "No se pudieron rechazar los cambios. Por favor, inténtalo de nuevo.",
                variant: "destructive"
            })
        }
    }

    // Filter reservations by source
    const hotelReservations = pendingReservations.filter(r => r.source === 'hotel')
    const externalReservations = pendingReservations.filter(r => r.source === 'external')

    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false)

    const { isOpen, handleOpen, handleClose, handleClientSelect, redirectPath, requirePetSelection } = useClientSearch({
        onClientSelect: (clientId, petId) => {
            const params = new URLSearchParams()
            params.set('userId', clientId)
            if (petId) {
                params.set('petId', petId)
            }
            window.location.href = `/peluqueria-booking?${params.toString()}`
        },
        redirectPath: '/peluqueria-booking',
        requirePetSelection: true
    })

    return (
        <div className='container mx-auto p-4 md:p-6'>
            <div className='flex items-center justify-between mb-4'>
                <h1 className='text-3xl font-bold'>Peluquería</h1>
                <Button
                    className='bg-[#34D399] text-white hover:bg-[#34D399]/90'
                    onClick={handleOpen}
                >
                    <PlusCircle className='mr-2 h-4 w-4' /> Nueva Reserva
                </Button>
            </div>

            <ClientSearchModal
                isOpen={isOpen}
                onClose={handleClose}
                onClientSelect={handleClientSelect}
                redirectPath={redirectPath}
                requirePetSelection={requirePetSelection}
                title="Buscar Cliente para Peluquería"
            />

            {/* Banner de notificaciones de cambios de checkout */}
            <CheckoutChangesNotificationBanner
                changes={checkoutChanges}
                onViewChange={handleViewChange}
                onAcceptChange={handleAcceptChange}
                onRejectChange={handleRejectChange}
            />

            <div className="mt-6">
                <Tabs value={activeTab} onValueChange={handleTabChange} className='space-y-6'>
                    <TabsList className='grid w-full grid-cols-2 gap-4 bg-transparent p-0'>
                        <TabsTrigger
                            value='pending'
                            className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                        >
                            Reservas pendientes
                        </TabsTrigger>
                        <TabsTrigger
                            value='calendar'
                            className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                        >
                            Calendario
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value='pending' className='mt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Solicitudes pendientes de Peluquería</CardTitle>
                                <CardDescription>
                                    Revisa y gestiona las solicitudes de peluquería en espera
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-8'>
                                    {/* Sección de Reservas de Hotel */}
                                    {hotelReservations.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Hotel className="h-5 w-5 text-primary" />
                                                <h3 className="text-lg font-semibold">Reservas de Hotel</h3>
                                            </div>
                                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                                <div className="grid grid-flow-col auto-cols-[calc(33.333%-0.5rem)] md:auto-cols-[300px] gap-4 pb-2">
                                                    {hotelReservations.map(reservation => (
                                                        <ReservationCard
                                                            key={reservation.id}
                                                            reservation={reservation}
                                                            onOrganizeCita={handleOrganizeCita}
                                                            onShowDetails={handleShowDetails}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Sección de Reservas Externas */}
                                    {externalReservations.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <Users className="h-5 w-5 text-primary" />
                                                <h3 className="text-lg font-semibold">Reservas Externas</h3>
                                            </div>
                                            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                                                <div className="grid grid-flow-col auto-cols-[calc(33.333%-0.5rem)] md:auto-cols-[300px] gap-4 pb-2">
                                                    {externalReservations.map(reservation => (
                                                        <ReservationCard
                                                            key={reservation.id}
                                                            reservation={reservation}
                                                            onOrganizeCita={handleOrganizeCita}
                                                            onShowDetails={handleShowDetails}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Mensaje cuando no hay reservas */}
                                    {pendingReservations.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">No hay reservas pendientes</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='calendar' className='mt-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Calendario de Peluquería</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <HairSalonCalendarWidget managingReservationId={managingReservationId} />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de detalles de reserva */}
            {selectedReservation && !selectedChange && (
                <HairSalonReservationModal
                    reservation={selectedReservation}
                    isOpen={!!selectedReservation}
                    onClose={() => {
                        setSelectedReservation(null)
                        setSelectedChange(null)
                    }}
                    onSave={handleSaveReservation}
                    onDelete={handleDeleteReservation}
                />
            )}

            {/* Banner de gestión de cambios */}
            {selectedChange && selectedReservation && activeTab === 'calendar' && (
                <ManageReservationBanner
                    reservation={selectedReservation}
                    onClose={() => {
                        setSelectedChange(null)
                        setSelectedReservation(null)
                        // Volver a la vista de pendientes
                        setSearchParams(prev => {
                            const newParams = new URLSearchParams(prev)
                            newParams.set('view', 'pending')
                            newParams.delete('reservationId')
                            return newParams
                        })
                    }}
                    onAccept={() => handleAcceptChange()}
                    onReject={() => handleRejectChange()}
                />
            )}
        </div>
    )
}
