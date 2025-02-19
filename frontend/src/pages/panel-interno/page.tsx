import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { format } from 'date-fns'

import { useReservation } from '@/components/ReservationContext.tsx'
import { CheckIns } from '@/components/check-ins.tsx'
import { CheckOuts } from '@/components/check-outs.tsx'
import { PendingRequests } from '@/components/pending-requests.tsx'
import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { useClientSearch } from '@/shared/hooks/use-client-search'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { ClientSearchModal } from '@/shared/ui/client-search-modal'
import { Tabs, TabsContent } from '@/shared/ui/tabs.tsx'
import { HotelNotificationBanner, useHotelNotificationStore } from '@/widgets/HotelNotificationBanner'
import { HotelReservationsCalendarWidget } from '@/widgets/HotelReservationsCalendar'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'

import { ActiveReservations, Header, TabNavigation } from './components'

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
            .sort(
                (a, b) => new Date(a.checkOutDate).getTime() - new Date(b.checkOutDate).getTime(),
            ) as HotelReservation[]
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

    const handleNewBudget = () => {
        setBookingType('budget')
        handleOpen()
    }

    const handleNewReservation = () => {
        setBookingType('hotel')
        handleOpen()
    }

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <Header onNewBudget={handleNewBudget} onNewReservation={handleNewReservation} />

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
                <TabNavigation
                    pendingRequests={pendingRequests}
                    checkIns={checkIns}
                    checkOuts={checkOuts}
                />

                <TabsContent value='pending'>
                    <Card>
                        <CardContent>
                            <PendingRequests />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='active'>
                    <ActiveReservations
                        onViewReservation={handleViewReservation}
                    />
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
