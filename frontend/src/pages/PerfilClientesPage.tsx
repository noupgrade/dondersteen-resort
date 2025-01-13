import { format } from 'date-fns'
import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'

import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Bed, ChevronDown, ChevronLeft, Euro, PawPrint, Phone, Plus, Scissors as ScissorsIcon, Truck, X } from 'lucide-react'

import { NewReservationModal } from '@/components/new-reservation-modal.tsx'
import { PetCard } from '@/components/pet-card.tsx'
import { type HairSalonReservation, type HotelReservation, type Client, type Pet } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge.ts'
import { AdditionalService, DriverService, HairdressingService, MedicationService, SpecialCareService, SpecialFoodService } from '@/shared/types/additional-services'
import { Alert, AlertDescription } from '@/shared/ui/alert.tsx'
import { Badge } from '@/shared/ui/badge.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog.tsx'
import { Input } from '@/shared/ui/input.tsx'
import { Label } from '@/shared/ui/label.tsx'

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
        pets: [
            {
                name: 'Max',
                breed: 'Golden Retriever',
                weight: 30,
                size: 'grande',
                sex: 'M'
            },
            {
                name: 'Luna',
                breed: 'Labrador',
                weight: 25,
                size: 'grande',
                sex: 'F'
            },
            {
                name: 'Rocky',
                breed: 'Yorkshire',
                weight: 3,
                size: 'pequeño',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            } as SpecialFoodService,
            {
                type: 'medication',
                petIndex: 1,
                comment: 'Antiinflamatorio cada 12h'
            } as MedicationService,
            {
                type: 'special_care',
                petIndex: 2,
                comment: 'Revisión diaria de oídos'
            } as SpecialCareService,
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'both'
            } as DriverService
        ],
        roomNumber: '101',
        status: 'confirmed',
        totalPrice: 480,
        paymentStatus: 'Pendiente'
    },
    {
        id: '2',
        type: 'peluqueria',
        source: 'external',
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
                services: ['bath_and_brush', 'bath_and_trim', 'spa_ozone']
            } as HairdressingService
        ],
        status: 'confirmed',
        totalPrice: 55,
        paymentStatus: 'Pendiente'
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
        pets: [
            {
                name: 'Toby',
                breed: 'Bulldog Francés',
                weight: 12,
                size: 'mediano',
                sex: 'M'
            },
            {
                name: 'Milo',
                breed: 'Bulldog Francés',
                weight: 11,
                size: 'mediano',
                sex: 'M'
            }
        ],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'frozen'
            } as SpecialFoodService,
            {
                type: 'special_food',
                petIndex: 1,
                foodType: 'frozen'
            } as SpecialFoodService,
            {
                type: 'driver',
                petIndex: 0,
                serviceType: 'pickup'
            } as DriverService
        ],
        roomNumber: '102',
        status: 'cancelled',
        totalPrice: 280,
        paymentStatus: 'Pendiente'
    },
    {
        id: '4',
        type: 'peluqueria',
        source: 'external',
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
                services: ['bath_and_trim', 'deshedding', 'spa']
            } as HairdressingService
        ],
        status: 'propuesta peluqueria',
        totalPrice: 65,
        paymentStatus: 'Pendiente',
        priceNote: 'Propuesta para el servicio de baño, corte, deslanado y spa'
    },
    {
        id: '5',
        type: 'hotel',
        checkInDate: '2024-04-10',
        checkInTime: '10:00',
        checkOutDate: '2024-04-15',
        client: {
            name: 'John Doe',
            phone: '+34 123 456 789',
            email: 'john.doe@example.com'
        },
        pets: [
            {
                name: 'Max',
                breed: 'Golden Retriever',
                weight: 30,
                size: 'grande',
                sex: 'M'
            },
            {
                name: 'Luna',
                breed: 'Labrador',
                weight: 25,
                size: 'grande',
                sex: 'F'
            }
        ],
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            } as SpecialFoodService,
            {
                type: 'medication',
                petIndex: 0,
                comment: 'Antiparasitario día 12'
            } as MedicationService,
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'deshedding']
            } as HairdressingService,
            {
                type: 'hairdressing',
                petIndex: 1,
                services: ['bath_and_brush', 'deshedding']
            } as HairdressingService
        ],
        roomNumber: '103',
        status: 'confirmed',
        totalPrice: 520,
        paymentStatus: 'Pendiente'
    }
] as const

type Language = 'es' | 'en'
type TranslationValue = { [K in Language]: string }
type Translations = { [K: string]: TranslationValue }

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
    // Service translations
    driverPickup: { es: 'Servicio de recogida', en: 'Pickup service' },
    driverDropoff: { es: 'Servicio de entrega', en: 'Dropoff service' },
    driverBoth: { es: 'Servicio de recogida y entrega', en: 'Pickup and dropoff service' },
    specialFood: { es: 'Comida especial', en: 'Special food' },
    refrigerated: { es: 'Refrigerada', en: 'Refrigerated' },
    frozen: { es: 'Congelada', en: 'Frozen' },
    medication: { es: 'Medicación', en: 'Medication' },
    specialCare: { es: 'Cuidados especiales', en: 'Special care' },
    hairdressing: { es: 'Peluquería', en: 'Grooming' },
    bathAndBrush: { es: 'Baño y cepillado', en: 'Bath and brush' },
    bathAndTrim: { es: 'Baño y corte', en: 'Bath and trim' },
    stripping: { es: 'Stripping', en: 'Stripping' },
    deshedding: { es: 'Deslanado', en: 'Deshedding' },
    brushing: { es: 'Cepillado', en: 'Brushing' },
    spa: { es: 'Spa', en: 'Spa' },
    spaOzone: { es: 'Spa con ozono', en: 'Ozone spa' },
    unknownService: { es: 'Servicio desconocido', en: 'Unknown service' },
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
    // Pet edit form
    editPet: { es: 'Editar Mascota', en: 'Edit Pet' },
    breed: { es: 'Raza', en: 'Breed' },
    age: { es: 'Edad', en: 'Age' },
    gender: { es: 'Género', en: 'Gender' },
    food: { es: 'Alimentación', en: 'Food' },
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
    },
    // Transport translations
    transportPickup: { es: 'Recogida', en: 'Pickup' },
    transportDropoff: { es: 'Entrega', en: 'Dropoff' },
    transportBoth: { es: 'Completo', en: 'Complete' },
    dataUpdated: { es: 'Datos actualizados correctamente', en: 'Data updated successfully' },
} as const

const mockClientDetails: Client = {
    id: 'client1',
    name: 'John Doe',
    phone: '+34 123 456 789',
    email: 'john.doe@example.com',
    address: 'Calle Principal 123, 28001 Madrid'
}

const mockPets: Pet[] = [
    {
        id: 'pet1',
        name: 'Max',
        breed: 'Golden Retriever',
        size: 'grande',
        weight: 30,
        sex: 'M',
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 0,
                foodType: 'refrigerated'
            },
            {
                type: 'medication',
                petIndex: 0,
                comment: 'Antiinflamatorio cada 12h'
            },
            {
                type: 'special_care',
                petIndex: 0,
                comment: 'Revisión diaria de articulaciones'
            },
            {
                type: 'hairdressing',
                petIndex: 0,
                services: ['bath_and_brush', 'deshedding', 'spa']
            }
        ]
    },
    {
        id: 'pet2',
        name: 'Luna',
        breed: 'Yorkshire',
        size: 'pequeño',
        weight: 3,
        sex: 'F',
        additionalServices: [
            {
                type: 'special_food',
                petIndex: 1,
                foodType: 'frozen'
            },
            {
                type: 'medication',
                petIndex: 1,
                comment: 'Vitaminas por la mañana'
            },
            {
                type: 'special_care',
                petIndex: 1,
                comment: 'Limpieza de oídos diaria'
            },
            {
                type: 'hairdressing',
                petIndex: 1,
                services: ['bath_and_trim', 'spa_ozone']
            }
        ]
    }
]

export default function ClientProfile() {
    const [isNewReservationModalOpen, setIsNewReservationModalOpen] = useState(false)
    const [language, setLanguage] = useState<Language>('es')
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [clientReservations, setClientReservations] = useState<(HairSalonReservation | HotelReservation)[]>(mockReservations)
    const [showAllReservations, setShowAllReservations] = useState(false)
    const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false)
    const [editedClientDetails, setEditedClientDetails] = useState(mockClientDetails)

    const t = useCallback((key: keyof typeof translations) => {
        const translation = translations[key] as TranslationValue
        return translation[language]
    }, [language])

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

    const CompactReservationCard = useCallback(({ reservation }: { reservation: HairSalonReservation | HotelReservation }) => {
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
                    return service.serviceType === 'pickup' ? t('driverPickup') :
                        service.serviceType === 'dropoff' ? t('driverDropoff') :
                            t('driverBoth')
                case 'special_food':
                    return `${t('specialFood')} (${service.foodType === 'refrigerated' ? t('refrigerated') : t('frozen')})`
                case 'medication':
                    return t('medication') + (service.comment ? `: ${service.comment}` : '')
                case 'special_care':
                    return t('specialCare') + (service.comment ? `: ${service.comment}` : '')
                case 'hairdressing':
                    return t('hairdressing') + ': ' + service.services.map(s => {
                        switch (s) {
                            case 'bath_and_brush': return t('bathAndBrush')
                            case 'bath_and_trim': return t('bathAndTrim')
                            case 'stripping': return t('stripping')
                            case 'deshedding': return t('deshedding')
                            case 'brushing': return t('brushing')
                            case 'spa': return t('spa')
                            case 'spa_ozone': return t('spaOzone')
                            default: return s
                        }
                    }).join(', ')
                default:
                    return t('unknownService')
            }
        }

        const getTransportService = (services: (SpecialFoodService | MedicationService | SpecialCareService | HairdressingService | DriverService)[]) => {
            const transportService = services.find(service => service.type === 'driver') as DriverService | undefined
            if (!transportService) return null

            const getTransportText = () => {
                switch (transportService.serviceType) {
                    case 'pickup': return t('transportPickup')
                    case 'dropoff': return t('transportDropoff')
                    case 'both': return t('transportBoth')
                    default: return ''
                }
            }

            return (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>{getTransportText()}</span>
                </div>
            )
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
                return reservation.pets.map((pet, index) => {
                    const petServices = reservation.additionalServices.filter(service =>
                        service.petIndex === index && service.type !== 'driver'
                    ) as (SpecialFoodService | MedicationService | SpecialCareService | HairdressingService)[]

                    return (
                        <div key={index} className='mb-4 last:mb-0'>
                            <div className='flex items-center text-gray-700 font-semibold mb-2'>
                                <PawPrint className='mr-2 h-4 w-4 text-gray-500' />
                                {pet.name} ({pet.breed})
                            </div>
                            {petServices.length > 0 && (
                                <ul className='ml-6 space-y-1'>
                                    {petServices.map((service, serviceIndex) => (
                                        <li key={serviceIndex} className='text-sm text-gray-600'>
                                            {translateService(service)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )
                })
            } else {
                const petServices = reservation.additionalServices.filter(service =>
                    service.petIndex === 0 && service.type !== 'driver'
                ) as (SpecialFoodService | MedicationService | SpecialCareService | HairdressingService)[]

                return (
                    <div className='mb-4'>
                        <div className='flex items-center text-gray-700 font-semibold mb-2'>
                            <PawPrint className='mr-2 h-4 w-4 text-gray-500' />
                            {reservation.pet.name} ({reservation.pet.breed})
                        </div>
                        {petServices.length > 0 && (
                            <ul className='ml-6 space-y-1'>
                                {petServices.map((service, serviceIndex) => (
                                    <li key={serviceIndex} className='text-sm text-gray-600'>
                                        {translateService(service)}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
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
                            <div className="flex flex-col items-end gap-1">
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
                                {getTransportService(reservation.additionalServices as (SpecialFoodService | MedicationService | SpecialCareService | HairdressingService | DriverService)[])}
                            </div>
                        </div>

                        {isExpanded && (
                            <div className="mt-4">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">{t('pets')}:</h4>
                                        <div className="space-y-2">
                                            {renderPets()}
                                        </div>
                                    </div>

                                    {reservation.totalPrice && (
                                        <div>
                                            <h4 className="font-semibold mb-1">{t('estimatedPrice')}:</h4>
                                            <div className="flex items-center gap-2 text-gray-700">
                                                <Euro className="h-4 w-4 text-gray-500" aria-hidden="true" />
                                                <span>{reservation.totalPrice.toFixed(2)}</span>
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
    }, [t, setClientReservations, setSuccessMessage])

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
            <div className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
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
                                className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8"
                            >
                                <Button
                                    size="lg"
                                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg p-0"
                                    onClick={handleHotelReservation}
                                >
                                    <Bed className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
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
                                className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8"
                            >
                                <Button
                                    size="lg"
                                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-red-500 hover:bg-red-600 shadow-lg p-0"
                                    onClick={handleGroomingReservation}
                                >
                                    <ScissorsIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
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
                                className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8"
                            >
                                <Button
                                    size="lg"
                                    className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg p-0"
                                    onClick={handleCall}
                                >
                                    <Phone className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
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
                        className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-orange-500 hover:bg-orange-600 shadow-lg p-0"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <Plus className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </Button>
                </motion.div>
            </div>
        )
    }

    return (
        <div className='container mx-auto px-4 py-4 pb-24 max-w-3xl'>
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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Link to="/">
                        <Button variant="ghost" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-bold">{t('clientProfile')}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="font-semibold bg-accent hover:bg-accent/80 min-w-[48px]"
                        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
                    >
                        {language === 'es' ? 'EN' : 'ES'}
                    </Button>
                </div>
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
                        {clientReservations.length > 4 && (
                            <div
                                className="border-t p-2 flex items-center justify-center cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowAllReservations(!showAllReservations)
                                }}
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {showAllReservations ? (
                                        <span>{t('showLess')}</span>
                                    ) : (
                                        <span>{t('showMore')} {clientReservations.length - 4} {t('more')}</span>
                                    )}
                                    <ChevronDown className={cn(
                                        "h-4 w-4 transition-transform",
                                        showAllReservations ? "rotate-180" : ""
                                    )} />
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

