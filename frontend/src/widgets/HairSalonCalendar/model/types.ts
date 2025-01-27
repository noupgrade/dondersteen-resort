import type { HairSalonReservation, HairSalonTask } from '@/components/ReservationContext'

export type CalendarView = 'day' | 'week'

export interface CalendarSlot {
    time: string
    date: string
    isAvailable: boolean
    tasks?: HairSalonTask[]
}

export type DraggedItem = {
    type: 'reservation' | 'task'
    item: HairSalonReservation | HairSalonTask
    sourceDate?: string
    sourceTime?: string
}

export interface CalendarState {
    view: CalendarView
    selectedDate: Date
    draggedItem: DraggedItem | null
    unscheduledReservations: HairSalonReservation[]
    scheduledTasks: HairSalonTask[]
    selectedTask: HairSalonTask | null
    isTouchMode: boolean
}

export interface CalendarActions {
    setView: (view: CalendarView) => void
    setSelectedDate: (date: Date) => void
    setDraggedItem: (item: DraggedItem | null) => void
    setSelectedTask: (task: HairSalonTask | null) => void
    setIsTouchMode: (isTouchMode: boolean) => void
    moveTask: (task: HairSalonTask, newDate: string, newTime: string) => Promise<void>
    createTasksFromReservation: (reservation: HairSalonReservation, date: string, time: string) => Promise<void>
    updateTask: (task: HairSalonTask) => Promise<void>
    deleteTask: (taskId: string) => Promise<void>
    getTasksByReservation: (reservationId: string) => HairSalonTask[]
    getTasksForTimeSlot: (date: string, time: string) => HairSalonTask[]
}

export interface TimeSlot {
    hour: number
    minute: number
    formatted: string
}

export const BUSINESS_HOURS = {
    start: 8,
    end: 19
} 