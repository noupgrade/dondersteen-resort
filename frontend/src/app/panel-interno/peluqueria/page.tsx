import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Check, Clock, Info, X } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { AvailabilityCalendarView } from '@/components/availability-calendar-view'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'

type Reservation = {
    id: string
    type: 'peluqueria'
    date: string
    time: string
    client: {
        name: string
        phone: string
    }
    pet: {
        name: string
        breed: string
    }
    additionalServices: string[]
    observations?: string
    status: 'pending' | 'confirmed' | 'completed'
    beforePhoto?: string
    afterPhoto?: string
    finalPrice?: number
    priceNote?: string
}

export default function PeluqueriaPage() {
    const { reservations } = useReservation()
    const navigate = useNavigate()
    const [pendingReservations, setPendingReservations] = useState<Reservation[]>([])
    const [confirmedReservations, setConfirmedReservations] = useState<Reservation[]>([])
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [photos, setPhotos] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const peluqueriaReservations = reservations.filter(r => r.type === 'peluqueria' && r.date === today)
        setPendingReservations(peluqueriaReservations.filter(r => r.status === 'pending'))
        setConfirmedReservations(
            peluqueriaReservations.filter(r => r.status === 'confirmed' || r.status === 'completed'),
        )
    }, [reservations])

    const handleAccept = async (reservation: Reservation) => {
        const existingReservation = confirmedReservations.find(
            r => r.date === reservation.date && r.time === reservation.time,
        )

        if (existingReservation) {
            // Mostrar un error
            alert('Ya existe una cita confirmada para esta fecha y hora. Por favor, elija otro horario.')
            return
        }

        const updatedReservation = { ...reservation, status: 'confirmed' }
        // Actualizar el estado local
        setConfirmedReservations(prev => [...prev, updatedReservation])
        setPendingReservations(prev => prev.filter(r => r.id !== reservation.id))
    }

    const handleReject = async () => {
        // Implementation
    }

    const handleSaveDetails = async () => {
        // Implementation
    }

    const timeSlots = Array.from({ length: 9 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`)

    return (
        <div className='container mx-auto p-6'>
            <h1 className='mb-6 text-3xl font-bold'>Gestión de Peluquería</h1>

            <Card className='mb-6'>
                <CardContent className='flex items-center justify-between p-4'>
                    <div className='flex space-x-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Reservas pendientes</p>
                            <p className='text-2xl font-bold'>{pendingReservations.length}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Citas confirmadas</p>
                            <p className='text-2xl font-bold'>{confirmedReservations.length}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Huecos libres</p>
                            <p className='text-2xl font-bold'>{timeSlots.length - confirmedReservations.length}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue='pending' className='space-y-4'>
                <TabsList>
                    <TabsTrigger value='pending'>Reservas pendientes</TabsTrigger>
                    <TabsTrigger value='confirmed'>Citas del día</TabsTrigger>
                    <TabsTrigger value='availability'>Disponibilidad</TabsTrigger>
                </TabsList>

                <TabsContent value='pending'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Reservas pendientes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className='h-[600px] pr-4'>
                                {pendingReservations.map(reservation => (
                                    <div
                                        key={reservation.id}
                                        className='mb-4 rounded-lg border p-6 pb-4 transition-all hover:shadow-md'
                                    >
                                        <div className='flex items-start justify-between gap-4'>
                                            <div className='flex-1 space-y-4'>
                                                <div>
                                                    <h3 className='text-xl font-semibold tracking-tight'>
                                                        {reservation.pet.name}
                                                    </h3>
                                                    <p className='text-base text-muted-foreground'>
                                                        Cliente: {reservation.client.name}
                                                    </p>
                                                </div>

                                                <div className='grid grid-cols-2 gap-4'>
                                                    <div>
                                                        <p className='text-sm font-medium text-gray-500'>Raza</p>
                                                        <p className='text-base'>{reservation.pet.breed}</p>
                                                    </div>
                                                    <div>
                                                        <p className='text-sm font-medium text-gray-500'>Teléfono</p>
                                                        <p className='text-base'>{reservation.client.phone}</p>
                                                    </div>
                                                </div>

                                                <div className='flex items-center gap-6'>
                                                    <div className='flex items-center gap-2'>
                                                        <Calendar className='h-4 w-4 text-gray-500' />
                                                        <span className='text-sm'>
                                                            {format(new Date(reservation.date), 'dd MMMM yyyy', {
                                                                locale: es,
                                                            })}
                                                        </span>
                                                    </div>
                                                    <div className='flex items-center gap-2'>
                                                        <Clock className='h-4 w-4 text-gray-500' />
                                                        <span className='text-sm'>{reservation.time}</span>
                                                    </div>
                                                </div>

                                                {reservation.observations && (
                                                    <div className='rounded-md bg-gray-50 p-3'>
                                                        <p className='text-sm text-gray-600'>
                                                            {reservation.observations}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className='flex h-full flex-col items-end justify-between'>
                                                <Badge
                                                    className={`px-3 py-1 text-base font-semibold ${
                                                        reservation.additionalServices[0] === 'corte'
                                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                            : reservation.additionalServices[0] === 'bano_especial'
                                                              ? 'bg-green-500 text-white hover:bg-green-600'
                                                              : 'bg-purple-500 text-white hover:bg-purple-600'
                                                    }`}
                                                >
                                                    {reservation.additionalServices[0] === 'corte'
                                                        ? 'Corte'
                                                        : reservation.additionalServices[0] === 'bano_especial'
                                                          ? 'Baño especial'
                                                          : 'Deslanado'}
                                                </Badge>

                                                <div className='mt-4 flex gap-2'>
                                                    <Button
                                                        onClick={() => handleReject(reservation)}
                                                        variant='destructive'
                                                        size='sm'
                                                    >
                                                        <X className='mr-2 h-4 w-4' /> Rechazar
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleAccept(reservation)}
                                                        variant='default'
                                                        size='sm'
                                                    >
                                                        <Check className='mr-2 h-4 w-4' /> Aceptar
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='confirmed'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Citas del día</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid grid-cols-1 gap-4'>
                                {timeSlots.map(slot => {
                                    const reservation = confirmedReservations.find(r => r.time === slot)
                                    return (
                                        <div key={slot} className='flex items-center border-b py-2'>
                                            <span className='w-20 font-semibold'>{slot}</span>
                                            {reservation ? (
                                                <div className='ml-4 flex-1'>
                                                    <div className='flex items-start justify-between'>
                                                        <div>
                                                            <h4 className='font-semibold'>
                                                                {reservation.pet.name} ({reservation.client.name})
                                                            </h4>
                                                            <p className='text-sm text-muted-foreground'>
                                                                {reservation.pet.breed}
                                                            </p>
                                                            <p className='text-xs text-muted-foreground'>
                                                                {reservation.additionalServices[0] === 'corte'
                                                                    ? 'Corte'
                                                                    : reservation.additionalServices[0] ===
                                                                        'bano_especial'
                                                                      ? 'Baño especial'
                                                                      : 'Deslanado'}
                                                            </p>
                                                            {reservation.observations && (
                                                                <div className='mt-1 flex items-center text-xs text-muted-foreground'>
                                                                    <Info className='mr-1 h-3 w-3' />
                                                                    <span className='max-w-[200px] truncate'>
                                                                        {reservation.observations}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Button
                                                                onClick={() => {
                                                                    setSelectedReservation(reservation)
                                                                    setIsDetailsOpen(true)
                                                                }}
                                                                variant='outline'
                                                                size='sm'
                                                                className='mr-2'
                                                            >
                                                                Detalles
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className='ml-4 flex flex-1 items-center justify-between'>
                                                    <span className='text-muted-foreground'>Sin cita</span>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        onClick={() => {
                                                            const dateString = format(new Date(), 'yyyy-MM-dd')
                                                            navigate(
                                                                `/peluqueria-booking?date=${dateString}&time=${slot}`,
                                                            )
                                                        }}
                                                    >
                                                        Añadir cita
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value='availability'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Calendario de Disponibilidad</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AvailabilityCalendarView />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>Detalles de la cita</DialogTitle>
                        <DialogDescription>Gestiona los detalles de la cita de peluquería.</DialogDescription>
                    </DialogHeader>
                    {selectedReservation && (
                        <div className='grid gap-4 py-4'>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right'>Cliente</Label>
                                <Input value={selectedReservation.client.name} readOnly />
                            </div>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right'>Teléfono</Label>
                                <Input value={selectedReservation.client.phone} readOnly />
                            </div>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right'>Servicio</Label>
                                <Input
                                    value={selectedReservation.additionalServices
                                        .map(service =>
                                            service === 'corte'
                                                ? 'Corte'
                                                : service === 'bano_especial'
                                                  ? 'Baño especial'
                                                  : 'Deslanado',
                                        )
                                        .join(', ')}
                                    readOnly
                                />
                            </div>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right'>Hora</Label>
                                <Input value={selectedReservation.time} readOnly />
                            </div>
                            {selectedReservation.observations && (
                                <div className='grid grid-cols-[120px_1fr] items-start gap-4'>
                                    <Label className='pt-2 text-right'>Observaciones</Label>
                                    <Textarea value={selectedReservation.observations} readOnly />
                                </div>
                            )}
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right'>Foto antes</Label>
                                <div>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        className='hidden'
                                        id='before-photo'
                                        onChange={e => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    setPhotos(prev => ({
                                                        ...prev,
                                                        [`${selectedReservation.id}_before`]: reader.result as string,
                                                    }))
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                    <label htmlFor='before-photo'>
                                        <Button variant='outline' className='cursor-pointer' asChild>
                                            <div>
                                                <Upload className='mr-2 h-4 w-4' />
                                                Subir foto
                                            </div>
                                        </Button>
                                    </label>
                                    {photos[`${selectedReservation.id}_before`] && (
                                        <img
                                            src={photos[`${selectedReservation.id}_before`]}
                                            alt='Antes'
                                            className='mt-2 max-h-32 rounded-md'
                                        />
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right'>Foto después</Label>
                                <div>
                                    <input
                                        type='file'
                                        accept='image/*'
                                        className='hidden'
                                        id='after-photo'
                                        onChange={e => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () => {
                                                    setPhotos(prev => ({
                                                        ...prev,
                                                        [`${selectedReservation.id}_after`]: reader.result as string,
                                                    }))
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                    <label htmlFor='after-photo'>
                                        <Button variant='outline' className='cursor-pointer' asChild>
                                            <div>
                                                <Upload className='mr-2 h-4 w-4' />
                                                Subir foto
                                            </div>
                                        </Button>
                                    </label>
                                    {photos[`${selectedReservation.id}_after`] && (
                                        <img
                                            src={photos[`${selectedReservation.id}_after`]}
                                            alt='Después'
                                            className='mt-2 max-h-32 rounded-md'
                                        />
                                    )}
                                </div>
                            </div>
                            <div className='grid grid-cols-[120px_1fr] items-center gap-4'>
                                <Label className='text-right'>Precio final</Label>
                                <Input
                                    type='number'
                                    value={selectedReservation.finalPrice || ''}
                                    onChange={e =>
                                        setSelectedReservation({
                                            ...selectedReservation,
                                            finalPrice: parseFloat(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className='grid grid-cols-[120px_1fr] items-start gap-4'>
                                <Label className='pt-2 text-right'>Nota de precio</Label>
                                <Textarea
                                    value={selectedReservation.priceNote || ''}
                                    onChange={e =>
                                        setSelectedReservation({
                                            ...selectedReservation,
                                            priceNote: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleSaveDetails}>Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
