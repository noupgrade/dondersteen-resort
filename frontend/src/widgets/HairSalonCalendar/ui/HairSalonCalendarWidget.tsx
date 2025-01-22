import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Calendar as CalendarIcon, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

import { HairSalonReservation, useReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useToast } from '@/shared/ui/use-toast'
import { useSearchParams } from 'react-router-dom'
import { BUSINESS_HOURS } from '../model/types'
import { ManageReservationBanner } from './ManageReservationBanner'
import { TimeSlot } from './TimeSlot'
import { UnscheduledReservations } from './UnscheduledReservations'

const timeSlots = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start }, (_, i) => {
    const hour = BUSINESS_HOURS.start + i
    return `${String(hour).padStart(2, '0')}:00`
})

interface HairSalonCalendarWidgetProps {
    managingReservationId?: string | null
}

// Función para detectar si es un dispositivo táctil
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

export function HairSalonCalendarWidget({ managingReservationId }: HairSalonCalendarWidgetProps) {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [view, setView] = useState<'day' | 'week'>('day')
    const [, setSearchParams] = useSearchParams()
    const { toast } = useToast()
    const { reservations } = useReservation()
    const [backend,] = useState(() => 
        isTouchDevice() ? TouchBackend : HTML5Backend
    )

    // Find the reservation being managed
    const managingReservation = managingReservationId
        ? reservations.find(r => r.id === managingReservationId && r.type === 'peluqueria') as HairSalonReservation
        : null

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (view === 'week') {
            setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1))
        } else {
            setSelectedDate(direction === 'prev' ? addDays(selectedDate, -1) : addDays(selectedDate, 1))
        }
    }

    const weekDays = Array.from({ length: 6 }, (_, i) => {
        const date = addDays(startOfWeek(selectedDate, { locale: es, weekStartsOn: 1 }), i)
        return {
            date: format(date, 'yyyy-MM-dd'),
            dayName: format(date, 'EEEE', { locale: es }),
            dayNumber: format(date, 'd'),
        }
    })

    const handleCloseBanner = () => {
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.delete('reservationId')
            return newParams
        })
    }

    const handleAcceptReservation = () => {
        if (!managingReservation) return

        // Here you would handle the reservation acceptance
        toast({
            title: "Reserva aceptada",
            description: "La reserva ha sido aceptada exitosamente."
        })
        handleCloseBanner()
    }

    const handleRejectReservation = () => {
        if (!managingReservation) return

        // Here you would handle the reservation rejection
        toast({
            title: "Reserva rechazada",
            description: "La reserva ha sido rechazada exitosamente."
        })
        handleCloseBanner()
    }

    return (
        <DndProvider backend={backend} options={{ enableMouseEvents: true }}>
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
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-2 w-[180px] justify-start text-left font-normal"
                                    >
                                        <CalendarIcon className="h-4 w-4" />
                                        {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={(date) => date && setSelectedDate(date)}
                                        initialFocus
                                        footer={
                                            <Button
                                                variant="outline"
                                                className="w-full mt-2 bg-primary/5 hover:bg-primary/10 border-primary/10 hover:border-primary/20 text-primary"
                                                onClick={() => {
                                                    setSelectedDate(new Date())
                                                }}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                Ir a hoy
                                            </Button>
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
                </div>

                <UnscheduledReservations className="mb-4" />

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
                        <div className={cn(
                            "relative",
                            managingReservation && "pb-32" // Add padding when banner is shown
                        )}>
                            {view === 'day' ? (
                                <div>
                                    <div className="relative grid auto-rows-[4rem]">
                                        {timeSlots.map((time) => (
                                            <TimeSlot
                                                key={time}
                                                time={time}
                                                date={format(selectedDate, 'yyyy-MM-dd')}
                                                isWeekView={false}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-6">
                                    {/* Header de días */}
                                    {weekDays.map((day) => (
                                        <div
                                            key={day.date}
                                            className="border-b border-r p-2 text-center"
                                        >
                                            <div className="font-medium capitalize">
                                                {day.dayName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {day.dayNumber}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Grid de slots */}
                                    <div className="col-span-6 grid grid-cols-6">
                                        {weekDays.map((day) => (
                                            <div key={day.date} className="relative grid auto-rows-[4rem]">
                                                {timeSlots.map((time) => (
                                                    <TimeSlot
                                                        key={`${day.date}-${time}`}
                                                        time={time}
                                                        date={day.date}
                                                        isWeekView={true}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {managingReservation && (
                    <ManageReservationBanner
                        reservation={managingReservation}
                        onClose={handleCloseBanner}
                        onAccept={managingReservation.source === 'external' ? handleAcceptReservation : undefined}
                        onReject={managingReservation.source === 'external' ? handleRejectReservation : undefined}
                    />
                )}
            </div>
        </DndProvider>
    )
} 