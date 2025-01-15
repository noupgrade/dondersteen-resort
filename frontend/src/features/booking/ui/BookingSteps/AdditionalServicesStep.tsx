import { UseFormReturn } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'

import { AdditionalServices } from '@/components/additional-services'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { BookingFormData } from '../../types/booking.types'
import { AdditionalService } from '@/shared/types/additional-services'

interface AdditionalServicesStepProps {
    form: UseFormReturn<BookingFormData>
    onServiceChange: (services: AdditionalService[]) => void
    groomingUnavailable: boolean
}

export function AdditionalServicesStep({
    form,
    onServiceChange,
    groomingUnavailable,
}: AdditionalServicesStepProps) {
    const pets = form.getValues('pets')
    const petNames = pets.map(pet => pet.name)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Paso 3: Servicios adicionales</CardTitle>
            </CardHeader>
            <CardContent>
                {groomingUnavailable && (
                    <Alert className='mb-4'>
                        <AlertCircle className='h-4 w-4' />
                        <AlertTitle>Servicio de peluquería no disponible</AlertTitle>
                        <AlertDescription>
                            Lo sentimos, el servicio de peluquería no está disponible para el
                            último día de su reserva (8 de diciembre). Si desea este servicio,
                            por favor seleccione otras fechas o contáctenos para más
                            información.
                        </AlertDescription>
                    </Alert>
                )}
                <AdditionalServices
                    onServiceChange={onServiceChange}
                    petCount={pets.length}
                    groomingUnavailable={groomingUnavailable}
                    initialServices={form.getValues('services')}
                    petNames={petNames}
                />
            </CardContent>
        </Card>
    )
} 