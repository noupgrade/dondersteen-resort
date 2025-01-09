import { useState } from 'react'
import { useDrag } from 'react-dnd'
import type { DragSourceMonitor } from 'react-dnd'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Euro, Phone } from 'lucide-react'

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
                {/* Header - Pet Name, Breed and Service */}
                <div className="flex flex-col gap-1">
                    <div className="font-medium text-sm truncate">
                        {reservation.pet.name} ({reservation.pet.breed})
                    </div>
                    {mainService && serviceTypeLabels[mainService] && (
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap w-fit",
                                serviceTypeColors[mainService]
                            )}
                        >
                            {serviceTypeLabels[mainService]}
                        </Badge>
                    )}
                </div>

                {/* Client Info */}
                <div className="space-y-0.5">
                    <div className="text-[11px] text-gray-600 truncate">{reservation.client.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-gray-600">
                        <Phone className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{reservation.client.phone}</span>
                    </div>
                </div>

                {/* Footer - Time */}
                <div className="flex flex-col gap-0.5 text-[11px] text-gray-600">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        {isUnscheduled ? (
                            <span className="truncate">{format(new Date(date), "EEEE d 'de' MMMM", { locale: es })}</span>
                        ) : (
                            <span>{time} ({reservation.duration || 60} min)</span>
                        )}
                    </div>
                    {isUnscheduled && reservation.time && (
                        <div className="pl-4 truncate">
                            {reservation.time}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 