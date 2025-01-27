import type { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { useToast } from '@/shared/ui/use-toast'
import { useState } from 'react'
import { useCalendarStore } from '../model/store'
import { HairSalonReservationModal } from './HairSalonReservationModal'
import { UnscheduledReservation } from './UnscheduledReservation'

interface UnscheduledReservationsProps {
    className?: string
}

export function UnscheduledReservations({ className }: UnscheduledReservationsProps) {
    const {
        unscheduledReservations,
        selectedReservation,
        setSelectedReservation,
    } = useCalendarStore()
    const [selectedModalReservation, setSelectedModalReservation] = useState<HairSalonReservation | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { toast } = useToast()

    const [lastTap, setLastTap] = useState(0)
    const [touchCount, setTouchCount] = useState(0)

    const handleReservationClick = (reservation: HairSalonReservation, e: React.MouseEvent) => {
        // Si es parte de un doble clic, no hacemos nada
        if (e.detail === 2) {
            return
        }

        if (selectedReservation?.id === reservation.id) {
            setSelectedReservation(null)
        } else {
            setSelectedReservation(reservation)
            toast({
                title: "Cita seleccionada",
                description: "Selecciona el hueco donde quieres crear las tareas."
            })
        }
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
            return
        }

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
                    description: "Selecciona el hueco donde quieres crear las tareas."
                })
            }
        }
    }

    const handleReservationDoubleClick = (reservation: HairSalonReservation, e: React.MouseEvent) => {
        e.preventDefault() // Prevenir el doble clic del sistema
        e.stopPropagation()
        setSelectedModalReservation(reservation)
        setIsModalOpen(true)
    }

    const handleSaveReservation = async (updatedReservation: HairSalonReservation) => {
        setIsModalOpen(false)
        setSelectedModalReservation(null)
    }

    const handleDeleteReservation = async (reservation: HairSalonReservation) => {
        // Aquí iría la lógica para eliminar la reserva
        console.log('Eliminar reserva:', reservation)
        setIsModalOpen(false)
        setSelectedModalReservation(null)
    }

    return (
        <>
            <Card className={className}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Citas confirmadas sin hora asignada esta semana</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                    <div className="overflow-x-auto min-h-[100px] p-2">
                        {unscheduledReservations.length > 0 ? (
                            <div className="flex gap-2 pb-2" style={{ minWidth: 'min-content' }}>
                                {unscheduledReservations.map((reservation) => (
                                    <UnscheduledReservation
                                        key={reservation.id}
                                        reservation={reservation}
                                        selectedReservation={selectedReservation}
                                        onReservationClick={handleReservationClick}
                                        onReservationDoubleClick={handleReservationDoubleClick}
                                        onTouchStart={handleTouchStart}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-500">
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