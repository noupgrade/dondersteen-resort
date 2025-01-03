import { UseFormReturn } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

import { AvailabilityCalendar } from '@/components/availability-calendar'
import { ImportantNotes } from '@/components/important-notes'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { BookingFormData, DateRange } from '../../types/booking.types'

interface DateSelectionStepProps {
    form: UseFormReturn<BookingFormData>
    onDateSelect: (range: DateRange | undefined) => void
    dateError: string
    capacity: number
}

export function DateSelectionStep({
    form,
    onDateSelect,
    dateError,
    capacity,
}: DateSelectionStepProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Paso 2: Selecciona las fechas</CardTitle>
            </CardHeader>
            <CardContent>
                <AvailabilityCalendar
                    onSelect={onDateSelect}
                    capacity={capacity}
                />
                {dateError && (
                    <Alert variant='destructive' className='mt-4'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{dateError}</AlertDescription>
                    </Alert>
                )}
                <ImportantNotes />
            </CardContent>
        </Card>
    )
} 