import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Ban, CalendarClock } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { DateRange } from '../../types'

interface ManageDatesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedRange: DateRange
    onBlockDates: () => void
    onOpenHolidayDialog: () => void
    onHighSeasonClick: () => void
    onRemoveSpecialConditions: () => void
    hasSpecialConditions: boolean
}

export function ManageDatesDialog({
    open,
    onOpenChange,
    selectedRange,
    onBlockDates,
    onOpenHolidayDialog,
    onHighSeasonClick,
    onRemoveSpecialConditions,
    hasSpecialConditions,
}: ManageDatesDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Gestionar Fechas</DialogTitle>
                    <DialogDescription>
                        {selectedRange.from && selectedRange.to && (
                            <div className='mt-2 text-sm'>
                                {format(selectedRange.from, "d 'de' MMMM", { locale: es })} -{' '}
                                {format(selectedRange.to, "d 'de' MMMM", { locale: es })}
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <Button onClick={onBlockDates} variant='outline' className='text-red-500 hover:text-red-600'>
                        <Ban className='mr-2 h-4 w-4' />
                        Bloquear fechas
                    </Button>
                    <Button onClick={onOpenHolidayDialog} variant='outline' className='text-amber-700 hover:text-amber-800'>
                        <CalendarClock className='mr-2 h-4 w-4' />
                        Marcar como festivo
                    </Button>
                    <Button onClick={onHighSeasonClick} variant='outline' className='text-green-500 hover:text-green-600'>
                        <Calendar className='mr-2 h-4 w-4' />
                        Marcar como temporada alta
                    </Button>
                    {hasSpecialConditions && (
                        <Button onClick={onRemoveSpecialConditions} variant='destructive'>
                            Eliminar condiciones especiales
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 