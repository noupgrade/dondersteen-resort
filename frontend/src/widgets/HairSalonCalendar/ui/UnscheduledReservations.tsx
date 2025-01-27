import { useState } from 'react'
import { DraggableReservation } from './DraggableReservation'
import { useCalendarStore } from '../model/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useDrop, useDrag } from 'react-dnd'
import type { DropTargetMonitor } from 'react-dnd'
import type { HairSalonReservation } from '@/components/ReservationContext'
import { HairSalonReservationModal } from './HairSalonReservationModal'
import { cn } from '@/shared/lib/styles/class-merge'
import { useToast } from '@/shared/ui/use-toast'
import { Button } from '@/shared/ui/button'
import { CalendarX, Car } from 'lucide-react'
import { Badge } from '@/shared/ui/badge'
import { HairdressingServiceType, isHairdressingService } from '@/shared/types/additional-services'

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono',
    knots: 'Nudos',
    extremely_dirty: 'Extremadamente sucio'
}

const serviceTypeColors: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'bg-blue-50 text-blue-700 border-blue-200',
    bath_and_trim: 'bg-green-50 text-green-700 border-green-200',
    stripping: 'bg-purple-50 text-purple-700 border-purple-200',
    deshedding: 'bg-orange-50 text-orange-700 border-orange-200',
    brushing: 'bg-pink-50 text-pink-700 border-pink-200',
    spa: 'bg-teal-50 text-teal-700 border-teal-200',
    spa_ozone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    knots: 'bg-red-50 text-red-700 border-red-200',
    extremely_dirty: 'bg-yellow-50 text-yellow-700 border-yellow-200'
}

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
        setSelectedReservation,
        setDraggedItem
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
            <Card className={cn("w-[300px] shrink-0", className)}>
                <CardHeader>
                    <CardTitle>Citas sin asignar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {unscheduledReservations.map((reservation) => {
                            const [{ isDragging }, drag] = useDrag({
                                type: 'reservation',
                                item: { type: 'reservation', item: reservation },
                                collect: (monitor) => ({
                                    isDragging: monitor.isDragging(),
                                }),
                            })

                            return (
                                <div
                                    key={reservation.id}
                                    ref={drag}
                                    className={cn(
                                        'p-4 rounded-lg border bg-card transition-opacity',
                                        isDragging && 'opacity-50'
                                    )}
                                >
                                    <div className="space-y-4">
                                        {/* Client and Pet Info */}
                                        <div className="space-y-2">
                                            <div>
                                                <h3 className="font-medium">{reservation.pet.name}</h3>
                                                <p className="text-sm text-muted-foreground">{reservation.pet.breed}</p>
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {reservation.client.name}
                                            </div>
                                        </div>

                                        {/* Services */}
                                        <div className="space-y-2">
                                            {reservation.additionalServices
                                                .filter(isHairdressingService)
                                                .map((service, index) => (
                                                    <div key={index} className="space-y-1">
                                                        {service.services.map(serviceType => (
                                                            <Badge
                                                                key={serviceType}
                                                                variant="outline"
                                                                className={cn(
                                                                    'text-xs font-normal',
                                                                    serviceTypeColors[serviceType]
                                                                )}
                                                            >
                                                                {serviceTypeLabels[serviceType]}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                ))}
                                        </div>

                                        {/* Driver Service */}
                                        {reservation.hasDriverService && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Car className="h-4 w-4" />
                                                <span>Servicio de recogida incluido</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}

                        {unscheduledReservations.length === 0 && (
                            <div className="text-center text-sm text-muted-foreground">
                                No hay citas sin asignar
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