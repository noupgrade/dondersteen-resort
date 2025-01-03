'use client'

import { AlertCircle } from 'lucide-react'

import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { BookingSummary } from '@/components/booking-summary'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Form } from '@/shared/ui/form'
import { useBookingForm } from '@/features/booking/model/useBookingForm'
import { useBookingCalculations } from '@/features/booking/model/useBookingCalculations'
import { AdditionalService } from '@/shared/types/additional-services'
import {
    PetInformationStep,
    DateSelectionStep,
    AdditionalServicesStep,
    ConfirmationStep,
} from '@/features/booking/ui/BookingSteps'

export default function BookingPage() {
    const {
        form,
        state,
        setState,
        addPet,
        removePet,
        handleSubmit,
        nextStep,
        prevStep,
    } = useBookingForm()

    const { calculateCapacity } = useBookingCalculations()

    const handleServiceChange = (services: AdditionalService[]) => {
        form.setValue('services', services)
    }

    return (
        <div className='container mx-auto max-w-4xl py-8'>
            <h1 className='mb-8 text-center text-3xl font-bold'>Reserva tu estancia en Dondersteen</h1>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                <div className='lg:col-span-2'>
                    <Form {...form}>
                        <form onSubmit={handleSubmit} className='space-y-8'>
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
                                    onDateSelect={(range) => {
                                        if (range) {
                                            setState(prev => ({ ...prev, selectedDates: range }))
                                        } else {
                                            setState(prev => ({ ...prev, selectedDates: null }))
                                        }
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
                                    <Button type='submit'>Confirmar reserva</Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>
                <div className='lg:col-span-1'>
                    <BookingSummary
                        pets={form.getValues('pets')}
                        dates={state.selectedDates ? {
                            startDate: state.selectedDates.from,
                            endDate: state.selectedDates.to
                        } : null}
                        services={form.getValues('services')}
                        totalPrice={state.totalPrice}
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
    )
}
