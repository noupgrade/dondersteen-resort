import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const translations = {
    newReservation: { es: 'Nueva Reserva', en: 'New Reservation' },
    whatTypeOfReservation: {
        es: '¿Qué tipo de reserva deseas realizar?',
        en: 'What type of reservation do you want to make?',
    },
    grooming: { es: 'Peluquería', en: 'Grooming' },
    hotel: { es: 'Hotel', en: 'Hotel' },
}

type NewReservationModalProps = {
    isOpen: boolean
    onClose: () => void
    language: 'es' | 'en'
}

export function NewReservationModal({ isOpen, onClose, language }: NewReservationModalProps) {
    const router = useRouter()
    const t = (key: string): string => {
        return translations[key]?.[language] || key
    }

    const handleReservationTypeSelect = (type: 'grooming' | 'hotel') => {
        onClose()
        if (type === 'grooming') {
            router.push('/peluqueria-booking')
        } else {
            router.push('/booking')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('newReservation')}</DialogTitle>
                </DialogHeader>
                <div className='py-6'>
                    <p className='mb-4'>{t('whatTypeOfReservation')}</p>
                    <div className='flex justify-center space-x-4'>
                        <Button onClick={() => handleReservationTypeSelect('grooming')}>{t('grooming')}</Button>
                        <Button onClick={() => handleReservationTypeSelect('hotel')}>{t('hotel')}</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
