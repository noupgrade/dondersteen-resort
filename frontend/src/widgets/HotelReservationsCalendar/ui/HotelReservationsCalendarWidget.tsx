import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { addDays, addWeeks, format, isSameDay, parse, startOfWeek, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Calendar as CalendarIcon, CalendarRange, ChevronLeft, ChevronRight, Truck } from 'lucide-react'

import {
    useHotelDayReservations,
    useHotelReservationsInPeriod,
    usePendingHotelReservation,
    useReservation,
} from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PetsPopup } from '@/shared/ui/pets-popup'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'

import { useCalendarStore } from '../model/store'
import { PendingReservationBanner } from './PendingReservationBanner'

export function HotelReservationsCalendarWidget() {
    console.log('HotelReservationsCalendarWidget')
    const { view, selectedDate, setView, setSelectedDate } = useCalendarStore()
    const { updateReservation } = useReservation()
    const [searchParams, setSearchParams] = useSearchParams()
    const [selectedDatePets, setSelectedDatePets] = useState<{ date: string; pets: HotelReservation['pets'][] } | null>(
        null,
    )

    const pendingReservationId = searchParams.get('pendingReservationId')
    const dateParam = searchParams.get('date')

    // Get week days for week view
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(startOfWeek(selectedDate, { locale: es }), i)
        return {
            date: format(date, 'yyyy-MM-dd'),
            dayName: format(date, 'EEEE', { locale: es }),
            dayNumber: format(date, 'd'),
        }
    })

    // Get reservations for current view
    const {
        reservations: dayReservations,
        petsBySize: dayPetsBySize,
        totalPets: dayTotalPets,
    } = useHotelDayReservations(format(selectedDate, 'yyyy-MM-dd'))
    const { reservations: weekReservations } = useHotelReservationsInPeriod(weekDays[0].date, weekDays[6].date)
    const { pendingReservation } = usePendingHotelReservation(pendingReservationId)

    // Actualizar la fecha seleccionada cuando cambie el parámetro date
    useEffect(() => {
        if (dateParam) {
            const date = parse(dateParam, 'yyyy-MM-dd', new Date())
            setSelectedDate(date)
        }
    }, [dateParam, setSelectedDate])

    const handleAccept = async (reservation: HotelReservation) => {
        try {
            console.log('Accepting reservation:', reservation)
            await updateReservation(reservation.id, { status: 'confirmed' })
            console.log('Reservation accepted successfully')

            const newParams = new URLSearchParams(searchParams)
            newParams.delete('pendingReservationId')
            newParams.delete('date')
            setSearchParams(newParams)
        } catch (error) {
            console.error('Error al aceptar la reserva:', error)
        }
    }

    const handleReject = async (reservation: HotelReservation) => {
        try {
            console.log('Rejecting reservation:', reservation)
            const updatedReservation: Partial<HotelReservation> = {
                ...reservation,
                status: 'cancelled',
                type: 'hotel',
                updatedAt: new Date().toISOString(),
            }

            await updateReservation(reservation.id, updatedReservation)
            console.log('Reservation rejected successfully')

            const newParams = new URLSearchParams(searchParams)
            newParams.delete('pendingReservationId')
            newParams.delete('date')
            setSearchParams(newParams)
        } catch (error) {
            console.error('Error al rechazar la reserva:', error)
        }
    }

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (view === 'week') {
            setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1))
        } else {
            setSelectedDate(direction === 'prev' ? addDays(selectedDate, -1) : addDays(selectedDate, 1))
        }
    }

    const getReservationStyle = (reservation: HotelReservation, date: string) => {
        const isCheckIn = isSameDay(new Date(reservation.checkInDate), new Date(date))
        const isCheckOut = isSameDay(new Date(reservation.checkOutDate), new Date(date))
        const isDaycare = isSameDay(new Date(reservation.checkInDate), new Date(reservation.checkOutDate))

        if (isDaycare) return 'bg-purple-200 border-purple-400'
        if (isCheckOut) return 'bg-orange-100 border-orange-300'
        if (isCheckIn) return 'bg-green-100 border-green-300'
        return 'bg-slate-100 border-slate-300'
    }

    const getReservationPriority = (reservation: HotelReservation, date: string) => {
        const isCheckIn = isSameDay(new Date(reservation.checkInDate), new Date(date))
        const isCheckOut = isSameDay(new Date(reservation.checkOutDate), new Date(date))
        const isDaycare = isSameDay(new Date(reservation.checkInDate), new Date(reservation.checkOutDate))

        if (isCheckOut) return 0 // Máxima prioridad
        if (isCheckIn) return 1
        if (isDaycare) return 2
        return 3 // Mínima prioridad
    }

    const hasTransportService = (reservation: HotelReservation, date: string) => {
        const transportService = reservation.additionalServices.find(service => service.type === 'driver')
        if (!transportService) return false

        const isCheckOut = isSameDay(new Date(reservation.checkOutDate), new Date(date))
        const isCheckIn = isSameDay(new Date(reservation.checkInDate), new Date(date))

        return (
            (transportService.serviceType === 'pickup' && isCheckIn) ||
            (transportService.serviceType === 'dropoff' && isCheckOut) ||
            (transportService.serviceType === 'both' && (isCheckIn || isCheckOut))
        )
    }

    const getTimeDisplay = (reservation: HotelReservation, date: string) => {
        const currentDate = new Date(date)
        const checkInDate = new Date(reservation.checkInDate)
        const checkOutDate = new Date(reservation.checkOutDate)

        const isCheckIn = isSameDay(checkInDate, currentDate)
        const isCheckOut = isSameDay(checkOutDate, currentDate)

        if (isCheckIn && reservation.checkInTime) {
            return reservation.checkInTime
        }

        if (isCheckOut && reservation.checkOutTime) {
            return reservation.checkOutTime
        }

        if (isCheckIn) return '14:00'
        if (isCheckOut) return '12:00'

        return null
    }

    const renderReservations = (date: string) => {
        const reservationsForDate =
            view === 'day'
                ? dayReservations
                : weekReservations.filter(
                      reservation =>
                          new Date(reservation.checkInDate) <= new Date(date) &&
                          new Date(reservation.checkOutDate) >= new Date(date),
                  )

        // Agrupar reservas por cliente y ordenar por prioridad
        const clientGroups = reservationsForDate.reduce(
            (groups, reservation) => {
                const clientId = reservation.client.id || 'unknown'
                if (!groups[clientId]) {
                    groups[clientId] = {
                        client: {
                            name: reservation.client.name || 'Cliente sin nombre',
                            id: clientId,
                        },
                        reservations: [],
                        priority: getReservationPriority(reservation, date),
                        earliestCheckOut: new Date(reservation.checkOutDate).getTime(),
                    }
                }
                groups[clientId].reservations.push(reservation)
                groups[clientId].priority = Math.min(
                    groups[clientId].priority,
                    getReservationPriority(reservation, date),
                )
                groups[clientId].earliestCheckOut = Math.min(
                    groups[clientId].earliestCheckOut,
                    new Date(reservation.checkOutDate).getTime(),
                )
                return groups
            },
            {} as Record<
                string,
                {
                    client: { name: string; id: string }
                    reservations: HotelReservation[]
                    priority: number
                    earliestCheckOut: number
                }
            >,
        )

        const sortedGroups = Object.values(clientGroups).sort((a, b) => {
            if (a.priority !== b.priority) {
                return a.priority - b.priority
            }
            return a.earliestCheckOut - b.earliestCheckOut
        })

        return (
            <div className='space-y-2'>
                {sortedGroups.map(({ client, reservations }) => {
                    const cardStyle = getReservationStyle(reservations[0], date)
                    return (
                        <div key={client.id} className={cn('rounded-lg border p-2', cardStyle)}>
                            <div className='space-y-1'>
                                {reservations.map(reservation => {
                                    const timeDisplay = getTimeDisplay(reservation, date)
                                    return (
                                        <div
                                            key={reservation.id}
                                            className='border-current/20 relative mt-2 rounded border bg-white/50 p-1.5'
                                        >
                                            <div className='absolute -top-2 right-0 flex items-center gap-1'>
                                                {timeDisplay && (
                                                    <Badge variant='secondary' className='px-1.5 py-0 text-xs'>
                                                        {timeDisplay}
                                                    </Badge>
                                                )}
                                                {hasTransportService(reservation, date) && (
                                                    <Badge className='flex h-4 w-4 items-center justify-center p-0'>
                                                        <Truck className='h-3 w-3' />
                                                    </Badge>
                                                )}
                                            </div>
                                            {reservation.pets.map(pet => (
                                                <div key={pet.name} className='mb-1 flex flex-col text-sm last:mb-0'>
                                                    <div className='flex flex-wrap items-center gap-1.5'>
                                                        <span className='font-bold'>{pet.name}</span>
                                                        <span className='italic text-muted-foreground'>
                                                            ({pet.breed})
                                                        </span>
                                                        {!isSameDay(
                                                            new Date(reservation.checkInDate),
                                                            new Date(reservation.checkOutDate),
                                                        ) && (
                                                            <Badge variant='secondary' className='h-5 px-1 text-xs'>
                                                                {pet.roomNumber || 'Sin habitación'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const getPetsBreakdown = (date: string) => {
        if (view === 'day') {
            return {
                total: dayTotalPets,
                breakdown: `(${dayPetsBySize.grande}G,${dayPetsBySize.mediano}M,${dayPetsBySize.pequeño}P)`,
            }
        }

        const reservationsForDate = weekReservations.filter(
            reservation =>
                new Date(reservation.checkInDate) <= new Date(date) &&
                new Date(reservation.checkOutDate) >= new Date(date),
        )

        const sizes = { grande: 0, mediano: 0, pequeño: 0 }
        const total = reservationsForDate.reduce((total, reservation) => {
            reservation.pets.forEach(pet => {
                sizes[pet.size]++
            })
            return total + reservation.pets.length
        }, 0)

        return {
            total,
            breakdown: `(${sizes.grande}G,${sizes.mediano}M,${sizes.pequeño}P)`,
        }
    }

    const getPetsForDate = (date: string) => {
        const reservationsForDate =
            view === 'day'
                ? dayReservations
                : weekReservations.filter(
                      reservation =>
                          new Date(reservation.checkInDate) <= new Date(date) &&
                          new Date(reservation.checkOutDate) >= new Date(date),
                  )
        return reservationsForDate.map(reservation => reservation.pets)
    }

    const handlePetsBadgeClick = (date: string) => {
        const pets = getPetsForDate(date)
        setSelectedDatePets({ date, pets })
    }

    return (
        <div className='space-y-4'>
            {selectedDatePets && (
                <PetsPopup
                    isOpen={true}
                    onClose={() => setSelectedDatePets(null)}
                    pets={selectedDatePets.pets.flat()}
                />
            )}
            {pendingReservation && (
                <PendingReservationBanner
                    reservation={pendingReservation}
                    onAccept={handleAccept}
                    onReject={handleReject}
                />
            )}
            <div className='flex items-center justify-between border-b pb-4'>
                <div className='flex items-center gap-4'>
                    <Button
                        variant='outline'
                        onClick={() => setView(view === 'day' ? 'week' : 'day')}
                        className='flex items-center gap-2'
                    >
                        {view === 'day' ? (
                            <>
                                <CalendarDays className='h-4 w-4' />
                                <span>Vista diaria</span>
                            </>
                        ) : (
                            <>
                                <CalendarRange className='h-4 w-4' />
                                <span>Vista semanal</span>
                            </>
                        )}
                    </Button>
                    <div className='flex items-center gap-2'>
                        <Button variant='outline' size='icon' onClick={() => handleNavigate('prev')}>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    className='flex min-w-[130px] items-center justify-start gap-2'
                                >
                                    <CalendarIcon className='h-4 w-4' />
                                    <span>{format(selectedDate, "d 'de' MMMM", { locale: es })}</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-auto p-0' align='start'>
                                <Calendar
                                    mode='single'
                                    selected={selectedDate}
                                    onSelect={date => date && setSelectedDate(date)}
                                    initialFocus
                                    footer={
                                        <div className='border-t p-3'>
                                            <Button
                                                variant='outline'
                                                className='flex w-full items-center justify-center gap-2'
                                                onClick={() => setSelectedDate(new Date())}
                                            >
                                                <CalendarIcon className='h-4 w-4' />
                                                Ir a hoy
                                            </Button>
                                        </div>
                                    }
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant='outline' size='icon' onClick={() => handleNavigate('next')}>
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <Badge variant='outline' className='border-orange-300 bg-orange-100'>
                        Check-out
                    </Badge>
                    <Badge variant='outline' className='border-green-300 bg-green-100'>
                        Check-in
                    </Badge>
                    <Badge variant='outline' className='border-purple-400 bg-purple-200'>
                        Guardería
                    </Badge>
                    <Badge variant='outline' className='border-slate-300 bg-slate-100'>
                        En curso
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                        <span>
                            {view === 'day'
                                ? format(selectedDate, "EEEE d 'de' MMMM", { locale: es })
                                : `Semana del ${format(new Date(weekDays[0].date), "d 'de' MMMM", {
                                      locale: es,
                                  })}`}
                        </span>
                        {view === 'day' && (
                            <Badge
                                variant='secondary'
                                className='ml-2 flex cursor-pointer flex-col items-center hover:bg-accent'
                                onClick={() => handlePetsBadgeClick(format(selectedDate, 'yyyy-MM-dd'))}
                            >
                                <span>{getPetsBreakdown(format(selectedDate, 'yyyy-MM-dd')).total} mascotas</span>
                                <span className='text-xs'>
                                    {getPetsBreakdown(format(selectedDate, 'yyyy-MM-dd')).breakdown}
                                </span>
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='relative'>
                        {view === 'day' ? (
                            <div className='min-h-[200px] p-4'>
                                {renderReservations(format(selectedDate, 'yyyy-MM-dd'))}
                            </div>
                        ) : (
                            <div className='grid grid-cols-7'>
                                {weekDays.map(day => (
                                    <div
                                        key={day.date}
                                        className={cn(
                                            'border-b border-r p-2',
                                            format(new Date(day.date), 'yyyy-MM-dd') ===
                                                format(new Date(), 'yyyy-MM-dd') && 'bg-primary/5',
                                        )}
                                    >
                                        <div className='text-center'>
                                            <div className='font-medium capitalize'>{day.dayName}</div>
                                            <div className='text-sm text-muted-foreground'>{day.dayNumber}</div>
                                        </div>
                                        <div className='mt-1 flex justify-center'>
                                            <Badge
                                                variant='secondary'
                                                className='flex cursor-pointer flex-col items-center px-2 py-0 text-xs hover:bg-accent'
                                                onClick={() => handlePetsBadgeClick(day.date)}
                                            >
                                                <span>{getPetsBreakdown(day.date).total} mascotas</span>
                                                <span className='text-xs'>{getPetsBreakdown(day.date).breakdown}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                                <div className='col-span-7 grid grid-cols-7'>
                                    {weekDays.map(day => (
                                        <div
                                            key={day.date}
                                            className={cn(
                                                'min-h-[200px] border-r p-2',
                                                format(new Date(day.date), 'yyyy-MM-dd') ===
                                                    format(new Date(), 'yyyy-MM-dd') && 'bg-primary/5',
                                            )}
                                        >
                                            {renderReservations(day.date)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
