import { useState } from 'react'

import { ChevronLeft, Pencil, Plus, Save, ShoppingBag, X } from 'lucide-react'

import { cn } from '@/shared/lib/styles/class-merge'
import { type HairSalonReservation, type HotelBudget, type HotelReservation, Discount } from '@monorepo/functions/src/types/reservations'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { type AdditionalService } from '@monorepo/functions/src/types/services'

import { ClientCard } from './ClientCard'
import { DatesCard } from './DatesCard'
import { PetsAndServicesCard } from './PetsAndServicesCard'
import { PriceBreakdownCard } from './PriceBreakdownCard'

interface ReservationViewerProps {
    reservation: HairSalonReservation | HotelReservation | HotelBudget
    isOpen: boolean
    onClose: () => void
}

export function ReservationViewer({ reservation, onClose }: ReservationViewerProps) {
    console.log({ reservation })
    const [editedReservation, setEditedReservation] = useState<HairSalonReservation | HotelReservation | HotelBudget>(
        reservation,
    )
    const [isEditMode, setIsEditMode] = useState(false)
    const [stayPrice, setStayPrice] = useState(50) // precio por día predeterminado
    const [serviceBasePrice, setServiceBasePrice] = useState(30) // precio base por servicio

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
            price: serviceBasePrice,
        }
        setEditedReservation({
            ...editedReservation,
            additionalServices: [...editedReservation.additionalServices, newService as AdditionalService],
        })
    }

    const handleRemoveService = (index: number) => {
        const newServices = [...editedReservation.additionalServices]
        newServices.splice(index, 1)
        setEditedReservation({
            ...editedReservation,
            additionalServices: newServices,
        })
    }

    const handleUpdateService = (index: number, updatedService: AdditionalService) => {
        const newServices = [...editedReservation.additionalServices]
        newServices[index] = updatedService
        setEditedReservation({
            ...editedReservation,
            additionalServices: newServices,
        })
    }

    const handleAddShopProduct = () => {
        if (!('shopProducts' in editedReservation)) return

        const newProduct = {
            id: `prod${Date.now()}`,
            name: '',
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0,
        }

        setEditedReservation({
            ...editedReservation,
            shopProducts: [...(editedReservation.shopProducts || []), newProduct],
        })
    }

    const handleDiscountsChange = (discounts: Discount[]) => {
        if (editedReservation.type !== 'hotel') return

        setEditedReservation({
            ...editedReservation,
            discounts,
        })
    }

    const renderShopProducts = () => {
        if (!('shopProducts' in editedReservation) || !editedReservation.shopProducts?.length) return null

        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center justify-between text-base font-medium'>
                        <div className='flex items-center gap-2'>
                            <ShoppingBag className='h-4 w-4' />
                            Productos de Tienda
                        </div>
                        {isEditMode && (
                            <Button variant='outline' size='sm' onClick={handleAddShopProduct}>
                                <Plus className='mr-2 h-4 w-4' />
                                Añadir Producto
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-[40%]'>Producto</TableHead>
                                <TableHead className='w-[15%] text-right'>Cantidad</TableHead>
                                <TableHead className='w-[20%] text-right'>Precio Unitario</TableHead>
                                <TableHead className='w-[15%] text-right'>Total</TableHead>
                                {isEditMode && <TableHead className='w-[10%]'></TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {'shopProducts' in editedReservation &&
                                editedReservation.shopProducts?.map(product => (
                                    <TableRow key={product.id}>
                                        <TableCell className='align-middle'>
                                            {isEditMode ? (
                                                <Input
                                                    value={product.name}
                                                    onChange={e => {
                                                        const newProducts = editedReservation.shopProducts?.map(p =>
                                                            p.id === product.id ? { ...p, name: e.target.value } : p,
                                                        )
                                                        setEditedReservation({
                                                            ...editedReservation,
                                                            shopProducts: newProducts,
                                                        })
                                                    }}
                                                    className='h-9'
                                                />
                                            ) : (
                                                <span>{product.name}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-right align-middle'>
                                            {isEditMode ? (
                                                <Input
                                                    type='number'
                                                    value={product.quantity}
                                                    onChange={e => {
                                                        const quantity = Number(e.target.value)
                                                        const newProducts = editedReservation.shopProducts?.map(p =>
                                                            p.id === product.id
                                                                ? {
                                                                      ...p,
                                                                      quantity,
                                                                      totalPrice: quantity * p.unitPrice,
                                                                  }
                                                                : p,
                                                        )
                                                        setEditedReservation({
                                                            ...editedReservation,
                                                            shopProducts: newProducts,
                                                        })
                                                    }}
                                                    className='h-9 w-20 text-right'
                                                />
                                            ) : (
                                                <span>{product.quantity}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-right align-middle'>
                                            {isEditMode ? (
                                                <Input
                                                    type='number'
                                                    value={product.unitPrice}
                                                    onChange={e => {
                                                        const unitPrice = Number(e.target.value)
                                                        const newProducts = editedReservation.shopProducts?.map(p =>
                                                            p.id === product.id
                                                                ? {
                                                                      ...p,
                                                                      unitPrice,
                                                                      totalPrice: p.quantity * unitPrice,
                                                                  }
                                                                : p,
                                                        )
                                                        setEditedReservation({
                                                            ...editedReservation,
                                                            shopProducts: newProducts,
                                                        })
                                                    }}
                                                    className='h-9 w-24 text-right'
                                                />
                                            ) : (
                                                <span>€{product.unitPrice.toFixed(2)}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className='text-right align-middle'>
                                            €{product.totalPrice.toFixed(2)}
                                        </TableCell>
                                        {isEditMode && (
                                            <TableCell>
                                                <Button
                                                    variant='destructive'
                                                    size='sm'
                                                    onClick={() => {
                                                        const newProducts = editedReservation.shopProducts?.filter(
                                                            p => p.id !== product.id,
                                                        )
                                                        setEditedReservation({
                                                            ...editedReservation,
                                                            shopProducts: newProducts,
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
        <div className='fixed inset-0 z-50 bg-background/80 backdrop-blur-sm'>
            <div className='fixed inset-y-0 right-0 flex w-full flex-col border-l bg-background md:w-[1200px]'>
                <div className='flex items-center justify-between border-b px-6 py-4'>
                    <div className='flex items-center gap-2'>
                        <Button variant='ghost' size='icon' onClick={onClose}>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <h2 className='text-lg font-semibold'>
                            {reservation.type === 'hotel'
                                ? 'Reserva de Hotel'
                                : reservation.type === 'hotel-budget'
                                  ? 'Presupuesto de Hotel'
                                  : 'Reserva de Peluquería'}
                        </h2>
                    </div>
                    <div className='flex items-center gap-2'>
                        {isEditMode ? (
                            <>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                        setIsEditMode(false)
                                        setEditedReservation(reservation)
                                    }}
                                >
                                    <X className='mr-2 h-4 w-4' />
                                    Cancelar
                                </Button>
                                <Button size='sm' onClick={() => setIsEditMode(false)}>
                                    <Save className='mr-2 h-4 w-4' />
                                    Guardar
                                </Button>
                            </>
                        ) : (
                            <Button variant='outline' size='sm' onClick={() => setIsEditMode(true)}>
                                <Pencil className='mr-2 h-4 w-4' />
                                Editar
                            </Button>
                        )}
                    </div>
                </div>

                <div className='flex-1 space-y-8 overflow-y-auto p-6'>
                    <div className='flex items-center justify-between'>
                        <Badge variant='outline' className={cn(getStatusStyle(editedReservation.status))}>
                            {editedReservation.status}
                        </Badge>
                        <Badge variant='outline' className={cn(getPaymentStatusStyle(editedReservation.paymentStatus))}>
                            {editedReservation.paymentStatus}
                        </Badge>
                    </div>

                    <ClientCard
                        client={editedReservation.client}
                        isEditMode={isEditMode}
                        onClientChange={client => setEditedReservation({ ...editedReservation, client })}
                    />

                    {editedReservation.type === 'hotel' && (
                        <DatesCard
                            reservation={editedReservation}
                            isEditMode={isEditMode}
                            onDatesChange={dates => setEditedReservation({ ...editedReservation, ...dates })}
                        />
                    )}

                    {editedReservation.type === 'hotel' && (
                        <PetsAndServicesCard
                            reservation={editedReservation}
                            isEditMode={isEditMode}
                            onPetsChange={pets => setEditedReservation({ ...editedReservation, pets })}
                            onAddService={handleAddService}
                            onRemoveService={handleRemoveService}
                            onUpdateService={handleUpdateService}
                        />
                    )}

                    {renderShopProducts()}

                    <PriceBreakdownCard
                        reservation={editedReservation}
                        isEditMode={isEditMode}
                        stayPrice={stayPrice}
                        serviceBasePrice={serviceBasePrice}
                        onStayPriceChange={setStayPrice}
                        onTotalPriceChange={totalPrice => setEditedReservation({ ...editedReservation, totalPrice })}
                        onDiscountsChange={handleDiscountsChange}
                    />
                </div>
            </div>
        </div>
    )
}
