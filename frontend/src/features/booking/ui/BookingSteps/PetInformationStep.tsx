import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { PetDetailsForm } from '@/components/pet-details-form'
import { useGlobalPublicConfig } from '@/shared/hooks/use-global-config'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

import { BookingFormData } from '../../types/booking.types'

interface PetInformationStepProps {
    form: UseFormReturn<BookingFormData>
    onAddPet: () => void
    onRemovePet: (index: number) => void
}

export function PetInformationStep({ form, onAddPet, onRemovePet }: PetInformationStepProps) {
    const { t } = useTranslation()
    const { data: globalConfig } = useGlobalPublicConfig()
    const pets = form.watch('pets')

    return (
        <div className='flex flex-col space-y-4 p-4'>
            <h1 className='text-2xl font-bold'>{t('booking.step1.title', 'Paso 1: Tus mascotas')}</h1>
            <div className=''>
                {pets.map((_, index) => (
                    <PetDetailsForm key={index} form={form} petIndex={index} onRemove={() => onRemovePet(index)} />
                ))}
                {pets.length < 2 && (
                    <Button type='button' variant='outline' className='w-full' onClick={onAddPet}>
                        {t('booking.step1.addPet', 'Añadir otra mascota')}
                    </Button>
                )}
                {pets.length >= 2 && (
                    <div className='mt-4 border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700'>
                        <p>
                            {t(
                                'booking.step1.maxPetsMessage',
                                'Para más de 2 mascotas, por favor llama al teléfono: {{phoneNumber}}',
                                {
                                    phoneNumber: globalConfig?.phoneNumber || '',
                                },
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
