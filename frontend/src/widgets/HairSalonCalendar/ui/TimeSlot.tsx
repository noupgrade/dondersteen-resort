import { useState } from 'react'
import { useDrop } from 'react-dnd'
import type { DropTargetMonitor } from 'react-dnd'

import type { ExtendedReservation, ReservationStatus } from '@/types/reservation'
import { useCalendarStore } from '../model/store'
import { cn } from '@/shared/lib/styles/class-merge'
import { DraggableReservation } from './DraggableReservation'
import { useToast } from '@/shared/ui/use-toast'
import { HairSalonReservationModal } from './HairSalonReservationModal'
import { HairSalonReservation, type Client } from '@/components/ReservationContext'
import { HairdressingServiceType } from '@/shared/types/additional-services'

interface TimeSlotProps {
    time: string
    date: string
    isAvailable?: boolean
    hairdresser?: 'hairdresser1' | 'hairdresser2'
}

export function TimeSlot({ time, date, isAvailable = true, hairdresser }: TimeSlotProps) {
    const { draggedReservation, setDraggedReservation, moveReservation, scheduleUnscheduledReservation, scheduledReservations, updateReservation } = useCalendarStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<HairSalonReservation | null>(null)
    const { toast } = useToast()

    const reservation = scheduledReservations.find(r => 
        r.date === date && 
        r.time === time && 
        (!hairdresser || r.hairdresser === hairdresser)
    )

    const [{ isOver, canDrop }, drop] = useDrop<
        { reservation: HairSalonReservation },
        Promise<void>,
        { isOver: boolean; canDrop: boolean }
    >({
        accept: 'reservation',
        canDrop: () => isAvailable && !reservation,
        drop: async (item) => {
            if (draggedReservation) {
                const updatedReservation = {
                    ...draggedReservation.reservation,
                    hairdresser: hairdresser || draggedReservation.reservation.hairdresser
                }
                if (draggedReservation.sourceTime) {
                    // Mover una cita existente
                    await moveReservation(updatedReservation, date, time)
                } else {
                    // Asignar hora a una cita sin hora
                    await scheduleUnscheduledReservation(updatedReservation, date, time)
                }
                setDraggedReservation(null)
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })

    const handleReservationClick = (res: HairSalonReservation) => {
        setSelectedReservation(res)
        setIsModalOpen(true)
    }

    const handleSaveReservation = async (updatedReservation: HairSalonReservation) => {
        try {
            await updateReservation(updatedReservation)
            toast({
                title: "Cambios guardados",
                description: "La configuración de la cita se ha actualizado correctamente."
            })
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error al guardar la configuración:', error)
            toast({
                title: "Error",
                description: "No se pudieron guardar los cambios. Por favor, inténtalo de nuevo.",
                variant: "destructive"
            })
        }
    }

    return (
        <>
            <div
                ref={drop}
                className={cn(
                    'relative border-b border-r transition-colors',
                    isAvailable ? 'bg-white hover:bg-gray-50' : 'bg-gray-100',
                    isOver && canDrop && 'bg-blue-50',
                    !isAvailable && 'cursor-not-allowed',
                    !reservation && isAvailable && 'cursor-pointer'
                )}
                style={
                    reservation 
                        ? { 
                            height: `${Math.ceil((reservation.duration || 60) / 30) * 2}rem`,
                            position: 'relative',
                            zIndex: reservation.duration && reservation.duration > 60 ? 10 : 'auto'
                        } 
                        : { height: '4rem' }
                }
            >
                <div className="flex h-full flex-col">
                    <span className="text-xs text-gray-500 px-2 py-1">{time}</span>
                    {reservation && (
                        <div 
                            onClick={() => handleReservationClick(reservation)} 
                            className="absolute inset-0"
                        >
                            <DraggableReservation
                                reservation={reservation}
                                date={date}
                                time={time}
                                className="h-full"
                                showPrice={true}
                            />
                        </div>
                    )}
                </div>
            </div>

            {selectedReservation && (
                <HairSalonReservationModal
                    reservation={selectedReservation}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveReservation}
                />
            )}
        </>
    )
} 