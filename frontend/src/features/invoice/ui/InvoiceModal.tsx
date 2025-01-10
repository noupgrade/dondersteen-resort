import { format } from 'date-fns'
import { Printer, CreditCard, Check } from 'lucide-react'

import { type HotelReservation } from '@/components/ReservationContext'
import { Button } from '@/shared/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'

interface InvoiceModalProps {
    reservation: HotelReservation
    isOpen: boolean
    onClose: () => void
    onPrintAndPay: () => void
    onPrint: () => void
    onPaid: () => void
}

export function InvoiceModal({ 
    reservation, 
    isOpen, 
    onClose,
    onPrintAndPay,
    onPrint,
    onPaid
}: InvoiceModalProps) {
    const calculateStayPrice = () => {
        const checkIn = new Date(reservation.checkInDate)
        const checkOut = new Date(reservation.checkOutDate)
        const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
        const basePrice = 50 // Base price per day
        return days * basePrice
    }

    const calculateServicesTotal = () => {
        return reservation.additionalServices.reduce((total, service) => total + (service.price || 0), 0)
    }

    const handlePrint = () => {
        window.print()
        onPrint()
    }

    const handlePrintAndPay = () => {
        window.print()
        onPrintAndPay()
    }

    const subtotal = calculateStayPrice() + calculateServicesTotal()
    const iva = subtotal * 0.21 // 21% IVA
    const total = subtotal + iva

    // Generate a unique invoice number
    const invoiceNumber = `A${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
    const serialNumber = `4A${Math.random().toString(36).substring(2, 10).toUpperCase()}`

    return (
        <>
            <style>
                {`
                    @font-face {
                        font-family: 'RobotoMono';
                        src: url('/fonts/RobotoMono-Regular.ttf') format('truetype');
                    }
                    @page {
                        margin: 0;
                        size: 80mm auto;
                    }
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-content, #print-content * {
                            visibility: visible;
                        }
                        #print-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 80mm;
                            padding: 8mm 4mm;
                            font-family: 'RobotoMono', monospace;
                            font-size: 12px;
                            line-height: 1.2;
                            background: white;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                    #print-content {
                        font-family: 'RobotoMono', monospace;
                        white-space: pre-wrap;
                        line-height: 1.2;
                    }
                `}
            </style>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-[500px] p-0">
                    <div className="p-4 border-b no-print">
                        <DialogTitle>Factura Simplificada</DialogTitle>
                        <DialogDescription>
                            Vista previa del ticket
                        </DialogDescription>
                    </div>

                    <div className="flex justify-center p-4 bg-gray-50">
                        {/* Ticket Content */}
                        <div id="print-content" className="w-[350px] bg-white p-8 text-[12px] leading-[1.2] shadow-sm">
                            {/* Header */}
                            <div className="text-center">
                                <div>* * *</div>
                                <div className="font-bold">DONDERSTEEN RESORT</div>
                                <div>Cami de Can Sole Mari, 6</div>
                                <div>08480 L'Ametlla del Vallés</div>
                                <div className="mb-4">Spain</div>
                            </div>

                            {/* Invoice Info */}
                            <div className="mb-4">
                                <div className="flex justify-between">
                                    <div>FACTURA SIMPLIFICADA</div>
                                    <div>Mesa: {reservation.roomNumber}</div>
                                </div>
                                <div className="flex justify-between">
                                    <div>DUPLICADO - 2</div>
                                    <div>1 cliente</div>
                                </div>
                                <div>Usuario A</div>
                                <div className="flex justify-between">
                                    <div>Venta - Pedido {invoiceNumber}</div>
                                    <div>{format(new Date(), 'dd/MM/yy, HH:mm:ss')}</div>
                                </div>
                            </div>

                            {/* Products Header */}
                            <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 mb-1">
                                <div>QTD</div>
                                <div className="pl-4">Producto</div>
                                <div style={{ minWidth: '80px' }} className="text-right">Precio</div>
                            </div>

                            {/* Products */}
                            <div className="mb-4">
                                <div className="grid grid-cols-[auto_1fr_auto] gap-x-4">
                                    <div>2</div>
                                    <div className="pl-4">Perro PEQUEÑO</div>
                                    <div style={{ minWidth: '80px' }} className="text-right">{calculateStayPrice().toFixed(2)}€</div>
                                </div>
                                {reservation.additionalServices.map((service, index) => (
                                    <div key={index} className="grid grid-cols-[auto_1fr_auto] gap-x-4">
                                        <div>1</div>
                                        <div className="pl-4">
                                            {service.type === 'hairdressing' ? 'BAÑO' :
                                             service.type === 'special_care' ? 'CUIDADOS ESP.' :
                                             service.type === 'special_food' ? 'COMIDA ESP.' :
                                             service.type === 'medication' ? 'MEDICACIÓN' :
                                             service.type === 'driver' ? 'TRANSPORTE' : service.type.toUpperCase()}
                                        </div>
                                        <div style={{ minWidth: '80px' }} className="text-right">{service.price ? `${service.price.toFixed(2)}€` : '€'}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Totals */}
                            <div className="mb-4">
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4">
                                    <div>IVA 21.0%(A)</div>
                                    <div style={{ minWidth: '80px' }} className="text-right">{subtotal.toFixed(2)}€</div>
                                    <div style={{ minWidth: '80px' }} className="text-right">{iva.toFixed(2)}€</div>
                                </div>
                                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4">
                                    <div>Total sin IVA</div>
                                    <div style={{ minWidth: '80px' }} className="text-right">{subtotal.toFixed(2)}€</div>
                                    <div style={{ minWidth: '80px' }} className="text-right">{iva.toFixed(2)}€</div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="text-center font-bold mb-4">
                                Total con IVA: {total.toFixed(2)}€
                            </div>

                            {/* Payment */}
                            <div className="mb-4">
                                <div className="flex justify-between">
                                    <div>Pagos</div>
                                    <div>TARJETA DE CRÉDITO</div>
                                </div>
                                <div className="flex justify-between">
                                    <div>Tarjeta de Crédito (B)</div>
                                    <div>{total.toFixed(2)}€</div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="text-center">
                                <div>Serie De Factura: {serialNumber}</div>
                                <div>Numero De Factura: {invoiceNumber}</div>
                                <div>{format(new Date(), 'dd/MM/yy, HH:mm:ss')}</div>
                                <div>NIF: X0318140G</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4 p-4 border-t bg-white no-print">
                        <Button variant="outline" onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" />
                            Imprimir
                        </Button>
                        <Button variant="outline" onClick={onPaid} className="gap-2">
                            <Check className="h-4 w-4" />
                            Pagado
                        </Button>
                        <Button onClick={handlePrintAndPay} className="gap-2 bg-black">
                            <CreditCard className="h-4 w-4" />
                            Imprimir y Pagar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
} 