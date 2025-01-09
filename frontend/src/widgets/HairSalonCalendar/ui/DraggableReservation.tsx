import { useState } from 'react'
import { useDrag } from 'react-dnd'
import type { DragSourceMonitor } from 'react-dnd'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Euro, Phone, Car } from 'lucide-react'

import type { HairSalonReservation } from '@/components/ReservationContext'
import { useCalendarStore } from '../model/store'
import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'
import { HairdressingServiceType } from '@/shared/types/additional-services'

interface DraggableReservationProps {
    reservation: HairSalonReservation
    date: string
    time: string
    className?: string
    showPrice?: boolean
}

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono'
}

const serviceTypeColors: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'bg-blue-50 text-blue-700 border-blue-200',
    bath_and_trim: 'bg-green-50 text-green-700 border-green-200',
    stripping: 'bg-purple-50 text-purple-700 border-purple-200',
    deshedding: 'bg-orange-50 text-orange-700 border-orange-200',
    brushing: 'bg-pink-50 text-pink-700 border-pink-200',
    spa: 'bg-teal-50 text-teal-700 border-teal-200',
    spa_ozone: 'bg-indigo-50 text-indigo-700 border-indigo-200'
}

export function DraggableReservation({ 
    reservation, 
    date, 
    time, 
    className,
    showPrice = false
}: DraggableReservationProps) {
    const { setDraggedReservation } = useCalendarStore()

    const [{ isDragging }, drag] = useDrag({
        type: 'reservation',
        item: () => {
            setDraggedReservation({ reservation, sourceDate: date, sourceTime: time })
            return { reservation }
        },
        end: (item, monitor: DragSourceMonitor) => {
            if (!monitor.didDrop()) {
                setDraggedReservation(null)
            }
        },
        collect: (monitor: DragSourceMonitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const isUnscheduled = !time || time.includes('-')
    const mainService = reservation.additionalServices?.[0]?.type === 'hairdressing' 
        ? reservation.additionalServices[0].services?.[0] as HairdressingServiceType
        : undefined

    return (
        <div
            ref={drag}
            className={cn(
                'flex cursor-move flex-col rounded-md border transition-opacity h-full p-1.5',
                isDragging && 'opacity-50',
                reservation.source === 'hotel' ? 'bg-emerald-50 border-emerald-200' : 'bg-pink-50 border-pink-200',
                className
            )}
        >
            <div className="flex flex-col h-full justify-between gap-1">
                {/* Header - Pet Name and Service */}
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                            <div className="font-bold text-sm truncate">
                                {reservation.pet.name}
                            </div>
                            <div className="text-xs text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                                ({reservation.pet.breed})
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-[11px] text-gray-600 truncate">{reservation.client.name}</div>
                            <div className="flex items-center gap-1 text-[11px] text-gray-600">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{reservation.client.phone}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        {mainService && serviceTypeLabels[mainService] && (
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
                        {reservation.hasDriverService && (
                            <Car className="h-4 w-4 text-gray-500 mx-auto mt-0.5" />
                        )}
                    </div>
                </div>

                {/* Footer - Time and Hotel Info */}
                <div className="flex flex-col gap-0.5 text-[11px] text-gray-600">
                    {isUnscheduled && (
                        <>
                            {reservation.source === 'external' && (
                                <>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{format(new Date(date), "EEEE d 'de' MMMM", { locale: es })}</span>
                                    </div>
                                    {reservation.requestedTime && (
                                        <div className="pl-4 truncate">
                                            Hora solicitada: {reservation.requestedTime}
                                        </div>
                                    )}
                                </>
                            )}
                            {reservation.source === 'hotel' && (
                                <>
                                    {reservation.hotelCheckIn && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3 flex-shrink-0" />
                                            <span className="truncate">
                                                Entrada: {format(new Date(reservation.hotelCheckIn), "d 'de' MMMM", { locale: es })}
                                            </span>
                                        </div>
                                    )}
                                    {reservation.hotelCheckOut && (
                                        <div className="pl-4 truncate">
                                            Salida: {format(new Date(reservation.hotelCheckOut), "d 'de' MMMM", { locale: es })}
                                            {reservation.hotelCheckOutTime && (
                                                <span> - {reservation.hotelCheckOutTime}</span>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                    {!isUnscheduled && (
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 flex-shrink-0" />
                            <span>{time} ({reservation.duration || 60} min)</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 