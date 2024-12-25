'use client'

import { differenceInDays, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Tag } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

type BookingSummaryProps = {
    dates: { from: Date; to: Date } | null
    pets: Array<{ name: string; size: string }>
    services: any
    totalPrice: number
    pickupTime: string
}

export function BookingSummary({ dates, pets, services, totalPrice, pickupTime }: BookingSummaryProps) {
    const formatDate = (date: Date) => format(date, 'EEE, d MMM yyyy', { locale: es })
    const calculateNights = () => {
        if (dates?.from && dates?.to) {
            return differenceInDays(dates.to, dates.from)
        }
        return 0
    }

    const calculatePetCost = (size: string, nights: number) => {
        let baseRate = 0
        switch (size) {
            case 'pequeño':
                baseRate = 32
                break
            case 'mediano':
                baseRate = 35
                break
            case 'grande':
                baseRate = 39
                break
            case 'extra-grande':
                baseRate = 45
                break
        }
        return baseRate * nights
    }

    const isOutOfHours = (time: string) => {
        const hour = parseInt(time.split(':')[0], 10)
        return hour < 8 || hour >= 19
    }

    const nights = calculateNights()
    const applyDiscount = pets.length > 1
    const petCosts = pets.map((pet, index) => ({
        name: pet.name || `Mascota ${index + 1}`,
        size: pet.size,
        baseRate: calculatePetCost(pet.size, 1),
        totalCost: calculatePetCost(pet.size, nights),
    }))

    const calculateServiceCost = (service: string, petIndex: number) => {
        switch (service) {
            case 'medication':
                if (services[`medication_${petIndex}`]) {
                    const costPerDay = services[`medication_frequency_${petIndex}`] === 'once' ? 2.5 : 3.5
                    return { costPerDay, totalCost: costPerDay * nights }
                }
                return { costPerDay: 0, totalCost: 0 }
            case 'specialCare':
                return services[`specialCare_${petIndex}`]
                    ? { costPerDay: 3, totalCost: 3 * nights }
                    : { costPerDay: 0, totalCost: 0 }
            case 'customFood':
                return services[`customFood_${petIndex}`]
                    ? { costPerDay: 2, totalCost: 2 * nights }
                    : { costPerDay: 0, totalCost: 0 }
            case 'grooming': {
                if (!services[`grooming_${petIndex}`]) return { costPerDay: 0, totalCost: 0 }
                const groomingService = services[`groomingService_${petIndex}`]
                const petSize = pets[petIndex].size
                let cost = 0
                switch (groomingService) {
                    case 'bano_especial': {
                        cost = petSize === 'pequeño' ? 25 : petSize === 'mediano' ? 30 : 35
                        break
                    }
                    case 'corte': {
                        cost = petSize === 'pequeño' ? 35 : petSize === 'mediano' ? 40 : 45
                        break
                    }
                    case 'deslanado': {
                        cost = petSize === 'pequeño' ? 45 : petSize === 'mediano' ? 50 : 55
                        break
                    }
                }
                return { costPerDay: cost, totalCost: cost } // Grooming is a one-time service
            }
            default:
                return { costPerDay: 0, totalCost: 0 }
        }
    }

    const totalPetCost = petCosts.reduce((sum, pet) => sum + pet.totalCost, 0)
    const discountedTotalPetCost = applyDiscount ? totalPetCost * 0.9 : totalPetCost
    const totalServiceCost = pets.reduce((sum, _, index) => {
        return (
            sum +
            calculateServiceCost('medication', index).totalCost +
            calculateServiceCost('specialCare', index).totalCost +
            calculateServiceCost('customFood', index).totalCost +
            calculateServiceCost('grooming', index).totalCost
        )
    }, 0)

    const transportCost = services.transport ? 20 : 0
    const outOfHoursPickupCost = isOutOfHours(pickupTime) ? 70 : 0

    const totalAdditionalServicesCost = totalServiceCost + transportCost + outOfHoursPickupCost

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
    }

    return (
        <Card className='w-full'>
            <CardContent className='p-6'>
                <h2 className='mb-6 text-2xl font-bold'>Resumen de tu reserva</h2>

                {/* General Information */}
                <div className='mb-8 space-y-4'>
                    <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground'>Total Mascotas</span>
                        <span className='text-right font-semibold'>
                            {pets.length} {pets.length === 1 ? 'Mascota' : 'Mascotas'}
                        </span>
                    </div>

                    {dates && (
                        <>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Fecha de entrada</span>
                                <span className='font-semibold'>{formatDate(dates.from)}</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Fecha de salida</span>
                                <span className='font-semibold'>{formatDate(dates.to)}</span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Hora de recogida</span>
                                <span className='flex items-center font-semibold'>
                                    <Clock className='mr-1 h-4 w-4' />
                                    {pickupTime}
                                </span>
                            </div>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>Duración</span>
                                <span className='font-semibold'>
                                    {nights} {nights === 1 ? 'noche' : 'noches'}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Price Details */}
                <div className='space-y-4'>
                    <h3 className='text-lg font-semibold'>Detalles del precio</h3>

                    {/* Per Pet Costs */}
                    {petCosts.map((pet, index) => (
                        <div key={index} className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <span className='text-muted-foreground'>
                                    {pet.name} ({pet.size})
                                </span>
                                <span className='text-right font-semibold'>{formatCurrency(pet.baseRate)}/día</span>
                            </div>
                            <div className='flex items-center justify-between pl-4'>
                                <span className='text-sm text-muted-foreground'>Subtotal ({nights} noches)</span>
                                <span className='text-right font-medium'>{formatCurrency(pet.totalCost)}</span>
                            </div>
                        </div>
                    ))}

                    {/* Subtotal Alojamiento */}
                    <div className='border-t pt-4'>
                        <div className='flex items-center justify-between font-semibold'>
                            <span>Subtotal Alojamiento</span>
                            <span>{formatCurrency(totalPetCost)}</span>
                        </div>
                        {applyDiscount && (
                            <>
                                <div className='flex items-center justify-between text-sm text-green-600'>
                                    <span>Descuento múltiples mascotas (10%)</span>
                                    <span>-{formatCurrency(totalPetCost - discountedTotalPetCost)}</span>
                                </div>
                                <div className='mt-2 flex items-center justify-between font-semibold'>
                                    <span>Total Alojamiento con descuento</span>
                                    <span>{formatCurrency(discountedTotalPetCost)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Additional Services */}
                    {(totalServiceCost > 0 || transportCost > 0 || outOfHoursPickupCost > 0) && (
                        <div className='space-y-2 border-t pt-4'>
                            <h4 className='mb-2 font-medium'>Servicios Adicionales</h4>

                            {/* Per Pet Services */}
                            {pets.map((pet, index) => (
                                <div key={index}>
                                    {(services[`medication_${index}`] ||
                                        services[`specialCare_${index}`] ||
                                        services[`customFood_${index}`] ||
                                        services[`grooming_${index}`]) && (
                                        <div className='space-y-2'>
                                            <span className='text-sm font-medium'>{pet.name}:</span>
                                            {services[`medication_${index}`] && (
                                                <div className='flex items-center justify-between pl-4'>
                                                    <span className='text-sm text-muted-foreground'>
                                                        Medicación (
                                                        {services[`medication_frequency_${index}`] === 'once'
                                                            ? '1 vez'
                                                            : 'Varias veces'}
                                                        )
                                                    </span>
                                                    <div className='text-right'>
                                                        <span className='font-medium'>
                                                            {formatCurrency(
                                                                calculateServiceCost('medication', index).costPerDay,
                                                            )}
                                                            /día
                                                            <br />(
                                                            {formatCurrency(
                                                                calculateServiceCost('medication', index).totalCost,
                                                            )}
                                                            )
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {services[`specialCare_${index}`] && (
                                                <div className='flex items-center justify-between pl-4'>
                                                    <span className='text-sm text-muted-foreground'>
                                                        Curas Especiales
                                                    </span>
                                                    <div className='text-right'>
                                                        <span className='font-medium'>
                                                            {formatCurrency(
                                                                calculateServiceCost('specialCare', index).costPerDay,
                                                            )}
                                                            /día
                                                            <br />(
                                                            {formatCurrency(
                                                                calculateServiceCost('specialCare', index).totalCost,
                                                            )}
                                                            )
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {services[`customFood_${index}`] && (
                                                <div className='flex items-center justify-between pl-4'>
                                                    <span className='text-sm text-muted-foreground'>
                                                        Comida personalizada
                                                    </span>
                                                    <div className='text-right'>
                                                        <span className='font-medium'>
                                                            {formatCurrency(
                                                                calculateServiceCost('customFood', index).costPerDay,
                                                            )}
                                                            /día
                                                            <br />(
                                                            {formatCurrency(
                                                                calculateServiceCost('customFood', index).totalCost,
                                                            )}
                                                            )
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                            {services[`grooming_${index}`] && (
                                                <div className='flex items-center justify-between pl-4'>
                                                    <span className='text-sm text-muted-foreground'>
                                                        Peluquería (
                                                        {services[`groomingService_${index}`] === 'bano_especial'
                                                            ? 'Baño especial'
                                                            : services[`groomingService_${index}`] === 'corte'
                                                              ? 'Corte'
                                                              : 'Deslanado'}
                                                        )
                                                    </span>
                                                    <span className='text-right font-medium'>
                                                        {formatCurrency(
                                                            calculateServiceCost('grooming', index).totalCost,
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* General Services */}
                            {(transportCost > 0 || outOfHoursPickupCost > 0) && (
                                <div className='mt-2 space-y-2'>
                                    <span className='text-sm font-medium'>Servicios generales:</span>
                                    {transportCost > 0 && (
                                        <div className='flex items-center justify-between pl-4'>
                                            <span className='text-sm text-muted-foreground'>
                                                Transporte (recogida y entrega)
                                            </span>
                                            <span className='text-right font-medium'>20,00€</span>
                                        </div>
                                    )}
                                    {outOfHoursPickupCost > 0 && (
                                        <div className='flex items-center justify-between pl-4'>
                                            <span className='text-sm text-muted-foreground'>
                                                Recogida fuera de horario
                                            </span>
                                            <span className='text-right font-medium'>70,00€</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Subtotal Servicios Adicionales */}
                            <div className='mt-2 border-t pt-2'>
                                <div className='flex items-center justify-between font-semibold'>
                                    <span>Subtotal Servicios Adicionales</span>
                                    <span className='text-right'>{formatCurrency(totalAdditionalServicesCost)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className='mt-6 border-t pt-4'>
                        <div className='flex items-center justify-between rounded-lg bg-primary/5 p-4'>
                            <div className='flex items-center gap-2'>
                                <Tag className='h-5 w-5' />
                                <span className='font-semibold'>Total</span>
                            </div>
                            <span className='text-right text-xl font-bold'>{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
