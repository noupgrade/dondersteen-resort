import { create } from 'zustand'

type CalendarView = 'day' | 'week'

interface CalendarStore {
    view: CalendarView
    selectedDate: Date
    setView: (view: CalendarView) => void
    setSelectedDate: (date: Date) => void
}

export const useCalendarStore = create<CalendarStore>((set) => ({
    view: 'week',
    selectedDate: new Date(),
    setView: (view) => set({ view }),
    setSelectedDate: (date) => set({ selectedDate: date }),
})) 