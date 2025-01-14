import { useCallback, useEffect, useState } from 'react'

import { addDays, format, startOfDay, isWeekend } from 'date-fns'
import { es } from 'date-fns/locale'

import { useReservation } from '@/components/ReservationContext'
import { useHotelAvailability } from '@/components/HotelAvailabilityContext'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { FormLabel } from '@/shared/ui/form'

type PeluqueriaAvailabilityCalendarProps = {
    onSelect: (date: Date, time: string) => void
    selectedDate?: Date
    selectedTime?: string
}

export function PeluqueriaAvailabilityCalendar({
    onSelect,
    selectedDate: propSelectedDate,
    selectedTime: propSelectedTime,
}: PeluqueriaAvailabilityCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(propSelectedDate || new Date())
    const { getCalendarAvailability } = useReservation()
    const { isHoliday } = useHotelAvailability()
    const peluqueriaAvailability = getCalendarAvailability('peluqueria')

    // Generar horas disponibles de 9:00 a 16:00
    const availableHours = Array.from({ length: 8 }, (_, i) => {
        const hour = i + 9
        return `${hour.toString().padStart(2, '0')}:00`
    })

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
            onSelect(date, propSelectedTime || '')
        }
    }

    const handleTimeSelect = (time: string) => {
        if (selectedDate) {
            onSelect(selectedDate, time)
        }
    }

    const isDateUnavailable = useCallback((date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd')
        const isWeekendDay = isWeekend(date)
        const isHolidayDay = isHoliday(dateString)
        const hasMaxReservations = peluqueriaAvailability[dateString] >= 3

        return isWeekendDay || isHolidayDay || hasMaxReservations
    }, [isHoliday, peluqueriaAvailability])

    return (
        <div className='space-y-4'>
            <div className='flex justify-center'>
                <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    className='rounded-md border w-full max-w-[350px] mx-auto'
                    locale={es}
                    fromDate={startOfDay(new Date())}
                    toDate={addDays(new Date(), 30)}
                    disabled={isDateUnavailable}
                    modifiers={{
                        weekend: date => isWeekend(date),
                        holiday: date => isHoliday(format(date, 'yyyy-MM-dd')),
                        busy: date => peluqueriaAvailability[format(date, 'yyyy-MM-dd')] >= 3
                    }}
                    modifiersStyles={{
                        weekend: { textDecoration: 'line-through', color: 'gray' },
                        holiday: { backgroundColor: 'rgb(251 191 36)', color: 'white' },
                        busy: { backgroundColor: 'rgb(239 68 68)', color: 'white' }
                    }}
                    showOutsideDays={false}
                />
            </div>
            {selectedDate && (
                <div className='space-y-2'>
                    <FormLabel>Hora del servicio</FormLabel>
                    <Select onValueChange={handleTimeSelect} value={propSelectedTime}>
                        <SelectTrigger>
                            <SelectValue placeholder='Selecciona una hora' />
                        </SelectTrigger>
                        <SelectContent>
                            {availableHours.map(hour => (
                                <SelectItem key={hour} value={hour}>
                                    {hour}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}
