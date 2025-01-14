import React, { useState } from 'react'
import { format } from 'date-fns'
import {
    Bed,
    Scissors as ScissorsIcon,
    PawPrint,
    Euro,
    Truck,
    Calendar,
    Clock,
    Phone,
    Mail,
    ChevronLeft,
    ShoppingBag,
    Plus,
    Save,
    X,
    Pencil
} from 'lucide-react'

import { type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { cn } from '@/shared/lib/styles/class-merge'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { DatePicker } from '@/shared/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { PetsAndServicesCard } from './PetsAndServicesCard'
import { type AdditionalService } from '@/shared/types/additional-services'

interface ReservationViewerProps {
    reservation: HairSalonReservation | HotelReservation
    isOpen: boolean
    onClose: () => void
}

export function ReservationViewer({ reservation, onClose }: ReservationViewerProps) {
    const [editedReservation, setEditedReservation] = useState<HotelReservation | HairSalonReservation>(reservation)
    const [isEditMode, setIsEditMode] = useState(false)
    const [stayPrice, setStayPrice] = useState(50) // precio por día predeterminado
    const [serviceBasePrice, setServiceBasePrice] = useState(30) // precio base por servicio
    const [totalDiscount, setTotalDiscount] = useState(0)

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

    const getPaymentStatusStyle = (status: string) => {
        switch (status) {
            case 'Pagado':
                return 'bg-green-500 text-white'
            default:
                return 'bg-yellow-500 text-black'
        }
    }

    const calculatePriceBreakdown = () => {
        const IVA = 0.21 // 21% IVA
        let calculatedStayPrice = 0
        let servicesPrice = 0
        let shopPrice = 0

        if (editedReservation.type === 'hotel') {
            const checkIn = new Date(editedReservation.checkInDate)
            const checkOut = new Date(editedReservation.checkOutDate)
            const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
            calculatedStayPrice = days * stayPrice
        }

        // Calcular precio de servicios usando los precios individuales
        servicesPrice = editedReservation.additionalServices
            .filter(service => service.type !== 'driver')
            .reduce((total, service) => total + (service.price || serviceBasePrice), 0)

        // Calcular precio de productos
        if ('shopProducts' in editedReservation && editedReservation.shopProducts) {
            shopPrice = editedReservation.shopProducts.reduce((total, product) => total + product.totalPrice, 0)
        }

        const subtotalSinIVA = calculatedStayPrice + servicesPrice + shopPrice
        const ivaAmount = subtotalSinIVA * IVA
        const total = subtotalSinIVA + ivaAmount

        return {
            stayPrice: calculatedStayPrice,
            servicesPrice,
            shopPrice,
            subtotalSinIVA,
            ivaAmount,
            total
        }
    }

    const handleAddService = (petIndex: number) => {
        const newService = {
            type: 'hairdressing',
            petIndex,
            services: [] as string[],
            price: serviceBasePrice
        }
        setEditedReservation({
            ...editedReservation,
            additionalServices: [...editedReservation.additionalServices, newService as AdditionalService]
        })
    }

    const handleRemoveService = (index: number) => {
        const newServices = [...editedReservation.additionalServices]
        newServices.splice(index, 1)
        setEditedReservation({
            ...editedReservation,
            additionalServices: newServices
        })
    }

    const handleUpdateService = (index: number, updatedService: AdditionalService) => {
        const newServices = [...editedReservation.additionalServices]
        newServices[index] = updatedService
        setEditedReservation({
            ...editedReservation,
            additionalServices: newServices
        })
    }

    const handleAddShopProduct = () => {
        if (!('shopProducts' in editedReservation)) return

        const newProduct = {
            id: `prod${Date.now()}`,
            name: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0
        }

        setEditedReservation({
            ...editedReservation,
            shopProducts: [...(editedReservation.shopProducts || []), newProduct]
        })
    }

    const renderShopProducts = () => {
        if (!('shopProducts' in editedReservation) || !editedReservation.shopProducts?.length) return null

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Productos de Tienda
                        </div>
                        {isEditMode && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddShopProduct}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Añadir Producto
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Producto</TableHead>
                                <TableHead className="w-[15%] text-right">Cantidad</TableHead>
                                <TableHead className="w-[20%] text-right">Precio Unitario</TableHead>
                                <TableHead className="w-[15%] text-right">Total</TableHead>
                                {isEditMode && <TableHead className="w-[10%]"></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {'shopProducts' in editedReservation && editedReservation.shopProducts?.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell className="align-middle">
                                        {isEditMode ? (
                                            <Input
                                                value={product.name}
                                                onChange={(e) => {
                                                    const newProducts = editedReservation.shopProducts?.map(p =>
                                                        p.id === product.id
                                                            ? { ...p, name: e.target.value }
                                                            : p
                                                    )
                                                    setEditedReservation({
                                                        ...editedReservation,
                                                        shopProducts: newProducts
                                                    })
                                                }}
                                                className="h-9"
                                            />
                                        ) : (
                                            <span>{product.name}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-middle">
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={product.quantity}
                                                onChange={(e) => {
                                                    const quantity = Number(e.target.value)
                                                    const newProducts = editedReservation.shopProducts?.map(p =>
                                                        p.id === product.id
                                                            ? {
                                                                ...p,
                                                                quantity,
                                                                totalPrice: quantity * p.unitPrice
                                                            }
                                                            : p
                                                    )
                                                    setEditedReservation({
                                                        ...editedReservation,
                                                        shopProducts: newProducts
                                                    })
                                                }}
                                                className="w-20 text-right h-9"
                                            />
                                        ) : (
                                            <span>{product.quantity}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-middle">
                                        {isEditMode ? (
                                            <Input
                                                type="number"
                                                value={product.unitPrice}
                                                onChange={(e) => {
                                                    const unitPrice = Number(e.target.value)
                                                    const newProducts = editedReservation.shopProducts?.map(p =>
                                                        p.id === product.id
                                                            ? {
                                                                ...p,
                                                                unitPrice,
                                                                totalPrice: p.quantity * unitPrice
                                                            }
                                                            : p
                                                    )
                                                    setEditedReservation({
                                                        ...editedReservation,
                                                        shopProducts: newProducts
                                                    })
                                                }}
                                                className="w-24 text-right h-9"
                                            />
                                        ) : (
                                            <span>€{product.unitPrice.toFixed(2)}</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right align-middle">
                                        €{product.totalPrice.toFixed(2)}
                                    </TableCell>
                                    {isEditMode && (
                                        <TableCell>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => {
                                                    const newProducts = editedReservation.shopProducts?.filter(
                                                        p => p.id !== product.id
                                                    )
                                                    setEditedReservation({
                                                        ...editedReservation,
                                                        shopProducts: newProducts
                                                    })
                                                }}
                                            >
                                                Eliminar
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm">
            <div className="fixed inset-0 bg-white">
                <div className="h-full overflow-auto">
                    <div className="container mx-auto p-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <Button variant="outline" onClick={onClose}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <div className="flex items-center gap-4">
                                {editedReservation.type === 'hotel' ? (
                                    <>
                                        <Bed className="h-5 w-5 text-blue-600" />
                                        <span className="text-blue-600">Reserva Hotel</span>
                                    </>
                                ) : (
                                    <>
                                        <ScissorsIcon className="h-5 w-5 text-red-600" />
                                        <span className="text-red-600">Reserva Peluquería</span>
                                    </>
                                )}
                                <Badge className={cn(
                                    getStatusStyle(editedReservation.status),
                                    "ml-2"
                                )}>
                                    {editedReservation.status === 'propuesta peluqueria' ? 'Propuesta' :
                                        editedReservation.status === 'confirmed' ? 'Confirmada' :
                                            editedReservation.status === 'cancelled' ? 'Cancelada' :
                                                editedReservation.status === 'pending' ? 'Pendiente' :
                                                    editedReservation.status}
                                </Badge>
                                <Button
                                    variant={isEditMode ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "border-2",
                                        isEditMode ? "border-primary" : "hover:border-primary"
                                    )}
                                    onClick={() => {
                                        if (isEditMode) {
                                            // Aquí iría la lógica para guardar los cambios
                                            console.log('Guardando cambios:', editedReservation)
                                        }
                                        setIsEditMode(!isEditMode)
                                    }}
                                >
                                    {isEditMode ? (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Guardar
                                        </>
                                    ) : (
                                        <>
                                            <Pencil className="h-4 w-4 mr-2" />
                                            Editar
                                        </>
                                    )}
                                </Button>
                                {isEditMode && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditedReservation(reservation)
                                            setIsEditMode(false)
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Fechas */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Fechas</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {editedReservation.type === 'hotel' ? (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className="w-4">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <span className="w-16">Entrada:</span>
                                                {isEditMode ? (
                                                    <div className="flex items-center gap-4">
                                                        <DatePicker
                                                            date={editedReservation.checkInDate ? new Date(editedReservation.checkInDate) : new Date()}
                                                            onSelect={(date) => date && setEditedReservation({
                                                                ...editedReservation,
                                                                checkInDate: date.toISOString().split('T')[0]
                                                            })}
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <Input
                                                                value={editedReservation.checkInTime}
                                                                onChange={(e) => setEditedReservation({
                                                                    ...editedReservation,
                                                                    checkInTime: e.target.value
                                                                })}
                                                                className="h-8 w-24"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <span>{formatDate(editedReservation.checkInDate)}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <span>{editedReservation.checkInTime}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-4">
                                                    <Calendar className="h-4 w-4 text-gray-500" />
                                                </div>
                                                <span className="w-16">Salida:</span>
                                                {isEditMode ? (
                                                    <div className="flex items-center gap-4">
                                                        <DatePicker
                                                            date={editedReservation.checkOutDate ? new Date(editedReservation.checkOutDate) : new Date()}
                                                            onSelect={(date) => date && setEditedReservation({
                                                                ...editedReservation,
                                                                checkOutDate: date.toISOString().split('T')[0]
                                                            })}
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <Input
                                                                value={editedReservation.checkOutTime || '12:00'}
                                                                onChange={(e) => setEditedReservation({
                                                                    ...editedReservation,
                                                                    checkOutTime: e.target.value
                                                                })}
                                                                className="h-8 w-24"
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-4">
                                                        <span>{formatDate(editedReservation.checkOutDate)}</span>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-gray-500" />
                                                            <span>{editedReservation.checkOutTime || '12:00'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <DatePicker
                                                date={editedReservation.date ? new Date(editedReservation.date) : new Date()}
                                                onSelect={(date) => date && setEditedReservation({
                                                    ...editedReservation,
                                                    date: date.toISOString().split('T')[0]
                                                })}
                                                disabled={!isEditMode}
                                            />
                                            <Clock className="h-4 w-4 text-gray-500 ml-2" />
                                            <Input
                                                value={editedReservation.time}
                                                onChange={(e) => setEditedReservation({
                                                    ...editedReservation,
                                                    time: e.target.value
                                                })}
                                                className="h-8 w-24"
                                                disabled={!isEditMode}
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Cliente */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Cliente</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                                        <div className="font-medium">Nombre:</div>
                                        <span>{editedReservation.client.name}</span>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                                        <div className="font-medium">Teléfono:</div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-gray-500" />
                                            <span>{editedReservation.client.phone}</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                                        <div className="font-medium">Email:</div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-500" />
                                            <span>{editedReservation.client.email}</span>
                                        </div>
                                    </div>
                                    {editedReservation.client.address && (
                                        <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                                            <div className="font-medium">Dirección:</div>
                                            <span>{editedReservation.client.address}</span>
                                        </div>
                                    )}
                                    {editedReservation.client.id && (
                                        <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
                                            <div className="font-medium">ID Cliente:</div>
                                            <span>{editedReservation.client.id}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Mascotas y Servicios */}
                            <PetsAndServicesCard
                                reservation={editedReservation}
                                isEditMode={isEditMode}
                                serviceBasePrice={serviceBasePrice}
                                onServiceAdd={handleAddService}
                                onServiceRemove={handleRemoveService}
                                onServiceUpdate={handleUpdateService}
                            />

                            {/* Productos de Tienda */}
                            {renderShopProducts()}

                            {/* Precio */}
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Desglose de Precio</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {editedReservation.type === 'hotel' && (
                                            <div className="flex items-center justify-between">
                                                <span>Estancia:</span>
                                                <div className="flex items-center gap-2 justify-end">
                                                    {isEditMode ? (
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="number"
                                                                value={stayPrice}
                                                                onChange={(e) => setStayPrice(Number(e.target.value))}
                                                                className="w-24 text-right"
                                                                placeholder="€/día"
                                                            />
                                                            <span>€/día</span>
                                                        </div>
                                                    ) : (
                                                        <span>€{calculatePriceBreakdown().stayPrice.toFixed(2)}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <span>Servicios:</span>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span>€{calculatePriceBreakdown().servicesPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        {'shopProducts' in editedReservation && (
                                            <div className="flex items-center justify-between">
                                                <span>Productos:</span>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span>€{calculatePriceBreakdown().shopPrice.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <span>Base Imponible:</span>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span>€{calculatePriceBreakdown().subtotalSinIVA.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span>IVA (21%):</span>
                                            <div className="flex items-center gap-2 justify-end">
                                                <span>€{calculatePriceBreakdown().ivaAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between font-bold">
                                            <span>Total:</span>
                                            <div className="flex items-center gap-2 justify-end">
                                                {isEditMode ? (
                                                    <Input
                                                        type="number"
                                                        value={editedReservation.totalPrice}
                                                        onChange={(e) => {
                                                            const newTotal = Number(e.target.value)
                                                            setEditedReservation({
                                                                ...editedReservation,
                                                                totalPrice: newTotal
                                                            })
                                                            // Calcular el descuento
                                                            const calculatedTotal = calculatePriceBreakdown().total
                                                            setTotalDiscount(calculatedTotal - newTotal)
                                                        }}
                                                        className="w-24 text-right"
                                                    />
                                                ) : (
                                                    <span>€{editedReservation.totalPrice.toFixed(2)}</span>
                                                )}
                                            </div>
                                        </div>
                                        {totalDiscount > 0 && (
                                            <div className="flex items-center justify-between text-green-600">
                                                <span>Descuento aplicado:</span>
                                                <div className="flex items-center gap-2 justify-end">
                                                    <span>-€{totalDiscount.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Botones de acción */}
                            <div className="md:col-span-2 flex justify-end gap-4">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 