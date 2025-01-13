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

    // Agrupar servicios por mascota
    type AdditionalService = typeof editedReservation.additionalServices[0]
    
    const servicesByPet = editedReservation.additionalServices
        .filter(service => service.type !== 'driver')
        .reduce((acc, service) => {
            const petIndex = service.petIndex
            if (!acc[petIndex]) acc[petIndex] = []
            acc[petIndex].push(service)
            return acc
        }, {} as Record<number, AdditionalService[]>)

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

    const getTransportService = () => {
        const transportService = editedReservation.additionalServices.find(service => service.type === 'driver') as { type: 'driver', serviceType?: 'pickup' | 'dropoff' | 'both' } | undefined
        if (!transportService) return null

        const getTransportText = () => {
            switch (transportService.serviceType) {
                case 'pickup': return 'Recogida'
                case 'dropoff': return 'Entrega'
                case 'both': return 'Completo'
                default: return ''
            }
        }

        return (
            <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-gray-500" />
                <span>{getTransportText()}</span>
            </div>
        )
    }

    const renderServices = () => {
        return (
            <div className="space-y-6">
                {/* Transporte si existe */}
                {getTransportService() && (
                    <div className="space-y-2">
                        <h4 className="font-medium">Transporte</h4>
                        {getTransportService()}
                    </div>
                )}

                {/* Servicios por mascota */}
                {Object.entries(servicesByPet).map(([petIndex, services]: [string, AdditionalService[]]) => {
                    const pet = editedReservation.type === 'hotel' 
                        ? editedReservation.pets[Number(petIndex)]
                        : editedReservation.pet

                    return (
                        <div key={petIndex} className="space-y-2">
                            <h5 className="text-sm font-medium">Servicios para {pet.name}</h5>
                            <div className="grid gap-4">
                                {services.map((service: AdditionalService, index: number) => (
                                    <div key={index} className="grid grid-cols-[1fr_2fr_auto_auto] gap-4 items-center">
                                        <div className="text-sm">
                                            {isEditMode ? (
                                                <Select
                                                    value={service.type}
                                                    onValueChange={(value) => handleUpdateService(index, {
                                                        ...service,
                                                        type: value as typeof service.type
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hairdressing">Peluquería</SelectItem>
                                                        <SelectItem value="special_care">Cuidados Especiales</SelectItem>
                                                        <SelectItem value="special_food">Comida Especial</SelectItem>
                                                        <SelectItem value="medication">Medicación</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                service.type === 'hairdressing' ? 'Peluquería' :
                                                service.type === 'special_care' ? 'Cuidados Especiales' :
                                                service.type === 'special_food' ? 'Comida Especial' :
                                                service.type === 'medication' ? 'Medicación' : 
                                                service.type
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            {service.type === 'hairdressing' ? (
                                                isEditMode ? (
                                                    <Select
                                                        value={service.services?.[0] || 'bath_and_brush'}
                                                        onValueChange={(value) => handleUpdateService(index, {
                                                            ...service,
                                                            services: [value]
                                                        })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="bath_and_brush">Baño y cepillado</SelectItem>
                                                            <SelectItem value="bath_and_trim">Baño y corte</SelectItem>
                                                            <SelectItem value="stripping">Stripping</SelectItem>
                                                            <SelectItem value="deshedding">Deslanado</SelectItem>
                                                            <SelectItem value="brushing">Cepillado</SelectItem>
                                                            <SelectItem value="spa">Spa</SelectItem>
                                                            <SelectItem value="spa_ozone">Spa con ozono</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    service.services?.map(s => {
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
                                                )
                                            ) : (
                                                isEditMode ? (
                                                    <Input
                                                        value={service.comment || ''}
                                                        onChange={(e) => handleUpdateService(index, {
                                                            ...service,
                                                            comment: e.target.value
                                                        })}
                                                    />
                                                ) : (
                                                    service.comment || '-'
                                                )
                                            )}
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                            {isEditMode ? (
                                                <Input
                                                    type="number"
                                                    value={service.price || serviceBasePrice}
                                                    onChange={(e) => handleUpdateService(index, {
                                                        ...service,
                                                        price: Number(e.target.value)
                                                    })}
                                                    className="w-24 text-right"
                                                />
                                            ) : (
                                                <span>€{(service.price || serviceBasePrice).toFixed(2)}</span>
                                            )}
                                        </div>
                                        {isEditMode && (
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleRemoveService(index)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const handlePetSizeChange = (value: string, index: number) => {
        if (value !== 'pequeño' && value !== 'mediano' && value !== 'grande') return

        if (editedReservation.type === 'hotel') {
            const newPets = [...editedReservation.pets]
            newPets[index] = { ...newPets[index], size: value }
            setEditedReservation({ ...editedReservation, pets: newPets })
        }
    }

    const handlePetSexChange = (value: string, index: number) => {
        if (value !== 'M' && value !== 'F') return

        if (editedReservation.type === 'hotel') {
            const newPets = [...editedReservation.pets]
            newPets[index] = { ...newPets[index], sex: value }
            setEditedReservation({ ...editedReservation, pets: newPets })
        }
    }

    const renderPets = () => {
        if (editedReservation.type === 'hotel') {
            return editedReservation.pets.map((pet, index) => (
                <div key={index} className="flex gap-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium mb-2">
                            <PawPrint className="h-4 w-4 text-gray-500" />
                            {pet.name} ({pet.breed})
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Tamaño:</span>
                                {isEditMode ? (
                                    <Input 
                                        value={pet.size}
                                        onChange={(e) => handlePetSizeChange(e.target.value, index)}
                                        className="h-8 w-32 mt-1"
                                    />
                                ) : (
                                    <div className="mt-1">{pet.size}</div>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">Peso:</span>
                                {isEditMode ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input 
                                            type="number"
                                            value={pet.weight}
                                            onChange={(e) => {
                                                const newPets = [...editedReservation.pets]
                                                newPets[index] = { ...pet, weight: Number(e.target.value) }
                                                setEditedReservation({ ...editedReservation, pets: newPets })
                                            }}
                                            className="h-8 w-24"
                                        />
                                        <span>kg</span>
                                    </div>
                                ) : (
                                    <div className="mt-1">{pet.weight} kg</div>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">Sexo:</span>
                                {isEditMode ? (
                                    <Input 
                                        value={pet.sex}
                                        onChange={(e) => handlePetSexChange(e.target.value, index)}
                                        className="h-8 w-24 mt-1"
                                    />
                                ) : (
                                    <div className="mt-1">{pet.sex === 'M' ? 'Macho' : 'Hembra'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        } else {
            const pet = editedReservation.pet
            return (
                <div className="flex gap-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium mb-2">
                            <PawPrint className="h-4 w-4 text-gray-500" />
                            {pet.name} ({pet.breed})
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Tamaño:</span>
                                <div className="mt-1">{pet.size}</div>
                            </div>
                            {pet.weight && (
                                <div>
                                    <span className="font-medium">Peso:</span>
                                    <div className="mt-1">{pet.weight} kg</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
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
            calculatedStayPrice = days * stayPrice // Usar el precio por día del estado
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
            type: '',
            petIndex,
            services: [] as string[],
            price: 0
        }
        setEditedReservation({
            ...editedReservation,
            additionalServices: [...editedReservation.additionalServices, newService]
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

    const handleUpdateService = (index: number, updatedService: typeof editedReservation.additionalServices[0]) => {
        const newServices = [...editedReservation.additionalServices]
        // Si el servicio es nuevo, asignar el precio base
        if (!newServices[index].price) {
            newServices[index] = {
                ...updatedService,
                price: serviceBasePrice
            }
        } else {
            newServices[index] = updatedService
        }
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
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleAddShopProduct}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Añadir Producto
                        </Button>
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
                                    onClick={() => setIsEditMode(!isEditMode)}
                                >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    {isEditMode ? "Modo Edición Activo" : "Editar"}
                                </Button>
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
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle className="text-base font-medium">Mascotas y Servicios</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Transporte si existe */}
                                        {getTransportService() && (
                                            <>
                                                <div className="space-y-2">
                                                    <h4 className="font-medium">Transporte</h4>
                                                    {getTransportService()}
                                                </div>
                                                <Separator />
                                            </>
                                        )}

                                        {/* Mascotas */}
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Mascotas</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {renderPets()}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Servicios adicionales */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">Servicios adicionales</h4>
                                            </div>
                                            <div className="space-y-6">
                                                {editedReservation.type === 'hotel' && editedReservation.pets.map((pet, petIndex) => (
                                                    <div key={petIndex} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-sm font-medium text-gray-500">Servicios para {pet.name}</h5>
                                                            {isEditMode && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleAddService(petIndex)}
                                                                >
                                                                    <Plus className="h-4 w-4 mr-2" />
                                                                    Añadir Servicio
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="grid gap-4">
                                                            {servicesByPet[petIndex]?.map((service: AdditionalService, index: number) => (
                                                                <div key={index} className="grid grid-cols-[1fr_2fr_auto_auto] gap-4 items-center">
                                                                    <div className="text-sm">
                                                                        {isEditMode ? (
                                                                            <Select
                                                                                value={service.type}
                                                                                onValueChange={(value) => handleUpdateService(index, {
                                                                                    ...service,
                                                                                    type: value as typeof service.type
                                                                                })}
                                                                            >
                                                                                <SelectTrigger>
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="hairdressing">Peluquería</SelectItem>
                                                                                    <SelectItem value="special_care">Cuidados Especiales</SelectItem>
                                                                                    <SelectItem value="special_food">Comida Especial</SelectItem>
                                                                                    <SelectItem value="medication">Medicación</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        ) : (
                                                                            service.type === 'hairdressing' ? 'Peluquería' :
                                                                            service.type === 'special_care' ? 'Cuidados Especiales' :
                                                                            service.type === 'special_food' ? 'Comida Especial' :
                                                                            service.type === 'medication' ? 'Medicación' : 
                                                                            service.type
                                                                        )}
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        {service.type === 'hairdressing' ? (
                                                                            isEditMode ? (
                                                                                <Select
                                                                                    value={service.services?.[0] || 'bath_and_brush'}
                                                                                    onValueChange={(value) => handleUpdateService(index, {
                                                                                        ...service,
                                                                                        services: [value]
                                                                                    })}
                                                                                >
                                                                                    <SelectTrigger>
                                                                                        <SelectValue />
                                                                                    </SelectTrigger>
                                                                                    <SelectContent>
                                                                                        <SelectItem value="bath_and_brush">Baño y cepillado</SelectItem>
                                                                                        <SelectItem value="bath_and_trim">Baño y corte</SelectItem>
                                                                                        <SelectItem value="stripping">Stripping</SelectItem>
                                                                                        <SelectItem value="deshedding">Deslanado</SelectItem>
                                                                                        <SelectItem value="brushing">Cepillado</SelectItem>
                                                                                        <SelectItem value="spa">Spa</SelectItem>
                                                                                        <SelectItem value="spa_ozone">Spa con ozono</SelectItem>
                                                                                    </SelectContent>
                                                                                </Select>
                                                                            ) : (
                                                                                service.services?.map(s => {
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
                                                                            )
                                                                        ) : (
                                                                            isEditMode ? (
                                                                                <Input
                                                                                    value={service.comment || ''}
                                                                                    onChange={(e) => handleUpdateService(index, {
                                                                                        ...service,
                                                                                        comment: e.target.value
                                                                                    })}
                                                                                />
                                                                            ) : (
                                                                                service.comment || '-'
                                                                            )
                                                                        )}
                                                                    </div>
                                                                    <div className="text-right whitespace-nowrap">
                                                                        {isEditMode ? (
                                                                            <Input
                                                                                type="number"
                                                                                value={service.price || serviceBasePrice}
                                                                                onChange={(e) => handleUpdateService(index, {
                                                                                    ...service,
                                                                                    price: Number(e.target.value)
                                                                                })}
                                                                                className="w-24 text-right"
                                                                            />
                                                                        ) : (
                                                                            <span>€{(service.price || serviceBasePrice).toFixed(2)}</span>
                                                                        )}
                                                                    </div>
                                                                    {isEditMode && (
                                                                        <div className="flex justify-end">
                                                                            <Button
                                                                                variant="destructive"
                                                                                size="sm"
                                                                                onClick={() => handleRemoveService(index)}
                                                                            >
                                                                                Eliminar
                                                                            </Button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Productos de Tienda */}
                            <Card className="md:col-span-2">
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
                                {isEditMode && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setEditedReservation(reservation)
                                                setIsEditMode(false)
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button onClick={() => {
                                            // Aquí iría la lógica para guardar los cambios
                                            console.log('Guardando cambios:', editedReservation)
                                            setIsEditMode(false)
                                        }}>
                                            Guardar Cambios
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 