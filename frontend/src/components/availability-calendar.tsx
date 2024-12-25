import { useState } from 'react'

import { format, isAfter, isBefore, isEqual } from 'date-fns'
import { es } from 'date-fns/locale'

import { useReservation } from '@/components/ReservationContext'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/shared/lib/styles/class-merge'

type AvailabilityCalendarProps = {
    className?: string
    onSelect: (dates: { from: Date; to: Date }, pickupTime: string) => void
    capacity: number
}

export function AvailabilityCalendar({ className, onSelect, capacity }: AvailabilityCalendarProps) {
    const [selectedDates, setSelectedDates] = useState<{
        from: Date | undefined
        to: Date | undefined
    }>({
        from: undefined,
        to: undefined,
    })

    const [pickupTime, setPickupTime] = useState<string>('09:00')
    const { getCalendarAvailability } = useReservation()
    const hotelAvailability = getCalendarAvailability('hotel')

    const isOutOfHours = (hour: number) => hour < 8 || hour >= 19
    const pickupHour = parseInt(pickupTime.split(':')[0], 10)

    const handleSelect = (dates: { from: Date | undefined; to: Date | undefined }) => {
        if (selectedDates.from && selectedDates.to && dates.from && !dates.to) {
            setSelectedDates({ from: dates.from, to: undefined })
            onSelect({ from: dates.from, to: dates.from }, pickupTime)
            return
        }

        setSelectedDates(dates)
        if (dates.from && dates.to) {
            onSelect({ from: dates.from, to: dates.to }, pickupTime)
        }
    }

    const handlePickupTimeChange = (time: string) => {
        setPickupTime(time)
        if (selectedDates.from && selectedDates.to) {
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
                        return currentOccupancy < capacity
                    },
                    lastPlaces: date => {
                        const dateString = format(date, 'yyyy-MM-dd')
                        const currentOccupancy = hotelAvailability[dateString] || 0
                        return currentOccupancy >= capacity * 0.8 && currentOccupancy < capacity
                    },
                    start: date => Boolean(selectedDates.from && isEqual(date, selectedDates.from)),
                    end: date => Boolean(selectedDates.to && isEqual(date, selectedDates.to)),
                    range: date =>
                        Boolean(
                            selectedDates.from &&
                                selectedDates.to &&
                                isAfter(date, selectedDates.from) &&
                                isBefore(date, selectedDates.to),
                        ),
                }}
                modifiersStyles={{
                    available: { backgroundColor: '#2d6a4f', color: 'white' },
                    lastPlaces: { backgroundColor: '#fbbf24', color: 'white' },
                    start: { backgroundColor: '#93c5fd', color: 'black', fontWeight: 'bold' },
                    end: { backgroundColor: '#93c5fd', color: 'black', fontWeight: 'bold' },
                    range: {
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                        '&:hover': { backgroundColor: 'rgba(59, 130, 246, 0.7)' },
                    },
                }}
                disabled={date => {
                    const dateString = format(date, 'yyyy-MM-dd')
                    const currentOccupancy = hotelAvailability[dateString] || 0
                    return currentOccupancy >= capacity
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
                    <div className='mr-2 h-4 w-4 rounded bg-[#fbbf24]'></div>
                    <span>Últimas plazas</span>
                </div>
                <div className='flex items-center'>
                    <div className='mr-2 h-4 w-4 rounded bg-gray-200'></div>
                    <span>No disponible</span>
                </div>
                <div className='flex items-center'>
                    <div className='mr-2 h-4 w-4 rounded bg-[#93c5fd]'></div>
                    <span>Fechas seleccionadas</span>
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
