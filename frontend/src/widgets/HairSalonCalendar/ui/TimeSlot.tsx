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
import { ClientSearchModal } from './ClientSearchModal'

interface TimeSlotProps {
    time: string
    date: string
    isAvailable?: boolean
    isWeekView?: boolean
}

export function TimeSlot({ time, date, isAvailable = true, isWeekView = false }: TimeSlotProps) {
    const { draggedReservation, setDraggedReservation, moveReservation, scheduleUnscheduledReservation, scheduledReservations, updateReservation } = useCalendarStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isClientSearchModalOpen, setIsClientSearchModalOpen] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<HairSalonReservation | null>(null)
    const { toast } = useToast()

    // Find both possible reservations for this slot
    const reservations = scheduledReservations.filter(r => 
        r.date === date && 
        r.time === time
    ).slice(0, 2) // Limit to 2 reservations per slot

    const [{ isOver, canDrop }, drop] = useDrop<
        { reservation: HairSalonReservation },
        Promise<void>,
        { isOver: boolean; canDrop: boolean }
    >({
        accept: 'reservation',
        canDrop: () => isAvailable && reservations.length < 2,
        drop: async (item) => {
            if (draggedReservation) {
                const updatedReservation = {
                    ...draggedReservation.reservation,
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

    const handleEmptySlotClick = () => {
        if (isAvailable && reservations.length < 2) {
            setIsClientSearchModalOpen(true)
        }
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

    // Calculate individual heights for each reservation
    const getReservationStyle = (reservation: HairSalonReservation) => {
        const duration = reservation.duration || 60
        return {
            height: `${Math.ceil(duration / 30) * 2}rem`,
            position: 'relative' as const,
            zIndex: duration > 60 ? 10 : 'auto'
        }
    }

    return (
        <>
            <div
                ref={drop}
                className={cn(
                    'relative border-b border-r transition-colors min-h-[4rem]',
                    isAvailable ? 'bg-white hover:bg-gray-50' : 'bg-gray-100',
                    isOver && canDrop && 'bg-blue-50',
                    !isAvailable && 'cursor-not-allowed',
                    !reservations.length && isAvailable && 'cursor-pointer'
                )}
            >
                <span className="absolute text-xs text-gray-500 px-2 py-1 pointer-events-none">{time}</span>
                <div className="absolute inset-0" onClick={handleEmptySlotClick}>
                    {reservations.map((reservation, index) => {
                        const duration = reservation.duration || 60
                        const height = `${Math.ceil(duration / 30) * 2}rem`
                        
                        return (
                            <div 
                                key={reservation.id}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleReservationClick(reservation)
                                }} 
                                className={cn(
                                    "absolute",
                                    index === 0 ? "left-0 right-1/2" : "left-1/2 right-0",
                                    !isWeekView && index === 0 && "border-r border-gray-100"
                                )}
                                style={{
                                    height,
                                    top: 0,
                                    zIndex: duration > 60 ? 10 : 'auto'
                                }}
                            >
                                <DraggableReservation
                                    reservation={reservation}
                                    date={date}
                                    time={time}
                                    className="h-full"
                                    showPrice={!isWeekView}
                                    isWeekView={isWeekView}
                                />
                            </div>
                        )
                    })}
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

            <ClientSearchModal
                isOpen={isClientSearchModalOpen}
                onClose={() => setIsClientSearchModalOpen(false)}
                selectedDate={date}
                selectedTime={time}
            />
        </>
    )
} 