import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AlertCircle } from 'lucide-react'

import { AvailabilityCalendar } from '@/components/availability-calendar'
import { ImportantNotes } from '@/components/important-notes'
import { AdditionalService } from '@/shared/types/additional-services'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

import { BookingFormData, DateRange } from '../../types/booking.types'

interface DateSelectionStepProps {
    form: UseFormReturn<BookingFormData>
    onDateSelect: (range: DateRange | undefined, checkInTime: string, checkOutTime: string) => void
    onServiceChange: (services: AdditionalService[]) => void
    dateError: string
    capacity: number
}

export function DateSelectionStep({
    form,
    onDateSelect,
    onServiceChange,
    dateError,
    capacity,
}: DateSelectionStepProps) {
    const { t } = useTranslation()
    const services = form.watch('services')

    return (
        <div className='flex flex-col space-y-4'>
            <div className='flex flex-col items-center'>
                <AvailabilityCalendar
                    onSelect={onDateSelect}
                    onServiceChange={onServiceChange}
                    capacity={capacity}
                    initialServices={services}
                />
                {dateError && (
                    <Alert variant='destructive' className='mt-4'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{dateError}</AlertDescription>
                    </Alert>
                )}
                <div className='mt-6 w-full max-w-2xl'>
                    <ImportantNotes />
                </div>
            </div>
        </div>
    )
}
