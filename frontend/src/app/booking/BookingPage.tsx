'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { differenceInDays, format, isEqual } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import * as z from 'zod'

import { useReservation } from '@/components/ReservationContext'
import { AdditionalServices } from '@/components/additional-services'
import { AvailabilityCalendar } from '@/components/availability-calendar'
import { BookingSummary } from '@/components/booking-summary'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { ImportantNotes } from '@/components/important-notes'
import { PetDetailsForm } from '@/components/pet-details-form'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'

const petSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    breed: z.string().min(1, 'La raza es requerida'),
    weight: z
        .string()
        .regex(/^\d+(\.\d+)?$/, 'El peso debe ser un número')
        .transform(Number),
    size: z.string().min(1, 'El tamaño es requerido'),
    age: z.string().regex(/^\d+$/, 'La edad debe ser un número entero').transform(Number),
    personality: z.string().min(1, 'La personalidad y hábitos son requeridos'),
})

const formSchema = z.object({
    pets: z.array(petSchema).min(1, 'Añade al menos una mascota'),
    dates: z.object({
        from: z.date(),
        to: z.date(),
    }),
    services: z.record(z.any()),
    clientName: z.string().min(1, 'El nombre es requerido'),
    clientLastName: z.string().min(1, 'Los apellidos son requeridos'),
    clientEmail: z.string().email('Formato de email inválido'),
    clientPhone: z.string().regex(/^\+?[0-9]{9,}$/, 'El teléfono debe contener al menos 9 números'),
})

export default function BookingPage() {
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedDates, setSelectedDates] = useState<{ from: Date; to: Date } | null>(null)
    const [selectedServices, setSelectedServices] = useState({})
    const [totalPrice, setTotalPrice] = useState(0)
    const [dateError, setDateError] = useState('')
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [formError, setFormError] = useState('')
    const [groomingUnavailable, setGroomingUnavailable] = useState(false)
    const [pickupTime, setPickupTime] = useState('09:00')
    const [confirmedReservationId, setConfirmedReservationId] = useState('') // Added state for reservation ID

    const { addReservation } = useReservation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            pets: [{ name: '', breed: '', weight: '', size: '', age: '', personality: '' }],
            services: {},
        },
    })

    const pets = form.watch('pets')

    const calculateTotalPrice = useCallback((dates: { from: Date; to: Date } | null, pets: any[], services: any) => {
        if (!dates || !dates.from || !dates.to) return

        const nights = differenceInDays(dates.to, dates.from)
        let basePrice = 0

        // Calculate base price for each pet
        pets.forEach(pet => {
            let nightlyRate = 0
            switch (pet.size) {
                case 'pequeño':
                    nightlyRate = 32
                    break
                case 'mediano':
                    nightlyRate = 35
                    break
                case 'grande':
                    nightlyRate = 39
                    break
                case 'extra-grande':
                    nightlyRate = 45
                    break
            }

            // Apply 10% discount for all pets if there's more than one
            if (pets.length > 1) {
                nightlyRate = nightlyRate * 0.9
            }

            basePrice += nightlyRate * nights
        })

        // Calculate service costs
        let additionalCosts = 0
        pets.forEach((pet, index) => {
            if (services[`medication_${index}`]) {
                additionalCosts += services[`medication_frequency_${index}`] === 'once' ? 2.5 * nights : 3.5 * nights
            }
            if (services[`specialCare_${index}`]) additionalCosts += 3 * nights
            if (services[`customFood_${index}`]) additionalCosts += 2 * nights
            if (services[`grooming_${index}`]) {
                const groomingService = services[`groomingService_${index}`]
                switch (groomingService) {
                    case 'bano_especial':
                        additionalCosts += pet.size === 'pequeño' ? 25 : pet.size === 'mediano' ? 30 : 35
                        break
                    case 'corte':
                        additionalCosts += pet.size === 'pequeño' ? 35 : pet.size === 'mediano' ? 40 : 45
                        break
                    case 'deslanado':
                        additionalCosts += pet.size === 'pequeño' ? 50 : pet.size === 'mediano' ? 60 : 70
                        break
                }
            }
        })

        // Apply transport and out-of-hours pickup costs only once
        if (services.transport) additionalCosts += 20
        if (services.outOfHoursPickup) additionalCosts += 70

        // Apply 10% discount to additional costs if there's more than one pet
        if (pets.length > 1) {
            additionalCosts = additionalCosts * 0.9
        }

        setTotalPrice(basePrice + additionalCosts)
    }, [])

    const addPet = useCallback(() => {
        const currentPets = form.getValues('pets')
        if (currentPets.length < 2) {
            const newPets = [...currentPets, { name: '', breed: '', weight: '', size: '', age: '', personality: '' }]
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

    const calculateCapacity = useCallback((pets: any[]) => {
        return pets.reduce((total, pet) => {
            switch (pet.size) {
                case 'pequeño':
                    return total + 1
                case 'mediano':
                    return total + 1.5
                case 'grande':
                    return total + 2
                case 'extra-grande':
                    return total + 2.5
                default:
                    return total
            }
        }, 0)
    }, [])

    const handleDateSelect = useCallback(
        (dates: { from: Date; to: Date }, selectedPickupTime: string) => {
            setSelectedDates(dates)
            form.setValue('dates', dates)
            setDateError('')
            setPickupTime(selectedPickupTime)

            // Agregar automáticamente el servicio de recogida fuera de horario si es necesario
            const pickupHour = parseInt(selectedPickupTime.split(':')[0], 10)
            const isOutOfHours = pickupHour < 9 || pickupHour >= 18
            const updatedServices = { ...selectedServices, outOfHoursPickup: isOutOfHours }
            setSelectedServices(updatedServices)
            form.setValue('services', updatedServices)

            // Verificar si el último día de la reserva es el 8 de diciembre
            const lastDay = new Date(dates.to)
            lastDay.setHours(0, 0, 0, 0)
            const december8 = new Date(lastDay.getFullYear(), 11, 8) // 11 es diciembre (0-indexed)
            setGroomingUnavailable(isEqual(lastDay, december8))

            calculateTotalPrice(dates, form.getValues('pets'), updatedServices)
        },
        [form, selectedServices, calculateTotalPrice],
    )

    const handleServiceChange = useCallback(
        (services: any) => {
            const updatedServices = {
                ...services,
                outOfHoursPickup: services.outOfHoursPickup || selectedServices.outOfHoursPickup,
            }
            setSelectedServices(updatedServices)
            form.setValue('services', updatedServices)
            calculateTotalPrice(selectedDates, form.getValues('pets'), updatedServices)
        },
        [form, selectedDates, calculateTotalPrice, selectedServices.outOfHoursPickup],
    )

    useEffect(() => {
        const subscription = form.watch((_, { name }) => {
            if (name?.startsWith('pets') || name?.startsWith('services')) {
                calculateTotalPrice(selectedDates, form.getValues('pets'), form.getValues('services'))
            }
        })
        return () => subscription.unsubscribe()
    }, [form, selectedDates, calculateTotalPrice])

    const validateAllSteps = useCallback(async () => {
        const isValid = await form.trigger()

        if (!isValid) {
            const errors = form.formState.errors

            if (errors.pets) {
                setFormError('Por favor, revisa la información de las mascotas. Hay campos inválidos o incompletos.')
                return false
            }

            if (!selectedDates) {
                setFormError('Por favor, selecciona las fechas de entrada y salida.')
                return false
            }

            if (errors.clientName || errors.clientLastName || errors.clientEmail || errors.clientPhone) {
                setFormError('Por favor, revisa tus datos de contacto. Hay campos inválidos o incompletos.')
                return false
            }
        }

        setFormError('')
        return isValid
    }, [form, selectedDates])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        const isValid = await form.trigger()

        if (isValid) {
            const values = form.getValues()
            const newReservation = {
                id: Date.now().toString(),
                type: 'hotel',
                date: format(selectedDates!.from, 'yyyy-MM-dd'),
                checkOutDate: format(selectedDates!.to, 'yyyy-MM-dd'),
                time: pickupTime,
                client: {
                    name: `${values.clientName} ${values.clientLastName}`,
                    phone: values.clientPhone,
                    email: values.clientEmail,
                },
                pet: values.pets[0],
                pets: values.pets,
                services: selectedServices,
                additionalServices: Object.keys(selectedServices).filter(key => selectedServices[key]),
                roomNumber: '',
            }
            await addReservation(newReservation)
            setConfirmedReservationId(newReservation.id)
            setShowConfirmation(true)
        } else {
            setFormError('Por favor, revisa todos los campos. Hay información incompleta o inválida.')
        }
    }

    const nextStep = useCallback(async () => {
        let isValid = false

        setFormError('') // Clear the form error when attempting to move to next step

        switch (currentStep) {
            case 1:
                isValid = await form.trigger('pets', { shouldFocus: true })
                if (!isValid) {
                    setFormError('Por favor, completa todos los campos de las mascotas antes de continuar.')
                }
                break
            case 2:
                if (!selectedDates) {
                    setDateError('Por favor, selecciona tus fechas antes de continuar.')
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
            setCurrentStep(prev => Math.min(prev + 1, 4))
        }
    }, [form, currentStep, selectedDates])

    const prevStep = useCallback(() => {
        setFormError('') // Clear form error when going back
        setDateError('') // Clear date error when going back
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }, [])

    return (
        <div className='container mx-auto max-w-4xl py-8'>
            <h1 className='mb-8 text-center text-3xl font-bold'>Reserva tu estancia en Dondersteen</h1>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                <div className='lg:col-span-2'>
                    <Form {...form}>
                        <form onSubmit={onSubmit} className='space-y-8'>
                            {currentStep === 1 && (
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
                                                    onRemove={() => removePet(index)}
                                                />
                                            ))}
                                            {pets.length < 2 && (
                                                <div className='flex justify-start'>
                                                    <Button type='button' onClick={addPet} className='mt-4'>
                                                        Añadir otra mascota
                                                    </Button>
                                                </div>
                                            )}
                                            {pets.length === 2 && (
                                                <p className='mt-4 text-center text-sm text-muted-foreground'>
                                                    Para reservas de más de 2 mascotas, por favor contacte directamente
                                                    con nosotros.
                                                </p>
                                            )}
                                            {form.formState.errors.pets && (
                                                <Alert variant='destructive' className='mt-4'>
                                                    <AlertCircle className='h-4 w-4' />
                                                    <AlertTitle>Error</AlertTitle>
                                                    <AlertDescription>
                                                        {form.formState.errors.pets.message}
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {currentStep === 2 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Paso 2: Selecciona las fechas</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <AvailabilityCalendar
                                            onSelect={handleDateSelect}
                                            capacity={calculateCapacity(form.getValues('pets'))}
                                        />
                                        {dateError && (
                                            <Alert variant='destructive' className='mt-4'>
                                                <AlertCircle className='h-4 w-4' />
                                                <AlertTitle>Error</AlertTitle>
                                                <AlertDescription>{dateError}</AlertDescription>
                                            </Alert>
                                        )}
                                        <ImportantNotes />
                                    </CardContent>
                                </Card>
                            )}

                            {currentStep === 3 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Paso 3: Servicios adicionales</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {groomingUnavailable && (
                                            <Alert variant='warning' className='mb-4'>
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
                                            onServiceChange={handleServiceChange}
                                            petCount={form.getValues('pets').length}
                                            groomingUnavailable={groomingUnavailable}
                                            currentServices={selectedServices}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {currentStep === 4 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Paso 4: Confirmación</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='space-y-4'>
                                            <FormField
                                                control={form.control}
                                                name='clientName'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nombre</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder='Tu nombre'
                                                                {...field}
                                                                onChange={e => {
                                                                    field.onChange(e)
                                                                    form.trigger('clientName')
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='clientLastName'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Apellidos</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder='Tus apellidos'
                                                                {...field}
                                                                onChange={e => {
                                                                    field.onChange(e)
                                                                    form.trigger('clientLastName')
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='clientEmail'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type='email'
                                                                placeholder='tu@email.com'
                                                                {...field}
                                                                onChange={e => {
                                                                    field.onChange(e)
                                                                    form.trigger('clientEmail')
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name='clientPhone'
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Teléfono</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                type='tel'
                                                                placeholder='+34 '
                                                                {...field}
                                                                onChange={e => {
                                                                    field.onChange(e)
                                                                    form.trigger('clientPhone')
                                                                }}
                                                                pattern='[+0-9]*'
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className='mt-6 flex justify-between'>
                                {currentStep > 1 && (
                                    <Button type='button' onClick={prevStep}>
                                        Anterior
                                    </Button>
                                )}
                                {currentStep < 4 && (
                                    <Button type='button' onClick={nextStep}>
                                        Siguiente
                                    </Button>
                                )}
                                {currentStep === 4 && (
                                    <Button
                                        type='submit'
                                        onClick={e => {
                                            e.preventDefault()
                                            if (validateAllSteps()) {
                                                onSubmit(e)
                                            }
                                        }}
                                        disabled={Object.keys(form.formState.errors).length > 0}
                                    >
                                        Confirmar y Reservar
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </div>
                <div className='lg:col-span-1'>
                    <BookingSummary
                        dates={selectedDates}
                        pets={form.getValues('pets')}
                        services={form.getValues('services')}
                        totalPrice={totalPrice}
                        pickupTime={pickupTime}
                    />
                </div>
            </div>
            {formError && (
                <Alert variant='destructive' className='mt-4'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                </Alert>
            )}
            <div>
                {console.log('Confirmation Dialog State:', { showConfirmation, confirmedReservationId })}
                <ConfirmationDialog
                    open={showConfirmation}
                    onOpenChange={setShowConfirmation}
                    reservationId={confirmedReservationId || ''}
                />
            </div>
        </div>
    )
}
