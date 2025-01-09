import { useState, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { addDays, format, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { TimeSlot } from './TimeSlot'
import { UnscheduledReservations } from './UnscheduledReservations'
import { ManageReservationBanner } from './ManageReservationBanner'
import { useCalendarStore } from '../model/store'
import { BUSINESS_HOURS } from '../model/types'
import { cn } from '@/shared/lib/styles/class-merge'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '@/shared/ui/use-toast'
import { useReservation } from '@/components/ReservationContext'
import { HairSalonReservation } from '@/components/ReservationContext'
import { DatePicker } from '@/shared/ui/date-picker'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Calendar } from '@/shared/ui/calendar'

const timeSlots = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start }, (_, i) => {
    const hour = BUSINESS_HOURS.start + i
    return `${String(hour).padStart(2, '0')}:00`
})

interface HairSalonCalendarWidgetProps {
    managingReservationId?: string | null
}

export function HairSalonCalendarWidget({ managingReservationId }: HairSalonCalendarWidgetProps) {
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [view, setView] = useState<'day' | 'week'>('day')
    const [selectedHairdresser, setSelectedHairdresser] = useState<'hairdresser1' | 'hairdresser2'>('hairdresser1')
    const [searchParams, setSearchParams] = useSearchParams()
    const { toast } = useToast()
    const { reservations } = useReservation()

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

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfWeek(selectedDate, { locale: es }), i)
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
        <DndProvider backend={HTML5Backend}>
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

                {view === 'week' && (
                    <Tabs
                        defaultValue="hairdresser1"
                        value={selectedHairdresser}
                        onValueChange={(value) => setSelectedHairdresser(value as 'hairdresser1' | 'hairdresser2')}
                        className="mb-4"
                    >
                        <TabsList className="grid w-[400px] grid-cols-2">
                            <TabsTrigger value="hairdresser1">Peluquera 1</TabsTrigger>
                            <TabsTrigger value="hairdresser2">Peluquera 2</TabsTrigger>
                        </TabsList>
                    </Tabs>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {view === 'day'
                                ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                                : `Semana del ${format(new Date(weekDays[0].date), "d 'de' MMMM", {
                                    locale: es,
                                })} - ${selectedHairdresser === 'hairdresser1' ? 'Peluquera 1' : 'Peluquera 2'}`}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={cn(
                            "relative",
                            managingReservation && "pb-32" // Add padding when banner is shown
                        )}>
                            {view === 'day' ? (
                                <div className="grid grid-cols-2 divide-x">
                                    {/* Columna Peluquera 1 */}
                                    <div>
                                        <div className="text-center p-2 font-medium border-b">
                                            Peluquera 1
                                        </div>
                                        <div className="relative grid auto-rows-[4rem]">
                                            {timeSlots.map((time) => (
                                                <TimeSlot
                                                    key={time}
                                                    time={time}
                                                    date={format(selectedDate, 'yyyy-MM-dd')}
                                                    hairdresser="hairdresser1"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    {/* Columna Peluquera 2 */}
                                    <div>
                                        <div className="text-center p-2 font-medium border-b">
                                            Peluquera 2
                                        </div>
                                        <div className="relative grid auto-rows-[4rem]">
                                            {timeSlots.map((time) => (
                                                <TimeSlot
                                                    key={time}
                                                    time={time}
                                                    date={format(selectedDate, 'yyyy-MM-dd')}
                                                    hairdresser="hairdresser2"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-7">
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
                                    <div className="col-span-7 grid grid-cols-7">
                                        {weekDays.map((day) => (
                                            <div key={day.date} className="relative grid auto-rows-[4rem]">
                                                {timeSlots.map((time) => (
                                                    <TimeSlot
                                                        key={`${day.date}-${time}`}
                                                        time={time}
                                                        date={day.date}
                                                        hairdresser={selectedHairdresser}
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