import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
    Calendar, 
    Check, 
    Clock, 
    Info, 
    X, 
    Hotel, 
    Users, 
    Scissors, 
    DollarSign, 
    Upload as UploadIcon,
    Split,
    Plus,
    Trash2
} from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { AvailabilityCalendarView } from '@/components/availability-calendar-view'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'
import { Checkbox } from '@/shared/ui/checkbox'
import { useToast } from '@/shared/ui/use-toast'
import { Upload } from '@/shared/ui/upload'
import { BaseReservation, ExtendedReservation, ReservationStatus } from '@/types/reservation'

interface SubCita {
    fecha: string
    hora: string
    descripcion: string
}

interface ExtendedReservationWithSubcitas extends ExtendedReservation {
    subcitas?: SubCita[]
    precioEstimado?: number
    horaDefinitiva?: string
}

const mockPendingReservations: ExtendedReservationWithSubcitas[] = [
    {
        id: '1',
        type: 'peluqueria',
        source: 'hotel',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00',
        client: {
            name: 'Juan Pérez',
            phone: '666555444'
        },
        pet: {
            name: 'Luna',
            breed: 'Golden Retriever'
        },
        additionalServices: ['corte'],
        status: 'pending',
        observations: 'El pelo está muy enredado, necesita cuidado especial'
    },
    {
        id: '2',
        type: 'peluqueria',
        source: 'external',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: '11:30',
        client: {
            name: 'María García',
            phone: '677888999'
        },
        pet: {
            name: 'Rocky',
            breed: 'Yorkshire Terrier'
        },
        additionalServices: ['bano_especial'],
        status: 'pending'
    },
    {
        id: '3',
        type: 'peluqueria',
        source: 'hotel',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '16:00',
        client: {
            name: 'Carlos Ruiz',
            phone: '644333222'
        },
        pet: {
            name: 'Max',
            breed: 'Schnauzer'
        },
        additionalServices: ['deslanado'],
        status: 'pending',
        observations: 'Necesita corte de uñas adicional'
    },
    {
        id: '4',
        type: 'peluqueria',
        source: 'external',
        date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
        time: '09:00',
        client: {
            name: 'Ana Martínez',
            phone: '655444333'
        },
        pet: {
            name: 'Bella',
            breed: 'Caniche'
        },
        additionalServices: ['corte'],
        status: 'pending',
        observations: 'Primera visita, pelo muy largo'
    },
    {
        id: '5',
        type: 'peluqueria',
        source: 'hotel',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '12:30',
        client: {
            name: 'Laura Sánchez',
            phone: '688777666'
        },
        pet: {
            name: 'Toby',
            breed: 'Shih Tzu'
        },
        additionalServices: ['bano_especial'],
        status: 'pending'
    }
]

interface PropuestaFecha {
    fecha: string
    hora: string
}

export default function PeluqueriaPage() {
    const { reservations } = useReservation()
    const navigate = useNavigate()
    const [pendingReservations, setPendingReservations] = useState<ExtendedReservationWithSubcitas[]>(mockPendingReservations)
    const [confirmedReservations, setConfirmedReservations] = useState<ExtendedReservationWithSubcitas[]>([])
    const [selectedReservation, setSelectedReservation] = useState<ExtendedReservationWithSubcitas | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [photos, setPhotos] = useState<{ [key: string]: string }>({})
    const { toast } = useToast()
    const [crearSubcitas, setCrearSubcitas] = useState(false)
    const [subcitas, setSubcitas] = useState<SubCita[]>([])
    const [precioEstimado, setPrecioEstimado] = useState<number>()
    const [horaDefinitiva, setHoraDefinitiva] = useState<string>('')
    const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false)
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [reservationToReject, setReservationToReject] = useState<ExtendedReservationWithSubcitas | null>(null)
    const [propuestaFecha, setPropuestaFecha] = useState<PropuestaFecha>({ fecha: '', hora: '' })
    const [isPropuestaModalOpen, setIsPropuestaModalOpen] = useState(false)

    // Función para ordenar las reservas por origen (hotel primero)
    const sortedReservations = [...pendingReservations].sort((a, b) => {
        if (a.source === 'hotel' && b.source !== 'hotel') return -1
        if (a.source !== 'hotel' && b.source === 'hotel') return 1
        return 0
    })

    // Separar las reservas por origen
    const hotelReservations = sortedReservations.filter(r => r.source === 'hotel')
    const externalReservations = sortedReservations.filter(r => r.source === 'external')

    const handleOpenAcceptModal = (reservation: ExtendedReservationWithSubcitas) => {
        setSelectedReservation(reservation)
        setHoraDefinitiva(reservation.time)
        setCrearSubcitas(false)
        setSubcitas([])
        setIsAcceptModalOpen(true)
    }

    const handleConfirmAccept = async () => {
        if (!selectedReservation) return

        const existingReservation = confirmedReservations.find(
            r => r.date === selectedReservation.date && r.time === horaDefinitiva,
        )

        if (existingReservation) {
            toast({
                title: "Error",
                description: "Ya existe una cita confirmada para esta fecha y hora. Por favor, elija otro horario.",
                variant: "destructive"
            })
            return
        }

        // Determinar el estado según el origen de la reserva
        const newStatus = selectedReservation.source === 'hotel' ? 'confirmed' : 'pending_client_confirmation'

        const updatedReservation = { 
            ...selectedReservation, 
            status: newStatus as ReservationStatus,
            precioEstimado,
            horaDefinitiva,
            subcitas: crearSubcitas ? subcitas : undefined
        }
        
        setConfirmedReservations(prev => [...prev, updatedReservation])
        setPendingReservations(prev => prev.filter(r => r.id !== selectedReservation.id))
        
        // Resetear todos los estados
        setCrearSubcitas(false)
        setSubcitas([])
        setPrecioEstimado(undefined)
        setHoraDefinitiva('')
        setSelectedReservation(null)
        setIsAcceptModalOpen(false)
        
        toast({
            title: selectedReservation.source === 'hotel' ? "Reserva aceptada" : "Reserva pendiente de confirmación",
            description: selectedReservation.source === 'hotel' 
                ? "La reserva ha sido confirmada exitosamente."
                : "La reserva está pendiente de confirmación por parte del cliente."
        })
    }

    const handleOpenRejectModal = (reservation: ExtendedReservationWithSubcitas) => {
        setReservationToReject(reservation)
        setIsRejectModalOpen(true)
    }

    const handleConfirmReject = () => {
        if (!reservationToReject) return

        setPendingReservations(prev => prev.filter(r => r.id !== reservationToReject.id))
        setIsRejectModalOpen(false)
        setReservationToReject(null)
        
        toast({
            title: "Reserva denegada",
            description: "La reserva ha sido denegada exitosamente."
        })
    }

    const handleSaveDetails = async () => {
        // Implementation
    }

    const timeSlots = Array.from({ length: 9 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`)

    const handlePropuestaFecha = () => {
        if (!reservationToReject) return
        
        // Aquí iría la lógica para enviar la propuesta al cliente
        toast({
            title: "Propuesta enviada",
            description: `Se ha enviado una propuesta para el ${format(new Date(propuestaFecha.fecha), 'dd MMM yyyy', { locale: es })} a las ${propuestaFecha.hora}`
        })
        
        setIsRejectModalOpen(false)
        setIsPropuestaModalOpen(false)
        setReservationToReject(null)
        setPropuestaFecha({ fecha: '', hora: '' })
    }

    return (
        <div className='container mx-auto p-4 md:p-6'>
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
                            <CardTitle className="text-2xl">Solicitudes pendientes de Peluquería</CardTitle>
                            <CardDescription>
                                Revisa y gestiona las solicitudes de peluquería en espera
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-8'>
                                {/* Sección de Reservas de Hotel */}
                                {hotelReservations.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Hotel className="h-5 w-5 text-primary" />
                                            <h3 className="text-lg font-semibold">Reservas de Hotel</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {hotelReservations.map(reservation => (
                                                <ReservationCard
                                                    key={reservation.id}
                                                    reservation={reservation}
                                                    onAccept={handleOpenAcceptModal}
                                                    onReject={handleOpenRejectModal}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sección de Reservas Externas */}
                                {externalReservations.length > 0 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Users className="h-5 w-5 text-primary" />
                                            <h3 className="text-lg font-semibold">Reservas Externas</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {externalReservations.map(reservation => (
                                                <ReservationCard
                                                    key={reservation.id}
                                                    reservation={reservation}
                                                    onAccept={handleOpenAcceptModal}
                                                    onReject={handleOpenRejectModal}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Mensaje cuando no hay reservas */}
                                {pendingReservations.length === 0 && (
                                    <div className="text-center py-8">
                                        <p className="text-muted-foreground">No hay reservas pendientes</p>
                                    </div>
                                )}
                            </div>
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
                                                                {reservation.status === 'pending_client_confirmation' && (
                                                                    <Badge variant="outline" className="ml-2">
                                                                        Pendiente confirmación
                                                                    </Badge>
                                                                )}
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
                                    <Upload
                                        onUpload={(file) => {
                                            if (selectedReservation) {
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
                                    >
                                        Subir foto
                                    </Upload>
                                    {photos[`${selectedReservation?.id}_before`] && (
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
                                    <Upload
                                        onUpload={(file) => {
                                            if (selectedReservation) {
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
                                    >
                                        Subir foto
                                    </Upload>
                                    {photos[`${selectedReservation?.id}_after`] && (
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

            {/* Modal de Confirmación para Reservas */}
            <Dialog open={isAcceptModalOpen} onOpenChange={setIsAcceptModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedReservation?.source === 'hotel' 
                                ? 'Confirmar Reserva de Hotel' 
                                : 'Confirmar Reserva Externa'}
                        </DialogTitle>
                        <DialogDescription>
                            Por favor, completa los detalles para confirmar la reserva
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="hora">Hora definitiva</Label>
                            <Input
                                id="hora"
                                type="time"
                                value={horaDefinitiva}
                                onChange={(e) => setHoraDefinitiva(e.target.value)}
                            />
                        </div>

                        {selectedReservation?.source === 'hotel' ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="subcitas"
                                            checked={crearSubcitas}
                                            onCheckedChange={(checked) => {
                                                setCrearSubcitas(checked as boolean)
                                                if (checked) {
                                                    setSubcitas([
                                                        { fecha: '', hora: '', descripcion: 'Baño' }
                                                    ])
                                                } else {
                                                    setSubcitas([])
                                                }
                                            }}
                                        />
                                        <Label htmlFor="subcitas">
                                            Dividir en subcitas
                                        </Label>
                                    </div>
                                    {crearSubcitas && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setSubcitas([...subcitas, { fecha: '', hora: '', descripcion: '' }])}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Agregar subcita
                                        </Button>
                                    )}
                                </div>

                                {crearSubcitas && (
                                    <div className="space-y-6">
                                        {subcitas.map((subcita, index) => (
                                            <div 
                                                key={index} 
                                                className="space-y-4 border rounded-lg p-4 relative"
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <h4 className="font-medium">Subcita {index + 1}</h4>
                                                    {subcitas.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                const newSubcitas = subcitas.filter((_, i) => i !== index)
                                                                setSubcitas(newSubcitas)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Descripción del servicio</Label>
                                                        <Input
                                                            value={subcita.descripcion}
                                                            onChange={(e) => {
                                                                const newSubcitas = [...subcitas]
                                                                newSubcitas[index] = {
                                                                    ...newSubcitas[index],
                                                                    descripcion: e.target.value
                                                                }
                                                                setSubcitas(newSubcitas)
                                                            }}
                                                            placeholder="Ej: Baño, Corte, etc."
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <Label>Fecha</Label>
                                                            <Input
                                                                type="date"
                                                                value={subcita.fecha}
                                                                onChange={(e) => {
                                                                    const newSubcitas = [...subcitas]
                                                                    newSubcitas[index] = {
                                                                        ...newSubcitas[index],
                                                                        fecha: e.target.value
                                                                    }
                                                                    setSubcitas(newSubcitas)
                                                                }}
                                                            />
                                                        </div>
                                                        <div>
                                                            <Label>Hora</Label>
                                                            <Input
                                                                type="time"
                                                                value={subcita.hora}
                                                                onChange={(e) => {
                                                                    const newSubcitas = [...subcitas]
                                                                    newSubcitas[index] = {
                                                                        ...newSubcitas[index],
                                                                        hora: e.target.value
                                                                    }
                                                                    setSubcitas(newSubcitas)
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio estimado</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="precio"
                                        type="number"
                                        className="pl-10"
                                        placeholder="0.00"
                                        value={precioEstimado || ''}
                                        onChange={(e) => setPrecioEstimado(parseFloat(e.target.value))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAcceptModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmAccept}>
                            Confirmar reserva
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal de Rechazo para Reservas Externas */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>¿Deseas denegar esta solicitud?</DialogTitle>
                        <DialogDescription>
                            Puedes denegar la cita o proponer una fecha alternativa
                        </DialogDescription>
                    </DialogHeader>
                    
                    {reservationToReject && (
                        <div className="py-4">
                            <div className="rounded-lg bg-muted p-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{reservationToReject.pet.name}</span>
                                        <Badge variant="secondary">
                                            Externo
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <div>Cliente: {reservationToReject.client.name}</div>
                                        <div>Fecha: {format(new Date(reservationToReject.date), 'dd MMM yyyy', { locale: es })}</div>
                                        <div>Hora: {reservationToReject.time}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsPropuestaModalOpen(true)
                                        setIsRejectModalOpen(false)
                                    }}
                                >
                                    Proponer otra fecha
                                </Button>
                                <Button 
                                    variant="destructive" 
                                    onClick={handleConfirmReject}
                                >
                                    Denegar cita
                                </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal para Proponer Nueva Fecha */}
            <Dialog open={isPropuestaModalOpen} onOpenChange={setIsPropuestaModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Proponer nueva fecha</DialogTitle>
                        <DialogDescription>
                            Selecciona una fecha y hora alternativa para la cita
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nueva fecha</Label>
                            <Input
                                type="date"
                                value={propuestaFecha.fecha}
                                onChange={(e) => setPropuestaFecha(prev => ({ ...prev, fecha: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Nueva hora</Label>
                            <Input
                                type="time"
                                value={propuestaFecha.hora}
                                onChange={(e) => setPropuestaFecha(prev => ({ ...prev, hora: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsPropuestaModalOpen(false)
                                setReservationToReject(null)
                                setPropuestaFecha({ fecha: '', hora: '' })
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button 
                            onClick={handlePropuestaFecha}
                            disabled={!propuestaFecha.fecha || !propuestaFecha.hora}
                        >
                            Enviar propuesta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

// Componente de tarjeta de reserva actualizado
function ReservationCard({ 
    reservation, 
    onAccept, 
    onReject 
}: { 
    reservation: ExtendedReservationWithSubcitas
    onAccept: (r: ExtendedReservationWithSubcitas) => void
    onReject: (r: ExtendedReservationWithSubcitas) => void 
}) {
    return (
        <Card className='transition-all hover:shadow-lg touch-manipulation'>
            <CardContent className='p-6'>
                <div className='space-y-6'>
                    {/* Header con origen de reserva */}
                    <div className='flex items-center justify-between'>
                        <Badge 
                            variant={reservation.source === 'hotel' ? 'default' : 'secondary'}
                            className='px-3 py-1.5'
                        >
                            {reservation.source === 'hotel' ? (
                                <div className='flex items-center gap-2'>
                                    <Hotel className='h-4 w-4' />
                                    <span>Hotel</span>
                                </div>
                            ) : (
                                <div className='flex items-center gap-2'>
                                    <Users className='h-4 w-4' />
                                    <span>Externo</span>
                                </div>
                            )}
                        </Badge>
                        <Badge 
                            variant="outline"
                            className={`px-3 py-1.5 ${
                                reservation.additionalServices[0] === 'corte'
                                    ? 'border-blue-500 text-blue-700'
                                    : reservation.additionalServices[0] === 'bano_especial'
                                    ? 'border-green-500 text-green-700'
                                    : 'border-purple-500 text-purple-700'
                            }`}
                        >
                            {reservation.additionalServices[0] === 'corte'
                                ? 'Baño y corte'
                                : reservation.additionalServices[0] === 'bano_especial'
                                ? 'Baño y cepillado'
                                : 'Deslanado'}
                        </Badge>
                    </div>

                    {/* Información principal */}
                    <div>
                        <h3 className='text-xl font-semibold mb-1'>
                            {reservation.pet.name}
                        </h3>
                        <p className='text-sm text-muted-foreground mb-2'>
                            {reservation.pet.breed}
                        </p>
                        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-1.5'>
                                <Calendar className='h-4 w-4' />
                                <span>
                                    {format(new Date(reservation.date), 'dd MMM', {
                                        locale: es,
                                    })}
                                </span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                                <Clock className='h-4 w-4' />
                                <span>{reservation.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className='flex gap-3 pt-2'>
                        {reservation.source === 'hotel' ? (
                            <Button
                                variant='default'
                                className='flex-1 min-h-[44px]'
                                onClick={() => onAccept(reservation)}
                            >
                                <Calendar className='mr-2 h-5 w-5' />
                                Organizar cita
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant='destructive'
                                    className='flex-1 min-h-[44px]'
                                    onClick={() => onReject(reservation)}
                                >
                                    <X className='mr-2 h-5 w-5' />
                                    Denegar
                                </Button>
                                <Button
                                    variant='default'
                                    className='flex-1 min-h-[44px]'
                                    onClick={() => onAccept(reservation)}
                                >
                                    <Check className='mr-2 h-5 w-5' />
                                    Aceptar
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
