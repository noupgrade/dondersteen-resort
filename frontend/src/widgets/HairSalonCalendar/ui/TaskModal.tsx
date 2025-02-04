import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Eye } from 'lucide-react'
import { HairSalonTask } from '@/components/ReservationContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { HairdressingServiceType, isHairdressingService } from '@/shared/types/additional-services'
import { DEFAULT_DURATIONS } from '../model/task-utils'
import { DatePicker } from '@/shared/ui/date-picker'
import { useReservation } from '@/components/ReservationContext'
import { HairSalonReservationModal } from './HairSalonReservationModal'

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
    const { reservations } = useReservation()
    const [duration, setDuration] = useState(task.duration?.toString() || '60')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(task.date))
    const [selectedTime, setSelectedTime] = useState(task.time)
    const [selectedService, setSelectedService] = useState<HairdressingServiceType | ''>('')
    const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)

    // Get the associated reservation
    const reservation = reservations.find(r => r.id === task.reservationId)

    // Get current service
    const hairdressingService = isHairdressingService(task.service) ? task.service : null
    const currentService = hairdressingService?.services[0]

    // Get all available services from the reservation
    const reservationHairdressingService = reservation?.additionalServices.find(isHairdressingService)
    const availableServices = reservationHairdressingService?.services || []

    // Initialize selected service with current one
    useState(() => {
        if (currentService) {
            setSelectedService(currentService)
        }
    })

    const handleSave = () => {
        if (!selectedService) {
            alert('Por favor, selecciona un servicio')
            return
        }

        onSave({
            ...task,
            date: format(selectedDate, 'yyyy-MM-dd'),
            time: selectedTime,
            duration: parseInt(duration),
            service: {
                type: 'hairdressing',
                petIndex: task.service.petIndex,
                services: [selectedService]
            }
        })
    }

    const handleDateSelect = (date: Date | undefined) => {
        if (date) {
            setSelectedDate(date)
        }
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Tarea</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Service Selection */}
                        <div className="space-y-2">
                            <Label>Servicio</Label>
                            <Select value={selectedService} onValueChange={setSelectedService}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona el servicio" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableServices.map((service) => (
                                        <SelectItem key={service} value={service}>
                                            {serviceTypeLabels[service]}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date and Time */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <DatePicker
                                    date={selectedDate}
                                    onSelect={handleDateSelect}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Hora</Label>
                                <Input
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                />
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

                        {/* View Reservation Button */}
                        {reservation && (
                            <Button
                                variant="outline"
                                className="w-full flex items-center gap-2"
                                onClick={() => setIsReservationModalOpen(true)}
                            >
                                <Eye className="h-4 w-4" />
                                Ver Reserva Completa
                            </Button>
                        )}
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

            {/* Reservation Modal */}
            {reservation && (
                <HairSalonReservationModal
                    reservation={reservation}
                    isOpen={isReservationModalOpen}
                    onClose={() => setIsReservationModalOpen(false)}
                    onSave={() => {
                        // We don't want to save changes from here
                        setIsReservationModalOpen(false)
                    }}
                />
            )}
        </>
    )
} 