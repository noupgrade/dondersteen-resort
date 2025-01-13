import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import {
    Hotel,
    Users
} from 'lucide-react'

import { HairSalonReservation, useHairSalonReservations } from '@/components/ReservationContext.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'
import { useToast } from '@/shared/ui/use-toast.ts'
import { HairSalonCalendarWidget } from '@/widgets/HairSalonCalendar'
import { ReservationCard } from '@/widgets/HairSalonCalendar/ui/ReservationCard'
import { HairSalonReservationModal } from '@/widgets/HairSalonCalendar/ui/HairSalonReservationModal'

export default function HairSalonInternalPanelPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const { reservations } = useHairSalonReservations()
    const pendingReservations = reservations.filter(res => res.status === 'pending')
    const [selectedReservation, setSelectedReservation] = useState<HairSalonReservation | null>(null)
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [reservationToReject, setReservationToReject] = useState<HairSalonReservation | null>(null)
    const { toast } = useToast()

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
    }, []) // Empty dependency array since we only want this to run once on mount

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
    }

    const handleDeleteReservation = async (reservation: HairSalonReservation) => {
        // Aquí implementarías la lógica para eliminar la reserva
        setSelectedReservation(null)
    }

    const handleOpenAcceptModal = (reservation: HairSalonReservation) => {
        setSelectedReservation(reservation)
        setIsAcceptModalOpen(true)
    }

    const handleOpenRejectModal = (reservation: HairSalonReservation) => {
        setReservationToReject(reservation)
        setIsRejectModalOpen(true)
    }

    const handleConfirmAccept = () => {
        if (!selectedReservation) return

        toast({
            title: "Reserva aceptada",
            description: "La reserva ha sido aceptada exitosamente."
        })

        setIsAcceptModalOpen(false)
        setSelectedReservation(null)
    }

    const handleConfirmReject = () => {
        if (!reservationToReject) return

        toast({
            title: "Reserva rechazada",
            description: "La reserva ha sido rechazada exitosamente."
        })

        setIsRejectModalOpen(false)
        setReservationToReject(null)
    }

    // Filter reservations by source
    const hotelReservations = pendingReservations.filter(r => r.source === 'hotel')
    const externalReservations = pendingReservations.filter(r => r.source === 'external')

    return (
        <div className='container mx-auto p-4 md:p-6'>
            <div className='flex items-center justify-between mb-4'>
                <h1 className='text-3xl font-bold'>Peluquería</h1>
            </div>

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

            {selectedReservation && (
                <HairSalonReservationModal
                    reservation={selectedReservation}
                    isOpen={!!selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onSave={handleSaveReservation}
                    onDelete={handleDeleteReservation}
                />
            )}
        </div>
    )
}
