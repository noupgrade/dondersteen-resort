'use client'

import { useEffect, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AlertCircle, Loader2, Phone } from 'lucide-react'

import { BookingSummary } from '@/components/booking-summary'
import { useBookingCalculations } from '@/features/booking/model/useBookingCalculations'
import { useBookingForm } from '@/features/booking/model/useBookingForm'
import {
    AdditionalServicesStep,
    ConfirmationStep,
    DateSelectionStep,
    PetInformationStep,
} from '@/features/booking/ui/BookingSteps'
import { useClientProfile } from '@/hooks/use-client-profile'
import { useGlobalPublicConfig } from '@/shared/hooks/use-global-config'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Form } from '@/shared/ui/form'
import { LanguageSwitchButton } from '@/shared/ui/language-switch-button'
import { AdditionalService } from '@monorepo/functions/src/types/services'

export default function BookingPage() {
    const { t } = useTranslation()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const { data: clientProfile } = useClientProfile(userId || '')
    const { data: globalConfig } = useGlobalPublicConfig()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasBackendError, setHasBackendError] = useState(false)

    const { form, state, setState, addPet, removePet, handleSubmit, nextStep, prevStep, clearForm } = useBookingForm({
        defaultValues: {
            pets: clientProfile?.pets.map(pet => ({
                name: pet.name,
                breed: pet.breed,
                weight: String(pet.weight),
                size: pet.size,
                age: '0',
                personality: '',
                sex: pet.sex || 'M',
                isNeutered: pet.isNeutered || false,
            })) || [
                {
                    name: '',
                    breed: '',
                    weight: '0',
                    size: 'pequeño' as const,
                    age: '0',
                    personality: '',
                    sex: 'M' as const,
                    isNeutered: false,
                },
            ],
            dates: null,
            services: clientProfile?.pets.map(pet => pet.additionalServices || []).flat() || [],
            clientName: clientProfile?.client.name.split(' ')[0] || '',
            clientLastName: clientProfile?.client.name.split(' ').slice(1).join(' ') || '',
            clientEmail: clientProfile?.client.email || '',
            clientPhone: clientProfile?.client.phone || '',
        },
    })

    // Update form values when clientProfile changes
    useEffect(() => {
        if (clientProfile) {
            form.setValue('clientName', clientProfile.client.name.split(' ')[0])
            form.setValue('clientLastName', clientProfile.client.name.split(' ').slice(1).join(' '))
            form.setValue('clientEmail', clientProfile.client.email)
            form.setValue('clientPhone', clientProfile.client.phone)
            form.setValue(
                'pets',
                clientProfile.pets.map(pet => ({
                    name: pet.name,
                    breed: pet.breed,
                    weight: String(pet.weight),
                    size: pet.size,
                    age: '0',
                    personality: '',
                    sex: pet.sex || 'M',
                    isNeutered: pet.isNeutered || false,
                })),
            )
            form.setValue('services', clientProfile.pets.map(pet => pet.additionalServices || []).flat())
        }
    }, [clientProfile, form])

    const { calculateCapacity } = useBookingCalculations()

    const handleServiceChange = (services: AdditionalService[]) => {
        form.setValue('services', services)
    }

    const watchedPets = useWatch({
        control: form.control,
        name: 'pets',
    })

    const watchedServices = useWatch({
        control: form.control,
        name: 'services',
    })

    const handleConfirmClick = async () => {
        setIsSubmitting(true)
        setHasBackendError(false)
        try {
            const reservationId = await handleSubmit()
            if (reservationId) {
                navigate(`/booking/confirmation/${reservationId}`)
            } else {
                setHasBackendError(true)
            }
        } catch (error) {
            setHasBackendError(true)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className='container mx-auto max-w-4xl p-4'>
                <div className='absolute right-4 top-4 z-50'>
                    <LanguageSwitchButton />
                </div>
                {type === 'budget' && (
                    <Alert variant='destructive' className='mb-6'>
                        <AlertCircle className='h-4 w-4' />
                        <div className='flex w-full items-center justify-between'>
                            <div>
                                <AlertTitle>Creando Presupuesto</AlertTitle>
                                <AlertDescription>
                                    Estás en el proceso de crear un presupuesto. Si deseas realizar una reserva, haz
                                    clic aquí.
                                </AlertDescription>
                            </div>
                            <Button
                                variant='outline'
                                className='bg-white hover:bg-white/90'
                                onClick={() => {
                                    const newParams = new URLSearchParams(searchParams)
                                    newParams.delete('type')
                                    window.location.search = newParams.toString()
                                }}
                            >
                                Crear Reserva
                            </Button>
                        </div>
                    </Alert>
                )}
                <img src='/dondersteen-logo.png' alt='Dondersteen Logo' className='mx-auto mb-8 h-24' />
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-8'>
                    <div className={`${!state.selectedDates ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                        <Form {...form}>
                            <div className='space-y-8'>
                                {state.currentStep === 1 && (
                                    <PetInformationStep form={form} onAddPet={addPet} onRemovePet={removePet} />
                                )}

                                {state.currentStep === 2 && (
                                    <DateSelectionStep
                                        form={form}
                                        onDateSelect={(range, checkInTime, checkOutTime) => {
                                            if (range) {
                                                setState(prev => ({
                                                    ...prev,
                                                    selectedDates: range,
                                                    checkInTime,
                                                    checkOutTime,
                                                }))
                                                form.setValue('dates', range)
                                            } else {
                                                setState(prev => ({
                                                    ...prev,
                                                    selectedDates: null,
                                                    checkInTime: '14:00',
                                                    checkOutTime: '12:00',
                                                }))
                                                form.setValue('dates', null)
                                            }
                                        }}
                                        onServiceChange={handleServiceChange}
                                        dateError={state.dateError}
                                        capacity={calculateCapacity(form.getValues('pets'))}
                                    />
                                )}

                                {state.currentStep === 3 && (
                                    <AdditionalServicesStep
                                        form={form}
                                        onServiceChange={handleServiceChange}
                                        groomingUnavailable={state.groomingUnavailable}
                                    />
                                )}

                                {state.currentStep === 4 && <ConfirmationStep form={form} />}
                            </div>
                        </Form>
                    </div>

                    <div className='flex flex-col gap-4 lg:col-span-1'>
                        {state.selectedDates && (
                            <BookingSummary pets={watchedPets} dates={state.selectedDates} services={watchedServices} />
                        )}
                        {state.formError && (
                            <>
                                <Alert variant='destructive'>
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{state.formError}</AlertDescription>
                                </Alert>
                            </>
                        )}

                        {hasBackendError && (
                            <Alert variant='default' className='border-yellow-500 bg-yellow-50'>
                                <Phone className='h-4 w-4 text-yellow-600' />
                                <AlertTitle className='text-yellow-800'>
                                    {t('booking.errors.banner.title', '¿Tienes problemas?')}
                                </AlertTitle>
                                <AlertDescription className='text-yellow-700'>
                                    {t(
                                        'booking.errors.banner.description',
                                        'Si estás teniendo algún problema, llámanos al {{phoneNumber}} y te ayudaremos con tu reserva.',
                                        {
                                            phoneNumber: globalConfig?.phoneNumber || '',
                                        },
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className='flex justify-between space-x-4'>
                            {state.currentStep > 1 && (
                                <Button type='button' variant='outline' onClick={prevStep}>
                                    {t('booking.navigation.previous', 'Anterior')}
                                </Button>
                            )}
                            {state.currentStep < 4 ? (
                                <Button type='button' className='w-full' onClick={nextStep}>
                                    {t('booking.navigation.next', 'Siguiente')}
                                </Button>
                            ) : (
                                <Button
                                    type='button'
                                    className='w-full'
                                    disabled={isSubmitting}
                                    onClick={handleConfirmClick}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            {t('booking.navigation.confirming', 'Confirmando...')}
                                        </>
                                    ) : (
                                        t('booking.navigation.confirm', 'Confirmar reserva')
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
