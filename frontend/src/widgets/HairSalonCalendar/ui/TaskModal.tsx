import { useState } from 'react'
import { HairSalonTask } from '@/components/ReservationContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { HairdressingServiceType, isHairdressingService } from '@/shared/types/additional-services'
import { DEFAULT_DURATIONS } from '../model/task-utils'

interface TaskModalProps {
    task: HairSalonTask
    isOpen: boolean
    onClose: () => void
    onSave: (updatedTask: HairSalonTask) => void
}

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

const durationOptions = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180]

export function TaskModal({ task, isOpen, onClose, onSave }: TaskModalProps) {
    const [duration, setDuration] = useState(task.duration?.toString() || '60')
    const [status, setStatus] = useState(task.status || 'pending')

    const handleSave = () => {
        onSave({
            ...task,
            duration: parseInt(duration),
            status
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Tarea</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Service Info */}
                    <div className="space-y-2">
                        <Label>Servicio</Label>
                        <div className="text-sm text-muted-foreground">
                            {isHairdressingService(task.service) && task.service.services.map(service => (
                                <span key={service} className="block">
                                    {serviceTypeLabels[service]}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="duration">Duración (minutos)</Label>
                        <Select value={duration} onValueChange={setDuration}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona la duración" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {durationOptions.map((mins) => (
                                    <SelectItem key={mins} value={mins.toString()}>
                                        {mins} minutos
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Estado</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona el estado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pendiente</SelectItem>
                                <SelectItem value="in_progress">En progreso</SelectItem>
                                <SelectItem value="completed">Completada</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
} 