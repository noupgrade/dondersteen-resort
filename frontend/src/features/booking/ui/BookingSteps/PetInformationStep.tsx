import { UseFormReturn } from 'react-hook-form'

import { PetDetailsForm } from '@/components/pet-details-form'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { BookingFormData } from '../../types/booking.types'

interface PetInformationStepProps {
    form: UseFormReturn<BookingFormData>
    onAddPet: () => void
    onRemovePet: (index: number) => void
}

export function PetInformationStep({ form, onAddPet, onRemovePet }: PetInformationStepProps) {
    const pets = form.watch('pets')

    return (
        <Card>
            <CardHeader>
                <CardTitle>Paso 1: Información de las mascotas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {pets.map((_, index) => (
                        <PetDetailsForm
                            key={index}
                            form={form}
                            petIndex={index}
                            onRemove={() => onRemovePet(index)}
                        />
                    ))}
                    {pets.length < 2 && (
                        <Button
                            type='button'
                            variant='outline'
                            className='w-full'
                            onClick={onAddPet}
                        >
                            Añadir otra mascota
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 