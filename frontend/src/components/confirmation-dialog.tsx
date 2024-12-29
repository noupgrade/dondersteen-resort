import { Link } from 'react-router-dom'

import { format } from 'date-fns'
import { CheckCircle } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { BookingSummary } from '@/components/booking-summary'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'

type ConfirmationDialogProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    reservationId: string
}

export function ConfirmationDialog({ open, onOpenChange, reservationId }: ConfirmationDialogProps) {
    const { reservations } = useReservation()
    const reservation = reservations.find(r => r.id === reservationId)

    if (!reservation) {
        return null
    }

    const renderContent = () => {
        if (reservation.type === 'hotel') {
            return (
                <div className='py-4'>
                    <BookingSummary
                        dates={{
                            from: new Date(reservation.checkInDate),
                            to: new Date(reservation.checkOutDate),
                        }}
                        pets={reservation.pets}
                        services={reservation.additionalServices.reduce((acc, service) => ({ ...acc, [service]: true }), {})}
                        totalPrice={reservation.totalPrice}
                        pickupTime={reservation.checkInTime}
                    />
                </div>
            )
        } else {
            return (
                <div className='py-4 space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>Fecha</p>
                            <p className='font-medium'>{format(new Date(reservation.date), 'dd/MM/yyyy')}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Hora</p>
                            <p className='font-medium'>{reservation.time}</p>
                        </div>
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>Mascota</p>
                        <p className='font-medium'>{reservation.pet.name} ({reservation.pet.breed})</p>
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>Servicio</p>
                        <p className='font-medium'>
                            {reservation.additionalServices.map(service =>
                                service === 'corte' ? 'Corte' :
                                    service === 'bano_especial' ? 'Baño especial' :
                                        'Deslanado'
                            ).join(', ')}
                        </p>
                    </div>
                    {reservation.totalPrice > 0 && (
                        <div>
                            <p className='text-sm text-muted-foreground'>Precio total</p>
                            <p className='font-medium'>€{reservation.totalPrice.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle className='flex items-center gap-2 text-2xl'>
                        <CheckCircle className='h-8 w-8 text-green-500' />
                        Solicitud Registrada
                    </DialogTitle>
                    <DialogDescription className='space-y-2'>
                        <p className='text-lg font-semibold'>
                            ¡Gracias {reservation.client.name.split(' ')[0]} por elegir nuestro servicio!
                        </p>
                        <p className='text-muted-foreground'>
                            Te enviaremos un correo con la confirmación de la reserva.
                        </p>
                        <p className='text-muted-foreground'>
                            Recuerda que esto es solo una solicitud, y la reserva no está confirmada.
                        </p>
                    </DialogDescription>
                </DialogHeader>
                {renderContent()}
                <DialogFooter className='sm:justify-between'>
                    <Button variant='outline' onClick={() => onOpenChange(false)}>
                        Cerrar
                    </Button>
                    <Button asChild>
                        <Link to='/'>Volver al Inicio</Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
