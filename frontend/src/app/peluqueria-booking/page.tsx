import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { format, parse } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import * as z from 'zod'

import { useReservation } from '@/components/ReservationContext'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { PeluqueriaAvailabilityCalendar } from '@/components/peluqueria-availability-calendar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
    date: z.date({
        required_error: 'La fecha del servicio es requerida.',
    }),
    time: z.string().min(1, 'La hora del servicio es requerida.'),
    serviceType: z.string().min(1, 'El tipo de servicio es requerido.'),
    clientName: z.string().min(1, 'El nombre del cliente es requerido.'),
    clientPhone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos.'),
    clientEmail: z.string().email('Correo electrónico inválido.'),
    petName: z.string().min(1, 'El nombre de la mascota es requerido.'),
    petBreed: z.string().min(1, 'La raza de la mascota es requerida.'),
    petWeight: z.number().min(0.1, 'El peso debe ser mayor que 0.'),
})

export default function PeluqueriaBookingPage() {
    const [showConfirmation, setShowConfirmation] = useState(false)
    const [dateTimeError, setDateTimeError] = useState('')
    const [confirmedReservationId, setConfirmedReservationId] = useState('')
    const { addReservation } = useReservation()

    // Wrap useSearchParams in Suspense
    const searchParams = useSearchParams()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            serviceType: '',
            clientName: '',
            clientPhone: '',
            clientEmail: '',
            petName: '',
            petBreed: '',
            petWeight: 0,
            date: searchParams?.get('date') ? parse(searchParams.get('date')!, 'yyyy-MM-dd', new Date()) : undefined,
            time: searchParams?.get('time') || '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.date || !values.time) {
            setDateTimeError('Por favor, selecciona una fecha y hora para el servicio.')
            return
        }
        setDateTimeError('')

        const newReservation = {
            id: Date.now().toString(),
            type: 'peluqueria',
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
            },
            additionalServices: [values.serviceType],
        }
        await addReservation(newReservation)
        setConfirmedReservationId(newReservation.id)
        setShowConfirmation(true)
    }

    const handleDateTimeSelect = (date: Date, time: string) => {
        form.setValue('date', date)
        form.setValue('time', time)
        setDateTimeError('')
    }

    return (
        <div className='container py-8'>
            <Card className='mx-auto max-w-2xl'>
                <CardHeader>
                    <CardTitle>Reserva de Peluquería</CardTitle>
                    <CardDescription>
                        {searchParams.get('date') && searchParams.get('time')
                            ? `Reserva para el ${format(parse(searchParams.get('date')!, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')} a las ${searchParams.get('time')}`
                            : 'Completa el formulario para reservar un servicio de peluquería para tu mascota.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            <FormField
                                control={form.control}
                                name='serviceType'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de servicio</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Selecciona un servicio' />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value='bano_especial'>Baño especial</SelectItem>
                                                <SelectItem value='corte'>Corte</SelectItem>
                                                <SelectItem value='deslanado'>Deslanado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='date'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha y hora del servicio</FormLabel>
                                        <FormControl>
                                            <PeluqueriaAvailabilityCalendar
                                                onSelect={handleDateTimeSelect}
                                                selectedDate={field.value}
                                                selectedTime={form.watch('time')}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {dateTimeError && (
                                <Alert variant='destructive'>
                                    <AlertCircle className='h-4 w-4' />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{dateTimeError}</AlertDescription>
                                </Alert>
                            )}
                            <FormField
                                control={form.control}
                                name='clientName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del cliente</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Nombre completo' {...field} />
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
                                            <Input type='tel' placeholder='+34 ' {...field} />
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
                                            <Input type='email' placeholder='tu@email.com' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='petName'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la mascota</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Nombre de la mascota' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='petBreed'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Raza de la mascota</FormLabel>
                                        <FormControl>
                                            <Input placeholder='Raza' {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name='petWeight'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Peso de la mascota (kg)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type='number'
                                                step='0.1'
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className='flex justify-between'>
                                <Link href='/'>
                                    <Button type='button' variant='outline'>
                                        Volver a Inicio
                                    </Button>
                                </Link>
                                <Button type='submit'>Reservar</Button>
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
    )
}
