import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ChevronLeft, Globe, Plus, ChevronDown, Calendar, Clock, Bed, Scissors as ScissorsIcon, X, PawPrint, Euro, Phone } from 'lucide-react'

import { ClientDetailsCard } from '@/components/client-details-card.tsx'
import { NewReservationModal } from '@/components/new-reservation-modal.tsx'
import { PetCard } from '@/components/pet-card.tsx'
import { type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'
import { ReservationCard } from '@/components/reservation-card.tsx'
import { Alert, AlertDescription } from '@/shared/ui/alert.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { cn } from '@/shared/lib/styles/class-merge.ts'
import { Badge } from '@/shared/ui/badge.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog.tsx'
import { Label } from '@/shared/ui/label.tsx'
import { Input } from '@/shared/ui/input.tsx'
import { AdditionalService } from '@/shared/types/additional-services'

const mockReservations: (HairSalonReservation | HotelReservation)[] = [
    {
        id: '1',
        type: 'hotel',
        checkInDate: '2024-03-01',
        checkInTime: '14:00',
        checkOutDate: '2024-03-05',
        client: {
            name: 'John Doe',
            phone: '+34 123 456 789',
            email: 'john.doe@example.com'
        },
        pets: [{
            name: 'Max',
            breed: 'Golden Retriever',
            weight: 30,
            size: 'grande',
            sex: 'M'
        }],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            }
        ],
        roomNumber: '101',
        status: 'confirmed',
        totalPrice: 240,
        paymentStatus: 'Pendiente'
    },
    {
        id: '2',
        type: 'peluqueria',
        date: '2024-03-15',
        time: '14:00',
        client: {
            name: 'John Doe',
            phone: '+34 123 456 789',
            email: 'john.doe@example.com'
        },
        pet: {
            name: 'Luna',
            breed: 'Yorkshire',
            weight: 3,
            size: 'pequeño'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'bath_and_trim']
            }
        ],
        status: 'confirmed',
        totalPrice: 35,
        paymentStatus: 'Pendiente',
        source: 'external'
    },
    {
        id: '3',
        type: 'hotel',
        checkInDate: '2024-03-25',
        checkInTime: '14:00',
        checkOutDate: '2024-03-28',
        client: {
            name: 'John Doe',
            phone: '+34 123 456 789',
            email: 'john.doe@example.com'
        },
        pets: [{
            name: 'Max',
            breed: 'Golden Retriever',
            weight: 30,
            size: 'grande',
            sex: 'M'
        }],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            }
        ],
        roomNumber: '102',
        status: 'cancelled',
        totalPrice: 180,
        paymentStatus: 'Pendiente'
    },
    {
        id: '4',
        type: 'peluqueria',
        date: '2024-04-01',
        time: '11:00',
        client: {
            name: 'John Doe',
            phone: '+34 123 456 789',
            email: 'john.doe@example.com'
        },
        pet: {
            name: 'Luna',
            breed: 'Yorkshire',
            weight: 3,
            size: 'pequeño'
        },
        additionalServices: [
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_trim', 'deshedding']
            }
        ],
        status: 'propuesta peluqueria',
        totalPrice: 45,
        paymentStatus: 'Pendiente',
        source: 'external',
        priceNote: 'Propuesta para el servicio de baño, corte y deslanado'
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
    accept: { es: 'Aceptar', en: 'Accept' },
    reject: { es: 'Rechazar', en: 'Reject' },
    // Status translations
    confirmed: { es: 'Confirmada', en: 'Confirmed' },
    cancelled: { es: 'Cancelada', en: 'Cancelled' },
    pending: { es: 'Pendiente', en: 'Pending' },
    proposal: { es: 'Propuesta', en: 'Proposal' },
    // Generic translations
    hotelReservation: { es: 'Hotel Reserva', en: 'Hotel Reservation' },
    groomingReservation: { es: 'Reserva de Peluquería', en: 'Grooming Reservation' },
    services: { es: 'Servicios', en: 'Services' },
    estimatedPrice: { es: 'Precio estimado', en: 'Estimated price' },
    from: { es: 'Desde', en: 'From' },
    to: { es: 'Hasta', en: 'To' },
    acceptProposal: { es: 'Aceptar propuesta', en: 'Accept proposal' },
    rejectProposal: { es: 'Rechazar propuesta', en: 'Reject proposal' },
    showMore: { es: 'Ver', en: 'Show' },
    more: { es: 'más', en: 'more' },
    // Form labels
    name: { es: 'Nombre', en: 'Name' },
    phone: { es: 'Teléfono', en: 'Phone' },
    email: { es: 'Email', en: 'Email' },
    address: { es: 'Dirección', en: 'Address' },
    // Success messages
    dataUpdated: { es: 'Datos actualizados correctamente', en: 'Data updated successfully' },
    // Pet edit form
    editPet: { es: 'Editar Mascota', en: 'Edit Pet' },
    breed: { es: 'Raza', en: 'Breed' },
    age: { es: 'Edad', en: 'Age' },
    gender: { es: 'Género', en: 'Gender' },
    food: { es: 'Alimentación', en: 'Food' },
    medication: { es: 'Medicación', en: 'Medication' },
    habits: { es: 'Hábitos', en: 'Habits' },
    personality: { es: 'Personalidad', en: 'Personality' },
    comments: { es: 'Comentarios', en: 'Comments' },
    proposalAccepted: { es: 'Propuesta aceptada correctamente', en: 'Proposal accepted successfully' },
    proposalRejected: { es: 'Propuesta rechazada', en: 'Proposal rejected' },
    rejectProposalTitle: { es: 'Rechazar Propuesta', en: 'Reject Proposal' },
    rejectProposalConfirm: { es: '¿Estás seguro de que quieres rechazar esta propuesta?', en: 'Are you sure you want to reject this proposal?' },
    yes: { es: 'Sí', en: 'Yes' },
    no: { es: 'No', en: 'No' },
    callEstablishment: { es: 'Llamar al establecimiento', en: 'Call establishment' },
    quickActions: {
        hotelReservation: { es: 'Reserva hotel', en: 'Hotel booking' },
        groomingReservation: { es: 'Reserva peluquería', en: 'Grooming booking' },
        call: { es: 'Llamar', en: 'Call' }
    }
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

    const t = (key: TranslationKey): string => translations[key][language]

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
        setSuccessMessage(t('dataUpdated'))
    }

    const displayedReservations = showAllReservations
        ? clientReservations
        : clientReservations.slice(0, 4)

    const CompactReservationCard = ({ reservation }: { reservation: HairSalonReservation | HotelReservation }) => {
        const [isExpanded, setIsExpanded] = useState(false)
        const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

        const formatDate = (date?: string) => {
            if (!date) return ''
            return format(new Date(date), 'dd MMM yyyy')
        }

        const getStatusStyle = (status: string) => {
            switch (status) {
                case 'confirmed':
                    return 'bg-green-500 text-white'
                case 'pending':
                    return 'bg-yellow-500 text-black'
                case 'cancelled':
                    return 'bg-red-500 text-white'
                case 'propuesta peluqueria':
                    return 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                default:
                    return 'bg-yellow-500 text-black'
            }
        }

        const handleAcceptProposal = () => {
            if (reservation.type === 'peluqueria' && reservation.status === 'propuesta peluqueria') {
                const updatedReservation = {
                    ...reservation,
                    status: 'confirmed' as const
                }
                setClientReservations(prev => 
                    prev.map(res => res.id === reservation.id ? updatedReservation : res)
                )
                setSuccessMessage(t('proposalAccepted'))
            }
        }

        const handleRejectProposal = () => {
            if (reservation.type === 'peluqueria' && reservation.status === 'propuesta peluqueria') {
                setClientReservations(prev => prev.filter(res => res.id !== reservation.id))
                setSuccessMessage(t('proposalRejected'))
                setIsRejectDialogOpen(false)
            }
        }

        const translateService = (service: AdditionalService) => {
            switch (service.type) {
                case 'driver':
                    return `Chofer (${service.serviceType === 'pickup' ? 'Recogida' : service.serviceType === 'dropoff' ? 'Entrega' : 'Recogida y entrega'})`
                case 'special_food':
                    return `Comida especial (${service.foodType === 'refrigerated' ? 'Refrigerada' : 'Congelada'})`
                case 'medication':
                    return 'Medicación' + (service.comment ? `: ${service.comment}` : '')
                case 'special_care':
                    return 'Curas' + (service.comment ? `: ${service.comment}` : '')
                case 'hairdressing':
                    return 'Peluquería: ' + service.services.map((s: string) => {
                        switch (s) {
                            case 'bath_and_brush': return 'Baño y cepillado'
                            case 'bath_and_trim': return 'Baño y corte'
                            case 'stripping': return 'Stripping'
                            case 'deshedding': return 'Deslanado'
                            case 'brushing': return 'Cepillado'
                            case 'spa': return 'Spa'
                            case 'spa_ozone': return 'Spa con ozono'
                            default: return s
                        }
                    }).join(', ')
                default:
                    return 'Servicio desconocido'
            }
        }

        const renderDates = () => {
            if (reservation.type === 'hotel') {
                return (
                    <>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <span className="flex items-center">
                                {t('from')} {formatDate(reservation.checkInDate)}
                            </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <span className="flex items-center">
                                {t('to')} {formatDate(reservation.checkOutDate)}
                            </span>
                        </div>
                    </>
                )
            } else {
                return (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatDate(reservation.date)}</span>
                        <span>{reservation.time}</span>
                    </div>
                )
            }
        }

        const renderPets = () => {
            if (reservation.type === 'hotel') {
                return reservation.pets.map((pet, index) => (
                    <li key={index} className='flex items-center text-gray-700'>
                        <PawPrint className='mr-2 h-4 w-4 text-gray-500' />
                        {pet.name} ({pet.breed})
                    </li>
                ))
            } else {
                return (
                    <li className='flex items-center text-gray-700'>
                        <PawPrint className='mr-2 h-4 w-4 text-gray-500' />
                        {reservation.pet.name} ({reservation.pet.breed})
                    </li>
                )
            }
        }

        return (
            <>
                <div className="p-4 hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
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
                                        {reservation.type === 'hotel' ? t('hotelReservation') : t('groomingReservation')}
                                    </p>
                                    <div className="flex flex-col gap-1 mt-1">
                                        {renderDates()}
                                    </div>
                                </div>
                            </div>
                            <Badge className={cn(
                                getStatusStyle(reservation.status),
                                "px-2 py-0.5 text-xs font-medium whitespace-nowrap"
                            )}>
                                {reservation.status === 'propuesta peluqueria' ? t('proposal') :
                                 reservation.status === 'confirmed' ? t('confirmed') :
                                 reservation.status === 'cancelled' ? t('cancelled') :
                                 reservation.status === 'pending' ? t('pending') :
                                 reservation.status}
                            </Badge>
                        </div>

                        {isExpanded && (
                            <div className="mt-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-1">{t('services')}:</h4>
                                        <ul className="list-disc list-inside">
                                            {reservation.additionalServices.map((service, index) => (
                                                <li key={index} className="text-gray-700">
                                                    {translateService(service)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-1">{t('pets')}:</h4>
                                        <ul className="list-inside">
                                            {renderPets()}
                                        </ul>
                                    </div>

                                    {reservation.totalPrice && (
                                        <div>
                                            <h4 className="font-semibold mb-1">{t('estimatedPrice')}:</h4>
                                            <div className="flex items-center gap-2">
                                                <Euro className="h-4 w-4 text-gray-500" />
                                                <span>€{reservation.totalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    )}

                                    {reservation.type === 'peluqueria' && 
                                     reservation.status === 'propuesta peluqueria' && 
                                     reservation.priceNote && (
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <div className="flex flex-col gap-2">
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAcceptProposal()
                                                    }}
                                                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                                                >
                                                    {t('acceptProposal')}
                                                </Button>
                                                <Button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setIsRejectDialogOpen(true)
                                                    }}
                                                    variant="outline"
                                                    className="w-full border-red-500 text-red-500 hover:bg-red-50"
                                                >
                                                    {t('rejectProposal')}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                    <DialogContent className='w-[95vw] max-w-[425px] p-4 sm:p-6'>
                        <DialogHeader>
                            <DialogTitle>{t('rejectProposalTitle')}</DialogTitle>
                        </DialogHeader>
                        <p className='py-2'>{t('rejectProposalConfirm')}</p>
                        <div className='mt-4 flex flex-col gap-2'>
                            <Button className='w-full' variant='destructive' onClick={handleRejectProposal}>
                                {t('yes')}
                            </Button>
                            <Button 
                                className='w-full' 
                                variant='outline' 
                                onClick={() => {
                                    window.location.href = 'tel:+34666777888'
                                    setIsRejectDialogOpen(false)
                                }}
                            >
                                {t('callEstablishment')}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    const FloatingActionButton = () => {
        const [isOpen, setIsOpen] = useState(false)

        const handleHotelReservation = () => {
            setIsOpen(false)
            setIsNewReservationModalOpen(true)
        }

        const handleGroomingReservation = () => {
            setIsOpen(false)
            setIsNewReservationModalOpen(true)
        }

        const handleCall = () => {
            window.location.href = 'tel:+34666777888'
        }

        return (
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/20"
                                onClick={() => setIsOpen(false)}
                            />
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    x: -70,
                                    y: -70,
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute bottom-7 right-7"
                            >
                                <Button
                                    size="lg"
                                    className="h-14 w-14 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg p-0"
                                    onClick={handleHotelReservation}
                                >
                                    <Bed className="h-6 w-6 text-white" />
                                </Button>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    y: -100,
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2, delay: 0.05 }}
                                className="absolute bottom-7 right-7"
                            >
                                <Button
                                    size="lg"
                                    className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 shadow-lg p-0"
                                    onClick={handleGroomingReservation}
                                >
                                    <ScissorsIcon className="h-6 w-6 text-white" />
                                </Button>
                            </motion.div>
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ 
                                    scale: 1, 
                                    opacity: 1,
                                    x: -100,
                                }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                                className="absolute bottom-7 right-7"
                            >
                                <Button
                                    size="lg"
                                    className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg p-0"
                                    onClick={handleCall}
                                >
                                    <Phone className="h-6 w-6 text-white" />
                                </Button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
                <motion.div
                    animate={{ rotate: isOpen ? 135 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <Button
                        size="lg"
                        className="h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg p-0"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Plus className="h-6 w-6 text-white" />
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className='container mx-auto p-4 max-w-3xl'>
            <FloatingActionButton />
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
                        className='border-b'
                    >
                        <div className='flex items-center justify-between'>
                            <div className="flex items-center gap-2">
                                <CardTitle>{t('reservations')}</CardTitle>
                                <Badge variant="outline" className="ml-2">
                                    {clientReservations.length}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {displayedReservations.map(reservation => (
                                <CompactReservationCard
                                    key={reservation.id}
                                    reservation={reservation}
                                />
                            ))}
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
                                    <span>{t('showMore')} {clientReservations.length - 4} {t('more')}</span>
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
                                    <span className='text-muted-foreground'>{t('name')}:</span>
                                    <span>{mockClientDetails.name}</span>
                                </div>
                                <div className='grid grid-cols-[100px_1fr] gap-2'>
                                    <span className='text-muted-foreground'>{t('phone')}:</span>
                                    <span>{mockClientDetails.phone}</span>
                                </div>
                                <div className='grid grid-cols-[100px_1fr] gap-2'>
                                    <span className='text-muted-foreground'>{t('email')}:</span>
                                    <span>{mockClientDetails.email}</span>
                                </div>
                                <div className='grid grid-cols-[100px_1fr] gap-2'>
                                    <span className='text-muted-foreground'>{t('address')}:</span>
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
                            <Label className="text-xs">{t('name')}</Label>
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
                                <Label className="text-xs">{t('phone')}</Label>
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
                                <Label className="text-xs">{t('email')}</Label>
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
                            <Label className="text-xs">{t('address')}</Label>
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
                            {t('save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

