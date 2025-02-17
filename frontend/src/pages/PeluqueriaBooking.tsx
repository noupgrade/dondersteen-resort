import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useSearchParams } from 'react-router-dom'

import { format, parse } from 'date-fns'
import { AlertCircle, ArrowRight, Clock } from 'lucide-react'
import * as z from 'zod'

import { useReservation } from '@/components/ReservationContext.tsx'
import { ConfirmationDialog } from '@/components/confirmation-dialog.tsx'
import { PeluqueriaAvailabilityCalendar } from '@/components/peluqueria-availability-calendar.tsx'
import { useClientProfile } from '@/hooks/use-client-profile'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Checkbox } from '@/shared/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form.tsx'
import { Input } from '@/shared/ui/input.tsx'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import type { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { type HairdressingServiceType } from '@monorepo/functions/src/types/services'

const formSchema = z.object({
    date: z.date({
        required_error: 'La fecha del servicio es requerida.',
    }),
    time: z.string().min(1, 'La hora del servicio es requerida.'),
    services: z.array(z.string()).min(1, 'El tipo de servicio es requerido.'),
    clientName: z.string().min(1, 'El nombre del cliente es requerido.'),
    clientPhone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos.'),
    clientEmail: z.string().email('Correo electrónico inválido.'),
    petName: z.string().min(1, 'El nombre de la mascota es requerido.'),
    petBreed: z.string().min(1, 'La raza de la mascota es requerida.'),
    petWeight: z.number().min(0.1, 'El peso debe ser mayor que 0.'),
})

const HAIRDRESSING_SERVICES = [
    { value: 'bath_and_brush', label: 'Baño y cepillado' },
    { value: 'bath_and_trim', label: 'Baño y arreglo (corte)' },
    { value: 'stripping', label: 'Stripping' },
    { value: 'deshedding', label: 'Desalanado (extraccion muda)' },
    { value: 'brushing', label: 'Cepillado' },
    { value: 'spa', label: 'Spa' },
    { value: 'spa_ozone', label: 'Spa+ozono' },
    { value: 'knots', label: 'Nudos' },
    { value: 'extremely_dirty', label: 'Extremadamente sucio' },
] as const

function DaycareBanner() {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const navigate = useNavigate()

    return (
        <>
            <Alert
                className='group mt-2 cursor-pointer bg-yellow-50 px-3 transition-colors hover:bg-yellow-100/80 sm:px-4'
                onClick={() => setIsDialogOpen(true)}
            >
                <div className='flex items-start justify-between'>
                    <div className='flex flex-col'>
                        <div className='flex items-center gap-2'>
                            <Clock className='h-4 w-4 shrink-0 text-yellow-800' />
                            <AlertDescription className='text-sm font-medium text-yellow-800 sm:text-base'>
                                Servicio de guardería:
                            </AlertDescription>
                        </div>
                        <AlertDescription className='ml-6 text-sm font-medium text-yellow-800 sm:text-base'>
                            Recogida hasta las 18:00
                        </AlertDescription>
                    </div>
                    <div className='flex items-center gap-1 text-yellow-800'>
                        <span className='text-sm'>Reservar</span>
                        <ArrowRight className='h-4 w-4 transform transition-transform group-hover:translate-x-1' />
                    </div>
                </div>
            </Alert>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className='w-[95vw] sm:w-full sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle className='text-lg sm:text-xl'>Servicio de Guardería</DialogTitle>
                        <DialogDescription className='space-y-2 pt-2'>
                            <p>
                                Las reservas para el servicio de guardería se realizan desde el motor de reservas de
                                hotel.
                            </p>
                            <p>
                                Durante el proceso de reserva podrás agregar sin problema los servicios de peluquería
                                que necesites a través de los servicios adicionales.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className='sm:justify-end'>
                        <Button onClick={() => navigate('/booking')} className='w-full gap-2 sm:w-auto'>
                            Ir al motor de reservas de hotel
                            <ArrowRight className='h-4 w-4' />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

function FormSubtitle({ children }: { children: React.ReactNode }) {
    return <h3 className='mb-2 text-lg font-semibold text-gray-900 sm:text-xl'>{children}</h3>
}

export default function PeluqueriaBookingPage() {
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [dateTimeError, setDateTimeError] = useState('')
    const [confirmedReservationId, setConfirmedReservationId] = useState('')
    const { addReservation } = useReservation()

    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const userId = searchParams.get('userId')
    const petId = searchParams.get('petId')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const { data: clientProfile } = useClientProfile(userId || '')

    useEffect(() => {
        if (!userId) {
            navigate('/panel-interno')
        }
    }, [userId, navigate])

    console.log('URL Params:', { userId, petId })
    console.log('Client Profile:', clientProfile)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            services: [],
            clientName: clientProfile?.client.name || '',
            clientPhone: clientProfile?.client.phone || '',
            clientEmail: clientProfile?.client.email || '',
            petName: '',
            petBreed: '',
            petWeight: 0,
            date: searchParams?.get('date') ? parse(searchParams.get('date')!, 'yyyy-MM-dd', new Date()) : undefined,
            time: searchParams?.get('time') || '',
        },
    })

    // Update form values when clientProfile changes
    useEffect(() => {
        if (clientProfile) {
            console.log('Setting form values with client profile:', clientProfile)
            form.setValue('clientName', clientProfile.client.name)
            form.setValue('clientPhone', clientProfile.client.phone)
            form.setValue('clientEmail', clientProfile.client.email)

            // Find the selected pet by ID if petId is provided
            const selectedPet = petId ? clientProfile.pets.find(pet => pet.id === petId) : clientProfile.pets[0]

            console.log('Selected Pet:', selectedPet)

            if (selectedPet) {
                console.log('Setting pet values:', {
                    name: selectedPet.name,
                    breed: selectedPet.breed,
                    weight: selectedPet.weight,
                })
                form.setValue('petName', selectedPet.name)
                form.setValue('petBreed', selectedPet.breed)
                form.setValue('petWeight', selectedPet.weight)
            }
        }
    }, [clientProfile, form, petId])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.date || !values.time) {
            setDateTimeError('Por favor, selecciona una fecha y hora para el servicio.')
            return
        }
        setDateTimeError('')

        const newReservation: Omit<HairSalonReservation, 'id'> = {
            type: 'peluqueria',
            source: 'external',
            date: format(values.date, 'yyyy-MM-dd'),
            time: values.time,
            client: {
                name: values.clientName,
                phone: values.clientPhone,
                email: values.clientEmail,
            },
            pet: {
                name: values.petName,
                breed: values.petBreed,
                weight: values.petWeight,
                size: clientProfile?.pets[0]?.size || 'pequeño',
                sex: clientProfile?.pets[0]?.sex || 'M',
            },
            additionalServices: [
                {
                    type: 'hairdressing',
                    petIndex: 0,
                    services: values.services as HairdressingServiceType[],
                },
            ],
            status: 'pending',
            paymentStatus: 'Pendiente',
            totalPrice: 0, // This will be calculated by the backend
        }

        try {
            const savedReservation = await addReservation(newReservation)
            setConfirmedReservationId(savedReservation.id)
            setShowConfirmation(true)
        } catch (error) {
            console.error('Error saving reservation:', error)
        }
    }

    const handleDateTimeSelect = (date: Date, time: string) => {
        form.setValue('date', date)
        form.setValue('time', time)
        setDateTimeError('')
    }

    return (
        <>
            <div className='container px-4 py-4 sm:px-6 sm:py-8'>
                <Card className='mx-auto max-w-2xl'>
                    <CardHeader className='px-4 sm:px-6'>
                        <CardTitle className='text-2xl sm:text-3xl'>Reserva de Peluquería</CardTitle>
                        <CardDescription className='text-sm sm:text-base'>
                            {searchParams.get('date') && searchParams.get('time')
                                ? `Reserva para el ${format(parse(searchParams.get('date')!, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')} a las ${searchParams.get('time')}`
                                : 'Completa el formulario para reservar un servicio de peluquería para tu mascota.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='px-4 sm:px-6'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 sm:space-y-8'>
                                <FormField
                                    control={form.control}
                                    name='services'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Servicios</FormSubtitle>
                                            <div className='ml-1 space-y-2'>
                                                {HAIRDRESSING_SERVICES.map(service => (
                                                    <div key={service.value} className='flex items-center space-x-2'>
                                                        <FormControl>
                                                            <Checkbox
                                                                id={`service-${service.value}`}
                                                                checked={field.value.includes(service.value)}
                                                                onCheckedChange={checked => {
                                                                    if (checked) {
                                                                        field.onChange([...field.value, service.value])
                                                                    } else {
                                                                        field.onChange(
                                                                            field.value.filter(
                                                                                value => value !== service.value,
                                                                            ),
                                                                        )
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <Label
                                                            htmlFor={`service-${service.value}`}
                                                            className='text-sm sm:text-base'
                                                        >
                                                            {service.label}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='date'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Fecha y hora del servicio</FormSubtitle>
                                            <FormControl>
                                                <PeluqueriaAvailabilityCalendar
                                                    onSelect={handleDateTimeSelect}
                                                    selectedDate={field.value}
                                                    selectedTime={form.watch('time')}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <DaycareBanner />
                                {dateTimeError && (
                                    <Alert variant='destructive'>
                                        <AlertCircle className='h-4 w-4' />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription className='text-sm'>{dateTimeError}</AlertDescription>
                                    </Alert>
                                )}
                                <FormField
                                    control={form.control}
                                    name='clientName'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Nombre del cliente</FormSubtitle>
                                            <FormControl>
                                                <Input
                                                    placeholder='Nombre completo'
                                                    className='text-sm sm:text-base'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='clientPhone'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Teléfono</FormSubtitle>
                                            <FormControl>
                                                <Input
                                                    type='tel'
                                                    placeholder='+34 '
                                                    className='text-sm sm:text-base'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='clientEmail'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Email</FormSubtitle>
                                            <FormControl>
                                                <Input
                                                    type='email'
                                                    placeholder='tu@email.com'
                                                    className='text-sm sm:text-base'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='petName'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Nombre de la mascota</FormSubtitle>
                                            <FormControl>
                                                <Input
                                                    placeholder='Nombre de la mascota'
                                                    className='text-sm sm:text-base'
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='petBreed'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Raza de la mascota</FormSubtitle>
                                            <FormControl>
                                                <Input placeholder='Raza' className='text-sm sm:text-base' {...field} />
                                            </FormControl>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='petWeight'
                                    render={({ field }) => (
                                        <FormItem className='space-y-4'>
                                            <FormSubtitle>Peso de la mascota (kg)</FormSubtitle>
                                            <FormControl>
                                                <Input
                                                    type='number'
                                                    step='0.1'
                                                    className='text-sm sm:text-base'
                                                    {...field}
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                />
                                            </FormControl>
                                            <FormMessage className='text-sm' />
                                        </FormItem>
                                    )}
                                />
                                <div className='flex justify-end pt-4'>
                                    <Button type='submit' className='w-full sm:w-auto'>
                                        Reservar
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
                <ConfirmationDialog
                    open={showConfirmation}
                    onOpenChange={setShowConfirmation}
                    reservationId={confirmedReservationId}
                />
            </div>
        </>
    )
}
