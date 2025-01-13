import { addDays, format, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Truck } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useCalendarStore } from '../model/store'
import { cn } from '@/shared/lib/styles/class-merge'
import { HotelReservation, useReservation } from '@/components/ReservationContext'
import { Badge } from '@/shared/ui/badge'
import { Calendar } from '@/shared/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/shared/ui/popover'

export function HotelReservationsCalendarWidget() {
    const { view, selectedDate, setView, setSelectedDate } = useCalendarStore()
    const { reservations } = useReservation()

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (view === 'week') {
            setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1))
        } else {
            setSelectedDate(direction === 'prev' ? addDays(selectedDate, -1) : addDays(selectedDate, 1))
        }
    }

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfWeek(selectedDate, { locale: es }), i)
        return {
            date: format(date, 'yyyy-MM-dd'),
            dayName: format(date, 'EEEE', { locale: es }),
            dayNumber: format(date, 'd'),
        }
    })

    const getReservationsForDate = (date: string) => {
        return reservations.filter(
            (reservation): reservation is HotelReservation =>
                reservation.type === 'hotel' &&
                new Date(reservation.checkInDate) <= new Date(date) &&
                new Date(reservation.checkOutDate) >= new Date(date)
        )
    }

    const getReservationStyle = (reservation: HotelReservation, date: string) => {
        const isCheckIn = isSameDay(new Date(reservation.checkInDate), new Date(date))
        const isCheckOut = isSameDay(new Date(reservation.checkOutDate), new Date(date))
        const isDaycare = isSameDay(new Date(reservation.checkInDate), new Date(reservation.checkOutDate))

        if (isDaycare) return 'bg-purple-200 border-purple-400'
        if (isCheckOut) return 'bg-orange-100 border-orange-300'
        if (isCheckIn) return 'bg-green-100 border-green-300'
        return 'bg-slate-100 border-slate-300'
    }

    const getReservationPriority = (reservation: HotelReservation, date: string) => {
        const isCheckIn = isSameDay(new Date(reservation.checkInDate), new Date(date))
        const isCheckOut = isSameDay(new Date(reservation.checkOutDate), new Date(date))
        const isDaycare = isSameDay(new Date(reservation.checkInDate), new Date(reservation.checkOutDate))

        if (isCheckOut) return 0 // Máxima prioridad
        if (isCheckIn) return 1
        if (isDaycare) return 2
        return 3 // Mínima prioridad
    }

    const hasTransportService = (reservation: HotelReservation, date: string) => {
        const transportService = reservation.additionalServices.find(service => service.type === 'driver')
        if (!transportService) return false

        const isCheckOut = isSameDay(new Date(reservation.checkOutDate), new Date(date))
        const isCheckIn = isSameDay(new Date(reservation.checkInDate), new Date(date))

        return (transportService.serviceType === 'pickup' && isCheckIn) ||
               (transportService.serviceType === 'dropoff' && isCheckOut) ||
               (transportService.serviceType === 'both' && (isCheckIn || isCheckOut))
    }

    const getTimeDisplay = (reservation: HotelReservation, date: string) => {
        const currentDate = new Date(date)
        const checkInDate = new Date(reservation.checkInDate)
        const checkOutDate = new Date(reservation.checkOutDate)
        
        const isCheckIn = isSameDay(checkInDate, currentDate)
        const isCheckOut = isSameDay(checkOutDate, currentDate)
        
        if (isCheckIn && reservation.checkInTime) {
            return reservation.checkInTime
        }
        
        if (isCheckOut && reservation.checkOutTime) {
            return reservation.checkOutTime
        }
        
        // Si no hay hora específica, usar valores por defecto
        if (isCheckIn) return '14:00'
        if (isCheckOut) return '12:00'
        
        return null
    }

    const renderReservations = (date: string) => {
        const reservations = getReservationsForDate(date)
        // Agrupar reservas por cliente y ordenar por prioridad
        const clientGroups = reservations.reduce((groups, reservation) => {
            const clientId = reservation.client.id || 'unknown'
            if (!groups[clientId]) {
                groups[clientId] = {
                    client: {
                        name: reservation.client.name || 'Cliente sin nombre',
                        id: clientId
                    },
                    reservations: [],
                    priority: getReservationPriority(reservation, date),
                    earliestCheckOut: new Date(reservation.checkOutDate).getTime()
                }
            }
            groups[clientId].reservations.push(reservation)
            // Usar la prioridad más alta entre todas las reservas del cliente
            groups[clientId].priority = Math.min(groups[clientId].priority, getReservationPriority(reservation, date))
            // Actualizar la fecha de check-out más temprana
            groups[clientId].earliestCheckOut = Math.min(
                groups[clientId].earliestCheckOut,
                new Date(reservation.checkOutDate).getTime()
            )
            return groups
        }, {} as Record<string, { 
            client: { name: string, id: string }, 
            reservations: HotelReservation[], 
            priority: number,
            earliestCheckOut: number 
        }>)

        // Convertir a array y ordenar por prioridad y fecha de check-out
        const sortedGroups = Object.values(clientGroups).sort((a, b) => {
            // Primero ordenar por prioridad
            if (a.priority !== b.priority) {
                return a.priority - b.priority
            }
            // Si tienen la misma prioridad, ordenar por fecha de check-out más cercana
            return a.earliestCheckOut - b.earliestCheckOut
        })

        return (
            <div className="space-y-2">
                {sortedGroups.map(({ client, reservations }) => {
                    const cardStyle = getReservationStyle(reservations[0], date)
                    return (
                        <div 
                            key={client.id} 
                            className={cn(
                                "rounded-lg border p-2",
                                cardStyle
                            )}
                        >
                            <div className="font-medium mb-2">{client.name}</div>
                            <div className="space-y-1">
                                {reservations.map((reservation) => {
                                    const timeDisplay = getTimeDisplay(reservation, date)
                                    return (
                                        <div 
                                            key={reservation.id} 
                                            className="rounded border border-current/20 p-1.5 relative bg-white/50"
                                        >
                                            <div className="absolute -top-2 right-0 flex items-center gap-1">
                                                {timeDisplay && (
                                                    <Badge variant="secondary" className="text-xs py-0 px-1.5">
                                                        {timeDisplay}
                                                    </Badge>
                                                )}
                                                {hasTransportService(reservation, date) && (
                                                    <Badge className="h-4 w-4 p-0 flex items-center justify-center">
                                                        <Truck className="h-3 w-3" />
                                                    </Badge>
                                                )}
                                            </div>
                                            {reservation.pets.map((pet) => (
                                                <div key={pet.name} className="text-sm">
                                                    {pet.name} ({reservation.roomNumber})
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const getTotalPetsForDate = (date: string) => {
        const reservations = getReservationsForDate(date)
        return reservations.reduce((total, reservation) => total + reservation.pets.length, 0)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setView(view === 'day' ? 'week' : 'day')}
                        className="flex items-center gap-2"
                    >
                        {view === 'day' ? (
                            <>
                                <CalendarDays className="h-4 w-4" />
                                <span>Vista diaria</span>
                            </>
                        ) : (
                            <>
                                <CalendarRange className="h-4 w-4" />
                                <span>Vista semanal</span>
                            </>
                        )}
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleNavigate('prev')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 min-w-[130px] justify-start"
                                >
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{format(selectedDate, "d 'de' MMMM", { locale: es })}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                    initialFocus
                                    footer={
                                        <div className="p-3 border-t">
                                            <Button
                                                variant="outline"
                                                className="w-full flex items-center justify-center gap-2"
                                                onClick={() => setSelectedDate(new Date())}
                                            >
                                                <CalendarIcon className="h-4 w-4" />
                                                Ir a hoy
                                            </Button>
                                        </div>
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleNavigate('next')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant="outline" className="bg-orange-100 border-orange-300">Check-out</Badge>
                    <Badge variant="outline" className="bg-green-100 border-green-300">Check-in</Badge>
                    <Badge variant="outline" className="bg-purple-200 border-purple-400">Guardería</Badge>
                    <Badge variant="outline" className="bg-slate-100 border-slate-300">En curso</Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>
                            {view === 'day'
                                ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                                : `Semana del ${format(new Date(weekDays[0].date), "d 'de' MMMM", {
                                    locale: es,
                                })}`}
                        </span>
                        {view === 'day' && (
                            <Badge variant="secondary" className="ml-2">
                                {getTotalPetsForDate(format(selectedDate, 'yyyy-MM-dd'))} mascotas
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="relative">
                        {view === 'day' ? (
                            <div className="min-h-[200px] p-4">
                                {renderReservations(format(selectedDate, 'yyyy-MM-dd'))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-7">
                                {/* Header de días */}
                                {weekDays.map((day) => (
                                    <div
                                        key={day.date}
                                        className={cn(
                                            "border-b border-r p-2",
                                            format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
                                            "bg-primary/5"
                                        )}
                                    >
                                        <div className="text-center">
                                            <div className="font-medium capitalize">
                                                {day.dayName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {day.dayNumber}
                                            </div>
                                        </div>
                                        <div className="mt-1 flex justify-center">
                                            <Badge variant="secondary" className="text-xs py-0 px-2">
                                                {getTotalPetsForDate(day.date)} mascotas
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                {/* Grid de reservas */}
                                <div className="col-span-7 grid grid-cols-7">
                                    {weekDays.map((day) => (
                                        <div
                                            key={day.date}
                                            className={cn(
                                                "min-h-[200px] border-r p-2",
                                                format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
                                                "bg-primary/5"
                                            )}
                                        >
                                            {renderReservations(day.date)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 