import { useState } from 'react'

import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Bed,
    CalendarIcon,
    Check,
    Clock,
    Euro,
    PawPrint,
    Scissors,
    LoaderPinwheelIcon as Spinner,
    X,
    Phone,
} from 'lucide-react'

import { useReservation, type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import { DateRange, SelectRangeEventHandler } from 'react-day-picker'
import { AdditionalService } from '@/shared/types/additional-services'

type Pet = {
    name: string
    breed: string
    size: 'pequeño' | 'mediano' | 'grande'
    weight: number
}

type ReservationStatus =
    | 'pending'
    | 'confirmed'
    | 'completed'
    | 'cancelled'
    | 'propuesta peluqueria'
    | 'servicio solicitado'
    | 'cancelacion solicitada'

type ReservationType = 'peluqueria' | 'hotel'

type Proposal = {
    originalPrice: number
    discountedPrice: number
    message: string
    suggestedDate?: string
    suggestedTime?: string
}

interface Reservation {
    id: string
    type: ReservationType
    date?: string
    time?: string
    startDate?: string
    endDate?: string
    services: AdditionalService[]
    status: ReservationStatus
    estimatedPrice?: number
    pets: Pet[]
    proposal?: Proposal
}

type TranslationKey = 'from' | 'to' | 'services' | 'estimatedPrice' | 'acceptProposal' | 'rejectProposal' |
    'requestCancellation' | 'changeDates' | 'cancel' | 'submit' | 'pets' | 'changeDatesRequested' |
    'processing' | 'awaitingConfirmation' | 'changeDatesSuccess' | 'callGrooming' | 'rejectReason' | 'rejectAndCall'

type Translations = {
    [K in TranslationKey]: {
        es: string
        en: string
    }
}

const translations: Translations = {
    from: { es: 'Desde', en: 'From' },
    to: { es: 'Hasta', en: 'To' },
    services: { es: 'Servicios', en: 'Services' },
    estimatedPrice: { es: 'Precio estimado', en: 'Estimated price' },
    acceptProposal: { es: 'Aceptar propuesta', en: 'Accept proposal' },
    rejectProposal: { es: 'Rechazar propuesta', en: 'Reject proposal' },
    requestCancellation: { es: 'Solicitar cancelación', en: 'Request cancellation' },
    changeDates: { es: 'Cambiar fechas', en: 'Change dates' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
    submit: { es: 'Enviar', en: 'Submit' },
    pets: { es: 'Mascotas', en: 'Pets' },
    changeDatesRequested: { es: 'Cambio de fechas solicitado', en: 'Date change requested' },
    processing: { es: 'Procesando...', en: 'Processing...' },
    awaitingConfirmation: { es: 'En espera de confirmación', en: 'Awaiting confirmation' },
    changeDatesSuccess: {
        es: 'Solicitud de cambio de fechas enviada exitosamente',
        en: 'Date change request submitted successfully',
    },
    callGrooming: { es: 'Llamar a peluquería', en: 'Call grooming service' },
    rejectReason: { es: 'Motivo del rechazo', en: 'Rejection reason' },
    rejectAndCall: { es: 'Rechazar y llamar', en: 'Reject and call' },
}

export function ReservationCard({ reservation, language, onReservationDeleted }: {
    reservation: HairSalonReservation | HotelReservation
    language: 'es' | 'en'
    onReservationDeleted: (id: string) => void
}) {
    const { updateReservation, deleteReservation } = useReservation()
    const [localReservation, setLocalReservation] = useState<HairSalonReservation | HotelReservation>(reservation)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [isChangeDatesDialogOpen, setIsChangeDatesDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [cancelReason, setCancelReason] = useState('')
    const [newDates, setNewDates] = useState<DateRange>({
        from: undefined,
        to: undefined
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const t = (key: TranslationKey) => translations[key][language]

    const handleAcceptProposal = () => {
        if (localReservation.type === 'peluqueria') {
            const updatedReservation: Partial<HairSalonReservation> = {
                status: 'confirmed' as const
            }
            updateReservation(localReservation.id, updatedReservation)
            setLocalReservation({ ...localReservation, status: 'confirmed' as const })
        }
    }

    const handleRejectProposal = () => {
        deleteReservation(localReservation.id)
        onReservationDeleted(localReservation.id)
        setIsRejectDialogOpen(false)
    }

    const handleRequestCancellation = () => {
        if (localReservation.type === 'peluqueria') {
            const updatedReservation: Partial<HairSalonReservation> = {
                status: 'cancelacion solicitada' as const
            }
            updateReservation(localReservation.id, updatedReservation)
            setLocalReservation({ ...localReservation, status: 'cancelacion solicitada' as const })
            setIsCancelDialogOpen(false)
        }
    }

    const handleChangeDates = async () => {
        if (newDates.from && newDates.to && localReservation.type === 'hotel') {
            setIsProcessing(true)
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))

            const startDate = new Date(newDates.from)
            let endDate = new Date(newDates.to)

            // Asegurarse de que la fecha de fin sea al menos un día después de la fecha de inicio
            if (endDate <= startDate) {
                endDate = new Date(startDate)
                endDate.setDate(endDate.getDate() + 1)
            }

            const updatedData: Partial<HotelReservation> = {
                checkInDate: format(startDate, 'yyyy-MM-dd'),
                checkOutDate: format(endDate, 'yyyy-MM-dd'),
                status: 'pending' as const
            }
            updateReservation(localReservation.id, updatedData)
            setLocalReservation({
                ...localReservation,
                checkInDate: updatedData.checkInDate!,
                checkOutDate: updatedData.checkOutDate!,
                status: 'pending' as const
            } as HotelReservation)
            setIsChangeDatesDialogOpen(false)
            setIsProcessing(false)
            setShowSuccessMessage(true)
            setTimeout(() => setShowSuccessMessage(false), 5000)
        }
    }

    const handleDateSelect: SelectRangeEventHandler = (range) => {
        if (range) {
            setNewDates(range)
        }
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return ''
            return format(date, 'dd MMM yyyy')
        } catch (error) {
            console.error('Error formatting date:', error)
            return ''
        }
    }

    const formatTime = (timeString: string) => {
        if (!timeString) return ''
        return timeString
    }

    const translateStatus = (status: string) => {
        const statusTranslations = {
            'propuesta peluqueria': language === 'es' ? 'Propuesta de Peluquería' : 'Grooming Proposal',
            'confirmed': language === 'es' ? 'Confirmada' : 'Confirmed',
            'cancelacion solicitada': language === 'es' ? 'Cancelación Solicitada' : 'Cancellation Requested',
            'pending': language === 'es' ? 'Pendiente' : 'Pending',
            'completed': language === 'es' ? 'Completada' : 'Completed',
            'cancelled': language === 'es' ? 'Cancelada' : 'Cancelled',
            'servicio solicitado': language === 'es' ? 'Servicio Solicitado' : 'Service Requested'
        }
        return statusTranslations[status as keyof typeof statusTranslations] || status
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
                return 'Peluquería: ' + service.services.map(s => {
                    switch (s) {
                        case 'bath_and_brush': return 'Baño y cepillado'
                        case 'bath_and_trim': return 'Baño y corte'
                        case 'stripping': return 'Stripping'
                        case 'deshedding': return 'Deslanado'
                        case 'brushing': return 'Cepillado'
                        case 'spa': return 'Spa'
                        case 'spa_ozone': return 'Spa con ozono'
                        case 'knots': return 'Nudos'
                        case 'extremely_dirty': return 'Extremadamente sucio'
                        default: return s
                    }
                }).join(', ')
            default:
                return 'Servicio desconocido'
        }
    }

    const statusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-500 text-white'
            case 'pending':
                return 'bg-yellow-500 text-black'
            case 'cancelled':
                return 'bg-red-500 text-white'
            case 'propuesta peluqueria':
                return 'bg-black text-white'
            default:
                return 'bg-yellow-500 text-black'
        }
    }

    return (
        <Card className='mb-4 overflow-hidden rounded-lg shadow-md'>
            <CardHeader className='flex flex-col items-start justify-between px-4 pb-2 pt-4 sm:flex-row sm:items-center sm:px-6'>
                <div className='mb-2 flex items-center sm:mb-0'>
                    {localReservation.type === 'peluqueria' ? (
                        <>
                            <Scissors className='mr-2 h-5 w-5 text-pink-500' />
                            <span className='text-lg font-bold text-pink-700'>Reserva de Peluquería</span>
                        </>
                    ) : (
                        <>
                            <Bed className='mr-2 h-5 w-5 text-blue-500' />
                            <span className='text-lg font-bold text-blue-700'>Hotel Reserva</span>
                        </>
                    )}
                </div>
                <Badge className={`${statusColor(localReservation.status)} whitespace-nowrap`}>
                    {translateStatus(localReservation.status)}
                </Badge>
            </CardHeader>
            <CardContent className='px-4 pt-4 sm:px-6'>
                <div className='space-y-4'>
                    <div className='flex flex-col gap-1'>
                        {localReservation.type === 'peluqueria' ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span>{formatDate(localReservation.date)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span>{formatTime(localReservation.time)}</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span>
                                        {t('from')} {formatDate(localReservation.checkInDate)} {t('to')}{' '}
                                        {formatDate(localReservation.checkOutDate)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <h4 className='font-semibold mb-1'>{t('services')}:</h4>
                        <ul className='list-disc list-inside'>
                            {localReservation.additionalServices.map((service, index) => (
                                <li key={index} className='text-gray-700'>
                                    {translateService(service)}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className='font-semibold mb-1'>{t('pets')}:</h4>
                        <ul className='list-inside'>
                            {localReservation.type === 'peluqueria' ? (
                                <li className='flex items-center text-gray-700'>
                                    <PawPrint className='mr-2 h-4 w-4 text-gray-500' />
                                    {localReservation.pet.name} ({localReservation.pet.breed})
                                </li>
                            ) : (
                                localReservation.pets.map((pet, index) => (
                                    <li key={index} className='flex items-center text-gray-700'>
                                        <PawPrint className='mr-2 h-4 w-4 text-gray-500' />
                                        {pet.name} ({pet.breed})
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    {localReservation.totalPrice && (
                        <div>
                            <h4 className='font-semibold mb-1'>{t('estimatedPrice')}:</h4>
                            <div className="flex items-center gap-2">
                                <Euro className='h-4 w-4 text-gray-500' />
                                <span>€{localReservation.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    {localReservation.type === 'peluqueria' && 
                     localReservation.status === 'propuesta peluqueria' && 
                     localReservation.priceNote && (
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <p className="text-sm text-yellow-800 mb-2">{localReservation.priceNote}</p>
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-yellow-800">
                                    <span className="font-bold">{localReservation.totalPrice}€</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className='flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4'>
                        {localReservation.type === 'peluqueria' && 
                         localReservation.status === 'propuesta peluqueria' && (
                            <>
                                <Button
                                    onClick={handleAcceptProposal}
                                    className='w-full bg-green-500 hover:bg-green-600 text-white sm:w-auto'
                                >
                                    <Check className='mr-2 h-4 w-4' />
                                    {t('acceptProposal')}
                                </Button>
                                <Button
                                    variant='outline'
                                    onClick={() => setIsRejectDialogOpen(true)}
                                    className='w-full border-red-500 text-red-500 hover:bg-red-50 sm:w-auto'
                                >
                                    <X className='mr-2 h-4 w-4' />
                                    {t('rejectProposal')}
                                </Button>
                            </>
                        )}
                        {localReservation.status === 'confirmed' && (
                            <>
                                <Button
                                    variant='outline'
                                    onClick={() => setIsCancelDialogOpen(true)}
                                    className='w-full border-red-500 text-red-500 hover:bg-red-50 sm:w-auto'
                                >
                                    {t('requestCancellation')}
                                </Button>
                                {localReservation.type === 'hotel' && (
                                    <Button
                                        variant='outline'
                                        onClick={() => setIsChangeDatesDialogOpen(true)}
                                        className='w-full border-blue-500 text-blue-500 hover:bg-blue-50 sm:w-auto'
                                    >
                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                        {t('changeDates')}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </CardContent>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{t('rejectProposal')}</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="outline"
                            className="w-full bg-gray-100 hover:bg-gray-200"
                            onClick={() => {
                                window.location.href = 'tel:+34666777888'
                            }}
                        >
                            <Phone className="mr-2 h-4 w-4" />
                            {t('callGrooming')}
                        </Button>
                        <Button
                            variant="destructive"
                            className="w-full"
                            onClick={handleRejectProposal}
                        >
                            <X className="mr-2 h-4 w-4" />
                            {t('rejectProposal')}
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsRejectDialogOpen(false)}
                        >
                            {t('cancel')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className='p-4 sm:max-w-[425px] sm:p-6'>
                    <DialogHeader>
                        <DialogTitle>{t('requestCancellation')}</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        placeholder={t('requestCancellation')}
                        value={cancelReason}
                        onChange={e => setCancelReason(e.target.value)}
                        className='min-h-[100px]'
                    />
                    <div className='mt-4 flex flex-col justify-end gap-2 sm:flex-row sm:gap-4'>
                        <Button
                            variant='outline'
                            onClick={() => setIsCancelDialogOpen(false)}
                            className='w-full sm:w-auto'
                        >
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleRequestCancellation} className='w-full sm:w-auto'>
                            {t('submit')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isChangeDatesDialogOpen} onOpenChange={setIsChangeDatesDialogOpen}>
                <DialogContent className='p-4 sm:max-w-[425px] sm:p-6'>
                    <DialogHeader>
                        <DialogTitle className='flex items-center'>
                            <CalendarIcon className='mr-2 h-5 w-5' />
                            {t('changeDates')}
                        </DialogTitle>
                    </DialogHeader>
                    <div className='mt-4 max-w-full overflow-hidden'>
                        <Calendar
                            mode='range'
                            selected={newDates}
                            onSelect={handleDateSelect}
                            numberOfMonths={1}
                            disabled={date => date < new Date()}
                            className='mx-auto w-full max-w-[350px] rounded-md border'
                        />
                    </div>
                    <div className='mt-4 flex flex-col justify-end gap-2 sm:flex-row sm:gap-4'>
                        <Button
                            variant='outline'
                            onClick={() => setIsChangeDatesDialogOpen(false)}
                            className='w-full bg-gray-200 text-gray-800 sm:w-auto'
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            onClick={handleChangeDates}
                            disabled={!newDates.from || !newDates.to || isProcessing}
                            className='w-full bg-blue-500 text-white hover:bg-blue-600 sm:w-auto'
                        >
                            {isProcessing ? (
                                <>
                                    <Spinner className='mr-2 h-4 w-4 animate-spin' />
                                    {t('processing')}
                                </>
                            ) : (
                                t('submit')
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            <AnimatePresence>
                {showSuccessMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        transition={{ duration: 0.3 }}
                        className='fixed right-4 top-4 z-50'
                    >
                        <Alert variant="destructive">
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>{t('changeDatesSuccess')}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
export type { Reservation }

