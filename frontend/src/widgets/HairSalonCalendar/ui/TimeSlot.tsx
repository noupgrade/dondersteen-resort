import { useEffect, useState } from 'react'
import { useDrop } from 'react-dnd'

import { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { useToast } from '@/shared/ui/use-toast'
import { useCalendarStore } from '../model/store'
import { ClientSearchModal } from './ClientSearchModal'
import { DraggableReservation } from './DraggableReservation'
import { HairSalonReservationModal } from './HairSalonReservationModal'

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

    // Normalize time format to HH:mm
    const normalizeTime = (timeStr: string) => {
        // If time is in HH:mm format, return as is
        if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr

        // If time is in H:mm format, pad with leading zero
        if (/^\d{1}:\d{2}$/.test(timeStr)) return `0${timeStr}`

        // If time is in military format (e.g. "900" for 9:00), convert to HH:mm
        if (/^\d{3,4}$/.test(timeStr)) {
            const hours = timeStr.length === 3 ? timeStr[0] : timeStr.slice(0, 2)
            const minutes = timeStr.length === 3 ? timeStr.slice(1) : timeStr.slice(2)
            return `${hours.padStart(2, '0')}:${minutes}`
        }

        return timeStr
    }

    // Find reservations for this slot
    const reservations = scheduledReservations.filter(r => {
        if (r.date !== date) return false

        // Get hour and minutes from both times
        const [slotHour] = normalizeTime(time).split(':').map(Number)
        const [reservationHour, reservationMinutes] = normalizeTime(r.time).split(':').map(Number)

        // Match if the hour is the same
        return slotHour === reservationHour
    })
        .reduce((groups, reservation) => {
            // Group by exact minutes
            const [, minutes] = normalizeTime(reservation.time).split(':').map(Number)
            if (!groups[minutes]) {
                groups[minutes] = []
            }
            if (groups[minutes].length < 2) { // Limit to 2 reservations per exact time
                groups[minutes].push(reservation)
            }
            return groups
        }, {} as Record<number, HairSalonReservation[]>)

    // Flatten and sort the groups
    const flatReservations = Object.values(reservations)
        .flat()
        .sort((a, b) => {
            const [, aMinutes] = normalizeTime(a.time).split(':').map(Number)
            const [, bMinutes] = normalizeTime(b.time).split(':').map(Number)
            return aMinutes - bMinutes
        })

    const handleSlotClick = async (e: React.MouseEvent) => {
        e.stopPropagation()

        if (!isAvailable) return

        // Show time picker dialog
        const selectedMinute = await showTimePickerDialog(time)
        if (!selectedMinute) return

        const newTime = `${time.split(':')[0]}:${selectedMinute}`
        const minutes = parseInt(selectedMinute)

        // Check if we can add another reservation at these minutes
        if (reservations[minutes]?.length >= 2) {
            toast({
                title: "Error",
                description: "Ya hay dos citas programadas para este horario exacto.",
                variant: "destructive"
            })
            return
        }

        if (selectedReservation) {
            // Si hay una reserva seleccionada, intentamos moverla a este slot
            try {
                if (selectedReservation.time) {
                    await moveReservation(selectedReservation, date, newTime)
                } else {
                    await scheduleUnscheduledReservation(selectedReservation, date, newTime)
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

    // Function to show time picker dialog
    const showTimePickerDialog = (hour: string): Promise<string | null> => {
        return new Promise((resolve) => {
            const dialog = document.createElement('dialog')
            dialog.innerHTML = `
                <div class="p-4">
                    <h3 class="mb-4">Seleccionar minuto</h3>
                    <div class="grid grid-cols-4 gap-2">
                        ${['00', '15', '30', '45'].map(minute => `
                            <button class="p-2 border rounded hover:bg-gray-100" data-minute="${minute}">
                                ${minute}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `

            // Style the dialog
            dialog.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg'

            // Add click handlers
            dialog.querySelectorAll('button').forEach(button => {
                button.onclick = () => {
                    const minute = button.getAttribute('data-minute')
                    dialog.remove()
                    resolve(minute)
                }
            })

            // Add click outside to cancel
            dialog.addEventListener('click', (e) => {
                if (e.target === dialog) {
                    dialog.remove()
                    resolve(null)
                }
            })

            document.body.appendChild(dialog)
            dialog.showModal()
        })
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
        canDrop: () => {
            if (!isAvailable) return false
            if (!draggedReservation) return false

            // Get the target minutes from the dragged reservation
            const [, targetMinutes] = normalizeTime(time).split(':').map(Number)

            // Check how many reservations exist at the target minutes
            const existingAtTime = reservations[targetMinutes]?.length || 0

            return existingAtTime < 2
        },
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
        const minutes = parseInt(normalizeTime(reservation.time).split(':')[1]) || 0
        const offsetPercentage = (minutes / 60) * 100

        return {
            height: `${Math.ceil(duration / 30) * 2}rem`,
            position: 'relative' as const,
            zIndex: duration > 60 ? 10 : 'auto',
            top: `${offsetPercentage}%`
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
                    !Object.values(reservations).flat().length && isAvailable && 'cursor-pointer',
                    selectedReservation && isAvailable && 'bg-blue-50/50'
                )}
                style={{ overflow: 'visible' }}
            >
                <span className="absolute text-xs text-gray-500 px-2 py-1 pointer-events-none">{time}</span>
                <div className="absolute inset-0" onClick={handleSlotClick} style={{ overflow: 'visible' }}>
                    {flatReservations.map((reservation) => {
                        const duration = reservation.duration || 60
                        const minutes = parseInt(normalizeTime(reservation.time).split(':')[1]) || 0
                        const offsetPercentage = (minutes / 60) * 100
                        const height = `${Math.ceil(duration / 30) * 2}rem`

                        // Find position index within the same minute group
                        const sameMinuteReservations = reservations[minutes] || []
                        const positionIndex = sameMinuteReservations.findIndex(r => r.id === reservation.id)

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
                                    positionIndex === 0 ? "left-0 right-1/2" : "left-1/2 right-0",
                                    !isWeekView && positionIndex === 0 && "border-r border-gray-100",
                                    selectedReservation?.id === reservation.id && "ring-2 ring-blue-500"
                                )}
                                style={{
                                    height,
                                    top: `${offsetPercentage}%`,
                                    zIndex: minutes > 0 ? 20 : (duration > 60 ? 10 : 'auto')
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