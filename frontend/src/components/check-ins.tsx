import { useMemo, useState } from 'react'

import { Dog, Home, Ruler } from 'lucide-react'
import { Calendar } from 'lucide-react'

import { useCheckIns } from '@/components/ReservationContext'
import { ROOMS } from '@/shared/types/rooms'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { HotelReservation, PetSize } from '@monorepo/functions/src/types/reservations'

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
                        <Select onValueChange={onRoomAssign} value={pet.roomNumber}>
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

let lastRenderTime = performance.now()

export function CheckIns() {
    console.log('CheckIns')
    console.log('Current time:', performance.now())
    const { checkIns, isLoading, handleRoomAssign, handleSizeChange } = useCheckIns()
    console.log('CheckIns hooks finished')

    const currentPetsInRooms = useMemo(() => {
        console.log('Current time:', performance.now())
        const startTime = performance.now()
        console.log('checkIns', checkIns)
        const petsInRooms: { [key: string]: Array<{ name: string; breed: string; sex: string }> } = ROOMS.reduce(
            (acc, room) => {
                acc[room] = []
                return acc
            },
            {} as { [key: string]: Array<{ name: string; breed: string; sex: string }> },
        )

        checkIns.forEach(reservation => {
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
        const endTime = performance.now()
        console.log('petsInRooms', petsInRooms)
        console.log(`Time taken to measure pets in rooms: ${endTime - startTime} milliseconds`)
        return petsInRooms
    }, [checkIns])

    if (isLoading) {
        console.log('CheckIns isLoading')
        return <div className='py-8 text-center text-muted-foreground'>Cargando check-ins...</div>
    }

    if (checkIns.length === 0) {
        console.log('CheckIns checkIns.length === 0')
        return (
            <Alert variant='info' className='mt-2'>
                <Calendar className='h-4 w-4' />
                <AlertTitle>Sin check-ins</AlertTitle>
                <AlertDescription>No hay entradas programadas para el día de hoy.</AlertDescription>
            </Alert>
        )
    }

    console.log('Rendering CheckIns for reservations:', checkIns)
    const renderTime = performance.now()
    console.log(`Time taken to render CheckIns: ${renderTime - lastRenderTime} milliseconds`)
    lastRenderTime = renderTime

    const el = (
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
                                key={pet.name + index}
                                pet={pet}
                                onRoomAssign={room => handleRoomAssign(reservation.id, pet.name, room)}
                                onSizeChange={size => handleSizeChange(reservation.id, index, size)}
                                availableRooms={ROOMS}
                                currentPetsInRooms={currentPetsInRooms}
                            />
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
    console.log('Current time:', performance.now())
    return el
}
