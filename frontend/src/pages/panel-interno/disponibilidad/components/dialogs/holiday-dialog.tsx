import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { DateRange } from '../../types'

interface HolidayDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedRange: DateRange
    onSubmit: (holidayName: string) => void
}

export function HolidayDialog({ open, onOpenChange, selectedRange, onSubmit }: HolidayDialogProps) {
    const [holidayName, setHolidayName] = useState('')

    const handleSubmit = () => {
        if (holidayName) {
            onSubmit(holidayName)
            setHolidayName('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Días Festivos</DialogTitle>
                    <DialogDescription>
                        {selectedRange.from && selectedRange.to && (
                            <div className='mt-2 text-sm'>
                                {format(selectedRange.from, "d 'de' MMMM", { locale: es })} -{' '}
                                {format(selectedRange.to, "d 'de' MMMM", { locale: es })}
                            </div>
                        )}
                        Introduce el nombre de los días festivos
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <div className='space-y-2'>
                        <Label>Nombre del festivo</Label>
                        <Input
                            value={holidayName}
                            onChange={(e) => setHolidayName(e.target.value)}
                            placeholder='Ej: Navidad'
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!holidayName}>
                        <CalendarDays className='mr-2 h-4 w-4' />
                        Añadir Festivos
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 