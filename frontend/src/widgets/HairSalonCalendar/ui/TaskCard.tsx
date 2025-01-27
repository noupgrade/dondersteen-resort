import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Phone, Car } from 'lucide-react'
import { useDrag } from 'react-dnd'

import { HairSalonTask } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'
import { useCalendarStore } from '../model/store'
import { useReservation } from '@/components/ReservationContext'
import { HairdressingServiceType, isHairdressingService } from '@/shared/types/additional-services'

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

interface TaskCardProps {
    task: HairSalonTask
    date: string
    time: string
    className?: string
    showDetails?: boolean
    isWeekView?: boolean
}

export function TaskCard({
    task,
    date,
    time,
    className,
    showDetails = true,
    isWeekView = false
}: TaskCardProps) {
    const { setDraggedItem } = useCalendarStore()
    const { reservations } = useReservation()

    // Get the associated reservation
    const reservation = reservations.find(r => r.id === task.reservationId)

    const [{ isDragging }, drag] = useDrag({
        type: 'task',
        item: { type: 'task', item: task },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            setDraggedItem(null)
        },
    })

    const handleDragStart = () => {
        setDraggedItem({ type: 'task', item: task })
    }

    // Get service type and label safely
    const hairdressingService = isHairdressingService(task.service) ? task.service : null
    const serviceType = hairdressingService?.services[0] ?? 'bath_and_brush' as const
    const serviceLabel = serviceTypeLabels[serviceType]
    const serviceColor = serviceTypeColors[serviceType]

    // If no reservation found, show minimal info
    if (!reservation) {
        return (
            <div
                ref={drag}
                onDragStart={handleDragStart}
                className={cn(
                    'h-full p-2 rounded-sm border transition-colors',
                    isDragging && 'opacity-50',
                    'bg-gray-50 border-gray-200',
                    className
                )}
            >
                <div className="flex flex-col h-full gap-1">
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap",
                            serviceColor
                        )}
                    >
                        {serviceLabel}
                    </Badge>
                    <div className="mt-auto flex items-center gap-1 text-[11px] text-gray-600">
                        <Clock className="h-3 w-3 flex-shrink-0" />
                        <span>{time} ({task.duration} min)</span>
                    </div>
                </div>
            </div>
        )
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
                    </div>
                    <div className="text-[10px] text-gray-600 truncate">
                        {reservation.pet.breed}
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap w-fit font-normal",
                            serviceColor
                        )}
                    >
                        {serviceLabel}
                    </Badge>
                </div>
            </div>
        )
    }

    // Daily view card (distributed layout)
    const isCompactView = task.duration < 45

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
                // Compact layout for short tasks
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
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap",
                                    serviceColor
                                )}
                            >
                                {serviceLabel}
                            </Badge>
                        </div>
                    </div>
                </div>
            ) : (
                // Full layout for longer tasks
                <div className="flex flex-col h-full gap-1">
                    {/* Top - Client and service info */}
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
                        {/* Right - Service */}
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap",
                                serviceColor
                            )}
                        >
                            {serviceLabel}
                        </Badge>
                    </div>
                    {showDetails && (
                        <>
                            <div className="flex items-center gap-2 text-[11px] text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">{reservation.client.phone}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                    <span>{time} ({task.duration} min)</span>
                                </div>
                                {reservation.hasDriverService && (
                                    <div className="flex items-center gap-1">
                                        <Car className="h-3 w-3 flex-shrink-0" />
                                        <span>Servicio de transporte</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
} 