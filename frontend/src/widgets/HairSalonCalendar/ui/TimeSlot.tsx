import { useState } from 'react'
import { useDrop } from 'react-dnd'
import type { DropTargetMonitor } from 'react-dnd'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import type { ExtendedReservation } from '@/types/reservation'
import { useCalendarStore } from '../model/store'
import { cn } from '@/shared/lib/styles/class-merge'
import { DraggableReservation } from './DraggableReservation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Checkbox } from '@/shared/ui/checkbox'
import { Textarea } from '@/shared/ui/textarea'
import { useToast } from '@/shared/ui/use-toast'

interface TimeSlotProps {
    time: string
    date: string
    isAvailable?: boolean
}

export function TimeSlot({ time, date, isAvailable = true }: TimeSlotProps) {
    const { draggedReservation, setDraggedReservation, moveReservation, scheduleUnscheduledReservation, scheduledReservations, updateReservation, createReservation } = useCalendarStore()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<ExtendedReservation | null>(null)
    const [duration, setDuration] = useState('60')
    const [price, setPrice] = useState('')
    const [createSubcitas, setCreateSubcitas] = useState(false)
    const [subcitas, setSubcitas] = useState<Array<{ fecha: string; descripcion: string }>>([])
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
        setDuration(res.duration?.toString() || '60')
        setPrice(res.precioEstimado?.toString() || '')
        setCreateSubcitas(!!res.subcitas?.length)
        setSubcitas(res.subcitas || [])
        setIsDialogOpen(true)
    }

    const handleSaveConfig = async () => {
        if (!selectedReservation) return

        try {
            // Actualizar la reserva principal
            const updatedReservation: ExtendedReservation = {
                ...selectedReservation,
                duration: parseInt(duration),
                precioEstimado: price ? parseFloat(price) : undefined,
                subcitas: createSubcitas ? subcitas : undefined
            }

            await updateReservation(updatedReservation)

            // Si hay subcitas y es una reserva de hotel, crear nuevas citas
            if (createSubcitas && selectedReservation.source === 'hotel' && subcitas.length > 0) {
                for (const subcita of subcitas) {
                    const newReservation: Omit<ExtendedReservation, 'id'> = {
                        type: 'peluqueria',
                        source: 'hotel',
                        date: subcita.fecha,
                        time: '', // Se asignará después desde la sección de citas sin asignar
                        client: selectedReservation.client,
                        pet: selectedReservation.pet,
                        additionalServices: [subcita.descripcion],
                        status: 'confirmed',
                        duration: 60, // Duración por defecto
                        precioEstimado: undefined, // Se establecerá cuando se asigne la hora
                        observations: `Subcita de la reserva ${selectedReservation.id} - ${subcita.descripcion}`
                    }
                    await createReservation(newReservation)
                }
            }

            toast({
                title: "Cambios guardados",
                description: createSubcitas && selectedReservation.source === 'hotel' 
                    ? "La configuración se ha actualizado y se han creado las subcitas."
                    : "La configuración de la cita se ha actualizado correctamente."
            })

            setIsDialogOpen(false)
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Configurar cita</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="duration" className="text-right">
                                Duración (min)
                            </Label>
                            <Input
                                id="duration"
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="col-span-3"
                                min="30"
                                step="30"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Precio (€)
                            </Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="col-span-3"
                                min="0"
                                step="0.01"
                            />
                        </div>
                        {selectedReservation?.source === 'hotel' && (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="subcitas"
                                    checked={createSubcitas}
                                    onCheckedChange={(checked) => {
                                        setCreateSubcitas(checked as boolean)
                                        if (checked) {
                                            setSubcitas([{ fecha: date, descripcion: 'Baño' }])
                                        } else {
                                            setSubcitas([])
                                        }
                                    }}
                                />
                                <Label htmlFor="subcitas">Crear subcitas adicionales</Label>
                            </div>
                        )}
                        {createSubcitas && selectedReservation?.source === 'hotel' && (
                            <div className="space-y-4">
                                <p className="text-sm text-muted-foreground">
                                    Las subcitas se crearán como nuevas citas pendientes de asignar hora.
                                </p>
                                {subcitas.map((subcita, index) => (
                                    <div key={index} className="grid gap-2 border rounded-lg p-4">
                                        <Label>Tipo de servicio</Label>
                                        <Input
                                            value={subcita.descripcion}
                                            onChange={(e) => {
                                                const newSubcitas = [...subcitas]
                                                newSubcitas[index].descripcion = e.target.value
                                                setSubcitas(newSubcitas)
                                            }}
                                            placeholder="Ej: Baño, Corte, etc."
                                        />
                                        <Label className="mt-2">Fecha</Label>
                                        <Input
                                            type="date"
                                            value={subcita.fecha}
                                            onChange={(e) => {
                                                const newSubcitas = [...subcitas]
                                                newSubcitas[index].fecha = e.target.value
                                                setSubcitas(newSubcitas)
                                            }}
                                        />
                                        {subcitas.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="mt-2"
                                                onClick={() => {
                                                    setSubcitas(subcitas.filter((_, i) => i !== index))
                                                }}
                                            >
                                                Eliminar subcita
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setSubcitas([...subcitas, { fecha: date, descripcion: 'Baño' }])}
                                >
                                    Añadir otra subcita
                                </Button>
                            </div>
                        )}
                        {createSubcitas && selectedReservation?.source !== 'hotel' && (
                            <p className="text-sm text-red-500">
                                La creación de subcitas solo está disponible para reservas de hotel.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleSaveConfig}>Guardar cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
} 