'use client'

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Mock data for peluqueria availability
const mockPeluqueriaAvailability: Record<string, number[]> = {
    '2024-12-10': [9, 10, 11, 12], // Available hours
    '2024-12-11': [14, 15, 16],
    '2024-12-12': [9, 10, 15, 16, 17],
    '2024-12-13': [11, 12, 13],
    '2024-12-14': [9, 10, 11, 12, 13, 14, 15, 16, 17],
}

export function AvailabilityCalendarView() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [selectedDateSlots, setSelectedDateSlots] = useState<string[]>([])
    const navigate = useNavigate()

    useEffect(() => {
        if (selectedDate) {
            const dateString = format(selectedDate, 'yyyy-MM-dd')
            const availableHours = mockPeluqueriaAvailability[dateString] || []
            setSelectedDateSlots(availableHours.map(hour => `${hour.toString().padStart(2, '0')}:00`))
        }
    }, [selectedDate])

    const handleTimeSelect = useCallback(
        (time: string) => {
            if (selectedDate) {
                const dateString = format(selectedDate, 'yyyy-MM-dd')
                // Use the new URLSearchParams API to properly encode the parameters
                const params = new URLSearchParams({
                    date: dateString,
                    time: time,
                })
                navigate(`/peluqueria-booking?${params.toString()}`)
            }
        },
        [selectedDate, navigate],
    )

    const getDayAvailability = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd')
        const availableHours = mockPeluqueriaAvailability[dateString] || []
        if (availableHours.length === 0) return 'busy'
        if (availableHours.length <= 3) return 'almostFull'
        return 'available'
    }

    return (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <Card>
                <CardHeader>
                    <CardTitle>Calendario de Disponibilidad</CardTitle>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode='single'
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className='rounded-md border'
                        locale={es}
                        modifiers={{
                            busy: date => getDayAvailability(date) === 'busy',
                            almostFull: date => getDayAvailability(date) === 'almostFull',
                            available: date => getDayAvailability(date) === 'available',
                        }}
                        modifiersStyles={{
                            busy: { textDecoration: 'line-through', color: 'red' },
                            almostFull: { backgroundColor: 'yellow', color: 'black' },
                            available: { backgroundColor: '#22c55e', color: 'white' },
                        }}
                    />
                    <div className='mt-4 flex justify-center space-x-2'>
                        <Badge variant='outline'>
                            <div className='mr-1 h-3 w-3 rounded-full bg-[#22c55e]'></div>
                            Disponible
                        </Badge>
                        <Badge variant='outline'>
                            <div className='mr-1 h-3 w-3 rounded-full bg-yellow-400'></div>
                            Últimas plazas
                        </Badge>
                        <Badge variant='outline'>
                            <div className='mr-1 h-3 w-3 rounded-full bg-red-500'></div>
                            No disponible
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Horas Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedDate && (
                        <>
                            <h3 className='mb-4 text-lg font-semibold'>
                                {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                            </h3>
                            <div className='grid grid-cols-3 gap-2'>
                                {selectedDateSlots.map(slot => (
                                    <Button key={slot} variant='outline' onClick={() => handleTimeSelect(slot)}>
                                        {slot}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
