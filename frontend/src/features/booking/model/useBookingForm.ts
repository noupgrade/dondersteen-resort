import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, isValid } from 'date-fns'
import { useSearchParams } from 'react-router-dom'

import { useReservation } from '@/components/ReservationContext'
import { AdditionalService } from '@/shared/types/additional-services'
import {
    BookingFormData,
    BookingState,
    DateRange,
    PetData,
    PetFormData,
    bookingFormSchema
} from '../types/booking.types'

interface UseBookingFormProps {
    defaultValues?: Partial<BookingFormData>
}

export function useBookingForm({ defaultValues }: UseBookingFormProps = {}) {
    const [searchParams] = useSearchParams()
    const type = searchParams.get('type')
    const [state, setState] = useState<BookingState>({
        currentStep: 1,
        selectedDates: null,
        totalPrice: 0,
        dateError: '',
        formError: '',
        groomingUnavailable: false,
        checkInTime: '14:00',
        checkOutTime: '12:00',
        confirmedReservationId: '',
    })

    const { addReservation } = useReservation()

    const form = useForm<BookingFormData>({
        resolver: zodResolver(bookingFormSchema),
        defaultValues: {
            pets: [{
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
            services: [],
            clientName: '',
            clientLastName: '',
            clientEmail: '',
            clientPhone: '',
            ...defaultValues
        },
    })

    // Load saved form data on mount
    useEffect(() => {
        const savedData = localStorage.getItem('bookingFormData')
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)

                // Restore dates if they exist
                if (parsedData.dates) {
                    const from = new Date(parsedData.dates.from)
                    const to = new Date(parsedData.dates.to)
                    if (isValid(from) && isValid(to)) {
                        const dates = { from, to }
                        setState(prev => ({ ...prev, selectedDates: dates }))
                        form.setValue('dates', dates)
                    }
                }

                // Ensure services is always an array
                const services = Array.isArray(parsedData.services) ? parsedData.services : []

                // Restore form data
                form.reset({
                    ...parsedData,
                    services,
                })

                // Restore other state
                if (parsedData.currentStep) {
                    setState(prev => ({ ...prev, currentStep: parsedData.currentStep }))
                }
                if (parsedData.checkInTime) {
                    setState(prev => ({ ...prev, checkInTime: parsedData.checkInTime }))
                }
                if (parsedData.checkOutTime) {
                    setState(prev => ({ ...prev, checkOutTime: parsedData.checkOutTime }))
                }
            } catch (error) {
                console.error('Error restoring form data:', error)
                localStorage.removeItem('bookingFormData')
            }
        }
    }, [form])

    // Save form data whenever it changes
    useEffect(() => {
        const subscription = form.watch((formData) => {
            const dataToSave = {
                ...formData,
                dates: state.selectedDates,
                currentStep: state.currentStep,
                checkInTime: state.checkInTime,
                checkOutTime: state.checkOutTime,
            }
            localStorage.setItem('bookingFormData', JSON.stringify(dataToSave))
        })

        return () => subscription.unsubscribe()
    }, [form, state.selectedDates, state.currentStep, state.checkInTime, state.checkOutTime])

    // Clear localStorage when reservation is confirmed
    useEffect(() => {
        if (state.confirmedReservationId) {
            localStorage.removeItem('bookingFormData')
        }
    }, [state.confirmedReservationId])

    const addPet = useCallback(() => {
        const currentPets = form.getValues('pets')
        if (currentPets.length < 2) {
            const newPets = [...currentPets, {
                name: '',
                breed: '',
                weight: '0',
                size: 'pequeño' as const,
                age: '0',
                personality: '',
                sex: 'M' as const,
                isNeutered: false
            }]
            form.setValue('pets', newPets)
        }
    }, [form])

    const removePet = useCallback(
        (index: number) => {
            const currentPets = form.getValues('pets')
            if (currentPets.length > 1) {
                const newPets = currentPets.filter((_, i) => i !== index)
                form.setValue('pets', newPets)
            }
        },
        [form],
    )

    const validateAllSteps = useCallback(async () => {
        const isValid = await form.trigger()

        if (!isValid) {
            const errors = form.formState.errors

            if (errors.pets) {
                setState(prev => ({ ...prev, formError: 'Por favor, revisa la información de las mascotas. Hay campos inválidos o incompletos.' }))
                return false
            }

            if (!state.selectedDates) {
                setState(prev => ({ ...prev, formError: 'Por favor, selecciona las fechas de entrada y salida.' }))
                return false
            }

            if (errors.clientName || errors.clientLastName || errors.clientEmail || errors.clientPhone) {
                setState(prev => ({ ...prev, formError: 'Por favor, revisa tus datos de contacto. Hay campos inválidos o incompletos.' }))
                return false
            }
        }

        setState(prev => ({ ...prev, formError: '' }))
        return isValid
    }, [form, state.selectedDates])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        console.log('handleSubmit', state.currentStep)
        e.preventDefault()

        const isValid = await form.trigger()

        if (isValid && state.selectedDates) {
            const values = form.getValues()
            const transformedPets: PetData[] = (values.pets as PetFormData[]).map(pet => ({
                name: pet.name,
                breed: pet.breed,
                weight: Number(pet.weight),
                size: pet.size,
                sex: pet.sex,
                isNeutered: pet.isNeutered || false
            }))

            // Filter out any undefined or null values from services
            const cleanedServices: AdditionalService[] = values.services
                .filter(service => service !== null)
                .map(service => {
                    switch (service.type) {
                        case 'driver':
                            return {
                                type: 'driver' as const,
                                petIndex: service.petIndex,
                                serviceType: service.serviceType
                            }
                        case 'special_food':
                            return {
                                type: 'special_food' as const,
                                petIndex: service.petIndex,
                                foodType: service.foodType
                            }
                        case 'medication':
                            return {
                                type: 'medication' as const,
                                petIndex: service.petIndex,
                                comment: service.comment,
                                frequency: service.frequency
                            }
                        case 'special_care':
                            return {
                                type: 'special_care' as const,
                                petIndex: service.petIndex,
                                comment: service.comment
                            }
                        case 'hairdressing':
                            return {
                                type: 'hairdressing' as const,
                                petIndex: service.petIndex,
                                services: service.services
                            }
                        default:
                            return service as AdditionalService
                    }
                })

            const newReservation = {
                type: type === 'budget' ? 'hotel-budget' as const : 'hotel' as const,
                checkInDate: format(state.selectedDates.from, 'yyyy-MM-dd'),
                checkOutDate: format(state.selectedDates.to, 'yyyy-MM-dd'),
                checkInTime: state.checkInTime,
                checkOutTime: state.checkOutTime,
                client: {
                    name: `${values.clientName} ${values.clientLastName}`,
                    phone: values.clientPhone,
                    email: values.clientEmail,
                },
                pets: transformedPets,
                additionalServices: cleanedServices,
                roomNumber: '',
                status: 'pending' as const,
                totalPrice: state.totalPrice,
                paymentStatus: 'Pendiente' as const,
            }

            try {
                console.log('newReservation', newReservation)
                const savedReservation = await addReservation(newReservation)
                setState(prev => ({
                    ...prev,
                    confirmedReservationId: savedReservation.id
                }))
                localStorage.removeItem('bookingFormData')
            } catch (error) {
                console.error('Error saving reservation:', error)
                setState(prev => ({
                    ...prev,
                    formError: 'Hubo un error al guardar la reserva. Por favor, inténtalo de nuevo.'
                }))
            }
        } else {
            setState(prev => ({
                ...prev,
                formError: 'Por favor, revisa todos los campos. Hay información incompleta o inválida.'
            }))
        }
    }, [form, state.selectedDates, state.checkInTime, state.checkOutTime, state.totalPrice, addReservation])

    const nextStep = useCallback(async () => {
        let isValid = false

        setState(prev => ({ ...prev, formError: '' })) // Clear the form error when attempting to move to next step
        console.log('state.currentStep', state.currentStep)
        switch (state.currentStep) {
            case 1:
                isValid = await form.trigger('pets', { shouldFocus: true })
                if (!isValid) {
                    setState(prev => ({
                        ...prev,
                        formError: 'Por favor, completa todos los campos de las mascotas antes de continuar.'
                    }))
                }
                break
            case 2:
                if (!state.selectedDates) {
                    setState(prev => ({ ...prev, dateError: 'Por favor, selecciona tus fechas antes de continuar.' }))
                    return
                }
                isValid = true
                break
            case 3:
                isValid = true
                break
            case 4:
                isValid = await form.trigger()
                break
        }

        if (isValid) {
            setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, 4) }))
        }
    }, [form, state.currentStep, state.selectedDates])

    const prevStep = useCallback(() => {
        setState(prev => ({
            ...prev,
            formError: '',
            dateError: '',
            currentStep: Math.max(prev.currentStep - 1, 1)
        }))
    }, [])

    const clearForm = useCallback(() => {
        localStorage.removeItem('bookingFormData')
        form.reset({
            pets: [{
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
            services: [],
            clientName: '',
            clientLastName: '',
            clientEmail: '',
            clientPhone: '',
        })
        setState({
            currentStep: 1,
            selectedDates: null,
            totalPrice: 0,
            dateError: '',
            formError: '',
            groomingUnavailable: false,
            checkInTime: '14:00',
            checkOutTime: '12:00',
            confirmedReservationId: '',
        })
    }, [form])

    return {
        form,
        state,
        setState,
        addPet,
        removePet,
        validateAllSteps,
        handleSubmit,
        nextStep,
        prevStep,
        clearForm,
    }
} 