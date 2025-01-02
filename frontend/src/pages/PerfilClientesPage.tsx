import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ChevronLeft, Globe, Plus, ChevronDown, Calendar, Clock, Bed, Scissors as ScissorsIcon, X } from 'lucide-react'

import { ClientDetailsCard } from '@/components/client-details-card.tsx'
import { NewReservationModal } from '@/components/new-reservation-modal.tsx'
import { PetCard } from '@/components/pet-card.tsx'
import { ReservationCard, type Reservation } from '@/components/reservation-card.tsx'
import { Alert, AlertDescription } from '@/shared/ui/alert.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { cn } from '@/shared/lib/styles/class-merge.ts'
import { Badge } from '@/shared/ui/badge.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog.tsx'
import { Label } from '@/shared/ui/label.tsx'
import { Input } from '@/shared/ui/input.tsx'

const mockReservations: Reservation[] = [
    {
        id: '1',
        type: 'hotel',
        status: 'confirmed',
        startDate: '2024-03-01',
        endDate: '2024-03-05',
        services: ['Alojamiento estándar'],
        pets: [{
            name: 'Max',
            breed: 'Golden Retriever',
            weight: 30,
            size: 'grande'
        }],
        estimatedPrice: 240
    },
    {
        id: '2',
        type: 'peluqueria',
        status: 'confirmed',
        date: '2024-03-15',
        time: '14:00',
        services: ['Corte y baño'],
        pets: [{
            name: 'Luna',
            breed: 'Yorkshire',
            weight: 3,
            size: 'pequeño'
        }],
        estimatedPrice: 35
    },
    {
        id: '3',
        type: 'hotel',
        status: 'cancelled',
        startDate: '2024-03-25',
        endDate: '2024-03-28',
        services: ['Alojamiento estándar'],
        pets: [{
            name: 'Max',
            breed: 'Golden Retriever',
            weight: 30,
            size: 'grande'
        }],
        estimatedPrice: 180
    },
    {
        id: '4',
        type: 'peluqueria',
        status: 'pending',
        date: '2024-04-01',
        time: '11:00',
        services: ['Corte'],
        pets: [{
            name: 'Luna',
            breed: 'Yorkshire',
            weight: 3,
            size: 'pequeño'
        }],
        estimatedPrice: 45
    }
]

const translations = {
    back: { es: 'Volver', en: 'Back' },
    clientProfile: { es: 'Mi Perfil', en: 'My Profile' },
    newReservation: { es: 'Nueva Reserva', en: 'New Reservation' },
    reservations: { es: 'Reservas', en: 'Reservations' },
    pets: { es: 'Mascotas', en: 'Pets' },
    addNewPet: { es: 'Añadir Nueva Mascota', en: 'Add New Pet' },
    showAll: { es: 'Ver todas', en: 'Show all' },
    showLess: { es: 'Ver menos', en: 'Show less' },
    editProfile: { es: 'Editar Perfil', en: 'Edit Profile' },
    save: { es: 'Guardar', en: 'Save' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
} as const

type TranslationKey = keyof typeof translations

const mockClientDetails = {
    name: 'John Doe',
    phone: '+34 123 456 789',
    email: 'john.doe@example.com',
    address: 'Calle Principal 123, 28001 Madrid',
}

export default function ClientProfile() {
    const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false)
    const [language, setLanguage] = useState<'es' | 'en'>('es')
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [clientReservations, setClientReservations] = useState(mockReservations)
    const [showAllReservations, setShowAllReservations] = useState(false)
    const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false)
    const [editedClientDetails, setEditedClientDetails] = useState(mockClientDetails)

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

    const t = (key: TranslationKey) => translations[key][language]

    const handleReservationDeleted = (reservationId: string) => {
        setClientReservations(prev => prev.filter(res => res.id !== reservationId))
    }

    const handleDateChangeSuccess = (message: string) => {
        setSuccessMessage(message)
        setTimeout(() => setSuccessMessage(null), 5000)
    }

    const handleSaveClientDetails = () => {
        // Aquí iría la lógica para guardar los datos del cliente
        setIsEditClientModalOpen(false)
        setSuccessMessage('Datos actualizados correctamente')
    }

    const displayedReservations = showAllReservations 
        ? clientReservations 
        : clientReservations.slice(0, 4)

    const CompactReservationCard = ({ reservation }: { reservation: Reservation }) => {
        const formatDate = (date?: string) => {
            if (!date) return ''
            return format(new Date(date), 'dd MMM yyyy')
        }

        const getStatusStyle = (status: string) => {
            switch (status) {
                case 'confirmed':
                    return 'bg-green-500 text-white hover:bg-green-600'
                case 'pending':
                    return 'bg-yellow-500 text-black hover:bg-yellow-600'
                case 'cancelled':
                    return 'bg-red-500 text-white hover:bg-red-600'
                default:
                    return ''
            }
        }

        return (
            <div className="p-4 hover:bg-accent/50 transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-full",
                                    reservation.type === 'hotel' ? "bg-blue-100" : "bg-red-100"
                                )}>
                                    {reservation.type === 'hotel' ? (
                                        <Bed className={cn(
                                            "h-5 w-5",
                                            "text-blue-600"
                                        )} />
                                    ) : (
                                        <ScissorsIcon className={cn(
                                            "h-5 w-5",
                                            "text-red-600"
                                        )} />
                                    )}
                                </div>
                                <div>
                                    <p className={cn(
                                        "text-sm font-semibold",
                                        reservation.type === 'hotel' ? "text-blue-600" : "text-red-600"
                                    )}>
                                        {reservation.type === 'hotel' ? 'Reserva hotel' : 'Reserva peluquería'}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        {reservation.type === 'hotel' ? (
                                            <>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Entrada: {formatDate(reservation.startDate)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        Salida: {formatDate(reservation.endDate)}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>
                                                        {formatDate(reservation.date)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    <span>{reservation.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span>{reservation.estimatedPrice}€</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className={cn(
                                "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                getStatusStyle(reservation.status)
                            )}>
                                {reservation.status === 'confirmed' ? 'Confirmada' :
                                 reservation.status === 'pending' ? 'Pendiente' : 'Cancelada'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='container mx-auto p-4 max-w-3xl'>
            <AnimatePresence>
                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        className='fixed right-4 top-4 z-50'
                    >
                        <Alert>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>{successMessage}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className='mb-6 flex flex-col items-center justify-between gap-4'>
                <div className='flex w-full items-center justify-between'>
                    <Link to='/frontend/public'>
                        <Button variant='ghost' size='icon'>
                            <ChevronLeft className='h-5 w-5' />
                        </Button>
                    </Link>
                    <h1 className='text-xl font-bold'>{t('clientProfile')}</h1>
                    <Button variant='ghost' size='icon' onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>
                        <Globe className='h-5 w-5' />
                    </Button>
                </div>
                <Button onClick={() => setIsNewReservationModalOpen(true)} className='w-full'>
                    <Plus className='mr-2 h-4 w-4' />
                    {t('newReservation')}
                </Button>
            </div>

            <div className='grid gap-4'>
                <Card>
                    <CardHeader 
                        className='cursor-pointer select-none border-b hover:bg-accent/50 transition-colors'
                        onClick={() => setShowAllReservations(!showAllReservations)}
                    >
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-2">
                                <CardTitle>{t('reservations')}</CardTitle>
                                <Badge variant="outline" className="ml-2">
                                    {clientReservations.length}
                                </Badge>
                            </div>
                            <ChevronDown className={cn(
                                'h-4 w-4 transition-transform duration-200',
                                showAllReservations && 'rotate-180'
                            )} />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {showAllReservations ? (
                                // Vista expandida con tarjetas completas
                                displayedReservations.map(reservation => (
                                    <div key={reservation.id} className="p-4">
                                        <ReservationCard
                                            reservation={reservation}
                                            language={language}
                                            onReservationDeleted={handleReservationDeleted}
                                        />
                                    </div>
                                ))
                            ) : (
                                // Vista compacta con las últimas 4 reservas
                                displayedReservations.map(reservation => (
                                    <CompactReservationCard 
                                        key={reservation.id} 
                                        reservation={reservation}
                                    />
                                ))
                            )}
                        </div>
                        {!showAllReservations && clientReservations.length > 4 && (
                            <div 
                                className="border-t p-2 flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAllReservations(true);
                                }}
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Ver {clientReservations.length - 4} más</span>
                                    <ChevronDown className="h-4 w-4" />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{t('pets')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid gap-4'>
                            {mockPets.map(pet => (
                                <PetCard key={pet.id} pet={pet} language={language} />
                            ))}
                        </div>
                        <Button className='mt-4 w-full'>
                            <Plus className='mr-2 h-4 w-4' />
                            {t('addNewPet')}
                        </Button>
                    </CardContent>
                </Card>

                <button 
                    className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                    onClick={() => setIsEditClientModalOpen(true)}
                >
                    <Card className='hover:bg-accent/50 transition-colors'>
                        <CardHeader>
                            <CardTitle>{t('clientProfile')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div className='grid grid-cols-[100px_1fr] gap-2'>
                                    <span className='text-muted-foreground'>Nombre:</span>
                                    <span>{mockClientDetails.name}</span>
                                </div>
                                <div className='grid grid-cols-[100px_1fr] gap-2'>
                                    <span className='text-muted-foreground'>Teléfono:</span>
                                    <span>{mockClientDetails.phone}</span>
                                </div>
                                <div className='grid grid-cols-[100px_1fr] gap-2'>
                                    <span className='text-muted-foreground'>Email:</span>
                                    <span>{mockClientDetails.email}</span>
                                </div>
                                <div className='grid grid-cols-[100px_1fr] gap-2'>
                                    <span className='text-muted-foreground'>Dirección:</span>
                                    <span>{mockClientDetails.address}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </button>
            </div>

            <NewReservationModal
                isOpen={isNewReservationModalOpen}
                onClose={() => setIsNewReservationModalOpen(false)}
                language={language}
            />

            <Dialog open={isEditClientModalOpen} onOpenChange={setIsEditClientModalOpen}>
                <DialogContent className="w-[95vw] max-w-[425px] p-3">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-base font-medium flex items-center justify-between">
                            {t('editProfile')}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditClientModalOpen(false)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                        <div>
                            <Label className="text-xs">Nombre</Label>
                            <Input
                                value={editedClientDetails.name}
                                onChange={(e) => setEditedClientDetails(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">Teléfono</Label>
                                <Input
                                    value={editedClientDetails.phone}
                                    onChange={(e) => setEditedClientDetails(prev => ({
                                        ...prev,
                                        phone: e.target.value
                                    }))}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">Email</Label>
                                <Input
                                    value={editedClientDetails.email}
                                    onChange={(e) => setEditedClientDetails(prev => ({
                                        ...prev,
                                        email: e.target.value
                                    }))}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">Dirección</Label>
                            <Input
                                value={editedClientDetails.address}
                                onChange={(e) => setEditedClientDetails(prev => ({
                                    ...prev,
                                    address: e.target.value
                                }))}
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 pt-2">
                        <Button
                            onClick={handleSaveClientDetails}
                            className="flex-1 h-8 text-xs font-medium"
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
