import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { AlertCircle } from 'lucide-react'

import { AdditionalServices } from '@/components/additional-services'
import { AdditionalService } from '@/shared/types/additional-services'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

import { BookingFormData } from '../../types/booking.types'

interface AdditionalServicesStepProps {
    form: UseFormReturn<BookingFormData>
    onServiceChange: (services: AdditionalService[]) => void
    groomingUnavailable: boolean
}

export function AdditionalServicesStep({ form, onServiceChange, groomingUnavailable }: AdditionalServicesStepProps) {
    const { t } = useTranslation()
    const pets = form.getValues('pets')
    const petNames = pets.map(pet => pet.name)

    return (
        <>
            {groomingUnavailable && (
                <Alert className='mb-4'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>{t('booking.step3.alerts.groomingUnavailable.title')}</AlertTitle>
                    <AlertDescription>{t('booking.step3.alerts.groomingUnavailable.description')}</AlertDescription>
                </Alert>
            )}
            <AdditionalServices
                onServiceChange={onServiceChange}
                petCount={pets.length}
                groomingUnavailable={groomingUnavailable}
                initialServices={form.getValues('services')}
                petNames={petNames}
                hideDriverService
            />
        </>
    )
}
