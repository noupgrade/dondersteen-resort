import { useCallback, useState } from 'react'

import { addMonths, eachDayOfInterval, endOfMonth, format, isSameMonth, startOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'

import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

// Comprehensive mock data for December 2024 and January 2025
const mockOccupancy: Record<string, { occupancy: number; availableRooms: number; pendingReservations: number }> = {
    // December 2024
    '2024-12-01': { occupancy: 15, availableRooms: 17, pendingReservations: 2 },
    '2024-12-02': { occupancy: 35, availableRooms: 13, pendingReservations: 3 },
    '2024-12-03': { occupancy: 65, availableRooms: 7, pendingReservations: 4 },
    '2024-12-04': { occupancy: 100, availableRooms: 0, pendingReservations: 5 },
    '2024-12-05': { occupancy: 45, availableRooms: 11, pendingReservations: 2 },
    '2024-12-06': { occupancy: 85, availableRooms: 3, pendingReservations: 3 },
    '2024-12-07': { occupancy: 25, availableRooms: 15, pendingReservations: 1 },
    '2024-12-08': { occupancy: 95, availableRooms: 1, pendingReservations: 4 },
    '2024-12-09': { occupancy: 10, availableRooms: 18, pendingReservations: 1 },
    '2024-12-10': { occupancy: 55, availableRooms: 9, pendingReservations: 3 },
    '2024-12-15': { occupancy: 75, availableRooms: 5, pendingReservations: 4 },
    '2024-12-20': { occupancy: 100, availableRooms: 0, pendingReservations: 6 },
    '2024-12-24': { occupancy: 90, availableRooms: 2, pendingReservations: 5 },
    '2024-12-25': { occupancy: 100, availableRooms: 0, pendingReservations: 7 },
    '2024-12-31': { occupancy: 100, availableRooms: 0, pendingReservations: 8 },

    // January 2025
    '2025-01-01': { occupancy: 95, availableRooms: 1, pendingReservations: 6 },
    '2025-01-02': { occupancy: 80, availableRooms: 4, pendingReservations: 4 },
    '2025-01-03': { occupancy: 70, availableRooms: 6, pendingReservations: 3 },
    '2025-01-04': { occupancy: 45, availableRooms: 11, pendingReservations: 2 },
    '2025-01-05': { occupancy: 30, availableRooms: 14, pendingReservations: 2 },
    '2025-01-10': { occupancy: 5, availableRooms: 19, pendingReservations: 1 },
    '2025-01-15': { occupancy: 25, availableRooms: 15, pendingReservations: 2 },
    '2025-01-20': { occupancy: 60, availableRooms: 8, pendingReservations: 3 },
    '2025-01-25': { occupancy: 40, availableRooms: 12, pendingReservations: 2 },
}

const getOccupancyStyle = (occupancy: number) => {
    if (occupancy === 100) return 'bg-red-500 text-white hover:bg-red-600'
    if (occupancy >= 50) return 'bg-orange-500 text-white hover:bg-orange-600'
    if (occupancy >= 20) return 'bg-yellow-500 text-black hover:bg-yellow-600'
    return 'bg-green-500 text-white hover:bg-green-600'
}

export function HotelDoubleCalendar() {
    const [selectedMonths, setSelectedMonths] = useState([new Date(), addMonths(new Date(), 1)])
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)

    const handleMonthNavigation = (direction: 'prev' | 'next') => {
        setSelectedMonths(prevMonths =>
            direction === 'prev'
                ? prevMonths.map(month => subMonths(month, 2))
                : prevMonths.map(month => addMonths(month, 2)),
        )
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
        }
    }

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

                                        const dateStr = format(date, 'yyyy-MM-dd')
                                        const occupancyData = mockOccupancy[dateStr]
                                        const isSelected =
                                            selectedDate &&
                                            isSameMonth(date, selectedDate) &&
                                            format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

                                        return (
                                            <td key={dayIndex} className='p-0 text-center'>
                                                <button
                                                    onClick={() => handleDateSelect(date)}
                                                    className={cn(
                                                        'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm transition-colors',
                                                        occupancyData
                                                            ? getOccupancyStyle(occupancyData.occupancy)
                                                            : 'hover:bg-accent',
                                                        isSelected && 'ring-2 ring-primary ring-offset-2',
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
        [selectedDate],
    )

    return (
        <Card className='mx-auto w-full max-w-4xl'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <CardTitle className='text-2xl font-bold'>Disponibilidad del Hotel</CardTitle>
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

                <div className='mb-6 flex flex-wrap justify-center gap-4'>
                    <Badge variant='outline' className='py-1'>
                        <div className='mr-2 h-3 w-3 rounded-full bg-green-500' />
                        {'<20% ocupación'}
                    </Badge>
                    <Badge variant='outline' className='py-1'>
                        <div className='mr-2 h-3 w-3 rounded-full bg-yellow-500' />
                        20-50% ocupación
                    </Badge>
                    <Badge variant='outline' className='py-1'>
                        <div className='mr-2 h-3 w-3 rounded-full bg-orange-500' />
                        50-80% ocupación
                    </Badge>
                    <Badge variant='outline' className='py-1'>
                        <div className='mr-2 h-3 w-3 rounded-full bg-red-500' />
                        Completo
                    </Badge>
                </div>

                {selectedDate && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant='outline' className='w-full'>
                                <Info className='mr-2 h-4 w-4' />
                                Información del {format(selectedDate, "d 'de' MMMM", { locale: es })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className='w-80'>
                            <div className='grid gap-4'>
                                <div className='space-y-2'>
                                    <h4 className='text-sm font-semibold'>
                                        {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                                    </h4>
                                    {mockOccupancy[format(selectedDate, 'yyyy-MM-dd')] ? (
                                        <>
                                            <div className='flex justify-between text-sm'>
                                                <span>Ocupación:</span>
                                                <span className='font-semibold'>
                                                    {mockOccupancy[format(selectedDate, 'yyyy-MM-dd')].occupancy}%
                                                </span>
                                            </div>
                                            <div className='flex justify-between text-sm'>
                                                <span>Habitaciones disponibles:</span>
                                                <span className='font-semibold'>
                                                    {mockOccupancy[format(selectedDate, 'yyyy-MM-dd')].availableRooms}
                                                </span>
                                            </div>
                                            <div className='flex justify-between text-sm'>
                                                <span>Reservas pendientes:</span>
                                                <span className='font-semibold'>
                                                    {
                                                        mockOccupancy[format(selectedDate, 'yyyy-MM-dd')]
                                                            .pendingReservations
                                                    }
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className='text-center text-sm text-muted-foreground'>
                                            No hay datos disponibles para esta fecha
                                        </p>
                                    )}
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </CardContent>
        </Card>
    )
}
