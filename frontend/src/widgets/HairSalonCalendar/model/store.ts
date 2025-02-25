import { addDays, format } from 'date-fns'
import { create } from 'zustand'

import type { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import type { HairSalonTask } from '@monorepo/functions/src/types/reservations'

import { calculateTaskConflicts, createTasksFromReservation } from './task-utils'
import type { CalendarState, CalendarView, DraggedItem } from './types'

interface CalendarStore extends CalendarState {
    setDraggedItem: (item: DraggedItem | null) => void
    setSelectedTask: (task: HairSalonTask | null) => void
    setSelectedReservation: (reservation: HairSalonReservation | null) => void
    setIsTouchMode: (isTouchMode: boolean) => void
    setView: (view: CalendarView) => void
    setSelectedDate: (date: Date) => void
    setScheduledTasks: (tasks: HairSalonTask[]) => void
    moveTask: (task: HairSalonTask, newDate: string, newTime: string) => Promise<void>
    createTasksFromReservation: (reservation: HairSalonReservation, date: string, time: string) => Promise<void>
    updateTask: (task: HairSalonTask) => Promise<void>
    deleteTask: (taskId: string) => Promise<void>
    getTasksByReservation: (reservationId: string) => HairSalonTask[]
    getTasksForTimeSlot: (date: string, time: string) => HairSalonTask[]
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
    scheduledTasks: [],
    unscheduledReservations: [],
    draggedItem: null,
    selectedTask: null,
    selectedReservation: null,
    isTouchMode: false,
    view: 'day',
    selectedDate: new Date(),

    setDraggedItem: item => set({ draggedItem: item }),
    setSelectedTask: task => set({ selectedTask: task }),
    setSelectedReservation: reservation => set({ selectedReservation: reservation }),
    setIsTouchMode: isTouchMode => set({ isTouchMode }),
    setView: (view: CalendarView) => set({ view }),
    setSelectedDate: (date: Date) => set({ selectedDate: date }),
    setScheduledTasks: tasks => set({ scheduledTasks: tasks }),

    createTasksFromReservation: async (reservation, date, time) => {
        console.log('Create task')
        const tasks = createTasksFromReservation(reservation, date, time)

        set(state => ({
            scheduledTasks: [...state.scheduledTasks, ...tasks],
            selectedReservation: null,
        }))

        return Promise.resolve()
    },

    moveTask: async (task, newDate, newTime) => {
        // Validate if the move is allowed
        const currentTasks = get().scheduledTasks
        const conflicts = calculateTaskConflicts(currentTasks, { ...task, date: newDate, time: newTime })

        if (conflicts.length > 0) {
            throw new Error('Task conflicts with existing tasks')
        }

        set(state => ({
            scheduledTasks: state.scheduledTasks.map(t =>
                t.id === task.id ? { ...t, date: newDate, time: newTime } : t,
            ),
        }))

        return Promise.resolve()
    },

    updateTask: async updatedTask => {
        set(state => ({
            scheduledTasks: state.scheduledTasks.map(t => (t.id === updatedTask.id ? updatedTask : t)),
        }))

        return Promise.resolve()
    },

    deleteTask: async taskId => {
        set(state => ({
            scheduledTasks: state.scheduledTasks.filter(t => t.id !== taskId),
        }))

        return Promise.resolve()
    },

    getTasksByReservation: reservationId => {
        return get().scheduledTasks.filter(t => t.reservationId === reservationId)
    },

    getTasksForTimeSlot: (date, time) => {
        return get().scheduledTasks.filter(t => t.date === date && t.time === time)
    },
}))
