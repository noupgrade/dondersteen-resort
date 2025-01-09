import type { HairSalonReservation } from '@/components/ReservationContext'

export type CalendarView = 'day' | 'week'

export interface CalendarSlot {
    time: string
    date: string
    isAvailable: boolean
    reservation?: HairSalonReservation
}

export interface DraggedReservation {
    reservation: HairSalonReservation
    sourceDate: string
    sourceTime: string
}

export interface CalendarState {
    view: CalendarView
    selectedDate: Date
    draggedReservation: DraggedReservation | null
    unscheduledReservations: HairSalonReservation[]
    scheduledReservations: HairSalonReservation[]
}

export interface CalendarActions {
    setView: (view: CalendarView) => void
    setSelectedDate: (date: Date) => void
    setDraggedReservation: (reservation: DraggedReservation | null) => void
    moveReservation: (reservation: HairSalonReservation, newDate: string, newTime: string) => Promise<void>
    createReservation: (reservation: Omit<HairSalonReservation, 'id'>) => Promise<void>
    scheduleUnscheduledReservation: (reservation: HairSalonReservation, date: string, time: string) => Promise<void>
    updateReservation: (updatedReservation: HairSalonReservation) => Promise<void>
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