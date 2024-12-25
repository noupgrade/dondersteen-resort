import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ChevronLeft, Globe, Plus } from 'lucide-react'

import { ClientDetailsCard } from '@/components/client-details-card'
import { NewReservationModal } from '@/components/new-reservation-modal'
import { PetCard } from '@/components/pet-card'
import { ReservationCard } from '@/components/reservation-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const translations = {
    back: {
        es: 'Volver',
        en: 'Back',
    },
    clientProfile: {
        es: 'Perfil del Cliente',
        en: 'Client Profile',
    },
    newReservation: {
        es: 'Nueva Reserva',
        en: 'New Reservation',
    },
    reservations: {
        es: 'Reservas',
        en: 'Reservations',
    },
    pets: {
        es: 'Mascotas',
        en: 'Pets',
    },
    addNewPet: {
        es: 'Añadir Nueva Mascota',
        en: 'Add New Pet',
    },
}

export default function ClientProfile() {
    const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false)
    const [language, setLanguage] = useState<'es' | 'en'>('es')
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const clientReservations = [
        {
            id: '1',
            type: 'grooming',
            date: '2024-03-15',
            time: '10:00',
            services: ['bath', 'haircut'],
            status: 'Propuesta Peluquería',
            estimatedPrice: 50,
            pets: [{ name: 'Max', breed: 'Golden Retriever' }],
        },
        {
            id: '2',
            type: 'hotel',
            startDate: '2024-03-18',
            endDate: '2024-03-20',
            services: ['accommodation', 'food'],
            status: 'Confirmada',
            pets: [
                { name: 'Luna', breed: 'Siamese' },
                { name: 'Rocky', breed: 'German Shepherd' },
            ],
        },
    ]
    const mockPets = [
        {
            id: 1,
            name: 'Max',
            breed: 'Golden Retriever',
            age: 5,
            gender: 'Male',
            food: 'BARF diet',
            medication: 'None',
            habits: 'Loves walks',
            personality: 'Friendly',
            comments: 'Allergic to chicken',
        },
        {
            id: 2,
            name: 'Luna',
            breed: 'Siamese',
            age: 3,
            gender: 'Female',
            food: 'Dry food',
            medication: 'None',
            habits: 'Sleeps a lot',
            personality: 'Independent',
            comments: 'Prefers quiet environments',
        },
    ]
    const mockClientDetails = {
        name: 'John Doe',
        phone: '+34 123 456 789',
        email: 'john.doe@example.com',
        address: 'Calle Principal 123, 28001 Madrid',
    }

    const t = (key: string) => translations[key][language]

    const handleReservationDeleted = (reservationId: string) => {
        console.log('Reservation deleted:', reservationId)
    }

    const handleDateChangeSuccess = (message: string) => {
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(null), 5000)
    }

    return (
        <div className='container mx-auto p-4'>
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        className='fixed right-4 top-4 z-50'
                    >
                        <Alert variant='success'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className='mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row'>
                <Link href='/' className='w-full sm:w-auto'>
                    <Button variant='outline' className='w-full sm:w-auto'>
                        <ChevronLeft className='mr-2 h-4 w-4' />
                        {t('back')}
                    </Button>
                </Link>
                <h1 className='order-first text-2xl font-bold sm:order-none'>{t('clientProfile')}</h1>
                <div className='flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center'>
                    <Button onClick={() => setIsNewReservationModalOpen(true)} className='w-full sm:w-auto'>
                        <Plus className='mr-2 h-4 w-4' />
                        {t('newReservation')}
                    </Button>
                    <Button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className='w-full sm:w-auto'>
                        <Globe className='mr-2 h-4 w-4' />
                        {language === 'es' ? 'EN' : 'ES'}
                    </Button>
                </div>
            </div>

            <div className='grid gap-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>{t('reservations')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-4'>
                            {clientReservations.map(reservation => (
                                <ReservationCard
                                    key={reservation.id}
                                    reservation={reservation}
                                    language={language}
                                    onReservationDeleted={handleReservationDeleted}
                                    onDateChangeSuccess={handleDateChangeSuccess}
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('pets')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
                            {mockPets.map(pet => (
                                <PetCard key={pet.id} pet={pet} language={language} />
                            ))}
                        </div>
                        <Button className='mt-6 w-full'>
                            <Plus className='mr-2 h-4 w-4' />
                            {t('addNewPet')}
                        </Button>
                    </CardContent>
                </Card>
                <ClientDetailsCard client={mockClientDetails} language={language} />
            </div>

            <NewReservationModal
                isOpen={isNewReservationModalOpen}
                onClose={() => setIsNewReservationModalOpen(false)}
                language={language}
            />
        </div>
    )
}
