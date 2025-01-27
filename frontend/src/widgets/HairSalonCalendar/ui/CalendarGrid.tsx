import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { cn } from '@/shared/lib/styles/class-merge'
import { useCalendarStore } from '../model/store'
import { TimeSlot } from './TimeSlot'
import { BUSINESS_HOURS } from '../model/types'

const timeSlots = Array.from({ length: BUSINESS_HOURS.end - BUSINESS_HOURS.start }, (_, i) => {
    const hour = BUSINESS_HOURS.start + i
    return `${String(hour).padStart(2, '0')}:00`
})

export function CalendarGrid() {
    const { view, selectedDate } = useCalendarStore()

    const weekDays = Array.from({ length: 6 }, (_, i) => {
        const date = addDays(startOfWeek(selectedDate, { locale: es, weekStartsOn: 1 }), i)
        return {
            date: format(date, 'yyyy-MM-dd'),
            dayName: format(date, 'EEEE', { locale: es }),
            dayNumber: format(date, 'd'),
        }
    })

    return (
        <Card className="flex-1">
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
    )
} 