'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'

import { ChevronLeft, Save } from 'lucide-react'
import * as z from 'zod'

import { useReservation } from '@/components/ReservationContext.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form.tsx'
import { Input } from '@/shared/ui/input.tsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select.tsx'
import { Textarea } from '@/shared/ui/textarea.tsx'
import { zodResolver } from '@hookform/resolvers/zod'
import { AdditionalService } from '@/shared/types/additional-services'

const reservationSchema = z.object({
    clientName: z.string().min(1, 'El nombre del cliente es requerido'),
    clientPhone: z.string().min(1, 'El teléfono del cliente es requerido'),
    clientEmail: z.string().email('Email inválido'),
    checkInDate: z.string(),
    checkOutDate: z.string(),
    checkInTime: z.string(),
    roomNumber: z.string(),
    totalPrice: z.number().min(0, 'El precio no puede ser negativo'),
    paymentStatus: z.enum(['Pagado', 'Pendiente']),
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
    additionalServices: z.array(z.custom<AdditionalService>()),
    specialNeeds: z.string().optional(),
})

export default function EditReservationPage() {
    const params = useParams()
    const navigate = useNavigate()
    const { reservations, updateReservation } = useReservation()
    const [reservation, setReservation] = useState<any>(null)

    const form = useForm<z.infer<typeof reservationSchema>>({
        resolver: zodResolver(reservationSchema),
        defaultValues: {
            clientName: '',
            clientPhone: '',
            clientEmail: '',
            checkInDate: '',
            checkOutDate: '',
            checkInTime: '',
            roomNumber: '',
            totalPrice: 0,
            paymentStatus: 'Pendiente',
            status: 'pending',
            additionalServices: [],
            specialNeeds: '',
        },
    })

    useEffect(() => {
        const reservationId = params.id as string
        const foundReservation = reservations.find(r => r.id === reservationId)
        if (foundReservation) {
            setReservation(foundReservation)
            form.reset({
                clientName: foundReservation.client.name,
                clientPhone: foundReservation.client.phone,
                clientEmail: foundReservation.client.email,
                checkInDate: foundReservation.checkInDate,
                checkOutDate: foundReservation.checkOutDate,
                checkInTime: foundReservation.checkInTime,
                roomNumber: foundReservation.roomNumber,
                totalPrice: foundReservation.totalPrice,
                paymentStatus: foundReservation.paymentStatus,
                status: foundReservation.status,
                additionalServices: foundReservation.additionalServices,
                specialNeeds: foundReservation.specialNeeds || '',
            })
        } else {
            navigate('/panel-interno')
        }
    }, [params.id, reservations, navigate, form])

    const onSubmit = async (data: z.infer<typeof reservationSchema>) => {
        if (reservation) {
            const updatedReservation = {
                ...reservation,
                client: {
                    name: data.clientName,
                    phone: data.clientPhone,
                    email: data.clientEmail,
                },
                date: data.checkInDate,
                checkOutDate: data.checkOutDate,
                time: data.checkInTime,
                roomNumber: data.roomNumber,
                totalPrice: data.totalPrice,
                paymentStatus: data.paymentStatus,
                status: data.status,
                additionalServices: data.additionalServices,
                specialNeeds: data.specialNeeds,
            }
            await updateReservation(reservation.id, updatedReservation)
            navigate(`/panel-interno/reservas/${reservation.id}`)
        }
    }

    if (!reservation) {
        return <div>Cargando...</div>
    }

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
                <ChevronLeft className='mr-2 h-4 w-4' /> Volver
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className='text-2xl font-bold'>Editar Reserva</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                                <FormField
                                    control={form.control}
                                    name='clientName'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Cliente</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Teléfono del Cliente</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Email del Cliente</FormLabel>
                                            <FormControl>
                                                <Input {...field} type='email' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='checkInDate'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Check-in</FormLabel>
                                            <FormControl>
                                                <Input {...field} type='date' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='checkOutDate'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha de Check-out</FormLabel>
                                            <FormControl>
                                                <Input {...field} type='date' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='checkInTime'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hora de Check-in</FormLabel>
                                            <FormControl>
                                                <Input {...field} type='time' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='roomNumber'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Número de Habitación</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='totalPrice'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Precio Total</FormLabel>
                                            <FormControl>
                                                <Input {...field} type='number' step='0.01' />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='paymentStatus'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado de Pago</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Seleccionar estado de pago' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='Pagado'>Pagado</SelectItem>
                                                    <SelectItem value='Pendiente'>Pendiente</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name='status'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Estado de la Reserva</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Seleccionar estado de la reserva' />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value='pending'>Pendiente</SelectItem>
                                                    <SelectItem value='confirmed'>Confirmada</SelectItem>
                                                    <SelectItem value='completed'>Completada</SelectItem>
                                                    <SelectItem value='cancelled'>Cancelada</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name='specialNeeds'
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Necesidades Especiales</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type='submit' className='w-full'>
                                <Save className='mr-2 h-4 w-4' /> Guardar Cambios
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
