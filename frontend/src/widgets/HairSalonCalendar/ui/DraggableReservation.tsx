import { useState } from 'react'
import { useDrag } from 'react-dnd'
import type { DragSourceMonitor } from 'react-dnd'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Phone, Car } from 'lucide-react'

import { useCalendarStore } from '../model/store'
import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'
import { HairSalonReservation } from '@/components/ReservationContext'
import { HairdressingServiceType, isDriverService, isHairdressingService } from '@/shared/types/additional-services'

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono',
    knots: 'Nudos',
    extremely_dirty: 'Extremadamente sucio'
}

const serviceTypeColors: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'bg-blue-50 text-blue-700 border-blue-200',
    bath_and_trim: 'bg-green-50 text-green-700 border-green-200',
    stripping: 'bg-purple-50 text-purple-700 border-purple-200',
    deshedding: 'bg-orange-50 text-orange-700 border-orange-200',
    brushing: 'bg-pink-50 text-pink-700 border-pink-200',
    spa: 'bg-teal-50 text-teal-700 border-teal-200',
    spa_ozone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    knots: 'bg-red-50 text-red-700 border-red-200',
    extremely_dirty: 'bg-yellow-50 text-yellow-700 border-yellow-200'
}

interface DraggableReservationProps {
    reservation: HairSalonReservation
    date: string
    time: string
    className?: string
    showPrice?: boolean
    isWeekView?: boolean
}

export function DraggableReservation({
    reservation,
    date,
    time,
    className,
    showPrice = false,
    isWeekView = false
}: DraggableReservationProps) {
    const { draggedReservation, setDraggedReservation } = useCalendarStore()
    const isUnscheduled = !time

    const [{ isDragging }, drag] = useDrag({
        type: 'reservation',
        item: { reservation },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            setDraggedReservation(null)
        },
    })

    const handleDragStart = () => {
        setDraggedReservation({
            reservation,
            sourceDate: date,
            sourceTime: time,
        })
    }

    // Find the main service (first hairdressing service)
    const mainService = reservation.additionalServices
        .find(service => isHairdressingService(service))
        ?.services[0] as HairdressingServiceType | undefined

    const hasDriverService = reservation.hasDriverService

    // Helper function to safely format dates
    const formatSafeDate = (dateString: string | undefined, formatStr: string) => {
        if (!dateString) return ''
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return ''
            return format(date, formatStr, { locale: es })
        } catch (error) {
            console.error('Error formatting date:', error)
            return ''
        }
    }

    // Weekly view card (compact)
    if (isWeekView) {
        return (
            <div
                ref={drag}
                onDragStart={handleDragStart}
                className={cn(
                    'h-full p-1 rounded-sm border transition-colors',
                    isDragging && 'opacity-50',
                    reservation.source === 'hotel' ? 'bg-emerald-50 border-emerald-200' : 'bg-pink-50 border-pink-200',
                    className
                )}
            >
                <div className="flex flex-col h-full text-xs">
                    <div className="flex items-center gap-1">
                        <div className="font-bold truncate">
                            {reservation.pet.name}
                        </div>
                        {hasDriverService && (
                            <Car className="h-3 w-3 flex-shrink-0 text-gray-500" />
                        )}
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                        {reservation.pet.breed}
                    </div>
                    {mainService && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap w-fit font-normal",
                                serviceTypeColors[mainService]
                            )}
                        >
                            {serviceTypeLabels[mainService]}
                        </Badge>
                    )}
                    {showPrice && (
                        <span className="text-[10px] text-gray-600">
                            {reservation.totalPrice}€
                        </span>
                    )}
                </div>
            </div>
        )
    }

    // Unscheduled reservation card (same as pending reservations)
    if (isUnscheduled) {
        return (
            <div
                ref={drag}
                onDragStart={handleDragStart}
                className={cn(
                    'h-full p-2 rounded-sm border transition-colors',
                    isDragging && 'opacity-50',
                    reservation.source === 'hotel' ? 'bg-emerald-50 border-emerald-200' : 'bg-pink-50 border-pink-200',
                    className
                )}
            >
                <div className="flex flex-col h-full gap-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-1">
                                <div className="font-bold text-sm">
                                    {reservation.pet.name}
                                </div>
                                <span className="text-sm text-gray-600">
                                    ({reservation.pet.breed})
                                </span>
                            </div>
                            <div className="text-sm text-gray-600">
                                {reservation.client.name}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {reservation.client.phone}
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            {mainService && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap",
                                        serviceTypeColors[mainService]
                                    )}
                                >
                                    {serviceTypeLabels[mainService]}
                                </Badge>
                            )}
                            {hasDriverService && (
                                <Car className="h-4 w-4 text-gray-500" />
                            )}
                        </div>
                    </div>
                    {reservation.source === 'hotel' && (
                        <div className="text-[11px] text-gray-600 space-y-0.5">
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                    Entrada: {formatSafeDate(reservation.hotelCheckIn, "d 'de' MMM")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>
                                    Salida: {formatSafeDate(reservation.hotelCheckOut, "d 'de' MMM")}
                                    {reservation.hotelCheckOutTime && ` - ${reservation.hotelCheckOutTime}`}
                                </span>
                            </div>
                        </div>
                    )}
                    <div className="mt-auto flex items-center justify-between text-[11px] text-gray-600">
                        <Clock className="h-3 w-3" />
                        <span>Sin hora asignada</span>
                        {showPrice && (
                            <span>{reservation.totalPrice}€</span>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Daily view card (distributed layout)
    const isCompactView = (reservation.duration || 60) < 45

    return (
        <div
            ref={drag}
            onDragStart={handleDragStart}
            className={cn(
                'h-full p-2 rounded-sm border transition-colors',
                isDragging && 'opacity-50',
                reservation.source === 'hotel' ? 'bg-emerald-50 border-emerald-200' : 'bg-pink-50 border-pink-200',
                className
            )}
        >
            {isCompactView ? (
                // Compact layout for short appointments
                <div className="flex flex-col h-full gap-1">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-1 text-sm">
                                <span className="font-bold truncate">
                                    {reservation.pet.name}
                                </span>
                                <span className="text-gray-600 text-[10px] truncate">
                                    ({reservation.pet.breed})
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {hasDriverService && (
                                <Car className="h-3 w-3 text-gray-500 flex-shrink-0" />
                            )}
                            {mainService && (
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap",
                                        serviceTypeColors[mainService]
                                    )}
                                >
                                    {serviceTypeLabels[mainService]}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                // Regular layout for normal appointments
                <div className="grid grid-cols-3 h-full gap-2">
                    {/* Left - Pet info and time */}
                    <div className="flex flex-col">
                        <div className="font-bold text-sm truncate">
                            {reservation.pet.name}
                        </div>
                        <div className="text-[10px] text-gray-600 truncate">
                            {reservation.pet.breed}
                        </div>
                        <div className="mt-auto flex items-center gap-1 text-[11px] text-gray-600">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{time} ({reservation.duration || 60} min)</span>
                        </div>
                    </div>

                    {/* Center - Client info */}
                    <div className="flex flex-col items-center justify-center text-[11px] text-gray-600">
                        <div className="truncate text-center">
                            {reservation.client.name}
                        </div>
                        <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {reservation.client.phone}
                        </div>
                    </div>

                    {/* Right - Service and price */}
                    <div className="flex flex-col items-end gap-1">
                        {mainService && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap",
                                    serviceTypeColors[mainService]
                                )}
                            >
                                {serviceTypeLabels[mainService]}
                            </Badge>
                        )}
                        {hasDriverService && (
                            <Car className="h-3 w-3 text-gray-500" />
                        )}
                        {showPrice && (
                            <span className="mt-auto text-[11px] text-gray-600">
                                {reservation.totalPrice}€
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
} 