import type { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { useDrag } from 'react-dnd'
import { useCalendarStore } from '../model/store'
import { DraggableReservation } from './DraggableReservation'

interface UnscheduledReservationProps {
    reservation: HairSalonReservation
    selectedReservation: HairSalonReservation | null
    onReservationClick: (reservation: HairSalonReservation, e: React.MouseEvent) => void
    onReservationDoubleClick: (reservation: HairSalonReservation, e: React.MouseEvent) => void
    onTouchStart: (reservation: HairSalonReservation) => void
}

export function UnscheduledReservation({
    reservation,
    selectedReservation,
    onReservationClick,
    onReservationDoubleClick,
    onTouchStart
}: UnscheduledReservationProps) {
    const { setDraggedItem } = useCalendarStore()

    const [{ isDragging }, drag] = useDrag({
        type: 'reservation',
        item: { type: 'reservation', item: reservation },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: () => {
            setDraggedItem(null)
        }
    })

    return (
        <div
            ref={drag}
            onClick={(e) => {
                e.stopPropagation()
                onReservationClick(reservation, e)
            }}
            onDoubleClick={(e) => {
                e.stopPropagation()
                onReservationDoubleClick(reservation, e)
            }}
            onTouchStart={() => onTouchStart(reservation)}
            className={cn(
                "cursor-pointer w-[300px] flex-shrink-0",
                selectedReservation?.id === reservation.id && "ring-2 ring-blue-500",
                isDragging && "opacity-50"
            )}
        >
            <DraggableReservation
                reservation={reservation}
                date={reservation.date}
                time=""
                className="hover:opacity-90"
                showPrice={true}
            />
        </div>
    )
} 