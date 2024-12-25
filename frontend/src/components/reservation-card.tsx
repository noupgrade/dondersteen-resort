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
} from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

type Pet = {
    name: string
    breed: string
}

type ReservationCardProps = {
    reservation: {
        id: string
        type: 'grooming' | 'hotel'
        date?: string
        time?: string
        startDate?: string
        endDate?: string
        services: string[]
        status: string
        estimatedPrice?: number
        pets: Pet[]
    }
    language: 'es' | 'en'
    onReservationDeleted: (id: string) => void
}

const translations = {
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
}

export function ReservationCard({ reservation, language, onReservationDeleted }: ReservationCardProps) {
    const { updateReservation, deleteReservation } = useReservation()
    const [localReservation, setLocalReservation] = useState(reservation)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
    const [isChangeDatesDialogOpen, setIsChangeDatesDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState('')
    const [cancelReason, setCancelReason] = useState('')
    const [newDates, setNewDates] = useState<{ from: Date | undefined; to: Date | undefined }>({
        from: undefined,
        to: undefined,
    })
    const [isProcessing, setIsProcessing] = useState(false)
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    const t = (key: string) => translations[key][language]

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, 'dd/MM/yyyy')
    }

    const formatTime = (timeString: string) => {
        return timeString
    }

    const translateStatus = (status: string) => {
        // Add translations for status if needed
        return status
    }

    const translateService = (service: string) => {
        // Add translations for services if needed
        return service
    }

    const statusColor = localReservation.status.toLowerCase().includes('confirmada') ? 'bg-green-500' : 'bg-yellow-500'

    const handleAcceptProposal = () => {
        updateReservation(localReservation.id, { ...localReservation, status: 'Confirmada' })
        setLocalReservation({ ...localReservation, status: 'Confirmada' })
    }

    const handleRejectProposal = () => {
        deleteReservation(localReservation.id)
        onReservationDeleted(localReservation.id)
        setIsRejectDialogOpen(false)
    }

    const handleRequestCancellation = () => {
        updateReservation(localReservation.id, { ...localReservation, status: 'Cancelación Solicitada' })
        setLocalReservation({ ...localReservation, status: 'Cancelación Solicitada' })
        setIsCancelDialogOpen(false)
    }

    const handleChangeDates = async () => {
        if (newDates.from && newDates.to) {
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

            const updatedReservation = {
                ...localReservation,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                status: 'Cambio de fechas solicitado',
            }
            updateReservation(localReservation.id, updatedReservation)
            setLocalReservation(updatedReservation)
            setIsChangeDatesDialogOpen(false)
            setIsProcessing(false)
            setShowSuccessMessage(true)
            setTimeout(() => setShowSuccessMessage(false), 5000)
        }
    }

    return (
        <Card className='mb-4 overflow-hidden rounded-lg shadow-md'>
            <CardHeader className='flex flex-col items-start justify-between px-4 pb-2 pt-4 sm:flex-row sm:items-center sm:px-6'>
                <div className='mb-2 flex items-center sm:mb-0'>
                    {localReservation.type === 'grooming' ? (
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
                <Badge className={`${statusColor} whitespace-nowrap`}>{translateStatus(localReservation.status)}</Badge>
            </CardHeader>
            <CardContent className='px-4 pt-4 sm:px-6'>
                <div className='mb-4'>
                    {localReservation.type === 'grooming' ? (
                        <p className='flex flex-col text-base font-bold sm:flex-row sm:items-center sm:text-lg'>
                            <span className='mb-2 flex items-center sm:mb-0'>
                                <CalendarIcon className='mr-2 h-5 w-5 text-gray-500' />
                                {formatDate(localReservation.date!)}
                            </span>
                            <span className='flex items-center sm:ml-4'>
                                <Clock className='mr-2 h-5 w-5 text-gray-500' />
                                {formatTime(localReservation.time!)}
                            </span>
                        </p>
                    ) : (
                        <p className='flex flex-col text-base font-bold sm:flex-row sm:items-center sm:text-lg'>
                            <CalendarIcon className='mr-2 h-5 w-5 text-gray-500' />
                            <span>
                                {t('from')} {formatDate(localReservation.startDate!)} {t('to')}{' '}
                                {formatDate(localReservation.endDate!)}
                            </span>
                        </p>
                    )}
                </div>
                <div className='mb-4'>
                    <h4 className='mb-2 font-semibold'>{t('services')}:</h4>
                    <ul className='list-inside list-disc'>
                        {localReservation.services.map((service, index) => (
                            <li key={index} className='text-gray-700'>
                                {translateService(service)}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className='mb-4'>
                    <h4 className='mb-2 font-semibold'>{t('pets')}:</h4>
                    <ul className='list-inside list-disc'>
                        {localReservation.pets.map((pet, index) => (
                            <li key={index} className='flex items-center text-gray-700'>
                                <PawPrint className='mr-2 h-4 w-4 text-gray-500' />
                                {pet.name} ({pet.breed})
                            </li>
                        ))}
                    </ul>
                </div>
                {localReservation.estimatedPrice && (
                    <div className='mb-4 flex items-center'>
                        <Euro className='mr-2 h-5 w-5 text-gray-500' />
                        <span className='font-semibold'>{t('estimatedPrice')}:</span>
                        <span className='ml-2'>€{localReservation.estimatedPrice.toFixed(2)}</span>
                    </div>
                )}
                <div className='mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-4'>
                    {localReservation.status.toLowerCase().includes('propuesta') && (
                        <>
                            <Button
                                onClick={handleAcceptProposal}
                                className='w-full bg-green-500 hover:bg-green-600 sm:w-auto'
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
                    {localReservation.status.toLowerCase().includes('confirmada') && (
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
                {localReservation.status.toLowerCase() === 'cambio de fechas solicitado' && (
                    <Badge variant='warning' className='mt-2 flex w-full items-center justify-center sm:w-auto'>
                        <AlertCircle className='mr-2 h-4 w-4' />
                        {t('changeDatesRequested')} - {t('awaitingConfirmation')}
                    </Badge>
                )}
            </CardContent>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className='p-4 sm:max-w-[425px] sm:p-6'>
                    <DialogHeader>
                        <DialogTitle>{t('rejectProposal')}</DialogTitle>
                    </DialogHeader>
                    <Textarea
                        placeholder={t('rejectProposal')}
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        className='min-h-[100px]'
                    />
                    <div className='mt-4 flex flex-col justify-end gap-2 sm:flex-row sm:gap-4'>
                        <Button
                            variant='outline'
                            onClick={() => setIsRejectDialogOpen(false)}
                            className='w-full sm:w-auto'
                        >
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleRejectProposal} className='w-full sm:w-auto'>
                            {t('submit')}
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
                            onSelect={setNewDates}
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
                        <Alert variant='success'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>{t('changeDatesSuccess')}</AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    )
}
