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

interface UnscheduledReservationsProps {
    className?: string
}

export function UnscheduledReservations({ className }: UnscheduledReservationsProps) {
    const { unscheduledReservations, view, selectedDate, draggedReservation, setDraggedReservation, moveReservation, updateReservation } = useCalendarStore()
    const [selectedReservation, setSelectedReservation] = useState<HairSalonReservation | null>(null)

    const [{ isOver }, drop] = useDrop({
        accept: 'reservation',
        drop: async (item: { reservation: HairSalonReservation }) => {
            if (draggedReservation && draggedReservation.sourceTime) {
                // Solo permitimos mover citas que ya tienen hora asignada
                const updatedReservation = {
                    ...draggedReservation.reservation,
                    time: '', // Eliminar la hora asignada
                }
                await moveReservation(updatedReservation, draggedReservation.reservation.date, '')
                setDraggedReservation(null)
            }
        },
        collect: (monitor: DropTargetMonitor) => ({
            isOver: monitor.isOver(),
        }),
    })

    // Filtrar las citas según la vista actual
    const filteredReservations = unscheduledReservations.filter(reservation => {
        // Solo mostrar citas confirmadas que tienen fecha pero no hora
        if (reservation.status !== 'confirmed' || !reservation.date || reservation.time) {
            return false
        }

        if (view === 'day') {
            // Para vista diaria, mostrar solo las citas del día seleccionado
            return reservation.date === format(selectedDate, 'yyyy-MM-dd')
        } else {
            // Para vista semanal, mostrar las citas de la semana seleccionada
            const weekStart = startOfWeek(selectedDate, { locale: es })
            const weekDates = Array.from({ length: 7 }, (_, i) => 
                format(addDays(weekStart, i), 'yyyy-MM-dd')
            )
            return weekDates.includes(reservation.date)
        }
    })

    const handleReservationClick = (reservation: HairSalonReservation) => {
        setSelectedReservation(reservation)
    }

    const handleSaveReservation = async (updatedReservation: HairSalonReservation) => {
        await updateReservation(updatedReservation)
        setSelectedReservation(null)
    }

    const handleDeleteReservation = async (reservation: HairSalonReservation) => {
        // Aquí implementarías la lógica para eliminar la reserva
        // Por ahora solo cerramos el modal
        setSelectedReservation(null)
    }

    if (filteredReservations.length === 0) {
        return null
    }

    return (
        <>
            <Card 
                ref={drop} 
                className={className}
                style={{ 
                    backgroundColor: isOver ? 'rgba(59, 130, 246, 0.1)' : undefined,
                    transition: 'background-color 0.2s ease'
                }}
            >
                <CardHeader className="py-4">
                    <CardTitle className="text-lg">
                        Citas confirmadas sin hora asignada {view === 'day' ? 'para hoy' : 'esta semana'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                    <div className="overflow-x-auto">
                        <div className="flex gap-2 pb-2" style={{ minWidth: 'min-content' }}>
                            {filteredReservations.map((reservation) => (
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
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {selectedReservation && (
                <HairSalonReservationModal
                    reservation={selectedReservation}
                    isOpen={!!selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    onSave={handleSaveReservation}
                    onDelete={handleDeleteReservation}
                />
            )}
        </>
    )
} 