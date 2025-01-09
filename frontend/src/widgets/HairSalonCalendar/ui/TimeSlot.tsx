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
}

export function TimeSlot({ time, date, isAvailable = true }: TimeSlotProps) {
    const { draggedReservation, setDraggedReservation, moveReservation, scheduleUnscheduledReservation, scheduledReservations, updateReservation } = useCalendarStore()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<ExtendedReservation | null>(null)
    const { toast } = useToast()

    const reservation = scheduledReservations.find(r => r.date === date && r.time === time)

    const [{ isOver, canDrop }, drop] = useDrop({
        accept: 'reservation',
        canDrop: () => isAvailable && !reservation,
        drop: async (item: { reservation: ExtendedReservation }) => {
            if (draggedReservation) {
                if (draggedReservation.sourceTime) {
                    // Mover una cita existente
                    await moveReservation(draggedReservation.reservation, date, time)
                } else {
                    // Asignar hora a una cita sin hora
                    await scheduleUnscheduledReservation(draggedReservation.reservation, date, time)
                }
                setDraggedReservation(null)
            }
        },
        collect: (monitor: DropTargetMonitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    })

    const handleReservationClick = (res: ExtendedReservation) => {
        setSelectedReservation(res)
        setIsModalOpen(true)
    }

    const handleSaveReservation = async (updatedReservation: HairSalonReservation) => {
        try {
            // Convert HairSalonReservation back to ExtendedReservation
            const extendedReservation: ExtendedReservation = {
                ...updatedReservation,
                client: {
                    name: updatedReservation.client.name,
                    phone: updatedReservation.client.phone
                },
                additionalServices: updatedReservation.additionalServices.flatMap(service => {
                    if (service.type === 'hairdressing' && service.services) {
                        return service.services as HairdressingServiceType[]
                    }
                    return [] as HairdressingServiceType[]
                }),
                status: updatedReservation.status === 'propuesta peluqueria' ? 'pending_client_confirmation' : updatedReservation.status === 'cancelled' ? 'completed' : updatedReservation.status as ReservationStatus,
                subcitas: updatedReservation.subcitas?.map(subcita => ({
                    fecha: subcita.fecha,
                    descripcion: subcita.descripcion
                }))
            }
            await updateReservation(extendedReservation)
            toast({
                title: "Cambios guardados",
                description: "La configuración de la cita se ha actualizado correctamente."
            })
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
                    reservation={{
                        ...selectedReservation,
                        totalPrice: selectedReservation.precioEstimado || 0,
                        paymentStatus: 'Pendiente',
                        additionalServices: [{
                            type: 'hairdressing',
                            petIndex: 0,
                            services: selectedReservation.additionalServices as HairdressingServiceType[]
                        }],
                        client: {
                            ...selectedReservation.client,
                            email: 'no-email@example.com' // Required by type but not used in this context
                        } as Client,
                        pet: {
                            ...selectedReservation.pet,
                            size: 'mediano', // Default size
                            weight: 0 // Default weight
                        },
                        status: selectedReservation.status === 'pending_client_confirmation' ? 'pending' : selectedReservation.status === 'completed' ? 'confirmed' : selectedReservation.status,
                        subcitas: selectedReservation.subcitas?.map(subcita => ({
                            fecha: subcita.fecha,
                            hora: selectedReservation.time, // Use the current time as default
                            descripcion: subcita.descripcion
                        }))
                    }}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveReservation}
                />
            )}
        </>
    )
} 