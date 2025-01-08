import { format, eachDayOfInterval } from 'date-fns'
import { useToast } from '@/shared/ui/use-toast'
import { useHotelAvailability } from '@/components/HotelAvailabilityContext'
import { DateRange } from '../types'

function getOrderedDates(date1: Date, date2: Date): [Date, Date] {
    return date1 < date2 ? [date1, date2] : [date2, date1]
}

export function useAvailabilityOperations() {
    const {
        blockedDates,
        holidays,
        highSeasonPeriods,
        addBlockedDate,
        removeBlockedDate,
        addHoliday,
        removeHoliday,
        addHighSeasonPeriod,
        removeHighSeasonPeriod,
        isDateBlocked,
        isHoliday,
        isHighSeason,
        isLoading,
    } = useHotelAvailability()

    const { toast } = useToast()

    const handleBlockDates = (range: DateRange) => {
        if (range.from && range.to) {
            const [startDate, endDate] = getOrderedDates(range.from, range.to)
            const startDateStr = format(startDate, 'yyyy-MM-dd')
            const endDateStr = format(endDate, 'yyyy-MM-dd')
            addBlockedDate(startDateStr, endDateStr)
            toast({
                title: 'Fechas bloqueadas',
                description: 'Las fechas han sido bloqueadas correctamente.',
            })
            return true
        }
        return false
    }

    const handleAddHolidays = (range: DateRange, holidayName: string) => {
        if (range.from && range.to && holidayName) {
            const [startDate, endDate] = getOrderedDates(range.from, range.to)
            const startDateStr = format(startDate, 'yyyy-MM-dd')
            const endDateStr = format(endDate, 'yyyy-MM-dd')
            addHoliday(startDateStr, endDateStr, holidayName)
            toast({
                title: 'Festivos añadidos',
                description: 'Los días festivos han sido añadidos correctamente.',
            })
            return true
        }
        return false
    }

    const handleAddHighSeason = (range: DateRange) => {
        if (range.from && range.to) {
            const [startDate, endDate] = getOrderedDates(range.from, range.to)
            const startDateStr = format(startDate, 'yyyy-MM-dd')
            const endDateStr = format(endDate, 'yyyy-MM-dd')
            addHighSeasonPeriod(startDateStr, endDateStr)
            toast({
                title: 'Temporada alta añadida',
                description: 'El periodo de temporada alta ha sido añadido correctamente.',
            })
            return true
        }
        return false
    }

    const handleRemoveSpecialConditions = (range: DateRange) => {
        if (range.from && range.to) {
            const [startDate, endDate] = getOrderedDates(range.from, range.to)
            const startDateStr = format(startDate, 'yyyy-MM-dd')
            const endDateStr = format(endDate, 'yyyy-MM-dd')

            // Buscar y eliminar bloqueados que se solapen
            blockedDates.forEach(block => {
                if (
                    new Date(block.startDate) <= new Date(endDateStr) &&
                    new Date(block.endDate) >= new Date(startDateStr)
                ) {
                    removeBlockedDate(block.startDate, block.endDate)
                }
            })

            // Buscar y eliminar festivos que se solapen
            holidays.forEach(holiday => {
                if (
                    new Date(holiday.startDate) <= new Date(endDateStr) &&
                    new Date(holiday.endDate) >= new Date(startDateStr)
                ) {
                    removeHoliday(holiday.startDate, holiday.endDate)
                }
            })

            // Buscar y eliminar temporadas altas que se solapen
            highSeasonPeriods.forEach(period => {
                if (
                    new Date(period.startDate) <= new Date(endDateStr) &&
                    new Date(period.endDate) >= new Date(startDateStr)
                ) {
                    removeHighSeasonPeriod(period.startDate, period.endDate)
                }
            })

            toast({
                title: 'Condiciones especiales eliminadas',
                description: 'Se han eliminado todas las condiciones especiales de las fechas seleccionadas.',
            })
            return true
        }
        return false
    }

    const getSelectedDatesStatus = (range: DateRange) => {
        if (!range.from || !range.to) return null

        const dates = eachDayOfInterval({ start: range.from, end: range.to })
        let hasBlocked = false
        let hasHolidays = false
        let hasHighSeason = false

        dates.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd')
            if (isDateBlocked(dateStr)) hasBlocked = true
            if (isHoliday(dateStr)) hasHolidays = true
            if (isHighSeason(dateStr)) hasHighSeason = true
        })

        return { hasBlocked, hasHolidays, hasHighSeason }
    }

    const getStats = () => {
        const currentYear = new Date().getFullYear()
        const startOfYear = new Date(currentYear, 0, 1)
        const endOfYear = new Date(currentYear, 11, 31)

        let blockedDaysCount = 0
        let holidayDaysCount = 0
        let highSeasonDaysCount = 0

        // Calculate total blocked days
        blockedDates.forEach(block => {
            const blockStart = new Date(block.startDate)
            const blockEnd = new Date(block.endDate)
            const daysInYear = eachDayOfInterval({
                start: blockStart < startOfYear ? startOfYear : blockStart,
                end: blockEnd > endOfYear ? endOfYear : blockEnd,
            })
            blockedDaysCount += daysInYear.length
        })

        // Calculate total holiday days
        holidays.forEach(holiday => {
            const holidayStart = new Date(holiday.startDate)
            const holidayEnd = new Date(holiday.endDate)
            const daysInYear = eachDayOfInterval({
                start: holidayStart < startOfYear ? startOfYear : holidayStart,
                end: holidayEnd > endOfYear ? endOfYear : holidayEnd,
            })
            holidayDaysCount += daysInYear.length
        })

        // Calculate total high season days
        highSeasonPeriods.forEach(period => {
            const periodStart = new Date(period.startDate)
            const periodEnd = new Date(period.endDate)
            const daysInYear = eachDayOfInterval({
                start: periodStart < startOfYear ? startOfYear : periodStart,
                end: periodEnd > endOfYear ? endOfYear : periodEnd,
            })
            highSeasonDaysCount += daysInYear.length
        })

        return {
            blockedCount: blockedDaysCount,
            holidaysCount: holidayDaysCount,
            highSeasonCount: highSeasonDaysCount,
        }
    }

    return {
        handleBlockDates,
        handleAddHolidays,
        handleAddHighSeason,
        handleRemoveSpecialConditions,
        getSelectedDatesStatus,
        getStats,
        isLoading,
    }
} 