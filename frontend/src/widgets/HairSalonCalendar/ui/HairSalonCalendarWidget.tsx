import { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

import { useCalendarStore } from '../model/store'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { UnscheduledReservations } from './UnscheduledReservations'
import { CalendarSyncProvider } from './CalendarSyncProvider'

export function HairSalonCalendarWidget() {
    const { isTouchMode } = useCalendarStore()

    return (
        <CalendarSyncProvider>
            <DndProvider backend={isTouchMode ? TouchBackend : HTML5Backend} options={{ enableMouseEvents: true }}>
                <div className="flex flex-col h-full">
                    <CalendarHeader />
                    <div className="flex gap-4 flex-1">
                        <CalendarGrid />
                        <UnscheduledReservations />
                    </div>
                </div>
            </DndProvider>
        </CalendarSyncProvider>
    )
} 