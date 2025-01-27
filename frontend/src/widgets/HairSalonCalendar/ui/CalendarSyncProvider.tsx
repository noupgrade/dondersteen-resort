import { useEffect } from 'react'
import { useReservation } from '@/components/ReservationContext'
import { useCalendarStore } from '../model/store'

interface CalendarSyncProviderProps {
    children: React.ReactNode
}

export function CalendarSyncProvider({ children }: CalendarSyncProviderProps) {
    const { reservations, updateReservation } = useReservation()
    const {
        scheduledTasks,
        setScheduledTasks,
        moveTask,
        updateTask,
        deleteTask,
        createTasksFromReservation
    } = useCalendarStore()

    // Initialize tasks from reservations
    useEffect(() => {
        const tasks = reservations
            .filter(r => r.type === 'peluqueria')
            .flatMap(r => r.tasks || [])
        setScheduledTasks(tasks)
    }, [reservations, setScheduledTasks])

    // Sync task changes back to reservations
    useEffect(() => {
        const updateReservationTasks = async () => {
            // Group tasks by reservation
            const tasksByReservation = scheduledTasks.reduce((acc, task) => {
                if (!acc[task.reservationId]) {
                    acc[task.reservationId] = []
                }
                acc[task.reservationId].push(task)
                return acc
            }, {} as Record<string, typeof scheduledTasks>)

            // Update each reservation
            for (const [reservationId, tasks] of Object.entries(tasksByReservation)) {
                const reservation = reservations.find(r => r.id === reservationId && r.type === 'peluqueria')
                if (reservation) {
                    await updateReservation(reservationId, {
                        ...reservation,
                        tasks
                    })
                }
            }
        }

        updateReservationTasks()
    }, [scheduledTasks, reservations, updateReservation])

    return <>{children}</>
} 