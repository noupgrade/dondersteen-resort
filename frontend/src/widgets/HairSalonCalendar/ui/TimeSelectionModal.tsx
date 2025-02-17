import { useEffect, useState } from 'react'

import { isHairdressingService } from '@/shared/types/service-checkers'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { HairSalonReservation } from '@monorepo/functions/src/types/reservations'
import { HairdressingServiceType } from '@monorepo/functions/src/types/services'

import { useCalendarStore } from '../model/store'

interface TimeSelectionModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectTime: (minutes: number, service: HairdressingServiceType, duration: number) => void
    hour: string
    reservation: HairSalonReservation
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
    extremely_dirty: 'Extremadamente sucio',
}

export function TimeSelectionModal({ isOpen, onClose, onSelectTime, hour, reservation }: TimeSelectionModalProps) {
    const minutes = [0, 15, 30, 45]
    const durations = [15, 30, 45, 60, 75, 90]
    const { scheduledTasks } = useCalendarStore()

    const [selectedService, setSelectedService] = useState<HairdressingServiceType | ''>('')
    const [selectedDuration, setSelectedDuration] = useState<string>('60')

    // Get all available services
    const allServices: HairdressingServiceType[] = [
        'bath_and_brush',
        'bath_and_trim',
        'stripping',
        'deshedding',
        'brushing',
        'spa',
        'spa_ozone',
        'knots',
        'extremely_dirty',
    ]

    // Find the first unassigned service from the reservation
    useEffect(() => {
        if (isOpen) {
            const hairdressingService = reservation.additionalServices.find(isHairdressingService)
            if (hairdressingService) {
                // Get all services from the reservation
                const reservationServices = hairdressingService.services

                // Get all services that already have tasks assigned
                const assignedServices = scheduledTasks
                    .filter(task => task.reservationId === reservation.id)
                    .map(task => {
                        if (isHairdressingService(task.service)) {
                            return task.service.services[0]
                        }
                        return null
                    })
                    .filter((service): service is HairdressingServiceType => service !== null)

                // Find the first service that doesn't have a task
                const firstUnassignedService = reservationServices.find(service => !assignedServices.includes(service))

                if (firstUnassignedService) {
                    setSelectedService(firstUnassignedService)
                }
            }
        }
    }, [isOpen, reservation, scheduledTasks])

    const handleTimeSelect = (minute: number) => {
        if (!selectedService) return
        onSelectTime(minute, selectedService, parseInt(selectedDuration))
    }

    // Reset state when modal closes
    const handleClose = () => {
        setSelectedService('')
        setSelectedDuration('60')
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='sm:max-w-[425px]'>
                <DialogHeader>
                    <DialogTitle>Crear tarea</DialogTitle>
                </DialogHeader>
                <div className='grid gap-4 py-4'>
                    {/* Service selection */}
                    <div className='space-y-2'>
                        <Label>Servicio</Label>
                        <Select
                            value={selectedService}
                            onValueChange={value => setSelectedService(value as HairdressingServiceType)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder='Selecciona un servicio' />
                            </SelectTrigger>
                            <SelectContent>
                                {allServices.map(service => (
                                    <SelectItem key={service} value={service}>
                                        {serviceTypeLabels[service]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Duration selection */}
                    <div className='space-y-2'>
                        <Label>Duración (minutos)</Label>
                        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                            <SelectTrigger>
                                <SelectValue placeholder='Selecciona la duración' />
                            </SelectTrigger>
                            <SelectContent>
                                {durations.map(duration => (
                                    <SelectItem key={duration} value={duration.toString()}>
                                        {duration} minutos
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Time selection */}
                    <div className='space-y-2'>
                        <Label>Hora de inicio</Label>
                        <div className='grid grid-cols-2 gap-4'>
                            {minutes.map(minute => (
                                <Button
                                    key={minute}
                                    onClick={() => handleTimeSelect(minute)}
                                    variant='outline'
                                    className='text-lg'
                                    disabled={!selectedService}
                                >
                                    {hour}:{minute.toString().padStart(2, '0')}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
