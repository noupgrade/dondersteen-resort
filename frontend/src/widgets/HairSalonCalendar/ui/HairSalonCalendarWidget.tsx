import { useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { addDays, format, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { TimeSlot } from './TimeSlot'
import { UnscheduledReservations } from './UnscheduledReservations'
import { useCalendarStore } from '../model/store'
import { BUSINESS_HOURS } from '../model/types'
import { cn } from '@/shared/lib/styles/class-merge'

const timeSlots = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start }, (_, i) => {
    const hour = BUSINESS_HOURS.start + i
    return `${String(hour).padStart(2, '0')}:00`
})

export function HairSalonCalendarWidget() {
    const { view, selectedDate, setView, setSelectedDate } = useCalendarStore()

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
                        <div className="relative">
                            {view === 'day' ? (
                                <div className="relative grid auto-rows-[4rem]">
                                    {timeSlots.map((time) => (
                                        <TimeSlot
                                            key={time}
                                            time={time}
                                            date={format(selectedDate, 'yyyy-MM-dd')}
                                        />
                                    ))}
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
            </div>
        </DndProvider>
    )
} 