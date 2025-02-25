import { useEffect, useState } from 'react'

import { useHotelReservations } from '@/components/ReservationContext'
import { RoomDetailsModal } from '@/components/room-details-modal'
import { cn } from '@/shared/lib/styles/class-merge'
import { SPECIAL_CONDITIONS } from '@/shared/types/special-conditions'
import { Badge } from '@/shared/ui/badge'
import { Card } from '@/shared/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'

interface Room {
    id: string
    number: string
    petName?: string
    symbols?: string[]
    notes?: string
    style?: React.CSSProperties
}

interface HotelReservation {
    id: string
    roomNumber: string
    pets: Array<{
        name: string
        breed: string
        size: string
        medication?: string
        specialFood?: string
        observations?: string
        roomNumber: string
    }>
}

interface RoomCardProps {
    room: Room
    onClick: () => void
    reservations: HotelReservation[]
}

function Legend() {
    return (
        <div className='mb-8'>
            <h3 className='mb-2 text-lg font-semibold'>Condiciones Especiales</h3>
            <div className='flex flex-wrap gap-3'>
                {SPECIAL_CONDITIONS.map(condition => (
                    <TooltipProvider key={condition.symbol}>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant='outline' className='text-base'>
                                    {condition.symbol} {condition.label}
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{condition.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>
        </div>
    )
}

function RoomCard({ room, onClick, reservations }: RoomCardProps) {
    // Find all pets assigned to this room
    const petsInRoom = reservations.flatMap(r => r.pets.filter(pet => pet.roomNumber === room.number))
    const hasManyPets = petsInRoom.length > 2

    // Collect all symbols from pets' properties
    const getSymbolsFromPet = (pet: any) => {
        const symbols = []

        // Medicación
        if (pet.medication) symbols.push('O')

        // Pienso propio
        if (pet.specialFood) symbols.push('*')

        // Tamaño del perro
        if (pet.size?.toLowerCase() === 'pequeño') symbols.push('□')
        if (pet.size?.toLowerCase() === 'mediano') symbols.push('△')
        if (pet.size?.toLowerCase() === 'grande') symbols.push('■')

        // Observaciones
        const obsLower = pet.observations?.toLowerCase() || ''
        if (obsLower.includes('escapista')) symbols.push('E')
        if (obsLower.includes('alergico') || obsLower.includes('alérgico')) symbols.push('A')
        if (obsLower.includes('lata propia')) symbols.push('L')
        if (obsLower.includes('poco pienso')) symbols.push('-')
        if (obsLower.includes('mas pienso') || obsLower.includes('más pienso')) symbols.push('+')
        if (obsLower.includes('añadir carne') || obsLower.includes('añadir lata')) symbols.push('■')
        if (obsLower.includes('juguete')) symbols.push('🧸')
        if (obsLower.includes('manta')) symbols.push('🧶')
        if (obsLower.includes('cama')) symbols.push('🛏️')
        if (obsLower.includes('sin cama')) symbols.push('△')

        return symbols
    }

    return (
        <div className='h-full w-full' onClick={onClick}>
            <Card
                className={cn(
                    'h-full w-full cursor-pointer p-3 transition-colors hover:bg-gray-50',
                    !petsInRoom.length && 'bg-gray-100',
                )}
            >
                <div className='flex h-full flex-col'>
                    <div
                        className={cn(
                            'mb-2 border-b pb-2 font-bold text-gray-700',
                            hasManyPets ? 'text-2xl' : 'text-3xl',
                        )}
                    >
                        {room.number}
                    </div>
                    <div className='flex flex-col'>
                        {petsInRoom.map((pet, index) => {
                            const petSymbols = getSymbolsFromPet(pet)
                            return (
                                <div
                                    key={index}
                                    className={cn(
                                        'mb-2 flex flex-wrap items-center gap-x-2 last:mb-0',
                                        hasManyPets && 'mb-1 gap-x-1',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'whitespace-nowrap font-semibold',
                                            hasManyPets ? 'text-xl' : 'text-2xl',
                                        )}
                                    >
                                        {pet.name}
                                    </span>
                                    {petSymbols.length > 0 && (
                                        <div className='flex gap-2'>
                                            {petSymbols.map((symbol, symbolIndex) => {
                                                const condition = SPECIAL_CONDITIONS.find(c => c.symbol === symbol)
                                                return condition ? (
                                                    <TooltipProvider key={symbolIndex}>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <span
                                                                    className={cn(
                                                                        'inline-flex items-center justify-center font-semibold',
                                                                        hasManyPets
                                                                            ? 'min-w-[32px] text-xl'
                                                                            : 'min-w-[40px] text-2xl',
                                                                    )}
                                                                >
                                                                    {symbol}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p className={hasManyPets ? 'text-lg' : 'text-xl'}>
                                                                    {condition.description}
                                                                </p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                ) : null
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                        {!petsInRoom.length && (
                            <span className={cn('text-gray-500', hasManyPets ? 'text-xl' : 'text-2xl')}>
                                Disponible
                            </span>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}

interface HotelFloorPlanProps {
    hotelNumber: 1 | 2
    reservations: HotelReservation[]
}

const hotel1Layout: Room[] = [
    // L shape - Vertical part (top to bottom)
    {
        id: '10',
        number: 'HAB.10',
        style: { left: '2%', top: '2%', width: '18%', height: '18%', position: 'absolute' },
    },
    {
        id: '9',
        number: 'HAB.9',
        style: { left: '2%', top: '21%', width: '18%', height: '18%', position: 'absolute' },
    },
    {
        id: '8',
        number: 'HAB.8',
        style: { left: '2%', top: '40%', width: '18%', height: '18%', position: 'absolute' },
    },
    {
        id: '7',
        number: 'HAB.7',
        style: { left: '2%', top: '59%', width: '18%', height: '18%', position: 'absolute' },
    },
    {
        id: '6',
        number: 'HAB.6',
        style: { left: '2%', top: '78%', width: '15%', height: '18%', position: 'absolute' },
    },
    // L shape - Horizontal part (left to right)
    {
        id: '5',
        number: 'HAB.5',
        style: { left: '19%', top: '78%', width: '15%', height: '18%', position: 'absolute' },
    },
    {
        id: '4',
        number: 'HAB.4',
        style: { left: '36%', top: '78%', width: '15%', height: '18%', position: 'absolute' },
    },
    {
        id: '3',
        number: 'HAB.3',
        style: { left: '53%', top: '78%', width: '15%', height: '18%', position: 'absolute' },
    },
    {
        id: '2',
        number: 'HAB.2',
        style: { left: '70%', top: '78%', width: '15%', height: '18%', position: 'absolute' },
    },
    {
        id: '1',
        number: 'HAB.1',
        style: { left: '87%', top: '78%', width: '15%', height: '18%', position: 'absolute' },
    },
    // Center area - Top row (left to right)
    {
        id: '24',
        number: 'HAB.24',
        style: { left: '24%', top: '2%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '23',
        number: 'HAB.23',
        style: { left: '34%', top: '2%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '22',
        number: 'HAB.22',
        style: { left: '44%', top: '2%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '21',
        number: 'HAB.21',
        style: { left: '54%', top: '2%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '20',
        number: 'HAB.20',
        style: { left: '64%', top: '2%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '19',
        number: 'HAB.19',
        style: { left: '74%', top: '2%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '18',
        number: 'HAB.18',
        style: { left: '84%', top: '2%', width: '9%', height: '25%', position: 'absolute' },
    },
    // Center area - Bottom row (left to right)
    {
        id: '17',
        number: 'HAB.17',
        style: { left: '24%', top: '29%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '16',
        number: 'HAB.16',
        style: { left: '34%', top: '29%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '15',
        number: 'HAB.15',
        style: { left: '44%', top: '29%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '14',
        number: 'HAB.14',
        style: { left: '54%', top: '29%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '13',
        number: 'HAB.13',
        style: { left: '64%', top: '29%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '12',
        number: 'HAB.12',
        style: { left: '74%', top: '29%', width: '9%', height: '25%', position: 'absolute' },
    },
    {
        id: '11',
        number: 'HAB.11',
        style: { left: '84%', top: '29%', width: '9%', height: '25%', position: 'absolute' },
    },
]

const hotel2Layout: Room[] = [
    // Left column (top to bottom)
    {
        id: '30',
        number: 'HAB.30',
        style: { left: '2%', top: '2%', width: '32%', height: '32%', position: 'absolute' },
    },
    {
        id: '29',
        number: 'HAB.29',
        style: { left: '2%', top: '36%', width: '32%', height: '16%', position: 'absolute' },
    },
    {
        id: '28',
        number: 'HAB.28',
        style: { left: '2%', top: '54%', width: '32%', height: '16%', position: 'absolute' },
    },
    {
        id: '27',
        number: 'HAB.27',
        style: { left: '2%', top: '72%', width: '32%', height: '16%', position: 'absolute' },
    },
    {
        id: '26',
        number: 'HAB.26',
        style: { left: '2%', top: '90%', width: '32%', height: '16%', position: 'absolute' },
    },
    {
        id: '25',
        number: 'HAB.25',
        style: { left: '2%', top: '108%', width: '32%', height: '16%', position: 'absolute' },
    },
    // Center area
    {
        id: '31',
        number: 'HAB.31',
        style: { left: '36%', top: '2%', width: '30%', height: '16%', position: 'absolute' },
    },
    // Right column (top to bottom)
    {
        id: '32',
        number: 'HAB.32',
        style: { right: '2%', top: '2%', width: '30%', height: '32%', position: 'absolute' },
    },
    {
        id: '33',
        number: 'HAB.33',
        style: { right: '2%', top: '36%', width: '30%', height: '32%', position: 'absolute' },
    },
    {
        id: '34',
        number: 'HAB.34',
        style: { right: '2%', top: '70%', width: '30%', height: '28%', position: 'absolute' },
    },
]

// Mock data para pruebas
const mockReservations: HotelReservation[] = [
    {
        id: '1',
        roomNumber: 'HAB.5',
        pets: [
            {
                name: 'Simba',
                breed: 'Golden',
                size: 'grande',
                medication: 'Sí',
                specialFood: 'Sí',
                observations: 'Escapista, alérgico, necesita manta',
                roomNumber: 'HAB.5',
            },
            {
                name: 'Nina',
                breed: 'Chihuahua',
                size: 'pequeño',
                observations: 'Sin cama, lata propia',
                roomNumber: 'HAB.6',
            },
            {
                name: 'Toby',
                breed: 'Pastor Alemán',
                size: 'grande',
                observations: 'Poco pienso, añadir carne',
                roomNumber: 'HAB.5',
            },
        ],
    },
    {
        id: '2',
        roomNumber: 'HAB.6',
        pets: [
            {
                name: 'Milo',
                breed: 'Labrador',
                size: 'mediano',
                medication: 'Sí',
                observations: 'Juguete propio, más pienso',
                roomNumber: 'HAB.6',
            },
            {
                name: 'Lola',
                breed: 'Beagle',
                size: 'mediano',
                specialFood: 'Sí',
                observations: 'Cama propia, alérgico',
                roomNumber: 'HAB.6',
            },
        ],
    },
]

export function HotelFloorPlan({ hotelNumber, reservations: initialReservations }: HotelFloorPlanProps) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const layout = hotelNumber === 1 ? hotel1Layout : hotel2Layout
    const { reservations } = useHotelReservations()
    const [localReservations, setLocalReservations] = useState<HotelReservation[]>(initialReservations)

    useEffect(() => {
        // Para pruebas, mezclamos los datos mock con las reservaciones reales
        const testReservations = [...mockReservations, ...reservations].filter(r =>
            r.pets.some(
                pet =>
                    pet.roomNumber &&
                    ((hotelNumber === 1 && parseInt(pet.roomNumber.split('.')[1]) <= 21) ||
                        (hotelNumber === 2 && parseInt(pet.roomNumber.split('.')[1]) >= 25)),
            ),
        ) as HotelReservation[]
        setLocalReservations(testReservations)
    }, [reservations, hotelNumber])

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room)
    }

    return (
        <div className='h-full w-full'>
            <div className='relative w-full' style={{ paddingTop: hotelNumber === 1 ? '45%' : '35%' }}>
                <div className='absolute inset-0'>
                    {layout.map(room => (
                        <div key={room.id} style={room.style}>
                            <RoomCard
                                room={room}
                                onClick={() => handleRoomClick(room)}
                                reservations={localReservations}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {selectedRoom && <RoomDetailsModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />}
        </div>
    )
}
