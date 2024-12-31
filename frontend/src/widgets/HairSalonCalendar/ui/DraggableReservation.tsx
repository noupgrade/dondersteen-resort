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
                'flex cursor-move flex-col rounded-none border-0 transition-opacity h-full',
                isDragging && 'opacity-50',
                reservation.source === 'hotel' ? 'bg-blue-200' : 'bg-emerald-200',
                className
            )}
        >
            <div className="flex flex-col h-full p-1.5">
                <div className="flex items-start justify-between gap-1 min-h-[20px]">
                    <span className="font-medium text-sm truncate">{reservation.pet.name}</span>
                    <Badge variant="outline" className="text-[10px] shrink-0 whitespace-nowrap">
                        {reservation.observations?.startsWith('Subcita') 
                            ? 'Subcita'
                            : serviceTypeLabels[reservation.additionalServices[0] as keyof typeof serviceTypeLabels]
                        }
                    </Badge>
                </div>
                <div className="flex flex-col justify-end flex-1 gap-0.5 mt-0.5">
                    {showPrice && (
                        <div className="text-[10px] text-gray-600 truncate">
                            {reservation.precioEstimado ? `${reservation.precioEstimado}€` : 'Sin precio estimado'}
                        </div>
                    )}
                    {isUnscheduled ? (
                        <div className="text-[10px] text-gray-600 truncate">
                            {format(new Date(date), "EEEE d 'de' MMMM", { locale: es })}
                        </div>
                    ) : time && (
                        <div className="text-[10px] text-gray-600 truncate">
                            {time} ({reservation.duration || 60} min)
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 