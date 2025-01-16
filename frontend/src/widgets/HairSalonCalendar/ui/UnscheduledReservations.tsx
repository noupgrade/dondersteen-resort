import { useState } from 'react'
import { DraggableReservation } from './DraggableReservation'
import { useCalendarStore } from '../model/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDrop } from 'react-dnd'
import type { DropTargetMonitor } from 'react-dnd'
import type { HairSalonReservation } from '@/components/ReservationContext'
import { HairSalonReservationModal } from './HairSalonReservationModal'
import { cn } from '@/lib/utils'

interface UnscheduledReservationsProps {
    className?: string
}

export function UnscheduledReservations({ className }: UnscheduledReservationsProps) {
    const { unscheduledReservations, updateReservation, draggedReservation, setDraggedReservation, moveReservation } = useCalendarStore()
    const [selectedReservation, setSelectedReservation] = useState<HairSalonReservation | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [{ canDrop, isOver }, drop] = useDrop<
        { reservation: HairSalonReservation },
        void,
        { canDrop: boolean; isOver: boolean }
    >({
        accept: 'reservation',
        canDrop: () => true,
        drop: (item) => {
            if (draggedReservation && draggedReservation.sourceTime) {
                // Solo permitimos mover citas que ya tienen hora asignada
                void moveReservation(draggedReservation.reservation, draggedReservation.reservation.date, '').then(() => {
                    setDraggedReservation(null)
                })
            }
        },
        collect: (monitor) => ({
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    })

    const handleReservationClick = (reservation: HairSalonReservation) => {
        setSelectedReservation(reservation)
        setIsModalOpen(true)
    }

    const handleSaveReservation = async (updatedReservation: HairSalonReservation) => {
        try {
            await updateReservation(updatedReservation)
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error al guardar la configuración:', error)
        }
    }

    const handleDeleteReservation = async (reservation: HairSalonReservation) => {
        // Aquí iría la lógica para eliminar la reserva
        console.log('Eliminar reserva:', reservation)
    }

    return (
        <>
            <Card className={className}>
                <CardHeader>
                    <CardTitle>Citas confirmadas sin hora asignada esta semana</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                    <div 
                        ref={drop}
                        className={cn(
                            "overflow-x-auto min-h-[100px]",
                            isOver && canDrop && "bg-blue-50/50"
                        )}
                    >
                        {unscheduledReservations.length > 0 ? (
                            <div className="flex gap-2 pb-2" style={{ minWidth: 'min-content' }}>
                                {unscheduledReservations.map((reservation) => (
                                    <div 
                                        key={reservation.id}
                                        onClick={() => handleReservationClick(reservation)}
                                        className="cursor-pointer w-[300px] flex-shrink-0"
                                    >
                                        <DraggableReservation
                                            reservation={reservation}
                                            date={reservation.date}
                                            time=""
                                            className="hover:opacity-90"
                                            showPrice={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-500">
                                Arrastra aquí las citas para quitarles la hora asignada
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedReservation && (
                <HairSalonReservationModal
                    reservation={selectedReservation}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveReservation}
                    onDelete={handleDeleteReservation}
                />
            )}
        </>
    )
} 