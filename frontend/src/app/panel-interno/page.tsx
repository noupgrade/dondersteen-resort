import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import { Clock, PawPrint, Plus, PlusCircle, Scissors, Users } from 'lucide-react'
import Link from 'next/link'

import { useReservation } from '@/components/ReservationContext'
import { AvailabilityCalendarView } from '@/components/availability-calendar-view'
import { CheckIns } from '@/components/check-ins'
import { CheckOuts } from '@/components/check-outs'
import { HotelAvailabilityCalendar } from '@/components/hotel-availability-calendar'
import { PendingRequests } from '@/components/pending-requests'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PanelInterno() {
    const { reservations, getReservationsByDate } = useReservation()
    const [pendingRequests, setPendingRequests] = useState<any[]>([])
    const [activeReservations, setActiveReservations] = useState<any[]>([])
    const [groomingAppointments, setGroomingAppointments] = useState<any[]>([])

    useEffect(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const todayRes = getReservationsByDate(today)
        setPendingRequests(reservations.filter(r => r.type === 'hotel' && r.status === 'pending'))
        setActiveReservations(
            reservations.filter(
                r => r.type === 'hotel' && new Date(r.date) <= new Date() && new Date(r.checkOutDate) > new Date(),
            ),
        )
        setGroomingAppointments(todayRes.filter(r => r.type === 'peluqueria'))
    }, [reservations, getReservationsByDate])

    const occupancy = activeReservations.length > 0 ? (activeReservations.length / 20) * 100 : 0

    return (
        <div className='container space-y-8 p-8'>
            <div className='flex items-center justify-between'>
                <h1 className='text-4xl font-bold text-[#101828]'>Panel de Control</h1>
                <div className='flex gap-4'>
                    <Button asChild className='bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90'>
                        <Link href='/booking'>
                            <PlusCircle className='mr-2 h-4 w-4' /> Nueva Reserva
                        </Link>
                    </Button>
                    <Button asChild className='bg-[#9757D7] text-white hover:bg-[#9757D7]/90'>
                        <Link href='/peluqueria-booking'>
                            <Plus className='mr-2 h-4 w-4' /> Añadir Cita Peluquería
                        </Link>
                    </Button>
                </div>
            </div>

            <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-4'>
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

                <Card className='bg-gradient-to-br from-[#9757D7] to-[#9757D7]/80 text-white'>
                    <CardHeader className='flex flex-row items-center justify-between pb-2'>
                        <CardTitle className='text-lg font-medium'>Citas de Peluquería</CardTitle>
                        <Scissors className='h-5 w-5 text-[#E5E7EB]' />
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{groomingAppointments.length}</div>
                        <p className='text-xs text-[#E5E7EB]'>Citas para hoy</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Calendario de Disponibilidad del Hotel</CardTitle>
                </CardHeader>
                <CardContent>
                    <HotelAvailabilityCalendar />
                </CardContent>
            </Card>

            <Tabs defaultValue='pending' className='space-y-4'>
                <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='pending'>Solicitudes pendientes</TabsTrigger>
                    <TabsTrigger value='check-ins'>Entradas</TabsTrigger>
                    <TabsTrigger value='check-outs'>Salidas</TabsTrigger>
                    <TabsTrigger value='grooming'>Peluquería</TabsTrigger>
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
                <TabsContent value='check-ins'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Entradas del Día</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CheckIns />
                        </CardContent>
                    </Card>
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
                <TabsContent value='grooming'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendario de Disponibilidad de Peluquería</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AvailabilityCalendarView />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
