import { useMemo, useState } from 'react'

import { Calendar, Check, ChevronsUpDown, Dog, Home, Ruler } from 'lucide-react'

import { useCheckIns } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { ROOMS } from '@/shared/types/rooms'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
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
    const [openRoom, setOpenRoom] = useState(false)
    const [openSize, setOpenSize] = useState(false)

    const sizes = [
        { value: 'pequeño', label: 'Pequeño' },
        { value: 'mediano', label: 'Mediano' },
        { value: 'grande', label: 'Grande' },
    ]

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
                        <Popover open={openRoom} onOpenChange={setOpenRoom}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    role='combobox'
                                    aria-expanded={openRoom}
                                    className={cn(
                                        'min-h-[2.75rem] w-full justify-between',
                                        !pet.roomNumber ? 'border-amber-300 bg-amber-100 hover:bg-amber-200' : '',
                                    )}
                                >
                                    <div className='flex w-full items-center gap-2'>
                                        <Home
                                            className={`h-4 w-4 shrink-0 ${!pet.roomNumber ? 'text-amber-500' : ''}`}
                                        />
                                        {pet.roomNumber ? (
                                            <RoomDisplay
                                                room={pet.roomNumber}
                                                pets={currentPetsInRooms[pet.roomNumber]}
                                            />
                                        ) : (
                                            <span className='text-amber-700'>Asignar Habitación</span>
                                        )}
                                    </div>
                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                                <Command>
                                    <CommandInput placeholder='Buscar habitación...' />
                                    <CommandEmpty>No se encontraron habitaciones.</CommandEmpty>
                                    <CommandList className='max-h-[300px] overflow-auto'>
                                        {availableRooms.map(room => (
                                            <CommandItem
                                                key={room}
                                                value={room}
                                                onSelect={() => {
                                                    onRoomAssign(room)
                                                    setOpenRoom(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        pet.roomNumber === room ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                                <RoomDisplay room={room} pets={currentPetsInRooms[room]} />
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className='flex-1'>
                        <Popover open={openSize} onOpenChange={setOpenSize}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant='outline'
                                    role='combobox'
                                    aria-expanded={openSize}
                                    className='min-h-[2.75rem] w-full justify-between'
                                >
                                    <div className='flex items-center gap-2'>
                                        <Ruler className='h-4 w-4 shrink-0' />
                                        <span>
                                            {sizes.find(s => s.value === pet.size)?.label || 'Seleccionar Tamaño'}
                                        </span>
                                    </div>
                                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[--radix-popover-trigger-width] p-0'>
                                <Command>
                                    <CommandInput placeholder='Buscar tamaño...' />
                                    <CommandEmpty>No se encontraron tamaños.</CommandEmpty>
                                    <CommandList>
                                        {sizes.map(size => (
                                            <CommandItem
                                                key={size.value}
                                                value={size.value}
                                                onSelect={() => {
                                                    onSizeChange(size.value as PetSize)
                                                    setOpenSize(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        pet.size === size.value ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                                {size.label}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export function CheckIns() {
    const { checkIns, isLoading, handleRoomAssign, handleSizeChange } = useCheckIns()

    const currentPetsInRooms = useMemo(() => {
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
        return petsInRooms
    }, [checkIns])

    if (isLoading) {
        return <div className='py-8 text-center text-muted-foreground'>Cargando check-ins...</div>
    }

    if (checkIns.length === 0) {
        return (
            <Alert variant='info' className='mt-2'>
                <Calendar className='h-4 w-4' />
                <AlertTitle>Sin check-ins</AlertTitle>
                <AlertDescription>No hay entradas programadas para el día de hoy.</AlertDescription>
            </Alert>
        )
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
}
