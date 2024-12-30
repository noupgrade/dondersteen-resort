import { useCallback, useEffect, useMemo, useState } from 'react'

import { format } from 'date-fns'
import { Dog, Home, Ruler } from 'lucide-react'

import { HotelReservation, useReservation } from './ReservationContext'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/shared/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'

type PetCardProps = {
    pet: HotelReservation['pets'][0]
    onRoomAssign: (room: string) => void
    onSizeChange: (size: 'pequeño' | 'mediano' | 'grande') => void
    availableRooms: string[]
    currentPetsInRooms: { [key: string]: Array<{ name: string; breed: string; sex: string }> }
}

function RoomDisplay({ room, pets }: { room: string, pets?: Array<{ name: string; breed: string; sex: string }> }) {
    return (
        <div className="flex flex-col gap-0.25 pl-2 min-w-0">
            <div className="text-start font-medium truncate">{room}</div>
            {pets && pets.length > 0 && (
                <div className="text-xs text-muted-foreground truncate">
                    {pets.map(p => `${p.name} (${p.breed}) ${p.sex === 'M' ? '♂️' : '♀️'}`).join(', ')}
                </div>
            )}
        </div>
    )
}

function PetCard({ pet, onRoomAssign, onSizeChange, availableRooms, currentPetsInRooms }: PetCardProps) {
    return (
        <Card className="mb-4 last:mb-0">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Dog className="h-5 w-5" />
                    {pet.name}
                </CardTitle>
                <CardDescription>
                    {pet.breed} - {pet.sex === 'M' ? '♂️' : '♀️'}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <Select
                            onValueChange={onRoomAssign}
                            defaultValue={pet.roomNumber}
                        >
                            <SelectTrigger className="w-full min-h-[2.75rem]">
                                <div className="flex items-center gap-2 w-full">
                                    <Home className="h-4 w-4 shrink-0" />
                                    {pet.roomNumber ? (
                                        <RoomDisplay
                                            room={pet.roomNumber}
                                            pets={currentPetsInRooms[pet.roomNumber]}
                                        />
                                    ) : (
                                        <span>Asignar Habitación</span>
                                    )}
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <div className="max-h-[300px] overflow-auto">
                                    {availableRooms.map(room => (
                                        <SelectItem
                                            key={room}
                                            value={room}
                                            className="py-2"
                                        >
                                            <RoomDisplay
                                                room={room}
                                                pets={currentPetsInRooms[room]}
                                            />
                                        </SelectItem>
                                    ))}
                                </div>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1">
                        <Select
                            onValueChange={onSizeChange}
                            defaultValue={pet.size}
                        >
                            <SelectTrigger className="w-full min-h-[2.75rem]">
                                <div className="flex items-center gap-2">
                                    <Ruler className="h-4 w-4 shrink-0" />
                                    <SelectValue placeholder="Seleccionar Tamaño" />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pequeño">Pequeño</SelectItem>
                                <SelectItem value="mediano">Mediano</SelectItem>
                                <SelectItem value="grande">Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function CheckIns() {
    const { reservations, updateReservation } = useReservation()
    const [checkIns, setCheckIns] = useState<HotelReservation[]>([])
    const [availableRooms] = useState<string[]>([
        'HAB.1', 'HAB.2', 'HAB.3', 'HAB.4', 'HAB.5',
        'HAB.6', 'HAB.7', 'HAB.8', 'HAB.9', 'HAB.10'
    ])

    // Usar useMemo para calcular los perros en las habitaciones
    const currentPetsInRooms = useMemo(() => {
        const petsInRooms: { [key: string]: Array<{ name: string; breed: string; sex: string }> } = {}

        // Inicializar todas las habitaciones con un array vacío
        availableRooms.forEach(room => {
            petsInRooms[room] = []
        })

        // Obtener todas las reservas activas (incluyendo check-ins de hoy)
        const today = format(new Date(), 'yyyy-MM-dd')
        const activeReservations = [
            ...reservations.filter(r =>
                r.type === 'hotel' &&
                r.status === 'confirmed' &&
                (new Date(r.checkOutDate) > new Date() || r.checkOutDate === today)
            ),
            // Incluir también los check-ins de hoy que aún no tienen habitación asignada
            ...checkIns
        ]

        // Mapear todas las mascotas a sus habitaciones
        activeReservations.forEach(reservation => {
            if (reservation.type === 'hotel') {
                reservation.pets.forEach(pet => {
                    if (pet.roomNumber) {
                        petsInRooms[pet.roomNumber].push({
                            name: pet.name,
                            breed: pet.breed,
                            sex: pet.sex
                        })
                    }
                })
            }
        })

        return petsInRooms
    }, [reservations, availableRooms, checkIns])

    useEffect(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const todayCheckIns = reservations.filter(
            r => r.type === 'hotel' &&
                r.checkInDate === today &&
                r.status === 'confirmed'
        ) as HotelReservation[]

        setCheckIns(todayCheckIns)
    }, [reservations])

    const handleRoomAssign = useCallback(async (reservationId: string, petIndex: number, room: string) => {
        const reservation = checkIns.find(r => r.id === reservationId)
        if (!reservation) return

        const updatedPets = [...reservation.pets]
        updatedPets[petIndex] = { ...updatedPets[petIndex], roomNumber: room }

        try {
            // Actualizar la reserva en el contexto
            await updateReservation(reservationId, {
                pets: updatedPets,
                // Actualizar también el roomNumber de la reserva si es el primer perro asignado
                roomNumber: reservation.roomNumber || room
            })

            // Actualizar el estado local de checkIns
            setCheckIns(prevCheckIns =>
                prevCheckIns.map(r =>
                    r.id === reservationId
                        ? { ...r, pets: updatedPets, roomNumber: r.roomNumber || room }
                        : r
                )
            )
        } catch (error) {
            console.error('Error al asignar habitación:', error)
            // Aquí podrías añadir una notificación de error si lo deseas
        }
    }, [checkIns, updateReservation])

    const handleSizeChange = useCallback(async (
        reservationId: string,
        petIndex: number,
        size: 'pequeño' | 'mediano' | 'grande'
    ) => {
        const reservation = checkIns.find(r => r.id === reservationId)
        if (!reservation) return

        const updatedPets = [...reservation.pets]
        const oldSize = updatedPets[petIndex].size
        updatedPets[petIndex] = { ...updatedPets[petIndex], size }

        // Ajustar el precio basado en el cambio de tamaño
        const priceAdjustments = {
            pequeño: 20,
            mediano: 25,
            grande: 30
        }

        const oldPrice = priceAdjustments[oldSize]
        const newPrice = priceAdjustments[size]
        const priceDifference = newPrice - oldPrice

        const newTotalPrice = reservation.totalPrice + priceDifference

        await updateReservation(reservationId, {
            pets: updatedPets,
            totalPrice: newTotalPrice
        })
    }, [checkIns, updateReservation])

    if (checkIns.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No hay check-ins programados para hoy
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {checkIns.map(reservation => (
                <Card key={reservation.id} className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>{reservation.client.name}</CardTitle>
                        <CardDescription>
                            Check-in: {reservation.checkInTime} - {reservation.pets.length} mascotas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {reservation.pets.map((pet, index) => (
                            <PetCard
                                key={index}
                                pet={pet}
                                onRoomAssign={(room) => handleRoomAssign(reservation.id, index, room)}
                                onSizeChange={(size) => handleSizeChange(reservation.id, index, size)}
                                availableRooms={availableRooms}
                                currentPetsInRooms={currentPetsInRooms}
                            />
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
