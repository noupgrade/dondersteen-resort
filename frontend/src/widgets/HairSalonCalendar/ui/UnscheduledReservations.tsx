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
import { cn } from '@/shared/lib/styles/class-merge'
import { useToast } from '@/shared/ui/use-toast'
import { Button } from '@/shared/ui/button'
import { CalendarX } from 'lucide-react'

interface UnscheduledReservationsProps {
    className?: string
}

export function UnscheduledReservations({ className }: UnscheduledReservationsProps) {
    const { 
        unscheduledReservations, 
        updateReservation, 
        draggedReservation, 
        setDraggedReservation, 
        moveReservation,
        selectedReservation,
        setSelectedReservation 
    } = useCalendarStore()
    const [selectedModalReservation, setSelectedModalReservation] = useState<HairSalonReservation | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { toast } = useToast()

    const [{ canDrop, isOver }, drop] = useDrop<
        { reservation: HairSalonReservation },
        void,
        { canDrop: boolean; isOver: boolean }
    >({
        accept: 'reservation',
        canDrop: () => true,
        drop: (item) => {
            if (draggedReservation) {
                try {
                    // Permitimos mover cualquier cita a la sección sin hora
                    void moveReservation(draggedReservation.reservation, draggedReservation.reservation.date, '').then(() => {
                        setDraggedReservation(null)
                        toast({
                            title: "Cita movida",
                            description: "La cita se ha movido a la sección sin hora asignada."
                        })
                    }).catch((error) => {
                        console.error('Error al mover la cita:', error)
                        toast({
                            title: "Error",
                            description: "No se pudo mover la cita. Por favor, inténtalo de nuevo.",
                            variant: "destructive"
                        })
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
            canDrop: monitor.canDrop(),
            isOver: monitor.isOver(),
        }),
    })

    const [lastTap, setLastTap] = useState(0)
    const [touchCount, setTouchCount] = useState(0)

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

    const handleReservationClick = (reservation: HairSalonReservation, e: React.MouseEvent) => {
        // Si es parte de un doble clic, no hacemos nada
        if (e.detail === 2) return

        if (selectedReservation?.id === reservation.id) {
            setSelectedReservation(null)
        } else {
            setSelectedReservation(reservation)
            toast({
                title: "Cita seleccionada",
                description: "Selecciona el hueco donde quieres mover la cita."
            })
        }
    }

    const handleReservationDoubleClick = (reservation: HairSalonReservation, e: React.MouseEvent) => {
        e.preventDefault() // Prevenir el doble clic del sistema
        e.stopPropagation()
        setSelectedModalReservation(reservation)
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

    const handleMoveToUnscheduled = async () => {
        if (selectedReservation?.time) {
            try {
                await moveReservation(selectedReservation, selectedReservation.date, '')
                setSelectedReservation(null)
                toast({
                    title: "Cita movida",
                    description: "La cita se ha movido a la sección sin hora asignada."
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
    }

    return (
        <>
            <Card className={className}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Citas confirmadas sin hora asignada esta semana</CardTitle>
                    {selectedReservation?.time && (
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleMoveToUnscheduled}
                            className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100"
                        >
                            <CalendarX className="h-4 w-4" />
                            <span>Mover aquí</span>
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="py-2">
                    <div 
                        ref={drop}
                        className={cn(
                            "overflow-x-auto min-h-[100px] p-2",
                            isOver && canDrop && "bg-blue-50/50 ring-2 ring-blue-500"
                        )}
                    >
                        {unscheduledReservations.length > 0 ? (
                            <div className="flex gap-2 pb-2" style={{ minWidth: 'min-content' }}>
                                {unscheduledReservations.map((reservation) => (
                                    <div 
                                        key={reservation.id}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleReservationClick(reservation, e)
                                        }}
                                        onDoubleClick={(e) => {
                                            e.stopPropagation()
                                            handleReservationDoubleClick(reservation, e)
                                        }}
                                        onTouchStart={() => handleTouchStart(reservation)}
                                        className={cn(
                                            "cursor-pointer w-[300px] flex-shrink-0",
                                            selectedReservation?.id === reservation.id && "ring-2 ring-blue-500"
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
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-500">
                                {selectedReservation?.time ? (
                                    "Pulsa el botón 'Mover aquí' para quitar la hora a la cita seleccionada"
                                ) : (
                                    "Arrastra aquí las citas para quitarles la hora asignada"
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedModalReservation && (
                <HairSalonReservationModal
                    reservation={selectedModalReservation}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false)
                        setSelectedModalReservation(null)
                    }}
                    onSave={handleSaveReservation}
                    onDelete={handleDeleteReservation}
                />
            )}
        </>
    )
} 