import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, ChevronLeft, Clock, DollarSign, Home, Pencil } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

export default function ReservationDetailsPage() {
    const params = useParams()
    const navigate = useNavigate()
    const { reservations, updateReservation } = useReservation()
    const [reservation, setReservation] = useState<any>(null)

    useEffect(() => {
        const reservationId = params.id as string
        const foundReservation = reservations.find(r => r.id === reservationId)
        if (foundReservation) {
            setReservation(foundReservation)
        } else {
            navigate('/panel-interno')
        }
    }, [params.id, reservations, navigate])

    if (!reservation) {
        return <div>Cargando...</div>
    }

    const handleStatusChange = (newStatus: 'confirmed' | 'completed' | 'cancelled') => {
        updateReservation(reservation.id, { status: newStatus })
        setReservation({ ...reservation, status: newStatus })
    }

    const handlePaymentStatusChange = (newStatus: 'Pagado' | 'Pendiente') => {
        updateReservation(reservation.id, { paymentStatus: newStatus })
        setReservation({ ...reservation, paymentStatus: newStatus })
    }

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
                <ChevronLeft className='mr-2 h-4 w-4' /> Volver
            </Button>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between text-2xl font-bold'>
                        Detalles de la Reserva
                        <Badge
                            variant={
                                reservation.status === 'confirmed'
                                    ? 'default'
                                    : reservation.status === 'completed'
                                        ? 'success'
                                        : 'destructive'
                            }
                        >
                            {reservation.status === 'confirmed'
                                ? 'Confirmada'
                                : reservation.status === 'completed'
                                    ? 'Completada'
                                    : 'Cancelada'}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-6'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        <div>
                            <h3 className='mb-2 text-lg font-semibold'>Información del Cliente</h3>
                            <p>
                                <strong>Nombre:</strong> {reservation.client.name}
                            </p>
                            <p>
                                <strong>Teléfono:</strong> {reservation.client.phone}
                            </p>
                            <p>
                                <strong>Email:</strong> {reservation.client.email}
                            </p>
                        </div>
                        <div>
                            <h3 className='mb-2 text-lg font-semibold'>Detalles de la Estancia</h3>
                            <div className='mb-1 flex items-center'>
                                <Calendar className='mr-2 h-4 w-4' />
                                <p>
                                    <strong>Check-in:</strong>{' '}
                                    {format(new Date(reservation.date), 'dd MMMM yyyy', { locale: es })}
                                </p>
                            </div>
                            <div className='mb-1 flex items-center'>
                                <Calendar className='mr-2 h-4 w-4' />
                                <p>
                                    <strong>Check-out:</strong>{' '}
                                    {format(new Date(reservation.checkOutDate), 'dd MMMM yyyy', { locale: es })}
                                </p>
                            </div>
                            <div className='mb-1 flex items-center'>
                                <Clock className='mr-2 h-4 w-4' />
                                <p>
                                    <strong>Hora de llegada:</strong> {reservation.time}
                                </p>
                            </div>
                            <div className='flex items-center'>
                                <Home className='mr-2 h-4 w-4' />
                                <p>
                                    <strong>Habitación:</strong> {reservation.roomNumber || 'No asignada'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className='mb-2 text-lg font-semibold'>Mascotas</h3>
                        {reservation.pets.map((pet: any, index: number) => (
                            <div key={index} className='mb-4 rounded-lg bg-gray-50 p-4'>
                                <p>
                                    <strong>Nombre:</strong> {pet.name}
                                </p>
                                <p>
                                    <strong>Raza:</strong> {pet.breed}
                                </p>
                                <p>
                                    <strong>Tamaño:</strong> {pet.size}
                                </p>
                                <p>
                                    <strong>Peso:</strong> {pet.weight} kg
                                </p>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    <div>
                        <h3 className='mb-2 text-lg font-semibold'>Servicios Adicionales</h3>
                        <ul className='list-inside list-disc'>
                            {reservation.additionalServices.map((service: string, index: number) => (
                                <li key={index}>{service}</li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    <div className='flex items-center justify-between'>
                        <div>
                            <h3 className='mb-2 text-lg font-semibold'>Información de Pago</h3>
                            <div className='flex items-center'>
                                <DollarSign className='mr-2 h-4 w-4' />
                                <p>
                                    <strong>Total:</strong> €{reservation.totalPrice?.toFixed(2) || '0.00'}
                                </p>
                            </div>
                            <Badge
                                variant={reservation.paymentStatus === 'Pagado' ? 'success' : 'destructive'}
                                className='mt-2'
                            >
                                {reservation.paymentStatus || 'Pendiente'}
                            </Badge>
                        </div>
                        <Button
                            variant='outline'
                            onClick={() => navigate(`/panel-interno/reservas/${reservation.id}/edit`)}
                        >
                            <Pencil className='mr-2 h-4 w-4' /> Editar Reserva
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className='flex justify-between'>
                    <div>
                        <Button
                            variant='outline'
                            onClick={() => handleStatusChange('confirmed')}
                            disabled={reservation.status === 'confirmed'}
                            className='mr-2'
                        >
                            Confirmar
                        </Button>
                        <Button
                            variant='outline'
                            onClick={() => handleStatusChange('completed')}
                            disabled={reservation.status === 'completed'}
                            className='mr-2'
                        >
                            Completar
                        </Button>
                        <Button
                            variant='destructive'
                            onClick={() => handleStatusChange('cancelled')}
                            disabled={reservation.status === 'cancelled'}
                        >
                            Cancelar
                        </Button>
                    </div>
                    <div>
                        <Button
                            variant={reservation.paymentStatus === 'Pagado' ? 'outline' : 'default'}
                            onClick={() =>
                                handlePaymentStatusChange(
                                    reservation.paymentStatus === 'Pagado' ? 'Pendiente' : 'Pagado',
                                )
                            }
                        >
                            {reservation.paymentStatus === 'Pagado' ? 'Marcar como Pendiente' : 'Marcar como Pagado'}
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
