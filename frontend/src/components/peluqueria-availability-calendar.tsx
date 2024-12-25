import { useCallback, useEffect, useState } from 'react'

import { addDays, format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'

import { useReservation } from '@/components/ReservationContext'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'

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
    const [availableHours, setAvailableHours] = useState<string[]>([])
    const { getCalendarAvailability } = useReservation()
    const peluqueriaAvailability = getCalendarAvailability('peluqueria')

    const updateAvailableHours = useCallback(
        (date: Date) => {
            const dateString = format(date, 'yyyy-MM-dd')
            const isDateAvailable = !peluqueriaAvailability[dateString] || peluqueriaAvailability[dateString] < 3
            const baseHours = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']
            const hours = isDateAvailable ? baseHours : []
            setAvailableHours(hours)
        },
        [peluqueriaAvailability],
    )

    useEffect(() => {
        if (selectedDate) {
            updateAvailableHours(selectedDate)
        }
    }, [selectedDate])

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

    return (
        <div className='space-y-4'>
            <Calendar
                mode='single'
                selected={selectedDate}
                onSelect={handleDateSelect}
                className='rounded-md border'
                locale={es}
                fromDate={startOfDay(new Date())}
                toDate={addDays(new Date(), 30)}
            />
            {selectedDate && (
                <div className='space-y-2'>
                    <h4 className='font-medium'>
                        Horas disponibles para {format(selectedDate, "d 'de' MMMM", { locale: es })}
                    </h4>
                    <div className='grid grid-cols-3 gap-2'>
                        {availableHours.map(hour => (
                            <Button
                                key={hour}
                                variant={propSelectedTime === hour ? 'default' : 'outline'}
                                onClick={() => handleTimeSelect(hour)}
                            >
                                {hour}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
