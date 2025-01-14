import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Calendar } from '@/shared/ui/calendar'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { cn } from '@/shared/lib/styles/class-merge'
import { useReservation } from './ReservationContext'
import { useHotelAvailability } from './HotelAvailabilityContext'
import { Badge } from '@/shared/ui/badge'
import { DateRange } from 'react-day-picker'

interface AvailabilityCalendarProps {
    className?: string
    onSelect: (dates: { from: Date; to: Date }, pickupTime: string) => void
    capacity: number
}

export function AvailabilityCalendar({ className, onSelect, capacity }: AvailabilityCalendarProps) {
    const [selectedDates, setSelectedDates] = useState<DateRange | undefined>()

    const [pickupTime, setPickupTime] = useState<string>('09:00')
    const { getCalendarAvailability } = useReservation()
    const { isWeekend, isHighSeason, isDateBlocked } = useHotelAvailability()
    const hotelAvailability = getCalendarAvailability('hotel')

    const isOutOfHours = (hour: number) => hour < 8 || hour >= 19
    const pickupHour = parseInt(pickupTime.split(':')[0], 10)

    const handleSelect = (range: DateRange | undefined) => {
        // Prevent selection of weekends for check-in/check-out
        if (range?.from && isWeekend(format(range.from, 'yyyy-MM-dd'))) {
            return
        }
        if (range?.to && isWeekend(format(range.to, 'yyyy-MM-dd'))) {
            return
        }

        // Check if there are any blocked dates in the range
        if (range?.from && range?.to) {
            const start = new Date(range.from)
            const end = new Date(range.to)
            for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
                if (isDateBlocked(format(date, 'yyyy-MM-dd'))) {
                    return // Don't allow selection if there are blocked dates in between
                }
            }
        }

        setSelectedDates(range)
        if (range?.from && range?.to) {
            onSelect({ from: range.from, to: range.to }, pickupTime)
        }
    }

    const handlePickupTimeChange = (time: string) => {
        setPickupTime(time)
        if (selectedDates?.from && selectedDates?.to) {
            onSelect({ from: selectedDates.from, to: selectedDates.to }, time)
        }
    }

    return (
        <div className='space-y-4'>
            <Calendar
                mode='range'
                selected={selectedDates}
                onSelect={handleSelect}
                className={cn('rounded-md border', className)}
                modifiers={{
                    available: date => {
                        const dateString = format(date, 'yyyy-MM-dd')
                        const currentOccupancy = hotelAvailability[dateString] || 0
                        return currentOccupancy < capacity && !isDateBlocked(dateString)
                    },
                    highSeason: date => {
                        const dateString = format(date, 'yyyy-MM-dd')
                        return isHighSeason(dateString)
                    },
                    weekend: date => {
                        const dateString = format(date, 'yyyy-MM-dd')
                        return isWeekend(dateString)
                    },
                    start: date => Boolean(selectedDates?.from && format(date, 'yyyy-MM-dd') === format(selectedDates.from, 'yyyy-MM-dd')),
                    end: date => Boolean(selectedDates?.to && format(date, 'yyyy-MM-dd') === format(selectedDates.to, 'yyyy-MM-dd')),
                    range: date =>
                        Boolean(
                            selectedDates?.from &&
                            selectedDates?.to &&
                            date > selectedDates.from &&
                            date < selectedDates.to,
                        ),
                }}
                modifiersStyles={{
                    available: { backgroundColor: '#2d6a4f', color: 'white' },
                    highSeason: { backgroundColor: '#22c55e', color: 'white' },
                    weekend: { backgroundColor: '#f59e0b', color: 'white', cursor: 'not-allowed' },
                    start: { backgroundColor: '#93c5fd', color: 'black', fontWeight: 'bold' },
                    end: { backgroundColor: '#93c5fd', color: 'black', fontWeight: 'bold' },
                    range: {
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    },
                }}
                disabled={date => {
                    const dateString = format(date, 'yyyy-MM-dd')
                    const currentOccupancy = hotelAvailability[dateString] || 0
                    return currentOccupancy >= capacity || isWeekend(dateString) || isDateBlocked(dateString)
                }}
                fromDate={new Date()}
                locale={es}
            />
            <div className='flex flex-wrap justify-center gap-4 text-sm'>
                <div className='flex items-center'>
                    <div className='mr-2 h-4 w-4 rounded bg-[#2d6a4f]'></div>
                    <span>Disponible</span>
                </div>
                <div className='flex items-center'>
                    <div className='mr-2 h-4 w-4 rounded bg-[#22c55e]'></div>
                    <span>Temporada Alta</span>
                </div>
                <div className='flex items-center'>
                    <div className='mr-2 h-4 w-4 rounded bg-[#f59e0b]'></div>
                    <span>Domingos sin entradas ni salidas</span>
                </div>
                <div className='flex items-center'>
                    <div className='mr-2 h-4 w-4 rounded bg-gray-200'></div>
                    <span>No disponible</span>
                </div>
            </div>
            <div className='mt-4 space-y-2'>
                <Label htmlFor='pickupTime'>Hora de recogida:</Label>
                <Select onValueChange={handlePickupTimeChange} defaultValue={pickupTime}>
                    <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Selecciona la hora' />
                    </SelectTrigger>
                    <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                            <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {isOutOfHours(pickupHour) && (
                    <p className='mt-2 text-sm text-yellow-600'>
                        Horario del hotel: 8:00 a 18:00. Recogida fuera de horario: 70€ adicionales.
                    </p>
                )}
            </div>
        </div>
    )
}
