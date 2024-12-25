import { useEffect, useState } from 'react'

import { useReservation } from '@/components/ReservationContext'
import { RoomDetailsModal } from '@/components/room-details-modal'
import { Badge } from '@/shared/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { cn } from '@/shared/lib/styles/class-merge'

interface Room {
    id: string
    number: string
    petName?: string
    symbols?: string[]
    notes?: string
    style?: React.CSSProperties
}

interface HotelFloorPlanProps {
    hotelNumber: 1 | 2
    reservations: any[]
}

const hotel1Layout: Room[] = [
    // Bottom row (left to right)
    {
        id: '1',
        number: 'HAB.1',
        petName: 'Max',
        symbols: ['*', 'O'],
        style: { left: '80%', bottom: '2%', width: '18%', height: '15%', position: 'absolute' },
    },
    {
        id: '2',
        number: 'HAB.2',
        petName: 'Luna',
        symbols: ['*', 'O'],
        notes: 'NO PARQUE',
        style: { left: '60%', bottom: '2%', width: '18%', height: '15%', position: 'absolute' },
    },
    {
        id: '3',
        number: 'HAB.3',
        petName: 'Rocky',
        symbols: ['*', '□'],
        style: { left: '40%', bottom: '2%', width: '18%', height: '15%', position: 'absolute' },
    },
    {
        id: '4',
        number: 'HAB.4',
        petName: 'Bella',
        symbols: ['*'],
        style: { left: '20%', bottom: '2%', width: '18%', height: '15%', position: 'absolute' },
    },
    {
        id: '5',
        number: 'HAB.5',
        petName: 'Charlie',
        symbols: ['*'],
        style: { left: '2%', bottom: '2%', width: '16%', height: '15%', position: 'absolute' },
    },
    // Left column (bottom to top)
    {
        id: '6',
        number: 'HAB.6',
        style: { left: '2%', bottom: '19%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '7',
        number: 'HAB.7',
        style: { left: '2%', bottom: '36%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '8',
        number: 'HAB.8',
        style: { left: '2%', bottom: '53%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '9',
        number: 'HAB.9',
        petName: 'Daisy',
        symbols: ['*'],
        style: { left: '2%', bottom: '70%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '10',
        number: 'HAB.10',
        petName: 'Cooper',
        symbols: ['*'],
        style: { left: '2%', bottom: '87%', width: '16%', height: '11%', position: 'absolute' },
    },
    // Center grid - top row
    {
        id: '18',
        number: 'HAB.18',
        petName: 'Milo',
        symbols: ['+'],
        style: { left: '82%', top: '2%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '19',
        number: 'HAB.19',
        style: { left: '64%', top: '2%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '20',
        number: 'HAB.20',
        petName: 'Lucy',
        symbols: ['L'],
        style: { left: '46%', top: '2%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '21',
        number: 'HAB.21',
        petName: 'Bailey',
        style: { left: '28%', top: '2%', width: '16%', height: '15%', position: 'absolute' },
    },
    // Center grid - bottom row
    {
        id: '12',
        number: 'HAB.12',
        petName: 'Zoe/Lola',
        style: { left: '64%', top: '19%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '13',
        number: 'HAB.13',
        petName: 'Buddy/Molly',
        style: { left: '46%', top: '19%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '14',
        number: 'HAB.14',
        petName: 'Jack',
        style: { left: '28%', top: '19%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '15',
        number: 'HAB.15',
        petName: 'Sadie',
        symbols: ['*'],
        style: { left: '28%', top: '36%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '16',
        number: 'HAB.16',
        petName: 'Toby',
        symbols: ['*', 'A'],
        style: { left: '46%', top: '36%', width: '16%', height: '15%', position: 'absolute' },
    },
    {
        id: '17',
        number: 'HAB.17',
        petName: 'Chloe/Roxy',
        style: { left: '64%', top: '36%', width: '16%', height: '15%', position: 'absolute' },
    },
]

const hotel2Layout: Room[] = [
    // Left column (bottom to top)
    {
        id: '25',
        number: 'HAB.25',
        petName: 'Leo',
        symbols: ['*', 'O'],
        style: { left: '2%', bottom: '2%', width: '30%', height: '12%', position: 'absolute' },
    },
    {
        id: '26',
        number: 'HAB.26',
        petName: 'Nala',
        symbols: ['□'],
        style: { left: '2%', bottom: '16%', width: '30%', height: '12%', position: 'absolute' },
    },
    {
        id: '27',
        number: 'HAB.27',
        style: { left: '2%', bottom: '30%', width: '30%', height: '12%', position: 'absolute' },
    },
    {
        id: '28',
        number: 'HAB.28',
        petName: 'Duke',
        symbols: ['A'],
        style: { left: '2%', bottom: '44%', width: '30%', height: '12%', position: 'absolute' },
    },
    {
        id: '29',
        number: 'HAB.29',
        petName: 'Bella',
        symbols: ['*', 'L'],
        style: { left: '2%', bottom: '58%', width: '30%', height: '12%', position: 'absolute' },
    },
    {
        id: '30',
        number: 'HAB.30',
        petName: 'Max/Charlie',
        symbols: ['+'],
        style: { left: '2%', bottom: '72%', width: '30%', height: '24%', position: 'absolute' },
    },
    // Right column (top to bottom)
    {
        id: '31',
        number: 'HAB.31',
        petName: 'Luna/Cooper',
        symbols: ['*', 'O'],
        style: { right: '35%', top: '2%', width: '30%', height: '24%', position: 'absolute' },
    },
    {
        id: '32',
        number: 'HAB.32',
        style: { right: '2%', top: '2%', width: '31%', height: '24%', position: 'absolute' },
    },
    {
        id: '33',
        number: 'HAB.33',
        petName: 'Rocky',
        symbols: ['□', 'A'],
        style: { right: '2%', top: '28%', width: '31%', height: '24%', position: 'absolute' },
    },
    {
        id: '34',
        number: 'HAB.34',
        petName: 'Daisy',
        symbols: ['*'],
        style: { right: '2%', top: '54%', width: '31%', height: '24%', position: 'absolute' },
    },
]

export function HotelFloorPlan({ hotelNumber, reservations: initialReservations }: HotelFloorPlanProps) {
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
    const layout = hotelNumber === 1 ? hotel1Layout : hotel2Layout
    const { reservations } = useReservation()
    const [localReservations, setLocalReservations] = useState(initialReservations)

    useEffect(() => {
        const updatedReservations = reservations.filter(
            r =>
                (hotelNumber === 1 && parseInt(r.roomNumber.split('.')[1]) <= 21) ||
                (hotelNumber === 2 && parseInt(r.roomNumber.split('.')[1]) >= 25),
        )
        setLocalReservations(updatedReservations)
    }, [reservations, hotelNumber])

    const handleRoomClick = (room: Room) => {
        setSelectedRoom(room)
    }

    const getSymbolsForRoom = (roomNumber: string) => {
        const room = layout.find(r => r.number === roomNumber)
        return room ? room.symbols || [] : []
    }

    const getRoomOccupancy = (roomNumber: string) => {
        const reservation = localReservations.find(r => r.roomNumber === roomNumber)
        return reservation ? reservation.pets.map(p => p.name).join(', ') : ''
    }

    return (
        <div className='relative h-[600px] w-full'>
            {layout.map(room => (
                <TooltipProvider key={room.id}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    'absolute cursor-pointer rounded-lg border-2 p-2',
                                    'hover:border-blue-500 hover:bg-blue-50',
                                    getRoomOccupancy(room.number) ? 'bg-green-100' : 'bg-white',
                                )}
                                style={room.style}
                                onClick={() => handleRoomClick(room)}
                            >
                                <div className='flex h-full flex-col justify-between'>
                                    <div className='flex items-center justify-between'>
                                        <Badge variant='outline'>{room.number}</Badge>
                                        <div className='flex gap-1'>
                                            {getSymbolsForRoom(room.number).map((symbol, index) => (
                                                <span key={index}>{symbol}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className='text-sm font-medium'>{getRoomOccupancy(room.number)}</div>
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Click para ver detalles</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
            {selectedRoom && (
                <RoomDetailsModal
                    room={selectedRoom}
                    onClose={() => setSelectedRoom(null)}
                    occupancy={getRoomOccupancy(selectedRoom.number)}
                />
            )}
        </div>
    )
}
