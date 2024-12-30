import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { DollarSign } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { DateRange } from '../../types'

interface HighSeasonDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedRange: DateRange
    onSubmit: (price: string) => void
}

export function HighSeasonDialog({ open, onOpenChange, selectedRange, onSubmit }: HighSeasonDialogProps) {
    const [price, setPrice] = useState('')

    const handleSubmit = () => {
        if (price) {
            onSubmit(price)
            setPrice('')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Temporada Alta</DialogTitle>
                    <DialogDescription>
                        {selectedRange.from && selectedRange.to && (
                            <div className='mt-2 text-sm'>
                                {format(selectedRange.from, "d 'de' MMMM", { locale: es })} -{' '}
                                {format(selectedRange.to, "d 'de' MMMM", { locale: es })}
                            </div>
                        )}
                        Define el precio de la temporada alta
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    <div className='space-y-2'>
                        <Label>Precio por noche (€)</Label>
                        <div className='relative'>
                            <DollarSign className='absolute left-3 top-2.5 h-5 w-5 text-muted-foreground' />
                            <Input
                                type='number'
                                className='pl-10'
                                placeholder='0.00'
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSubmit} disabled={!price}>
                        <DollarSign className='mr-2 h-4 w-4' />
                        Añadir Temporada Alta
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 