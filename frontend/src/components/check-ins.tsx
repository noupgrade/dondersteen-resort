import { useEffect, useState } from 'react'

import { Clock } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type Room = {
    number: string
    status: 'occupied' | 'free'
}

type Pet = {
    name: string
    breed: string
    assignedRoom?: string
}

type CheckIn = {
    id: string
    clientName: string
    pets: Pet[]
    checkInTime: string
    status: 'confirmed' | 'pending' | 'Hab.Asignada'
}

// Mock data for available rooms
const availableRooms: Room[] = [
    { number: '101', status: 'free' },
    { number: '102', status: 'free' },
    { number: '103', status: 'occupied' },
    { number: '104', status: 'free' },
    { number: '105', status: 'free' },
]

export function CheckIns() {
    const [checkIns, setCheckIns] = useState<CheckIn[]>([])
    const { reservations, updateReservation } = useReservation()

    useEffect(() => {
        // Filter and map reservations to checkIns
        const todayCheckIns = reservations
            .filter(r => r.type === 'hotel' && new Date(r.date).toDateString() === new Date().toDateString())
            .map(r => ({
                id: r.id,
                clientName: r.client.name,
                pets: r.pets?.map(pet => ({ name: pet.name, breed: pet.breed })) || [],
                checkInTime: r.time,
                status: r.status as 'confirmed' | 'pending' | 'Hab.Asignada',
            }))
        setCheckIns(todayCheckIns)
    }, [reservations])

    const handleAssignRoom = (checkInId: string, petName: string, roomNumber: string) => {
        const checkIn = checkIns.find(c => c.id === checkInId)
        if (checkIn) {
            const updatedPets = checkIn.pets.map(pet =>
                pet.name === petName ? { ...pet, assignedRoom: roomNumber } : pet,
            )

            const allPetsAssigned = updatedPets.every(pet => pet.assignedRoom)
            const newStatus = allPetsAssigned ? 'Hab.Asignada' : 'pending'

            // Actualizar el estado local
            setCheckIns(prevCheckIns =>
                prevCheckIns.map(c => (c.id === checkInId ? { ...c, pets: updatedPets, status: newStatus } : c)),
            )

            // Actualizar el contexto de reservación
            updateReservation(checkInId, {
                pets: updatedPets,
                roomNumber: allPetsAssigned ? roomNumber : undefined,
                status: newStatus,
            })
        }
    }

    return (
        <div className='space-y-4'>
            {checkIns.map(checkIn => (
                <Card key={checkIn.id} className='overflow-hidden'>
                    <CardHeader className='bg-gray-50'>
                        <CardTitle className='flex items-center justify-between text-lg font-semibold'>
                            <span>
                                {checkIn.clientName} - {checkIn.pets.map(pet => pet.name).join(', ')}
                            </span>
                            <Badge
                                variant={
                                    checkIn.status === 'Hab.Asignada'
                                        ? 'default'
                                        : checkIn.pets.some(pet => pet.assignedRoom)
                                            ? 'secondary'
                                            : 'outline'
                                }
                            >
                                {checkIn.status === 'Hab.Asignada'
                                    ? 'Hab.Asignada'
                                    : checkIn.pets.some(pet => pet.assignedRoom)
                                        ? 'Asignación Parcial'
                                        : 'Pendiente'}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='pt-4'>
                        <div className='space-y-4'>
                            {checkIn.pets.map((pet, index) => (
                                <div key={index} className='flex items-center justify-between'>
                                    <div>
                                        <p className='text-sm text-gray-500'>Raza: {pet.breed}</p>
                                        {pet.assignedRoom && (
                                            <p className='text-sm text-green-600'>
                                                Habitación asignada: {pet.assignedRoom}
                                            </p>
                                        )}
                                    </div>
                                    {!pet.assignedRoom && (
                                        <Select
                                            onValueChange={value => handleAssignRoom(checkIn.id, pet.name, value)}
                                            value={pet.assignedRoom}
                                        >
                                            <SelectTrigger className='w-[180px]'>
                                                <SelectValue placeholder='Asignar habitación' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms
                                                    .filter(room => room.status === 'free')
                                                    .map(room => (
                                                        <SelectItem key={room.number} value={room.number}>
                                                            Habitación {room.number}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}
                            <div className='mt-4 flex items-center justify-between'>
                                <div className='flex items-center text-sm text-gray-500'>
                                    <Clock className='mr-2 h-4 w-4' />
                                    Hora de entrada: {checkIn.checkInTime}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
