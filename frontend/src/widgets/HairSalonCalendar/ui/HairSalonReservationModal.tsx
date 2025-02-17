import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
    Building2,
    Calendar,
    Camera,
    Car,
    Clock,
    Copy,
    Euro,
    Hotel,
    Phone,
    Plus,
    Save,
    Trash2,
    Users,
    X,
} from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { isDriverService, isHairdressingService } from '@/shared/types/service-checkers'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { DatePicker } from '@/shared/ui/date-picker'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { HairdressingServiceType } from '@monorepo/functions/src/types/services'

interface HairSalonReservationModalProps {
    reservation: HairSalonReservation
    isOpen: boolean
    onClose: () => void
    onSave: (updatedReservation: HairSalonReservation) => void
    onDelete?: (reservation: HairSalonReservation) => void
}

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono',
    knots: 'Nudos',
    extremely_dirty: 'Extremadamente sucio',
}

const serviceTypeColors: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'bg-blue-50 text-blue-700 border-blue-200',
    bath_and_trim: 'bg-green-50 text-green-700 border-green-200',
    stripping: 'bg-purple-50 text-purple-700 border-purple-200',
    deshedding: 'bg-orange-50 text-orange-700 border-orange-200',
    brushing: 'bg-pink-50 text-pink-700 border-pink-200',
    spa: 'bg-teal-50 text-teal-700 border-teal-200',
    spa_ozone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    knots: 'bg-red-50 text-red-700 border-red-200',
    extremely_dirty: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120]

interface SubAppointmentDialogProps {
    isOpen: boolean
    onClose: () => void
    services: HairdressingServiceType[]
    onServiceSelect: (service: HairdressingServiceType | 'duplicate') => void
}

function SubAppointmentDialog({ isOpen, onClose, services, onServiceSelect }: SubAppointmentDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
            <DialogContent className='sm:max-w-[400px]'>
                <DialogHeader>
                    <DialogTitle>Seleccionar Servicio para Subcita</DialogTitle>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    {services.map(service => (
                        <Button
                            key={service}
                            variant='outline'
                            className='w-full justify-start gap-2'
                            onClick={() => onServiceSelect(service)}
                        >
                            <Calendar className='h-4 w-4' />
                            {serviceTypeLabels[service]}
                        </Button>
                    ))}
                    <Separator />
                    <Button
                        variant='outline'
                        className='w-full justify-start gap-2'
                        onClick={() => onServiceSelect('duplicate')}
                    >
                        <Copy className='h-4 w-4' />
                        Duplicar todos los servicios
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export function HairSalonReservationModal({
    reservation,
    isOpen,
    onClose,
    onSave,
    onDelete,
}: HairSalonReservationModalProps) {
    const [duration, setDuration] = useState(reservation.duration?.toString() || '60')
    const [price, setPrice] = useState(reservation.precioEstimado?.toString() || '')
    const [resultImage, setResultImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(reservation.resultImage || null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(reservation.date))
    const [selectedTime, setSelectedTime] = useState(reservation.time || reservation.horaDefinitiva || '')
    const [isSubAppointmentDialogOpen, setIsSubAppointmentDialogOpen] = useState(false)

    // Find the hairdressing service and get its services array
    const hairdressingService = reservation.additionalServices.find(isHairdressingService)
    const services = hairdressingService?.services || []
    const hasDriverService = reservation.additionalServices.some(isDriverService)

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setResultImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSave = () => {
        // Validate required fields
        if (!duration) {
            alert('Por favor, completa la duración')
            return
        }

        // Validate numeric values
        const durationNum = parseInt(duration)
        const priceNum = price ? parseFloat(price) : undefined

        if (isNaN(durationNum)) {
            alert('Por favor, introduce valores numéricos válidos')
            return
        }

        const updatedReservation: HairSalonReservation = {
            ...reservation,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            duration: durationNum,
            precioEstimado: priceNum,
            resultImage: previewUrl ? previewUrl : undefined,
            horaDefinitiva: selectedTime, // Update hora definitiva with the new time
        }

        try {
            onSave(updatedReservation)
            onClose()
        } catch (error) {
            console.error('Error al guardar los cambios:', error)
            alert('Hubo un error al guardar los cambios. Por favor, inténtalo de nuevo.')
        }
    }

    const handleDelete = () => {
        if (!onDelete) return

        try {
            onDelete(reservation)
            onClose()
        } catch (error) {
            console.error('Error al eliminar la cita:', error)
            alert('Hubo un error al eliminar la cita. Por favor, inténtalo de nuevo.')
        }
    }

    const resetForm = () => {
        setDuration(reservation.duration?.toString() || '60')
        setPrice(reservation.precioEstimado?.toString() || '')
        setResultImage(null)
        setPreviewUrl(reservation.resultImage || null)
        setSelectedDate(new Date(reservation.date))
        setSelectedTime(reservation.time || '')
    }

    // Reset form when modal opens with new reservation
    useEffect(() => {
        if (isOpen) {
            resetForm()
        }
    }, [isOpen, reservation])

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
        }
    }

    const handleSubAppointmentServiceSelect = (service: HairdressingServiceType | 'duplicate') => {
        setIsSubAppointmentDialogOpen(false)
        // TODO: Open weekly view for selecting the slot
        console.log('Selected service:', service)
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={open => {
                if (!open) {
                    resetForm()
                    onClose()
                }
            }}
        >
            <DialogContent className='sm:max-w-[600px]'>
                <DialogHeader className='flex flex-row items-center justify-between border-b pb-4'>
                    <div className='flex items-center gap-4'>
                        <DialogTitle>Detalles de la Cita</DialogTitle>
                        <Badge
                            variant='outline'
                            className={cn(
                                'ml-2',
                                reservation.source === 'hotel'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-violet-50 text-violet-700',
                            )}
                        >
                            <div className='flex items-center gap-1.5'>
                                {reservation.source === 'hotel' ? (
                                    <Hotel className='h-3 w-3' />
                                ) : (
                                    <Users className='h-3 w-3' />
                                )}
                                {reservation.source === 'hotel' ? 'Hotel' : 'Externo'}
                            </div>
                        </Badge>
                    </div>
                </DialogHeader>

                <div className='grid gap-6 py-4'>
                    {/* Client and Pet Info */}
                    <div className='grid gap-6'>
                        <div className='space-y-4'>
                            <div>
                                <h3 className='text-lg font-medium'>{reservation.pet.name}</h3>
                                <p className='text-sm text-muted-foreground'>{reservation.pet.breed}</p>
                                <div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
                                    <span>Tamaño: {reservation.pet.size}</span>
                                    <span>•</span>
                                    <span>Peso: {reservation.pet.weight}kg</span>
                                </div>
                            </div>
                            <div className='space-y-1'>
                                <p className='text-sm text-muted-foreground'>{reservation.client.name}</p>
                                <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                                    <Phone className='h-3 w-3' />
                                    {reservation.client.phone}
                                </div>
                                {reservation.client.email && (
                                    <p className='text-sm text-muted-foreground'>{reservation.client.email}</p>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Fechas y Horarios */}
                        <div className='space-y-4'>
                            <h4 className='font-medium'>Fechas y Horarios</h4>
                            <div className='space-y-4'>
                                {/* Fecha y hora de la cita */}
                                <div className='space-y-2'>
                                    <Label>Fecha de la cita</Label>
                                    <DatePicker date={selectedDate} onSelect={handleDateSelect} />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Hora de la cita</Label>
                                    <Input
                                        type='time'
                                        value={selectedTime}
                                        onChange={e => setSelectedTime(e.target.value)}
                                    />
                                </div>

                                {/* Fechas de hotel si es una reserva de hotel */}
                                {reservation.source === 'hotel' && (
                                    <div className='mt-4 space-y-2 border-t pt-4'>
                                        <h5 className='text-sm font-medium text-muted-foreground'>
                                            Información del Hotel
                                        </h5>
                                        {reservation.hotelCheckIn && (
                                            <div className='flex items-center gap-2 text-sm'>
                                                <Calendar className='h-4 w-4 text-gray-500' />
                                                <span>
                                                    Check-in:{' '}
                                                    {format(new Date(reservation.hotelCheckIn), "d 'de' MMMM", {
                                                        locale: es,
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                        {reservation.hotelCheckOut && (
                                            <div className='flex items-center gap-2 text-sm'>
                                                <Calendar className='h-4 w-4 text-gray-500' />
                                                <span>
                                                    Check-out:{' '}
                                                    {format(new Date(reservation.hotelCheckOut), "d 'de' MMMM", {
                                                        locale: es,
                                                    })}
                                                    {reservation.hotelCheckOutTime &&
                                                        ` - ${reservation.hotelCheckOutTime}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Hora solicitada para reservas externas */}
                                {reservation.source === 'external' && reservation.requestedTime && (
                                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                        <Clock className='h-4 w-4' />
                                        <span>Hora solicitada: {reservation.requestedTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* Services */}
                        <div className='space-y-4'>
                            <div className='flex items-center justify-between'>
                                <h4 className='font-medium'>Servicios</h4>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='flex items-center gap-2'
                                    onClick={() => setIsSubAppointmentDialogOpen(true)}
                                >
                                    <Plus className='h-4 w-4' />
                                    Añadir Subcita
                                </Button>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {services.map((service, index) => (
                                    <Badge
                                        key={index}
                                        variant='outline'
                                        className={cn(
                                            'whitespace-nowrap border-[1.5px] px-2 py-0.5 text-xs',
                                            serviceTypeColors[service],
                                        )}
                                    >
                                        {serviceTypeLabels[service]}
                                    </Badge>
                                ))}
                            </div>
                            {hasDriverService && (
                                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                                    <Car className='h-4 w-4' />
                                    <span>Servicio de recogida incluido</span>
                                </div>
                            )}

                            <SubAppointmentDialog
                                isOpen={isSubAppointmentDialogOpen}
                                onClose={() => setIsSubAppointmentDialogOpen(false)}
                                services={services}
                                onServiceSelect={handleSubAppointmentServiceSelect}
                            />
                        </div>

                        <Separator />

                        {/* Duration and Price */}
                        <div className='grid grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='duration'>Duración (minutos)</Label>
                                <Select value={duration} onValueChange={setDuration}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Selecciona la duración' />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-[200px]'>
                                        {durationOptions.map(mins => (
                                            <SelectItem key={mins} value={mins.toString()}>
                                                {mins} minutos
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='space-y-2'>
                                <Label htmlFor='price'>Precio (€)</Label>
                                <Input
                                    id='price'
                                    type='number'
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className={!price ? 'border-red-500' : ''}
                                />
                                {!price && <p className='text-sm text-red-500'>El precio es requerido</p>}
                            </div>
                        </div>

                        {/* Result Image */}
                        <div className='space-y-4'>
                            <Label>Foto del Resultado</Label>
                            <div className='flex items-center gap-4'>
                                <Button
                                    variant='outline'
                                    onClick={() => document.getElementById('image-upload')?.click()}
                                    className='flex items-center gap-2'
                                >
                                    <Camera className='h-4 w-4' />
                                    Subir Foto
                                </Button>
                                <input
                                    id='image-upload'
                                    type='file'
                                    accept='image/*'
                                    onChange={handleImageChange}
                                    className='hidden'
                                />
                            </div>
                            {previewUrl && (
                                <div className='relative h-48 w-48'>
                                    <img
                                        src={previewUrl}
                                        alt='Preview'
                                        className='h-full w-full rounded-md object-cover'
                                    />
                                    <Button
                                        variant='destructive'
                                        size='icon'
                                        className='absolute right-2 top-2'
                                        onClick={() => {
                                            setResultImage(null)
                                            setPreviewUrl(null)
                                        }}
                                    >
                                        <X className='h-4 w-4' />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className='flex justify-between gap-4 border-t pt-4'>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant='destructive'
                                        className='flex items-center gap-2'
                                        disabled={!onDelete}
                                    >
                                        <Trash2 className='h-4 w-4' />
                                        Eliminar Cita
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción no se puede deshacer. Se eliminará permanentemente la cita de{' '}
                                            {reservation.pet.name}.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                        >
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <div className='flex gap-2'>
                                <Button
                                    variant='outline'
                                    onClick={() => {
                                        resetForm()
                                        onClose()
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} className='flex items-center gap-2' disabled={!duration}>
                                    <Save className='h-4 w-4' />
                                    Guardar Cambios
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
