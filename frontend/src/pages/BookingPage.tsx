'use client'

import { useClientProfile } from '@/hooks/use-client-profile'
import { AlertCircle } from 'lucide-react'
import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useWatch } from 'react-hook-form'

import { BookingSummary } from '@/components/booking-summary'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { useBookingCalculations } from '@/features/booking/model/useBookingCalculations'
import { useBookingForm } from '@/features/booking/model/useBookingForm'
import {
    AdditionalServicesStep,
    ConfirmationStep,
    DateSelectionStep,
    PetInformationStep,
} from '@/features/booking/ui/BookingSteps'
import { AdditionalService } from '@/shared/types/additional-services'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Form } from '@/shared/ui/form'

export default function BookingPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const userId = searchParams.get('userId')
    const type = searchParams.get('type')
    const { data: clientProfile } = useClientProfile(userId || '')

    const {
        form,
        state,
        setState,
        addPet,
        removePet,
        handleSubmit,
        nextStep,
        prevStep,
        clearForm,
    } = useBookingForm({
        defaultValues: {
            pets: clientProfile?.pets.map(pet => ({
                name: pet.name,
                breed: pet.breed,
                weight: String(pet.weight),
                size: pet.size,
                age: '0',
                personality: '',
                sex: pet.sex || 'M',
                isNeutered: pet.isNeutered || false
            })) || [{
                name: '',
                breed: '',
                weight: '0',
                size: 'pequeño' as const,
                age: '0',
                personality: '',
                sex: 'M' as const,
                isNeutered: false
            }],
            dates: null,
            services: clientProfile?.pets
                .map(pet => pet.additionalServices || [])
                .flat() || [],
            clientName: clientProfile?.client.name.split(' ')[0] || '',
            clientLastName: clientProfile?.client.name.split(' ').slice(1).join(' ') || '',
            clientEmail: clientProfile?.client.email || '',
            clientPhone: clientProfile?.client.phone || ''
        }
    })

    // Update form values when clientProfile changes
    useEffect(() => {
        if (clientProfile) {
            form.setValue('clientName', clientProfile.client.name.split(' ')[0])
            form.setValue('clientLastName', clientProfile.client.name.split(' ').slice(1).join(' '))
            form.setValue('clientEmail', clientProfile.client.email)
            form.setValue('clientPhone', clientProfile.client.phone)
            form.setValue('pets', clientProfile.pets.map(pet => ({
                name: pet.name,
                breed: pet.breed,
                weight: String(pet.weight),
                size: pet.size,
                age: '0',
                personality: '',
                sex: pet.sex || 'M',
                isNeutered: pet.isNeutered || false
            })))
            form.setValue('services', clientProfile.pets
                .map(pet => pet.additionalServices || [])
                .flat()
            )
        }
    }, [clientProfile, form])

    const { calculateCapacity } = useBookingCalculations()

    const handleServiceChange = (services: AdditionalService[]) => {
        form.setValue('services', services)
    }

    const watchedPets = useWatch({
        control: form.control,
        name: 'pets'
    })

    const watchedServices = useWatch({
        control: form.control,
        name: 'services'
    })

    return (
        <>
            <div className='container mx-auto max-w-4xl py-8'>
                {type === 'budget' && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <AlertTitle>Creando Presupuesto</AlertTitle>
                                <AlertDescription>
                                    Estás en el proceso de crear un presupuesto. Si deseas realizar una reserva, haz clic aquí.
                                </AlertDescription>
                            </div>
                            <Button
                                variant="outline"
                                className="bg-white hover:bg-white/90"
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
                <div className='fixed left-5 top-5'>
                    <Button
                        variant='outline'
                        onClick={clearForm}
                    >
                        Limpiar reserva
                    </Button>
                </div>
                <h1 className='mb-8 text-center text-3xl font-bold'>Reserva tu estancia en Dondersteen</h1>
                <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                    <div className='lg:col-span-2'>
                        <Form {...form}>
                            <div className='space-y-8'>
                                {state.currentStep === 1 && (
                                    <PetInformationStep
                                        form={form}
                                        onAddPet={addPet}
                                        onRemovePet={removePet}
                                    />
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
                                                    checkOutTime
                                                }))
                                            } else {
                                                setState(prev => ({
                                                    ...prev,
                                                    selectedDates: null,
                                                    checkInTime: '14:00',
                                                    checkOutTime: '12:00'
                                                }))
                                            }
                                        }}
                                        onServiceChange={services => {
                                            // Keep all services except driver service
                                            const nonDriverServices = form.getValues('services').filter(s => s.type !== 'driver')
                                            // Add new driver service if present
                                            const driverService = services.find(s => s.type === 'driver')
                                            form.setValue('services', driverService ? [...nonDriverServices, driverService] : nonDriverServices)
                                        }}
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

                                {state.currentStep === 4 && (
                                    <ConfirmationStep form={form} />
                                )}

                                {state.formError && (
                                    <Alert variant='destructive'>
                                        <AlertCircle className='h-4 w-4' />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{state.formError}</AlertDescription>
                                    </Alert>
                                )}

                                <div className='flex justify-between space-x-4'>
                                    {state.currentStep > 1 && (
                                        <Button type='button' variant='outline' onClick={prevStep}>
                                            Anterior
                                        </Button>
                                    )}
                                    {state.currentStep < 4 ? (
                                        <Button type='button' onClick={nextStep}>
                                            Siguiente
                                        </Button>
                                    ) : (
                                        <Button type='button' onClick={handleSubmit}>Confirmar reserva</Button>
                                    )}
                                </div>
                            </div>
                        </Form>
                    </div>
                    <div className='lg:col-span-1'>
                        <BookingSummary
                            pets={watchedPets}
                            dates={state.selectedDates}
                            services={watchedServices}
                        />
                    </div>
                </div>

                <ConfirmationDialog
                    open={state.confirmedReservationId !== ''}
                    onOpenChange={(open) => {
                        if (!open) {
                            setState(prev => ({ ...prev, confirmedReservationId: '' }))
                        }
                    }}
                    reservationId={state.confirmedReservationId}
                />
            </div>
        </>
    )
}
