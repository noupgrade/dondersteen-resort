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
        <div className='flex flex-col space-y-4 p-4'>
            <h1 className='text-2xl font-bold'>Paso 1: Tus mascotas</h1>
            <div className=''>
                {pets.map((_, index) => (
                    <PetDetailsForm key={index} form={form} petIndex={index} onRemove={() => onRemovePet(index)} />
                ))}
                {pets.length < 2 && (
                    <Button type='button' variant='outline' className='w-full' onClick={onAddPet}>
                        Añadir otra mascota
                    </Button>
                )}
                {pets.length >= 2 && (
                    <div className='mt-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700'>
                        <p>
                            Para más de 2 mascotas, por favor llama al teléfono: <strong>123-456-7890</strong>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
