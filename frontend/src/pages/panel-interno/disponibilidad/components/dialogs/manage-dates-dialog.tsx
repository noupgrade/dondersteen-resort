import { format, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import { Ban, CalendarDays, DollarSign, Trash2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { DateRange } from '../../types'

interface ManageDatesDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedRange: DateRange
    onBlockDates: () => void
    onOpenHolidayDialog: () => void
    onOpenHighSeasonDialog: () => void
    onRemoveSpecialConditions: () => void
    hasSpecialConditions: boolean
}

export function ManageDatesDialog({
    open,
    onOpenChange,
    selectedRange,
    onBlockDates,
    onOpenHolidayDialog,
    onOpenHighSeasonDialog,
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
                                <br />
                                {eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to }).length} días
                                seleccionados
                            </div>
                        )}
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <Button onClick={onBlockDates} className='w-full'>
                        <Ban className='mr-2 h-4 w-4' />
                        Bloquear Fechas
                    </Button>
                    <Button onClick={onOpenHolidayDialog} variant='outline' className='w-full'>
                        <CalendarDays className='mr-2 h-4 w-4' />
                        Marcar como Festivos
                    </Button>
                    <Button onClick={onOpenHighSeasonDialog} variant='outline' className='w-full'>
                        <DollarSign className='mr-2 h-4 w-4' />
                        Marcar como Temporada Alta
                    </Button>
                    {hasSpecialConditions && (
                        <>
                            <div className='relative'>
                                <div className='absolute inset-0 flex items-center'>
                                    <span className='w-full border-t' />
                                </div>
                                <div className='relative flex justify-center text-xs uppercase'>
                                    <span className='bg-background px-2 text-muted-foreground'>
                                        Eliminar condiciones
                                    </span>
                                </div>
                            </div>
                            <Button onClick={onRemoveSpecialConditions} variant='destructive' className='w-full'>
                                <Trash2 className='mr-2 h-4 w-4' />
                                Eliminar Condiciones Especiales
                            </Button>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
} 