import { useCallback, useEffect, useMemo, useState } from 'react'

import { format } from 'date-fns'
import { Dog, Home, Ruler } from 'lucide-react'

import { useReservation, useTodayCheckIns } from '@/components/ReservationContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'
import { PetSize } from '@monorepo/functions/src/types/reservations'
import { ROOMS } from '@/shared/types/rooms'

type PetCardProps = {
    pet: HotelReservation['pets'][0]
    onRoomAssign: (room: string) => void
    onSizeChange: (size: PetSize) => void
    availableRooms: string[]
    currentPetsInRooms: { [key: string]: Array<{ name: string; breed: string; sex: string }> }
}

function RoomDisplay({ room, pets }: { room: string; pets?: Array<{ name: string; breed: string; sex: string }> }) {
    return (
        <div className='gap-0.25 flex min-w-0 flex-col pl-2'>
            <div className='truncate text-start font-medium'>{room}</div>
            {pets && pets.length > 0 && (
                <div className='truncate text-xs text-muted-foreground'>
                    {pets.map(p => `${p.name} (${p.breed}) ${p.sex === 'M' ? '♂️' : '♀️'}`).join(', ')}
                </div>
            )}
        </div>
    )
}

function PetCard({ pet, onRoomAssign, onSizeChange, availableRooms, currentPetsInRooms }: PetCardProps) {
    return (
        <Card className='mb-4 last:mb-0'>
            <CardHeader className='pb-2'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
                    <Dog className='h-5 w-5' />
                    {pet.name}
                </CardTitle>
                <CardDescription>
                    {pet.breed} - {pet.sex === 'M' ? '♂️' : '♀️'} - {pet.isNeutered ? 'Castrado/a' : 'No castrado/a'}
                </CardDescription>
            </CardHeader>
            <CardContent className='grid gap-4'>
                <div className='flex items-center gap-4'>
                    <div className='flex-1'>
                        <Select onValueChange={onRoomAssign} defaultValue={pet.roomNumber}>
                            <SelectTrigger
                                className={`min-h-[2.75rem] w-full ${!pet.roomNumber ? 'border-amber-300 bg-amber-100 hover:bg-amber-200' : ''}`}
                            >
                                <div className='flex w-full items-center gap-2'>
                                    <Home className={`h-4 w-4 shrink-0 ${!pet.roomNumber ? 'text-amber-500' : ''}`} />
                                    {pet.roomNumber ? (
                                        <RoomDisplay room={pet.roomNumber} pets={currentPetsInRooms[pet.roomNumber]} />
                                    ) : (
                                        <span className='text-amber-700'>Asignar Habitación</span>
                                    )}
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <div className='max-h-[300px] overflow-auto'>
                                    {availableRooms.map(room => (
                                        <SelectItem key={room} value={room} className='py-2'>
                                            <RoomDisplay room={room} pets={currentPetsInRooms[room]} />
                                        </SelectItem>
                                    ))}
                                </div>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className='flex-1'>
                        <Select onValueChange={onSizeChange} defaultValue={pet.size}>
                            <SelectTrigger className='min-h-[2.75rem] w-full'>
                                <div className='flex items-center gap-2'>
                                    <Ruler className='h-4 w-4 shrink-0' />
                                    <SelectValue placeholder='Seleccionar Tamaño' />
                                </div>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='pequeño'>Pequeño</SelectItem>
                                <SelectItem value='mediano'>Mediano</SelectItem>
                                <SelectItem value='grande'>Grande</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function CheckIns() {
    const { reservations: checkIns, isLoading } = useTodayCheckIns()
    const { updateReservation } = useReservation()
    const [availableRooms] = useState<string[]>(ROOMS)

    const handleRoomAssign = useCallback(
        (reservationId: string, petName: string, room: string) => {
            const reservation = checkIns.find(r => r.id === reservationId)
            if (reservation) {
                const updatedPets = reservation.pets.map(p => (p.name === petName ? { ...p, roomNumber: room } : p))
                updateReservation(reservationId, {
                    pets: updatedPets,
                })
            }
        },
        [checkIns, updateReservation],
    )

    // Usar useMemo para calcular los perros en las habitaciones
    const currentPetsInRooms = useMemo(() => {
        const petsInRooms: { [key: string]: Array<{ name: string; breed: string; sex: string }> } = {}

        // Inicializar todas las habitaciones con un array vacío
        availableRooms.forEach(room => {
            petsInRooms[room] = []
        })

        // Obtener todas las reservas activas (incluyendo check-ins de hoy)
        const today = format(new Date(), 'yyyy-MM-dd')
        const activeReservations = checkIns

        // Mapear todas las mascotas a sus habitaciones
        activeReservations.forEach(reservation => {
            reservation.pets.forEach(pet => {
                if (pet.roomNumber) {
                    petsInRooms[pet.roomNumber].push({
                        name: pet.name,
                        breed: pet.breed,
                        sex: pet.sex,
                    })
                }
            })
        })

        return petsInRooms
    }, [availableRooms, checkIns])

    const handleSizeChange = useCallback(
        async (reservationId: string, petIndex: number, size: 'pequeño' | 'mediano' | 'grande') => {
            const reservation = checkIns.find(r => r.id === reservationId)
            if (!reservation) return

            const updatedPets = [...reservation.pets]
            const oldSize = updatedPets[petIndex].size
            updatedPets[petIndex] = { ...updatedPets[petIndex], size }

            // Ajustar el precio basado en el cambio de tamaño
            const priceAdjustments = {
                pequeño: 20,
                mediano: 25,
                grande: 30,
            }

            const oldPrice = priceAdjustments[oldSize]
            const newPrice = priceAdjustments[size]
            const priceDifference = newPrice - oldPrice

            const newTotalPrice = reservation.totalPrice + priceDifference

            await updateReservation(reservationId, {
                pets: updatedPets,
                totalPrice: newTotalPrice,
            })
        },
        [checkIns, updateReservation],
    )

    if (isLoading) {
        return <div className='py-8 text-center text-muted-foreground'>Cargando check-ins...</div>
    }

    if (checkIns.length === 0) {
        return <div className='py-8 text-center text-muted-foreground'>No hay check-ins programados para hoy</div>
    }

    return (
        <div className='space-y-6'>
            {checkIns.map(reservation => (
                <Card key={reservation.id} className='overflow-hidden'>
                    <CardHeader>
                        <CardTitle>{reservation.client.name}</CardTitle>
                        <CardDescription>
                            Check-in: {reservation.checkInTime} - {reservation.pets.length} mascotas
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='grid gap-4'>
                        {reservation.pets.map((pet, index) => (
                            <PetCard
                                key={index}
                                pet={pet}
                                onRoomAssign={room => handleRoomAssign(reservation.id, pet.name, room)}
                                onSizeChange={size => handleSizeChange(reservation.id, index, size)}
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
