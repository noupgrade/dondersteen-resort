import { useDrag } from 'react-dnd'
import type { DragSourceMonitor } from 'react-dnd'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type { ExtendedReservation } from '@/types/reservation'
import { useCalendarStore } from '../model/store'
import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'

interface DraggableReservationProps {
    reservation: ExtendedReservation
    date: string
    time: string
    className?: string
    showPrice?: boolean
    duration?: number
}

const serviceTypeLabels = {
    corte: 'Corte',
    bano_especial: 'Baño especial',
    deslanado: 'Deslanado'
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

    const isUnscheduled = date && !time

    return (
        <div
            ref={drag}
            className={cn(
                'flex h-full cursor-move flex-col gap-1 rounded-md border p-2 transition-opacity',
                isDragging && 'opacity-50',
                reservation.source === 'hotel' ? 'bg-blue-200 border-blue-300' : 'bg-emerald-200 border-emerald-300',
                className
            )}
        >
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{reservation.pet.name}</span>
                <Badge variant="outline" className="text-[10px]">
                    {serviceTypeLabels[reservation.additionalServices[0] as keyof typeof serviceTypeLabels]}
                </Badge>
            </div>
            {showPrice && (
                <div className="text-xs text-gray-600">
                    {reservation.precioEstimado ? `Precio estimado: ${reservation.precioEstimado}€` : 'Sin precio estimado'}
                </div>
            )}
            {isUnscheduled ? (
                <div className="mt-1 text-xs text-gray-600">
                    {format(new Date(date), "EEEE d 'de' MMMM", { locale: es })}
                </div>
            ) : time && (
                <div className="mt-1 text-xs text-gray-600">
                    {time} ({reservation.duration || 60} min)
                </div>
            )}
        </div>
    )
} 