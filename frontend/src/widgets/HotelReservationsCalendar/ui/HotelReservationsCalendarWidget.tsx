import { addDays, format, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Home } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useCalendarStore } from '../model/store'
import { cn } from '@/shared/lib/styles/class-merge'
import { HotelReservation, useReservation } from '@/components/ReservationContext'

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

    const renderReservations = (date: string) => {
        const reservations = getReservationsForDate(date)
        // Agrupar reservas por habitación
        const roomGroups = reservations.reduce((groups, reservation) => {
            const roomNumber = reservation.roomNumber || '?'
            if (!groups[roomNumber]) {
                groups[roomNumber] = []
            }
            groups[roomNumber].push(reservation)
            return groups
        }, {} as Record<string, HotelReservation[]>)

        // Ordenar las habitaciones: primero las no asignadas (?), luego el resto alfabéticamente
        const sortedRooms = Object.entries(roomGroups).sort(([roomA], [roomB]) => {
            if (roomA === '?' && roomB === '?') return 0
            if (roomA === '?') return -1
            if (roomB === '?') return 1
            return roomA.localeCompare(roomB)
        })

        return (
            <div className="space-y-2">
                {sortedRooms.map(([roomNumber, roomReservations]) => (
                    <div
                        key={roomNumber}
                        className={cn(
                            "rounded-md p-2 text-sm",
                            roomNumber === '?' ? "bg-amber-100/60" : "bg-primary/10"
                        )}
                    >
                        <div className={cn(
                            "flex items-center gap-1.5 mb-1",
                            roomNumber === '?' ? "text-amber-800" : "text-primary"
                        )}>
                            <Home className="h-4 w-4" />
                            <span className="text-base font-bold">{roomNumber}</span>
                        </div>
                        <div className="pl-5 space-y-0.5">
                            {roomReservations.flatMap(reservation =>
                                reservation.pets.map(pet => (
                                    <div key={`${reservation.id}-${pet.name}`} className={cn("text-sm", roomNumber === '?' ? "text-amber-800" : "text-primary")}>
                                        {pet.name}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
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
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={() => setSelectedDate(new Date())}
                        >
                            <CalendarIcon className="h-4 w-4" />
                            <span>Hoy</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleNavigate('next')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {view === 'day'
                            ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                            : `Semana del ${format(new Date(weekDays[0].date), "d 'de' MMMM", {
                                locale: es,
                            })}`}
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
                                            "border-b border-r p-2 text-center",
                                            format(new Date(day.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') &&
                                            "bg-primary/5"
                                        )}
                                    >
                                        <div className="font-medium capitalize">
                                            {day.dayName}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {day.dayNumber}
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