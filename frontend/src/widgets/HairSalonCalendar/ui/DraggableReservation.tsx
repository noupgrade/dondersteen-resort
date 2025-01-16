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
                    <div className="mt-auto flex items-center justify-between">
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
            </div>
        )
    }

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
                {/* Header - Pet Name and Service */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1">
                        <div className="font-bold text-sm truncate">
                            {reservation.pet.name}
                        </div>
                        <div className="text-xs text-gray-600">
                            ({reservation.pet.breed})
                        </div>
                        {hasDriverService && (
                            <Car className="h-3 w-3 flex-shrink-0 text-gray-500" />
                        )}
                    </div>
                    <div className="flex items-center gap-1">
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

                {/* Center - Client Info */}
                <div className="flex flex-col text-[11px] text-gray-600">
                    <div className="truncate">
                        {reservation.client.name}
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        {reservation.client.phone}
                    </div>
                </div>

                {/* Footer - Time and Price */}
                <div className="mt-auto flex justify-between items-center text-[11px] text-gray-600">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{time ? `${time} (${reservation.duration || 60} min)` : 'Sin hora asignada'}</span>
                    </div>
                    {showPrice && (
                        <span>
                            {reservation.totalPrice}€
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
} 