'use client'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { format } from 'date-fns'
import { Clock, DollarSign, Truck, Scissors, PawPrint } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { InvoiceModal } from '@/features/invoice/ui/InvoiceModal'
import { type HotelReservation } from '@/components/ReservationContext'

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
    const { reservations, updateReservation } = useReservation()
    const [confirmedCheckOuts, setConfirmedCheckOuts] = useState<string[]>([])
    const [selectedReservation, setSelectedReservation] = useState<HotelReservation | null>(null)
    const [isViewerOpen, setIsViewerOpen] = useState(false)
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
    const [checkoutReservation, setCheckoutReservation] = useState<HotelReservation | null>(null)

    // Filter check-outs for today
    const checkOuts: CheckOut[] = reservations
        .filter(r => r.type === 'hotel' && new Date(r.checkOutDate).toDateString() === new Date().toDateString())
        .map(r => ({
            id: r.id,
            clientName: r.client.name,
            clientPhone: r.client.phone,
            clientEmail: r.client.email,
            pets: r.pets || [],
            roomNumber: r.roomNumber || '',
            checkInDate: r.checkInDate,
            checkOutDate: r.checkOutDate,
            paymentStatus: (r.paymentStatus as 'Pagado' | 'Pendiente') || 'Pendiente',
            totalAmount: r.totalPrice || 0,
            additionalServices: r.additionalServices || []
        }))

    const handleConfirmCheckOut = (id: string) => {
        const reservation = reservations.find(r => r.id === id) as HotelReservation | undefined
        if (reservation) {
            setCheckoutReservation(reservation)
            setIsInvoiceOpen(true)
        }
    }

    const handlePaymentAndCheckOut = (id: string) => {
        const reservation = reservations.find(r => r.id === id) as HotelReservation | undefined
        if (reservation) {
            setCheckoutReservation(reservation)
            setIsInvoiceOpen(true)
        }
    }

    const handleViewDetails = (id: string) => {
        const reservation = reservations.find(r => r.id === id) as HotelReservation | undefined
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

    return (
        <div className='space-y-4'>
            {checkOuts.map(checkOut => (
                <Card key={checkOut.id} className='overflow-hidden'>
                    <div className='flex'>
                        <div className='w-64 shrink-0 bg-[#4B6BFB]/5 p-6 flex flex-col justify-between space-y-6'>
                            <div className='space-y-6'>
                                <div>
                                    <CardTitle className='text-lg font-semibold'>
                                        {checkOut.clientName}
                                    </CardTitle>
                                    <div className='space-y-1 mt-1 text-sm text-muted-foreground'>
                                        <p>{checkOut.clientPhone}</p>
                                        <p>{checkOut.clientEmail}</p>
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <Clock className='h-4 w-4' />
                                        <span className='text-sm text-muted-foreground'>Check-out: 12:00</span>
                                    </div>
                                    {checkOut.additionalServices.some(service => 
                                        service.type === 'driver' && 
                                        (service.serviceType === 'dropoff' || service.serviceType === 'both')
                                    ) && (
                                        <div className='flex items-center gap-2'>
                                            <Truck className='h-4 w-4 text-[#4B6BFB]' />
                                            <span className='text-sm text-muted-foreground'>
                                                {checkOut.additionalServices.find(service => service.type === 'driver')?.serviceType === 'both'
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
                            <div className='flex flex-col h-full'>
                                <div className='flex-grow space-y-6'>
                                    {/* Mascotas y sus servicios */}
                                    {checkOut.pets.map((pet, petIndex) => {
                                        // Filtrar servicios para esta mascota
                                        const petServices = checkOut.additionalServices
                                            .filter(service => 
                                                service.petIndex === petIndex && 
                                                service.type !== 'driver' // Excluir servicio de transporte
                                            )

                                        return (
                                            <div key={petIndex} className='space-y-4 pb-4 border-b last:border-b-0'>
                                                <div className='grid grid-cols-[auto,1fr] gap-6'>
                                                    <div className='flex items-start gap-2'>
                                                        <PawPrint className='h-4 w-4 mt-1 text-[#4B6BFB]' />
                                                        <div>
                                                            <p className='font-medium'>{pet.name} ({checkOut.roomNumber})</p>
                                                            <p className='text-sm text-muted-foreground'>
                                                                {pet.breed} · {pet.size} · {pet.weight}kg
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className='flex flex-wrap gap-4'>
                                                        {petServices.map((service, index) => {
                                                            let icon = null
                                                            let text = ''

                                                            switch (service.type) {
                                                                case 'hairdressing':
                                                                    icon = <Scissors className='h-4 w-4 text-[#4B6BFB]' />
                                                                    text = 'Peluquería: Baño y cepillado'
                                                                    break
                                                                case 'special_food':
                                                                    icon = <DollarSign className='h-4 w-4 text-[#4B6BFB]' />
                                                                    text = `Comida especial (${service.foodType === 'refrigerated' ? 'Refrigerada' : 'Congelada'})`
                                                                    break
                                                            }

                                                            return icon && (
                                                                <div key={index} className='flex items-center gap-2'>
                                                                    {icon}
                                                                    <span className='text-sm text-muted-foreground'>
                                                                        {text}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Precio Total y Acciones */}
                                <div className='space-y-4 pt-4 mt-4 border-t'>
                                    <div className='flex items-center justify-between'>
                                        <span className='font-semibold'>Precio Total</span>
                                        <span className='text-lg font-bold'>{checkOut.totalAmount}€</span>
                                    </div>
                                    <div className='flex justify-between items-center'>
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
