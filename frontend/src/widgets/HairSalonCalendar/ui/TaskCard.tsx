import { useDrag } from 'react-dnd'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Car, Clock, Phone } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { isHairdressingService } from '@/shared/types/isHairdressingService'
import { Badge } from '@/shared/ui/badge'
import { HairSalonTask } from '@monorepo/functions/src/types/reservations'
import { HairdressingServiceType } from '@monorepo/functions/src/types/services'

import { useCalendarStore } from '../model/store'

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono',
    knots: 'Nudos',
    extremely_dirty: 'Extremadamente sucio',
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
    extremely_dirty: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

interface TaskCardProps {
    task: HairSalonTask
    className?: string
    showDetails?: boolean
    isWeekView?: boolean
}

export function TaskCard({ task, className, showDetails = true, isWeekView = false }: TaskCardProps) {
    const { setDraggedItem } = useCalendarStore()
    const { reservations } = useReservation()

    // Get the associated reservation
    const reservation = reservations.find(r => r.id === task.reservationId)

    const [{ isDragging }, drag] = useDrag({
        type: 'task',
        item: { type: 'task', item: task },
        collect: monitor => ({
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
    const serviceType = hairdressingService?.services[0] ?? ('bath_and_brush' as const)
    const serviceLabel = serviceTypeLabels[serviceType]
    const serviceColor = serviceTypeColors[serviceType]

    // If no reservation found, show minimal info
    if (!reservation) {
        return (
            <div
                ref={drag}
                onDragStart={handleDragStart}
                className={cn(
                    'h-full rounded-sm border p-2 transition-colors',
                    isDragging && 'opacity-50',
                    'border-gray-200 bg-gray-50',
                    className,
                )}
            >
                <div className='flex h-full flex-col gap-1'>
                    <Badge
                        variant='outline'
                        className={cn('whitespace-nowrap border-[1.5px] px-1.5 py-0 text-[10px]', serviceColor)}
                    >
                        {serviceLabel}
                    </Badge>
                    <div className='mt-auto flex items-center gap-1 text-[11px] text-gray-600'>
                        <Clock className='h-3 w-3 flex-shrink-0' />
                        <span>
                            {task.time} ({task.duration} min)
                        </span>
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
                    'h-full rounded-sm border p-1 transition-colors',
                    isDragging && 'opacity-50',
                    reservation.source === 'hotel' ? 'border-emerald-200 bg-emerald-50' : 'border-pink-200 bg-pink-50',
                    className,
                )}
            >
                <div className='flex h-full flex-col text-xs'>
                    <div className='flex items-center gap-1'>
                        <div className='truncate font-bold'>{reservation.pet.name}</div>
                    </div>
                    <div className='truncate text-[10px] text-gray-600'>{reservation.pet.breed}</div>
                    <Badge
                        variant='outline'
                        className={cn(
                            'w-fit whitespace-nowrap border-[1.5px] px-1.5 py-0 text-[10px] font-normal',
                            serviceColor,
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
                'h-full rounded-sm border p-2 transition-colors',
                isDragging && 'opacity-50',
                reservation.source === 'hotel' ? 'border-emerald-200 bg-emerald-50' : 'border-pink-200 bg-pink-50',
                className,
            )}
        >
            {isCompactView ? (
                // Compact layout for short tasks
                <div className='flex h-full flex-col gap-1'>
                    <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                            <div className='flex items-center gap-1 text-sm'>
                                <span className='truncate font-bold'>{reservation.pet.name}</span>
                                <span className='truncate text-[10px] text-gray-600'>({reservation.pet.breed})</span>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                            <Badge
                                variant='outline'
                                className={cn('whitespace-nowrap border-[1.5px] px-1.5 py-0 text-[10px]', serviceColor)}
                            >
                                {serviceLabel}
                            </Badge>
                        </div>
                    </div>
                </div>
            ) : (
                // Full layout for longer tasks
                <div className='flex h-full flex-col gap-1'>
                    {/* Top - Client and service info */}
                    <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                            <div className='flex items-center gap-1 text-sm'>
                                <span className='truncate font-bold'>{reservation.pet.name}</span>
                                <span className='truncate text-[10px] text-gray-600'>({reservation.pet.breed})</span>
                            </div>
                        </div>
                        {/* Right - Service */}
                        <Badge
                            variant='outline'
                            className={cn('whitespace-nowrap border-[1.5px] px-1.5 py-0 text-[10px]', serviceColor)}
                        >
                            {serviceLabel}
                        </Badge>
                    </div>
                    {showDetails && (
                        <>
                            <div className='flex items-center gap-2 text-[11px] text-gray-600'>
                                <div className='flex items-center gap-1'>
                                    <Phone className='h-3 w-3 flex-shrink-0' />
                                    <span className='truncate'>{reservation.client.phone}</span>
                                </div>
                                <div className='flex items-center gap-1'>
                                    <Clock className='h-3 w-3 flex-shrink-0' />
                                    <span>
                                        {task.time} ({task.duration} min)
                                    </span>
                                </div>
                                {reservation.hasDriverService && (
                                    <div className='flex items-center gap-1'>
                                        <Car className='h-3 w-3 flex-shrink-0' />
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
