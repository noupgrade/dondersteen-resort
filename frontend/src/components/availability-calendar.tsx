import { useState } from 'react'
import { DateRange } from 'react-day-picker'

import { format, isSaturday } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Truck } from 'lucide-react'

import { cn } from '@/shared/lib/styles/class-merge'
import { AdditionalService, DriverService } from '@/shared/types/additional-services'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Calendar } from '@/shared/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'

import { useHotelAvailability } from './HotelAvailabilityContext'
import { useReservation } from './ReservationContext'

const AVAILABLE_HOURS = ['11:00', '12:00', '13:00', '14:00', '16:00', '17:00', '18:00']

interface AvailabilityCalendarProps {
    className?: string
    onSelect: (dates: { from: Date; to: Date }, checkInTime: string, checkOutTime: string) => void
    onServiceChange: (services: AdditionalService[]) => void
    capacity: number
    initialServices?: AdditionalService[]
}

export function AvailabilityCalendar({
    className,
    onSelect,
    onServiceChange,
    capacity,
    initialServices = [],
}: AvailabilityCalendarProps) {
    const [selectedDates, setSelectedDates] = useState<DateRange | undefined>()
    const [checkInTime, setCheckInTime] = useState<string>('14:00')
    const [checkOutTime, setCheckOutTime] = useState<string>('12:00')
    const [driverService, setDriverService] = useState<DriverService | undefined>(
        initialServices.find(s => s.type === 'driver') as DriverService | undefined,
    )

    const { getCalendarAvailability } = useReservation()
    const { isWeekend, isHighSeason, isDateBlocked, isHoliday } = useHotelAvailability()
    const hotelAvailability = getCalendarAvailability('hotel')

    const isOutOfHours = (hour: number) => hour < 8 || hour >= 19
    const checkInHour = parseInt(checkInTime.split(':')[0], 10)
    const checkOutHour = parseInt(checkOutTime.split(':')[0], 10)

    const isRestrictedDay = (dateStr: string) => {
        return (isWeekend(dateStr) && !isSaturday(new Date(dateStr))) || isHoliday(dateStr)
    }

    const handleSelect = (range: DateRange | undefined) => {
        if (range?.from && isRestrictedDay(format(range.from, 'yyyy-MM-dd'))) {
            return
        }
        if (range?.to && isRestrictedDay(format(range.to, 'yyyy-MM-dd'))) {
            return
        }

        if (range?.from && range?.to) {
            const start = new Date(range.from)
            const end = new Date(range.to)
            for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
                if (isDateBlocked(format(date, 'yyyy-MM-dd'))) {
                    return
                }
            }
        }

        setSelectedDates(range)
        if (range?.from && range?.to) {
            onSelect({ from: range.from, to: range.to }, checkInTime, checkOutTime)
        }
    }

    const handleCheckInTimeChange = (time: string) => {
        setCheckInTime(time)
        if (selectedDates?.from && selectedDates?.to) {
            onSelect({ from: selectedDates.from, to: selectedDates.to }, time, checkOutTime)
        }
    }

    const handleCheckOutTimeChange = (time: string) => {
        setCheckOutTime(time)
        if (selectedDates?.from && selectedDates?.to) {
            onSelect({ from: selectedDates.from, to: selectedDates.to }, checkInTime, time)
        }
    }

    const handleDriverServiceChange = (checked: boolean) => {
        if (checked) {
            const newService: DriverService = {
                type: 'driver',
                serviceType: 'both',
                petIndex: 0,
                isOutOfHours: isOutOfHours(checkInHour) || isOutOfHours(checkOutHour),
            }
            setDriverService(newService)
            onServiceChange([...initialServices.filter(s => s.type !== 'driver'), newService])
        } else {
            setDriverService(undefined)
            onServiceChange(initialServices.filter(s => s.type !== 'driver'))
        }
    }

    const handleDriverServiceTypeChange = (value: 'pickup' | 'dropoff' | 'both') => {
        if (driverService) {
            const newService: DriverService = {
                ...driverService,
                serviceType: value,
                isOutOfHours: isOutOfHours(checkInHour) || isOutOfHours(checkOutHour),
            }
            setDriverService(newService)
            onServiceChange([...initialServices.filter(s => s.type !== 'driver'), newService])
        }
    }

    const isSaturdayCheckIn = selectedDates?.from && isSaturday(selectedDates.from)
    const isSaturdayCheckOut = selectedDates?.to && isSaturday(selectedDates.to)

    // Filter available hours based on Saturday restrictions
    const availableCheckInHours = isSaturdayCheckIn
        ? AVAILABLE_HOURS.filter(hour => parseInt(hour) < 14)
        : AVAILABLE_HOURS

    const availableCheckOutHours = isSaturdayCheckOut
        ? AVAILABLE_HOURS.filter(hour => parseInt(hour) < 14)
        : AVAILABLE_HOURS

    return (
        <div className='space-y-6'>
            <Card>
                <CardContent className='mt-4 space-y-6'>
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
                                return isRestrictedDay(dateString)
                            },
                            saturday: date => isSaturday(date),
                            start: date =>
                                Boolean(
                                    selectedDates?.from &&
                                        format(date, 'yyyy-MM-dd') === format(selectedDates.from, 'yyyy-MM-dd'),
                                ),
                            end: date =>
                                Boolean(
                                    selectedDates?.to &&
                                        format(date, 'yyyy-MM-dd') === format(selectedDates.to, 'yyyy-MM-dd'),
                                ),
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
                            saturday: { backgroundColor: '#fbbf24', color: 'white' },
                            start: { backgroundColor: '#93c5fd', color: 'black', fontWeight: 'bold' },
                            end: { backgroundColor: '#93c5fd', color: 'black', fontWeight: 'bold' },
                            range: {
                                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                            },
                        }}
                        disabled={date => {
                            const dateString = format(date, 'yyyy-MM-dd')
                            const currentOccupancy = hotelAvailability[dateString] || 0
                            return (
                                currentOccupancy >= capacity || isRestrictedDay(dateString) || isDateBlocked(dateString)
                            )
                        }}
                        fromDate={new Date()}
                        locale={es}
                    />
                    <div className='flex flex-wrap justify-start gap-2'>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#2d6a4f]'></div>
                            <span className='text-sm'>Disponible</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#22c55e]'></div>
                            <span className='text-sm'>Temporada Alta</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#f59e0b]'></div>
                            <span className='text-sm'>Festivos</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#fbbf24]'></div>
                            <span className='text-sm'>Sábados</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-gray-200'></div>
                            <span className='text-sm'>No disponible</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Servicios y horarios</CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='space-y-4'>
                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id='transport'
                                checked={!!driverService}
                                onCheckedChange={handleDriverServiceChange}
                            />
                            <Label htmlFor='transport' className='flex items-center'>
                                <Truck className='mr-2 h-4 w-4' />
                                Servicio de chofer
                            </Label>
                        </div>
                        {driverService && (
                            <div className='ml-6 space-y-4'>
                                <div className='space-y-2'>
                                    <Select
                                        value={driverService.serviceType}
                                        onValueChange={value =>
                                            handleDriverServiceTypeChange(value as 'pickup' | 'dropoff' | 'both')
                                        }
                                    >
                                        <SelectTrigger className='w-[180px]'>
                                            <SelectValue placeholder='Selecciona el tipo' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='pickup'>Solo recogida</SelectItem>
                                            <SelectItem value='dropoff'>Solo entrega</SelectItem>
                                            <SelectItem value='both'>Recogida y entrega</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div>
                        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='checkInTime'>Hora de entrada:</Label>
                                <Select onValueChange={handleCheckInTimeChange} defaultValue={checkInTime}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Selecciona la hora' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {driverService?.serviceType === 'pickup' ||
                                        driverService?.serviceType === 'both'
                                            ? Array.from({ length: 24 }, (_, i) => i).map(hour => (
                                                  <SelectItem
                                                      key={hour}
                                                      value={`${hour.toString().padStart(2, '0')}:00`}
                                                  >
                                                      {`${hour.toString().padStart(2, '0')}:00`}
                                                  </SelectItem>
                                              ))
                                            : availableCheckInHours.map(hour => (
                                                  <SelectItem key={hour} value={hour}>
                                                      {hour}
                                                  </SelectItem>
                                              ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='checkOutTime'>Hora de salida:</Label>
                                <Select onValueChange={handleCheckOutTimeChange} defaultValue={checkOutTime}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder='Selecciona la hora' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {driverService?.serviceType === 'dropoff' ||
                                        driverService?.serviceType === 'both'
                                            ? Array.from({ length: 24 }, (_, i) => i).map(hour => (
                                                  <SelectItem
                                                      key={hour}
                                                      value={`${hour.toString().padStart(2, '0')}:00`}
                                                  >
                                                      {`${hour.toString().padStart(2, '0')}:00`}
                                                  </SelectItem>
                                              ))
                                            : availableCheckOutHours.map(hour => (
                                                  <SelectItem key={hour} value={hour}>
                                                      {hour}
                                                  </SelectItem>
                                              ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    {(isSaturdayCheckIn ||
                        isSaturdayCheckOut ||
                        isOutOfHours(checkInHour) ||
                        isOutOfHours(checkOutHour)) && (
                        <div className='space-y-2'>
                            {isSaturdayCheckIn &&
                                (!driverService ||
                                    (driverService.serviceType !== 'pickup' &&
                                        driverService.serviceType !== 'both')) && (
                                    <Alert variant='destructive'>
                                        <AlertDescription>
                                            Los sábados la entrega del perro debe ser antes de las 14:00h.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            {isSaturdayCheckOut &&
                                (!driverService ||
                                    (driverService.serviceType !== 'dropoff' &&
                                        driverService.serviceType !== 'both')) && (
                                    <Alert variant='destructive'>
                                        <AlertDescription>
                                            Los sábados la recogida debe ser antes de las 14:00h.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            {((isOutOfHours(checkInHour) &&
                                (!driverService ||
                                    (driverService.serviceType !== 'pickup' &&
                                        driverService.serviceType !== 'both'))) ||
                                (isOutOfHours(checkOutHour) &&
                                    (!driverService ||
                                        (driverService.serviceType !== 'dropoff' &&
                                            driverService.serviceType !== 'both')))) && (
                                <Alert variant='destructive'>
                                    <AlertDescription>
                                        Horario del hotel: 8:00 a 18:00. Entrada/salida fuera de horario: 70€
                                        adicionales.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
