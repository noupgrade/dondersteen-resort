'use client'

import { useCallback, useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameMonth, isWithinInterval, startOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { useHotelAvailability } from './HotelAvailabilityContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface DateRange {
    from: Date | null
    to: Date | null
}

interface HotelAvailabilityCalendarProps {
    onDateSelect?: (dates: DateRange) => void
}

export function HotelAvailabilityCalendar({ onDateSelect }: HotelAvailabilityCalendarProps) {
    const [selectedMonths, setSelectedMonths] = useState([new Date(), addMonths(new Date(), 1)])
    const [dateRange, setDateRange] = useState<DateRange>({ from: null, to: null })
    const { isDateBlocked, isHoliday, getHighSeasonPrice } = useHotelAvailability()

    const handleMonthNavigation = (direction: 'prev' | 'next') => {
        setSelectedMonths(prevMonths =>
            direction === 'prev'
                ? prevMonths.map(month => subMonths(month, 2))
                : prevMonths.map(month => addMonths(month, 2)),
        )
    }

    const handleDateSelect = (date: Date) => {
        setDateRange(prev => {
            // Si no hay fecha inicial o si ya hay un rango completo, empezar nuevo rango
            if (!prev.from || prev.to) {
                return { from: date, to: null }
            }

            // Si la fecha seleccionada es anterior a la fecha inicial, intercambiar
            if (date < prev.from) {
                return { from: date, to: prev.from }
            }

            // Completar el rango
            return { from: prev.from, to: date }
        })

        // Solo notificar cuando el rango está completo
        if (dateRange.from && !dateRange.to) {
            onDateSelect?.({ from: dateRange.from, to: date })
        }
    }

    const getDateStatus = useCallback((date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        if (isDateBlocked(dateStr)) return 'blocked'
        if (isHoliday(dateStr)) return 'holiday'
        const price = getHighSeasonPrice(dateStr)
        if (price) return 'highSeason'
        return 'available'
    }, [isDateBlocked, isHoliday, getHighSeasonPrice])

    const isDateInRange = useCallback((date: Date) => {
        if (!dateRange.from) return false
        if (!dateRange.to) return format(date, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd')
        return isWithinInterval(date, { start: dateRange.from, end: dateRange.to })
    }, [dateRange])

    const getDateStyle = useCallback((date: Date) => {
        const status = getDateStatus(date)
        const inRange = isDateInRange(date)
        const baseStyle = inRange ? 'ring-2 ring-primary ring-offset-2' : ''

        switch (status) {
            case 'blocked':
                return cn(baseStyle, 'bg-red-500 text-white hover:bg-red-600')
            case 'holiday':
                return cn(baseStyle, 'bg-amber-500 text-white hover:bg-amber-600')
            case 'highSeason':
                return cn(baseStyle, 'bg-green-500 text-white hover:bg-green-600')
            default:
                return cn(baseStyle, 'hover:bg-accent')
        }
    }, [getDateStatus, isDateInRange])

    const renderCalendar = useCallback(
        (month: Date) => {
            const start = startOfMonth(month)
            const end = endOfMonth(month)
            const days = eachDayOfInterval({ start, end })

            return (
                <div className='p-4'>
                    <table className='w-full border-collapse'>
                        <thead>
                            <tr>
                                {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'].map(day => (
                                    <th key={day} className='p-2 text-sm font-semibold text-muted-foreground'>
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from({ length: 6 }).map((_, weekIndex) => (
                                <tr key={weekIndex}>
                                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                                        const date = days[weekIndex * 7 + dayIndex]
                                        if (!date || !isSameMonth(date, month)) {
                                            return <td key={dayIndex} className='p-0' />
                                        }

                                        return (
                                            <td key={dayIndex} className='p-0 text-center'>
                                                <button
                                                    onClick={() => handleDateSelect(date)}
                                                    className={cn(
                                                        'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors',
                                                        getDateStyle(date),
                                                    )}
                                                >
                                                    {format(date, 'd')}
                                                </button>
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        },
        [getDateStyle],
    )

    return (
        <Card className='mx-auto w-full max-w-4xl'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <div className='space-y-1'>
                    <CardTitle className='text-2xl font-bold'>Calendario de Disponibilidad</CardTitle>
                </div>
                <div className='flex items-center space-x-2'>
                    <Button variant='outline' size='icon' onClick={() => handleMonthNavigation('prev')}>
                        <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <Button variant='outline' size='icon' onClick={() => handleMonthNavigation('next')}>
                        <ChevronRight className='h-4 w-4' />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className='mb-6 grid grid-cols-2 gap-4'>
                    {selectedMonths.map((month, index) => (
                        <div key={index} className='space-y-2'>
                            <h3 className='text-center font-semibold capitalize'>
                                {format(month, 'MMMM yyyy', { locale: es })}
                            </h3>
                            {renderCalendar(month)}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
