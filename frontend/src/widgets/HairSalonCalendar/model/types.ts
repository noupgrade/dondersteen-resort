import type { ExtendedReservation } from '@/types/reservation'

export type CalendarView = 'day' | 'week'

export interface CalendarSlot {
    time: string
    date: string
    isAvailable: boolean
    reservation?: ExtendedReservation
}

export interface DraggedReservation {
    reservation: ExtendedReservation
    sourceDate: string
    sourceTime: string
}

export interface CalendarState {
    view: CalendarView
    selectedDate: Date
    draggedReservation: DraggedReservation | null
    unscheduledReservations: ExtendedReservation[]
    scheduledReservations: ExtendedReservation[]
}

export interface CalendarActions {
    setView: (view: CalendarView) => void
    setSelectedDate: (date: Date) => void
    setDraggedReservation: (reservation: DraggedReservation | null) => void
    moveReservation: (reservation: ExtendedReservation, newDate: string, newTime: string) => Promise<void>
    createReservation: (reservation: Omit<ExtendedReservation, 'id'>) => Promise<void>
    scheduleUnscheduledReservation: (reservation: ExtendedReservation, date: string, time: string) => Promise<void>
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