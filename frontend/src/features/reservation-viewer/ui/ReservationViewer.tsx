import { format } from 'date-fns'
import {
    Bed,
    Calendar,
    ChevronLeft,
    Clock,
    Mail,
    Pencil,
    Phone,
    Plus,
    Save,
    Scissors as ScissorsIcon,
    ShoppingBag,
    X
} from 'lucide-react'
import { useState } from 'react'

import { type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { type AdditionalService } from '@/shared/types/additional-services'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DatePicker } from '@/shared/ui/date-picker'
import { Input } from '@/shared/ui/input'
import { Separator } from '@/shared/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { PetsAndServicesCard } from './PetsAndServicesCard'
import { ClientCard } from './ClientCard'
import { DatesCard } from './DatesCard'
import { PriceBreakdownCard } from './PriceBreakdownCard'

interface ReservationViewerProps {
    reservation: HairSalonReservation | HotelReservation
    isOpen: boolean
    onClose: () => void
}

export function ReservationViewer({ reservation, onClose }: ReservationViewerProps) {
    console.log({ reservation })
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
                            <DatesCard
                                reservation={editedReservation}
                                isEditMode={isEditMode}
                                onUpdate={setEditedReservation}
                            />

                            {/* Cliente */}
                            <ClientCard reservation={editedReservation} />

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
                            <PriceBreakdownCard
                                reservation={editedReservation}
                                isEditMode={isEditMode}
                                stayPrice={stayPrice}
                                serviceBasePrice={serviceBasePrice}
                                totalDiscount={totalDiscount}
                                onStayPriceChange={setStayPrice}
                                onTotalPriceChange={(newTotal) => {
                                    setEditedReservation({
                                        ...editedReservation,
                                        totalPrice: newTotal
                                    })
                                }}
                            />

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