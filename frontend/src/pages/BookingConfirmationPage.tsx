import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'

import { CheckCircle } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { BookingSummary } from '@/components/booking-summary'
import { PetFormData } from '@/features/booking/types/booking.types'
import { isHairdressingService } from '@/shared/types/service-checkers'
import { Button } from '@/shared/ui/button'
import { LanguageSwitchButton } from '@/shared/ui/language-switch-button'

export default function BookingConfirmationPage() {
    const { t } = useTranslation()
    const { reservationId } = useParams()
    const navigate = useNavigate()
    const { reservations } = useReservation()
    const reservation = reservations.find(r => r.id === reservationId)

    useEffect(() => {
        if (!reservation) {
            navigate('/')
        }
    }, [reservation, navigate])

    if (!reservation) return null

    const renderContent = () => {
        if (reservation.type === 'hotel') {
            const petsFormData: PetFormData[] = reservation.pets.map(pet => ({
                name: pet.name,
                breed: pet.breed,
                weight: String(pet.weight),
                size: pet.size,
                age: '0',
                personality: '',
                sex: pet.sex || 'M',
                isNeutered: pet.isNeutered || false,
            }))

            return (
                <div className='py-4'>
                    <BookingSummary
                        dates={{
                            from: new Date(reservation.checkInDate),
                            to: new Date(reservation.checkOutDate),
                        }}
                        pets={petsFormData}
                        services={reservation.additionalServices}
                    />
                </div>
            )
        } else {
            // Encontrar el servicio de peluquería
            const hairdressingService = reservation.additionalServices.find(isHairdressingService)
            const services = hairdressingService?.services || []

            return (
                <div className='space-y-4 py-4'>
                    <div className='grid grid-cols-2 gap-4'>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                {t('booking.confirmation.grooming.date', 'Fecha')}
                            </p>
                            <p className='font-medium'>{reservation.date}</p>
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                {t('booking.confirmation.grooming.time', 'Hora')}
                            </p>
                            <p className='font-medium'>{reservation.time}</p>
                        </div>
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>
                            {t('booking.confirmation.grooming.pet', 'Mascota')}
                        </p>
                        <p className='font-medium'>
                            {reservation.pet.name} ({reservation.pet.breed})
                        </p>
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>
                            {t('booking.confirmation.grooming.services', 'Servicios')}
                        </p>
                        <p className='font-medium'>
                            {services
                                .map(service => t(`booking.confirmation.grooming.services.${service}`, service))
                                .join(', ')}
                        </p>
                    </div>
                    {reservation.totalPrice > 0 && (
                        <div>
                            <p className='text-sm text-muted-foreground'>
                                {t('booking.confirmation.grooming.totalPrice', 'Precio total')}
                            </p>
                            <p className='font-medium'>€{reservation.totalPrice.toFixed(2)}</p>
                        </div>
                    )}
                </div>
            )
        }
    }

    return (
        <div className='container mx-auto max-w-4xl p-4'>
            <div className='absolute right-4 top-4 z-50'>
                <LanguageSwitchButton />
            </div>
            <img src='/dondersteen-logo.png' alt='Dondersteen Logo' className='mx-auto mb-8 h-24' />
            <div className='rounded-lg border bg-card p-6 text-card-foreground shadow-sm'>
                <div className='flex flex-col items-center gap-4 text-center'>
                    <CheckCircle className='h-12 w-12 text-green-500' />
                    <h1 className='text-2xl font-bold'>{t('booking.confirmation.title', 'Solicitud Registrada')}</h1>
                    <div className='space-y-2'>
                        <p className='text-lg font-semibold'>
                            {t('booking.confirmation.thanks', '¡Gracias {{name}} por elegir nuestro servicio!', {
                                name: reservation.client.name.split(' ')[0],
                            })}
                        </p>
                        <p className='text-muted-foreground'>
                            {t(
                                'booking.confirmation.email',
                                'Te enviaremos un correo con la confirmación de la reserva.',
                            )}
                        </p>
                        <p className='text-muted-foreground'>
                            {t(
                                'booking.confirmation.pending',
                                'Recuerda que esto es solo una solicitud, y la reserva no está confirmada.',
                            )}
                        </p>
                    </div>
                </div>
                {renderContent()}
                <div className='mt-6 flex justify-center'>
                    <Button variant='outline' onClick={() => navigate('/')}>
                        {t('booking.confirmation.close', 'Volver al inicio')}
                    </Button>
                </div>
            </div>
        </div>
    )
}
