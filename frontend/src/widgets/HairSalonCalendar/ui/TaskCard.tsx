import { useMemo } from 'react'
import { useDrag } from 'react-dnd'
import { HairSalonTask } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'
import { HairdressingServiceType, isHairdressingService } from '@/shared/types/additional-services'
import { getTaskEndTime, isTaskInProgress } from '../model/task-utils'
import { Clock } from 'lucide-react'

interface TaskCardProps {
    task: HairSalonTask
    date: string
    time: string
    className?: string
    showDetails?: boolean
    isWeekView?: boolean
}

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

const statusColors = {
    pending: 'bg-gray-50 text-gray-700 border-gray-200',
    in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    completed: 'bg-green-50 text-green-700 border-green-200'
}

const statusLabels = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    completed: 'Completada'
}

export function TaskCard({ task, date, time, className, showDetails = true, isWeekView = false }: TaskCardProps) {
    const [{ isDragging }, drag] = useDrag({
        type: 'task',
        item: { type: 'task', item: task, sourceDate: date, sourceTime: time },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const endTime = useMemo(() => getTaskEndTime(task), [task])
    const inProgress = useMemo(() => isTaskInProgress(task), [task])

    return (
        <div
            ref={drag}
            className={cn(
                'relative flex flex-col gap-1 p-2 rounded-md border shadow-sm transition-opacity',
                isDragging && 'opacity-50',
                className
            )}
        >
            {/* Service Type */}
            {isHairdressingService(task.service) && task.service.services.map(service => (
                <Badge
                    key={service}
                    variant="outline"
                    className={cn(
                        'text-xs font-normal',
                        serviceTypeColors[service]
                    )}
                >
                    {serviceTypeLabels[service]}
                </Badge>
            ))}

            {/* Status */}
            <Badge
                variant="outline"
                className={cn(
                    'text-xs font-normal',
                    statusColors[task.status]
                )}
            >
                {statusLabels[task.status]}
            </Badge>

            {/* Time */}
            {showDetails && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{task.time} - {endTime}</span>
                </div>
            )}

            {/* In Progress Indicator */}
            {inProgress && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
            )}
        </div>
    )
} 