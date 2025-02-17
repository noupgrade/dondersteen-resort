import { useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'

import { cn } from '@/shared/lib/styles/class-merge'
import { isHairdressingService } from '@/shared/types/service-checkers'
import { useToast } from '@/shared/ui/use-toast'
import { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { HairSalonTask } from '@monorepo/functions/src/types/reservations'
import { HairdressingServiceType } from '@monorepo/functions/src/types/services'

import { useCalendarStore } from '../model/store'
import { calculateTaskConflicts, generateId } from '../model/task-utils'
import { TaskCard } from './TaskCard'
import { TaskModal } from './TaskModal'
import { TimeSelectionModal } from './TimeSelectionModal'

interface TimeSlotProps {
    time: string
    date: string
    isAvailable?: boolean
    isWeekView?: boolean
}

export function TimeSlot({ time, date, isAvailable = true, isWeekView = false }: TimeSlotProps) {
    const {
        draggedItem,
        setDraggedItem,
        moveTask,
        createTasksFromReservation,
        scheduledTasks,
        updateTask,
        selectedTask,
        setSelectedTask,
        selectedReservation,
        setSelectedReservation,
        setScheduledTasks,
    } = useCalendarStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isTimeSelectionModalOpen, setIsTimeSelectionModalOpen] = useState(false)
    const [selectedModalTask, setSelectedModalTask] = useState<HairSalonTask | null>(null)
    const { toast } = useToast()
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const [lastTap, setLastTap] = useState(0)
    const [touchCount, setTouchCount] = useState(0)

    // Detect touch device on mount
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }, [])

    // Normalize time format to HH:mm
    const normalizeTime = (timeStr: string) => {
        // If time is in HH:mm format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr

        // If time is in H:mm format, pad with leading zero
        if (/^\d{1}:\d{2}$/.test(timeStr)) return `0${timeStr}`

        // If time is in military format (e.g. "900" for 9:00), convert to HH:mm
        if (/^\d{3,4}$/.test(timeStr)) {
            const hours = timeStr.length === 3 ? timeStr[0] : timeStr.slice(0, 2)
            const minutes = timeStr.length === 3 ? timeStr.slice(1) : timeStr.slice(2)
            return `${hours.padStart(2, '0')}:${minutes}`
        }

        return timeStr
    }

    // Find tasks for this slot
    const tasks = scheduledTasks
        .filter(t => {
            if (t.date !== date) return false

            // Get hour and minutes from both times
            const [slotHour] = normalizeTime(time).split(':').map(Number)
            const [taskHour, taskMinutes] = normalizeTime(t.time).split(':').map(Number)

            // Match if the hour is the same
            return slotHour === taskHour
        })
        .reduce(
            (groups, task) => {
                // Group by exact minutes
                const [, minutes] = normalizeTime(task.time).split(':').map(Number)
                if (!groups[minutes]) {
                    groups[minutes] = []
                }
                if (groups[minutes].length < 2) {
                    // Limit to 2 tasks per exact time
                    groups[minutes].push(task)
                }
                return groups
            },
            {} as Record<number, HairSalonTask[]>,
        )

    // Flatten and sort the groups
    const flatTasks = Object.values(tasks)
        .flat()
        .sort((a, b) => {
            const [, aMinutes] = normalizeTime(a.time).split(':').map(Number)
            const [, bMinutes] = normalizeTime(b.time).split(':').map(Number)
            return aMinutes - bMinutes
        })

    const handleTaskClick = (task: HairSalonTask) => {
        setSelectedTask(task)
    }

    const handleTaskDoubleClick = (task: HairSalonTask) => {
        setSelectedModalTask(task)
        setIsModalOpen(true)
    }

    const handleTouchStart = (task: HairSalonTask) => {
        if (!isTouchDevice) return

        const now = Date.now()
        const timeDiff = now - lastTap

        if (timeDiff < 300) {
            // Double tap
            handleTaskDoubleClick(task)
            setTouchCount(0)
            setLastTap(0)
        } else {
            setTouchCount(1)
            setLastTap(now)
            handleTaskClick(task)
        }
    }

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: ['task', 'reservation'],
        drop: async (item: { type: 'task' | 'reservation'; item: HairSalonTask | HairSalonReservation }) => {
            try {
                if (item.type === 'task') {
                    await moveTask(item.item as HairSalonTask, date, time)
                    toast({
                        title: 'Tarea movida',
                        description: 'La tarea se ha movido correctamente.',
                    })
                } else {
                    await createTasksFromReservation(item.item as HairSalonReservation, date, time)
                    toast({
                        title: 'Tareas creadas',
                        description: 'Las tareas se han creado correctamente.',
                    })
                }
            } catch (error) {
                console.error('Error al mover/crear la tarea:', error)
                toast({
                    title: 'Error',
                    description: error instanceof Error ? error.message : 'No se pudo mover/crear la tarea.',
                    variant: 'destructive',
                })
            }
        },
        collect: monitor => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })

    const handleSaveTask = async (updatedTask: HairSalonTask) => {
        try {
            await updateTask(updatedTask)
            toast({
                title: 'Cambios guardados',
                description: 'La configuración de la tarea se ha actualizado correctamente.',
            })
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error al guardar la configuración:', error)
            toast({
                title: 'Error',
                description: 'No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.',
                variant: 'destructive',
            })
        }
    }

    const handleTimeSlotClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        if (selectedReservation && isAvailable) {
            const [hour] = normalizeTime(time).split(':')
            setIsTimeSelectionModalOpen(true)
        }
    }

    const handleTimeSelection = async (minutes: number, service: HairdressingServiceType, duration: number) => {
        if (!selectedReservation) return

        console.log(minutes, service, duration)

        const hour = parseInt(normalizeTime(time).split(':')[0])
        const selectedTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

        try {
            const task: HairSalonTask = {
                id: generateId(),
                reservationId: selectedReservation.id,
                service: {
                    type: 'hairdressing' as const,
                    petIndex: selectedReservation.additionalServices.find(isHairdressingService)?.petIndex || 0,
                    services: [service],
                },
                date,
                time: selectedTime,
                duration,
            }

            console.log(task)

            // Check for conflicts
            const conflicts = calculateTaskConflicts(scheduledTasks, task)
            if (conflicts.length > 0) {
                throw new Error('La tarea entra en conflicto con otras tareas existentes')
            }

            setScheduledTasks([...scheduledTasks, task])
            setSelectedReservation(null)

            toast({
                title: 'Tarea creada',
                description: 'La tarea se ha creado correctamente.',
            })
        } catch (error) {
            console.error('Error al crear la tarea:', error)
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'No se pudo crear la tarea.',
                variant: 'destructive',
            })
        } finally {
            setIsTimeSelectionModalOpen(false)
        }
    }

    return (
        <>
            <div
                ref={drop}
                onClick={handleTimeSlotClick}
                className={cn(
                    'relative min-h-[4rem] border-b border-r pl-12 transition-colors',
                    isOver && canDrop && 'bg-blue-50',
                    !isAvailable && 'bg-gray-50',
                    selectedReservation && isAvailable && 'cursor-pointer hover:bg-blue-50',
                )}
            >
                <div className='absolute left-2 top-2 text-xs text-gray-400'>{time}</div>

                <div className='relative'>
                    {flatTasks.map(task => {
                        const minutes = parseInt(normalizeTime(task.time).split(':')[1]) || 0
                        const offsetPercentage = minutes / 60
                        console.log(offsetPercentage)

                        // Find position index within the same minute group
                        const sameMinuteTasks = tasks[minutes] || []
                        const positionIndex = sameMinuteTasks.findIndex(t => t.id === task.id)

                        return (
                            <div
                                key={task.id}
                                onClick={e => {
                                    e.stopPropagation()
                                    handleTaskClick(task)
                                }}
                                onDoubleClick={e => {
                                    e.stopPropagation()
                                    handleTaskDoubleClick(task)
                                }}
                                onTouchStart={() => handleTouchStart(task)}
                                className={cn(
                                    'absolute',
                                    positionIndex === 0 ? 'left-0 right-1/2' : 'left-1/2 right-0',
                                    !isWeekView && positionIndex === 0 && 'border-r border-gray-100',
                                    selectedTask?.id === task.id && 'ring-2 ring-blue-500',
                                )}
                                style={{
                                    height: `${Math.ceil(task.duration / 30) * 2}rem`,
                                    top: `${offsetPercentage * 4}rem`,
                                    zIndex: minutes > 0 ? 20 : task.duration > 60 ? 10 : 'auto',
                                }}
                            >
                                <TaskCard
                                    task={task}
                                    className='h-full'
                                    showDetails={!isWeekView}
                                    isWeekView={isWeekView}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>

            {selectedModalTask && (
                <TaskModal
                    task={selectedModalTask}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedModalTask(null)
                    }}
                    onSave={handleSaveTask}
                />
            )}

            {selectedReservation && (
                <TimeSelectionModal
                    isOpen={isTimeSelectionModalOpen}
                    onClose={() => setIsTimeSelectionModalOpen(false)}
                    onSelectTime={handleTimeSelection}
                    hour={normalizeTime(time).split(':')[0]}
                    reservation={selectedReservation}
                />
            )}
        </>
    )
}
