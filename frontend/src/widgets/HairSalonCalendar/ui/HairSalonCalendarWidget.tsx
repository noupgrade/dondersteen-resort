import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { TouchBackend } from 'react-dnd-touch-backend'

import { useCalendarStore } from '../model/store'
import { CalendarSyncProvider } from './CalendarSyncProvider'
import { UnscheduledReservations } from './UnscheduledReservations'
import { CalendarGrid } from './CalendarGrid'
import { CalendarHeader } from './CalendarHeader'

export function HairSalonCalendarWidget() {
    const { isTouchMode } = useCalendarStore()

    return (
        <CalendarSyncProvider>
            <DndProvider backend={isTouchMode ? TouchBackend : HTML5Backend} options={{ enableMouseEvents: true }}>
                <div className="flex flex-col h-full">
                    <UnscheduledReservations className="mb-4" />
                    <CalendarHeader />
                    <CalendarGrid />
                </div>
            </DndProvider>
        </CalendarSyncProvider>
    )
} 