import { addMinutes, parse } from 'date-fns'

import { isHairdressingService } from '@/shared/types/isHairdressingService'
import { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { HairSalonTask } from '@monorepo/functions/src/types/reservations'
import { HairdressingServiceType } from '@monorepo/functions/src/types/services'

export const DEFAULT_DURATIONS: Record<HairdressingServiceType, number> = {
    bath_and_brush: 60,
    bath_and_trim: 90,
    stripping: 120,
    deshedding: 90,
    brushing: 45,
    spa: 45,
    spa_ozone: 60,
    knots: 30,
    extremely_dirty: 90,
}

// Helper to generate unique IDs
export function generateId(): string {
    return Math.random().toString(36).substr(2, 9)
}

// Helper to add minutes to a time string (HH:mm)
export function addMinutesToTimeString(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, mins)
    const newDate = addMinutes(date, minutes)
    return `${String(newDate.getHours()).padStart(2, '0')}:${String(newDate.getMinutes()).padStart(2, '0')}`
}

export function createTasksFromReservation(
    reservation: HairSalonReservation,
    initialDate: string,
    initialTime: string,
): HairSalonTask[] {
    const tasks: HairSalonTask[] = []
    let currentTime = initialTime

    reservation.additionalServices.filter(isHairdressingService).forEach(service => {
        service.services.forEach(serviceType => {
            tasks.push({
                id: generateId(),
                reservationId: reservation.id,
                service: {
                    type: 'hairdressing',
                    petIndex: service.petIndex,
                    services: [serviceType],
                },
                date: initialDate,
                time: currentTime,
                duration: DEFAULT_DURATIONS[serviceType],
            })

            // Calculate next task start time
            currentTime = addMinutesToTimeString(currentTime, DEFAULT_DURATIONS[serviceType])
        })
    })

    return tasks
}

export function validateTaskSequence(tasks: HairSalonTask[]): boolean {
    // TODO: Implement validation logic for task sequence
    // For example: certain services must come before others
    return true
}

export function calculateTaskConflicts(tasks: HairSalonTask[], newTask: HairSalonTask): HairSalonTask[] {
    const conflicts: HairSalonTask[] = []
    const newTaskStart = parse(`${newTask.date} ${newTask.time}`, 'yyyy-MM-dd HH:mm', new Date())
    const newTaskEnd = addMinutes(newTaskStart, newTask.duration)

    tasks.forEach(task => {
        if (task.id === newTask.id) return // Skip the task itself

        if (task.date === newTask.date) {
            const taskStart = parse(`${task.date} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date())
            const taskEnd = addMinutes(taskStart, task.duration)

            // Check if tasks overlap
            if (
                (newTaskStart >= taskStart && newTaskStart < taskEnd) ||
                (newTaskEnd > taskStart && newTaskEnd <= taskEnd) ||
                (newTaskStart <= taskStart && newTaskEnd >= taskEnd)
            ) {
                conflicts.push(task)
            }
        }
    })

    return conflicts
}

export function getTaskEndTime(task: HairSalonTask): string {
    return addMinutesToTimeString(task.time, task.duration)
}

export function isTaskInProgress(task: HairSalonTask): boolean {
    const now = new Date()
    const taskDate = parse(`${task.date} ${task.time}`, 'yyyy-MM-dd HH:mm', new Date())
    const taskEnd = addMinutes(taskDate, task.duration)

    return now >= taskDate && now < taskEnd
}
