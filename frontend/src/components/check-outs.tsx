'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { format } from 'date-fns'
import { Calendar, Clock, DollarSign, PawPrint, Scissors, Truck } from 'lucide-react'

import { useReservation, useTodayCheckOuts } from '@/components/ReservationContext'
import { InvoiceModal } from '@/features/invoice/ui/InvoiceModal'
import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { type HotelReservation } from '@monorepo/functions/src/types/reservations'

type CheckOut = {
    id: string
    clientName: string
    clientPhone: string
    clientEmail: string
    pets: Array<{
        name: string
        breed: string
        size: 'pequeño' | 'mediano' | 'grande'
        weight: number
        sex: 'M' | 'H'
        isNeutered: boolean
    }>
    roomNumber: string
    checkInDate: string
    checkOutDate: string
    paymentStatus: 'Pagado' | 'Pendiente'
    totalAmount: number
    additionalServices: Array<{
        type: string
        petIndex: number
        services?: string[]
        serviceType?: 'pickup' | 'dropoff' | 'both'
        foodType?: 'refrigerated' | 'frozen'
        comment?: string
    }>
}

export function CheckOuts() {
    const navigate = useNavigate()
    const { updateReservation } = useReservation()
    const { reservations: todayCheckOuts, isLoading } = useTodayCheckOuts()
    const [confirmedCheckOuts, setConfirmedCheckOuts] = useState<string[]>([])
    const [selectedReservation, setSelectedReservation] = useState<HotelReservation | null>(null)
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
    const [checkoutReservation, setCheckoutReservation] = useState<HotelReservation | null>(null)

    // Map check-outs to the expected format
    const checkOuts: CheckOut[] = todayCheckOuts.map(r => ({
        id: r.id,
        clientName: r.client.name,
        clientPhone: r.client.phone,
        clientEmail: r.client.email,
        pets: r.pets || [],
        checkInDate: r.checkInDate,
        checkOutDate: r.checkOutDate,
        paymentStatus: (r.paymentStatus as 'Pagado' | 'Pendiente') || 'Pendiente',
        totalAmount: r.totalPrice || 0,
        additionalServices: r.additionalServices || [],
    }))

    const handleConfirmCheckOut = (id: string) => {
        const reservation = todayCheckOuts.find(r => r.id === id)
        if (reservation) {
            setCheckoutReservation(reservation)
            setIsInvoiceOpen(true)
        }
    }

    const handlePaymentAndCheckOut = (id: string) => {
        const reservation = todayCheckOuts.find(r => r.id === id)
        if (reservation) {
            setCheckoutReservation(reservation)
            setIsInvoiceOpen(true)
        }
    }

    const handleViewDetails = (id: string) => {
        const reservation = todayCheckOuts.find(r => r.id === id)
        if (reservation) {
            setSelectedReservation(reservation)
            setIsViewerOpen(true)
        }
    }

    const handleCloseViewer = () => {
        setIsViewerOpen(false)
        setSelectedReservation(null)
    }

    const handleCloseInvoice = () => {
        setIsInvoiceOpen(false)
        setCheckoutReservation(null)
    }

    const handlePrintAndPay = () => {
        if (checkoutReservation) {
            updateReservation(checkoutReservation.id, { status: 'cancelled', paymentStatus: 'Pagado' })
            setConfirmedCheckOuts([...confirmedCheckOuts, checkoutReservation.id])
            handleCloseInvoice()
        }
    }

    const handlePrint = () => {
        handleCloseInvoice()
    }

    const handlePaid = () => {
        if (checkoutReservation) {
            updateReservation(checkoutReservation.id, { status: 'cancelled', paymentStatus: 'Pagado' })
            setConfirmedCheckOuts([...confirmedCheckOuts, checkoutReservation.id])
            handleCloseInvoice()
        }
    }

    if (isLoading) {
        return <div className='py-8 text-center text-muted-foreground'>Cargando check-outs...</div>
    }

    if (checkOuts.length === 0) {
        return (
            <Alert variant='info' className='mt-2'>
                <Calendar className='h-4 w-4' />
                <AlertTitle>Sin check-outs</AlertTitle>
                <AlertDescription>No hay salidas programadas para el día de hoy.</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className='space-y-4'>
            {checkOuts.map(checkOut => (
                <Card key={checkOut.id} className='overflow-hidden'>
                    <div className='flex'>
                        <div className='flex w-64 shrink-0 flex-col justify-between space-y-6 bg-[#4B6BFB]/5 p-6'>
                            <div className='space-y-6'>
                                <div>
                                    <CardTitle className='text-lg font-semibold'>{checkOut.clientName}</CardTitle>
                                    <div className='mt-1 space-y-1 text-sm text-muted-foreground'>
                                        <p>{checkOut.clientPhone}</p>
                                        <p>{checkOut.clientEmail}</p>
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <Clock className='h-4 w-4' />
                                        <span className='text-sm text-muted-foreground'>Check-out: 12:00</span>
                                    </div>
                                    {checkOut.additionalServices.some(
                                        service =>
                                            service.type === 'driver' &&
                                            (service.serviceType === 'dropoff' || service.serviceType === 'both'),
                                    ) && (
                                        <div className='flex items-center gap-2'>
                                            <Truck className='h-4 w-4 text-[#4B6BFB]' />
                                            <span className='text-sm text-muted-foreground'>
                                                {checkOut.additionalServices.find(service => service.type === 'driver')
                                                    ?.serviceType === 'both'
                                                    ? 'Recogida y entrega'
                                                    : 'Entrega'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Badge
                                variant={checkOut.paymentStatus === 'Pagado' ? 'default' : 'destructive'}
                                className='w-fit'
                            >
                                {checkOut.paymentStatus}
                            </Badge>
                        </div>

                        <CardContent className='flex-1 p-6'>
                            <div className='flex h-full flex-col'>
                                <div className='flex-grow space-y-6'>
                                    {/* Mascotas y sus servicios */}
                                    {checkOut.pets.map((pet, petIndex) => {
                                        // Filtrar servicios para esta mascota
                                        const petServices = checkOut.additionalServices.filter(
                                            service => service.petIndex === petIndex && service.type !== 'driver', // Excluir servicio de transporte
                                        )

                                        return (
                                            <div key={petIndex} className='space-y-4 border-b pb-4 last:border-b-0'>
                                                <div className='grid grid-cols-[auto,1fr] gap-6'>
                                                    <div className='flex items-start gap-2'>
                                                        <PawPrint className='mt-1 h-4 w-4 text-[#4B6BFB]' />
                                                        <div>
                                                            <div className='flex items-center gap-2'>
                                                                <p className='font-medium'>{pet.name}</p>
                                                                <Badge
                                                                    variant='secondary'
                                                                    className='h-5 px-1.5 text-xs'
                                                                >
                                                                    {checkOut.roomNumber || 'Sin habitación'}
                                                                </Badge>
                                                            </div>
                                                            <p className='text-sm text-muted-foreground'>
                                                                {pet.breed} · {pet.size} · {pet.weight}kg ·{' '}
                                                                {pet.sex === 'M' ? 'Macho' : 'Hembra'} ·{' '}
                                                                {pet.isNeutered ? 'Castrado/a' : 'No castrado/a'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-wrap gap-4'>
                                                        {petServices.map((service, index) => {
                                                            let icon = null
                                                            let text = ''

                                                            switch (service.type) {
                                                                case 'hairdressing':
                                                                    icon = (
                                                                        <Scissors className='h-4 w-4 text-[#4B6BFB]' />
                                                                    )
                                                                    text = 'Peluquería: Baño y cepillado'
                                                                    break
                                                                case 'special_food':
                                                                    icon = (
                                                                        <DollarSign className='h-4 w-4 text-[#4B6BFB]' />
                                                                    )
                                                                    text = `Comida especial (${service.foodType === 'refrigerated' ? 'Refrigerada' : 'Congelada'})`
                                                                    break
                                                            }

                                                            return (
                                                                icon && (
                                                                    <div
                                                                        key={index}
                                                                        className='flex items-center gap-2'
                                                                    >
                                                                        {icon}
                                                                        <span className='text-sm text-muted-foreground'>
                                                                            {text}
                                                                        </span>
                                                                    </div>
                                                                )
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Precio Total y Acciones */}
                                <div className='mt-4 space-y-4 border-t pt-4'>
                                    <div className='flex items-center justify-between'>
                                        <span className='font-semibold'>Precio Total</span>
                                        <span className='text-lg font-bold'>{checkOut.totalAmount}€</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <Button variant='outline' onClick={() => handleViewDetails(checkOut.id)}>
                                            Ver detalles
                                        </Button>
                                        {!confirmedCheckOuts.includes(checkOut.id) &&
                                            (checkOut.paymentStatus === 'Pagado' ? (
                                                <Button onClick={() => handleConfirmCheckOut(checkOut.id)}>
                                                    Confirmar salida
                                                </Button>
                                            ) : (
                                                <Button onClick={() => handlePaymentAndCheckOut(checkOut.id)}>
                                                    Cobrar y confirmar salida
                                                </Button>
                                            ))}
                                        {confirmedCheckOuts.includes(checkOut.id) && (
                                            <Badge variant='outline' className='ml-2'>
                                                Salida confirmada
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </Card>
            ))}

            {selectedReservation && (
                <ReservationViewer
                    reservation={selectedReservation}
                    isOpen={isViewerOpen}
                    onClose={handleCloseViewer}
                />
            )}

            {checkoutReservation && (
                <InvoiceModal
                    reservation={checkoutReservation}
                    isOpen={isInvoiceOpen}
                    onClose={handleCloseInvoice}
                    onPrintAndPay={handlePrintAndPay}
                    onPrint={handlePrint}
                    onPaid={handlePaid}
                />
            )}
        </div>
    )
}
