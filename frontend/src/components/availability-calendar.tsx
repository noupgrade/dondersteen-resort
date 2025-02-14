import { useState } from 'react'
import { DateRange } from 'react-day-picker'
import { useTranslation } from 'react-i18next'

import { format, isSaturday } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
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
const DRIVER_SERVICE_HOURS = Array.from({ length: 10 }, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`)

interface AvailabilityCalendarProps {
    className?: string
    onSelect: (dates: { from: Date; to: Date }, checkInTime: string, checkOutTime: string) => void
    onServiceChange: (services: AdditionalService[]) => void
    capacity: number
    initialServices?: AdditionalService[]
    initialDates?: DateRange | null
    initialCheckInTime?: string
    initialCheckOutTime?: string
}

export function AvailabilityCalendar({
    className,
    onSelect,
    onServiceChange,
    capacity,
    initialServices = [],
    initialDates,
    initialCheckInTime = '14:00',
    initialCheckOutTime = '12:00',
}: AvailabilityCalendarProps) {
    const [selectedDates, setSelectedDates] = useState<DateRange | undefined>(() => {
        if (initialDates?.from && initialDates?.to) {
            // Ensure we create new Date objects from the dates
            return {
                from: new Date(initialDates.from),
                to: new Date(initialDates.to),
            }
        }
        return undefined
    })
    const [checkInTime, setCheckInTime] = useState<string>(initialCheckInTime)
    const [checkOutTime, setCheckOutTime] = useState<string>(initialCheckOutTime)
    const [driverService, setDriverService] = useState<DriverService | undefined>(
        initialServices.find(s => s.type === 'driver') as DriverService | undefined,
    )

    const { getCalendarAvailability } = useReservation()
    const { isWeekend, isHighSeason, isDateBlocked, isHoliday } = useHotelAvailability()
    const hotelAvailability = getCalendarAvailability('hotel')

    const { t, i18n } = useTranslation()

    // Get the correct locale based on the current language
    const calendarLocale = i18n.language === 'en' ? enUS : es

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
        console.log('range', range)

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
        if (range?.from) {
            onSelect({ from: range.from, to: range.to || range.from }, checkInTime, checkOutTime)
        }
    }

    const handleCheckInTimeChange = (time: string) => {
        // If driver service is active, only allow times between 9:00 and 18:00
        if (driverService && isOutsideDriverServiceHours(time)) {
            return
        }

        setCheckInTime(time)
        if (selectedDates?.from && selectedDates?.to) {
            onSelect({ from: selectedDates.from, to: selectedDates.to }, time, checkOutTime)
        }
    }

    const handleCheckOutTimeChange = (time: string) => {
        // If driver service is active, only allow times between 9:00 and 18:00
        if (driverService && isOutsideDriverServiceHours(time)) {
            return
        }

        setCheckOutTime(time)
        if (selectedDates?.from && selectedDates?.to) {
            onSelect({ from: selectedDates.from, to: selectedDates.to }, checkInTime, time)
        }
    }

    const handleDriverServiceChange = (checked: boolean) => {
        if (checked) {
            // Reset times to be within driver service hours if they're outside the range
            const newCheckInTime = isOutsideDriverServiceHours(checkInTime) ? '09:00' : checkInTime
            const newCheckOutTime = isOutsideDriverServiceHours(checkOutTime) ? '18:00' : checkOutTime

            setCheckInTime(newCheckInTime)
            setCheckOutTime(newCheckOutTime)

            if (selectedDates?.from && selectedDates?.to) {
                onSelect({ from: selectedDates.from, to: selectedDates.to }, newCheckInTime, newCheckOutTime)
            }

            const newService: DriverService = {
                type: 'driver',
                serviceType: 'both',
                petIndex: 0,
                isOutOfHours: false,
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

    const isOutsideDriverServiceHours = (time: string) => {
        const hour = parseInt(time.split(':')[0], 10)
        return hour < 9 || hour > 18
    }

    return (
        <div className='space-y-6'>
            <Card>
                <CardContent className='mt-4 space-y-6'>
                    <Calendar
                        mode='range'
                        selected={selectedDates}
                        onSelect={handleSelect}
                        className={cn('rounded-md border', className)}
                        defaultMonth={initialDates?.from ? new Date(initialDates.from) : undefined}
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
                        locale={calendarLocale}
                    />
                    <div className='flex flex-wrap justify-start gap-2'>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#2d6a4f]'></div>
                            <span className='text-sm'>{t('booking.step2.calendar.available')}</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#22c55e]'></div>
                            <span className='text-sm'>{t('booking.step2.calendar.highSeason')}</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#f59e0b]'></div>
                            <span className='text-sm'>{t('booking.step2.calendar.holidays')}</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-[#fbbf24]'></div>
                            <span className='text-sm'>{t('booking.step2.calendar.saturdays')}</span>
                        </div>
                        <div className='flex items-center'>
                            <div className='mr-2 h-4 w-4 rounded bg-gray-200'></div>
                            <span className='text-sm'>{t('booking.step2.calendar.notAvailable')}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>{t('booking.step2.services.title')}</CardTitle>
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
                                {t('booking.step2.services.driver')}
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
                                            <SelectValue placeholder={t('booking.step2.services.driverType')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='pickup'>
                                                {t('booking.step2.services.driverType.pickup')}
                                            </SelectItem>
                                            <SelectItem value='dropoff'>
                                                {t('booking.step2.services.driverType.dropoff')}
                                            </SelectItem>
                                            <SelectItem value='both'>
                                                {t('booking.step2.services.driverType.both')}
                                            </SelectItem>
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
                                <Label htmlFor='checkInTime'>{t('booking.step2.time.checkIn')}</Label>
                                <Select onValueChange={handleCheckInTimeChange} defaultValue={checkInTime}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder={t('booking.step2.time.selectTime')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {driverService
                                            ? DRIVER_SERVICE_HOURS.map(hour => (
                                                  <SelectItem key={hour} value={hour}>
                                                      {hour}
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
                                <Label htmlFor='checkOutTime'>{t('booking.step2.time.checkOut')}</Label>
                                <Select onValueChange={handleCheckOutTimeChange} defaultValue={checkOutTime}>
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder={t('booking.step2.time.selectTime')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {driverService
                                            ? DRIVER_SERVICE_HOURS.map(hour => (
                                                  <SelectItem key={hour} value={hour}>
                                                      {hour}
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
                                        <AlertDescription>{t('booking.step2.alerts.saturdayCheckIn')}</AlertDescription>
                                    </Alert>
                                )}
                            {isSaturdayCheckOut &&
                                (!driverService ||
                                    (driverService.serviceType !== 'dropoff' &&
                                        driverService.serviceType !== 'both')) && (
                                    <Alert variant='destructive'>
                                        <AlertDescription>
                                            {t('booking.step2.alerts.saturdayCheckOut')}
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
                                    <AlertDescription>{t('booking.step2.alerts.outOfHours')}</AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
