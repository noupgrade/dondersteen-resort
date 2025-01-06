import { useCallback } from 'react'
import { Badge } from '@/shared/ui/badge'

import { HotelAvailabilityCalendar } from '@/components/hotel-availability-calendar'
import { useAvailabilityDialogs } from './hooks/use-availability-dialogs'
import { useAvailabilityOperations } from './hooks/use-availability-operations'
import { ManageDatesDialog } from './components/dialogs/manage-dates-dialog'
import { HolidayDialog } from './components/dialogs/holiday-dialog'
import { DateRange } from './types'

export default function DisponibilidadPage() {
    const {
        isBlockDateDialogOpen,
        isHolidayDialogOpen,
        selectedRange,
        handleDialogOpenChange,
        handleHolidayDialogOpenChange,
        openHolidayDialog,
        setSelectedRange,
    } = useAvailabilityDialogs()

    const {
        handleBlockDates,
        handleAddHolidays,
        handleAddHighSeason,
        handleRemoveSpecialConditions,
        getSelectedDatesStatus,
        getStats,
        isLoading,
    } = useAvailabilityOperations()

    const handleDateRangeSelect = useCallback(
        (range: DateRange) => {
            setSelectedRange(range)
            if (range.from && range.to) {
                handleDialogOpenChange(true)
            }
        },
        [setSelectedRange, handleDialogOpenChange]
    )

    if (isLoading) {
        return (
            <div className='container mx-auto p-6'>
                <div className='flex items-center justify-center h-[60vh]'>
                    <div className='text-center space-y-4'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                        <p className='text-muted-foreground'>Cargando disponibilidad...</p>
                    </div>
                </div>
            </div>
        )
    }

    const stats = getStats()
    const dateStatus = selectedRange.from && selectedRange.to ? getSelectedDatesStatus(selectedRange) : null
    const hasSpecialConditions = dateStatus ? dateStatus.hasBlocked || dateStatus.hasHolidays || dateStatus.hasHighSeason : false

    const handleHighSeasonClick = () => {
        if (handleAddHighSeason(selectedRange)) {
            handleDialogOpenChange(false)
        }
    }

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold'>Disponibilidad del Hotel</h1>
            </div>

            <HotelAvailabilityCalendar onDateSelect={handleDateRangeSelect} />

            <div className='flex flex-wrap justify-center gap-4'>
                <Badge variant='outline' className='py-1'>
                    <div className='mr-2 h-3 w-3 rounded-full bg-red-500' />
                    Bloqueado
                </Badge>
                <Badge variant='outline' className='py-1'>
                    <div className='mr-2 h-3 w-3 rounded-full bg-amber-500' />
                    Festivo
                </Badge>
                <Badge variant='outline' className='py-1'>
                    <div className='mr-2 h-3 w-3 rounded-full bg-green-500' />
                    Temporada Alta
                </Badge>
            </div>

            <ManageDatesDialog
                open={isBlockDateDialogOpen}
                onOpenChange={handleDialogOpenChange}
                selectedRange={selectedRange}
                onBlockDates={() => {
                    if (handleBlockDates(selectedRange)) {
                        handleDialogOpenChange(false)
                    }
                }}
                onOpenHolidayDialog={openHolidayDialog}
                onHighSeasonClick={handleHighSeasonClick}
                onRemoveSpecialConditions={() => {
                    if (handleRemoveSpecialConditions(selectedRange)) {
                        handleDialogOpenChange(false)
                    }
                }}
                hasSpecialConditions={hasSpecialConditions}
            />

            <HolidayDialog
                open={isHolidayDialogOpen}
                onOpenChange={handleHolidayDialogOpenChange}
                selectedRange={selectedRange}
                onSubmit={(holidayName) => {
                    if (handleAddHolidays(selectedRange, holidayName)) {
                        handleHolidayDialogOpenChange(false)
                    }
                }}
            />
        </div>
    )
} 