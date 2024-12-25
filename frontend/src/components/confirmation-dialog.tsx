import { Link } from 'react-router-dom'

import { CheckCircle } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { BookingSummary } from '@/components/booking-summary'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'

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
                <div className='py-4'>
                    <BookingSummary
                        dates={{
                            from: new Date(reservation.date),
                            to: new Date(reservation.checkOutDate || reservation.date),
                        }}
                        pets={reservation.pets || []}
                        services={reservation.additionalServices || {}}
                        totalPrice={reservation.totalPrice || 0}
                        pickupTime={reservation.time}
                    />
                </div>
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
