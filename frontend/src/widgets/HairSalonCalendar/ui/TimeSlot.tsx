import { useState, useEffect } from 'react'
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
    const { 
        draggedReservation, 
        setDraggedReservation, 
        moveReservation, 
        scheduleUnscheduledReservation, 
        scheduledReservations, 
        updateReservation,
        selectedReservation,
        setSelectedReservation
    } = useCalendarStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isClientSearchModalOpen, setIsClientSearchModalOpen] = useState(false)
    const [selectedModalReservation, setSelectedModalReservation] = useState<HairSalonReservation | null>(null)
    const { toast } = useToast()
    const [isTouchDevice, setIsTouchDevice] = useState(false)
    const [lastTap, setLastTap] = useState(0)
    const [touchCount, setTouchCount] = useState(0)

    // Detect touch device on mount
    useEffect(() => {
        setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)
    }, [])

    // Find both possible reservations for this slot
    const reservations = scheduledReservations.filter(r => 
        r.date === date && 
        r.time === time
    ).slice(0, 2) // Limit to 2 reservations per slot

    const handleSlotClick = async (e: React.MouseEvent) => {
        e.stopPropagation()
        
        if (!isAvailable || reservations.length >= 2) return

        if (selectedReservation) {
            // Si hay una reserva seleccionada, intentamos moverla a este slot
            try {
                if (selectedReservation.time) {
                    await moveReservation(selectedReservation, date, time)
                } else {
                    await scheduleUnscheduledReservation(selectedReservation, date, time)
                }
                setSelectedReservation(null)
                toast({
                    title: "Cita movida",
                    description: "La cita se ha movido correctamente."
                })
            } catch (error) {
                console.error('Error al mover la cita:', error)
                toast({
                    title: "Error",
                    description: "No se pudo mover la cita. Por favor, inténtalo de nuevo.",
                    variant: "destructive"
                })
            }
        } else {
            // Si no hay reserva seleccionada, abrimos el modal de nueva cita
            setIsClientSearchModalOpen(true)
        }
    }

    const handleReservationClick = (res: HairSalonReservation, e: React.MouseEvent) => {
        // Si es parte de un doble clic, no hacemos nada
        if (e.detail === 2) return

        if (selectedReservation?.id === res.id) {
            setSelectedReservation(null)
        } else {
            setSelectedReservation(res)
            toast({
                title: "Cita seleccionada",
                description: "Selecciona el hueco donde quieres mover la cita."
            })
        }
    }

    const handleReservationDoubleClick = (res: HairSalonReservation, e: React.MouseEvent) => {
        e.preventDefault() // Prevenir el doble clic del sistema
        e.stopPropagation()
        setSelectedModalReservation(res)
        setIsModalOpen(true)
    }

    const handleTouchStart = (res: HairSalonReservation) => {
        const now = Date.now()
        const DOUBLE_TAP_DELAY = 300 // milisegundos

        if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
            // Doble tap detectado
            setSelectedModalReservation(res)
            setIsModalOpen(true)
            setTouchCount(0)
            setLastTap(0)
        } else {
            setLastTap(now)
            setTouchCount(prev => prev + 1)
            // Si es un tap simple, manejamos la selección
            if (touchCount === 0) {
                if (selectedReservation?.id === res.id) {
                    setSelectedReservation(null)
                } else {
                    setSelectedReservation(res)
                    toast({
                        title: "Cita seleccionada",
                        description: "Selecciona el hueco donde quieres mover la cita."
                    })
                }
            }
        }
    }

    const [{ isOver, canDrop }, drop] = useDrop<
        { reservation: HairSalonReservation },
        Promise<void>,
        { isOver: boolean; canDrop: boolean }
    >({
        accept: 'reservation',
        canDrop: () => isAvailable && reservations.length < 2,
        drop: async (item) => {
            if (draggedReservation) {
                try {
                    if (draggedReservation.sourceTime) {
                        await moveReservation(draggedReservation.reservation, date, time)
                    } else {
                        await scheduleUnscheduledReservation(draggedReservation.reservation, date, time)
                    }
                    setDraggedReservation(null)
                    toast({
                        title: "Cita movida",
                        description: "La cita se ha movido correctamente."
                    })
                } catch (error) {
                    console.error('Error al mover la cita:', error)
                    toast({
                        title: "Error",
                        description: "No se pudo mover la cita. Por favor, inténtalo de nuevo.",
                        variant: "destructive"
                    })
                }
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })

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
                    !reservations.length && isAvailable && 'cursor-pointer',
                    selectedReservation && isAvailable && reservations.length < 2 && 'bg-blue-50/50'
                )}
            >
                <span className="absolute text-xs text-gray-500 px-2 py-1 pointer-events-none">{time}</span>
                <div className="absolute inset-0" onClick={handleSlotClick}>
                    {reservations.map((reservation, index) => {
                        const duration = reservation.duration || 60
                        const height = `${Math.ceil(duration / 30) * 2}rem`
                        
                        return (
                            <div 
                                key={reservation.id}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleReservationClick(reservation, e)
                                }}
                                onDoubleClick={(e) => handleReservationDoubleClick(reservation, e)}
                                onTouchStart={() => handleTouchStart(reservation)}
                                className={cn(
                                    "absolute",
                                    index === 0 ? "left-0 right-1/2" : "left-1/2 right-0",
                                    !isWeekView && index === 0 && "border-r border-gray-100",
                                    selectedReservation?.id === reservation.id && "ring-2 ring-blue-500"
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

            {selectedModalReservation && (
                <HairSalonReservationModal
                    reservation={selectedModalReservation}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedModalReservation(null)
                    }}
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