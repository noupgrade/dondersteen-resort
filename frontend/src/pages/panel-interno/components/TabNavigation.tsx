import { Badge } from '@/shared/ui/badge.tsx'
import { TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'
import { HotelReservation } from '@monorepo/functions/src/types/reservations'

type TabNavigationProps = {
    activeReservations: HotelReservation[]
    pendingRequests: HotelReservation[]
    checkIns: HotelReservation[]
    checkOuts: HotelReservation[]
}

export const TabNavigation = ({ activeReservations, pendingRequests, checkIns, checkOuts }: TabNavigationProps) => (
    <TabsList className='grid w-full grid-cols-5 gap-4 bg-transparent p-0'>
        <TabsTrigger
            value='active'
            className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
        >
            Reservas activas
            {activeReservations.length > 0 && (
                <Badge
                    variant='destructive'
                    className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
                >
                    {activeReservations.length}
                </Badge>
            )}
        </TabsTrigger>
        <TabsTrigger
            value='calendar'
            className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
        >
            Calendario
        </TabsTrigger>
        <TabsTrigger
            value='pending'
            className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
        >
            Solicitudes pendientes
            {pendingRequests.length > 0 && (
                <Badge
                    variant='destructive'
                    className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
                >
                    {pendingRequests.length}
                </Badge>
            )}
        </TabsTrigger>
        <TabsTrigger
            value='check-ins'
            className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
        >
            Entradas
            {checkIns.length > 0 && (
                <Badge
                    variant='destructive'
                    className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
                >
                    {checkIns.length}
                </Badge>
            )}
        </TabsTrigger>
        <TabsTrigger
            value='check-outs'
            className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
        >
            Salidas
            {checkOuts.length > 0 && (
                <Badge
                    variant='destructive'
                    className='absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs'
                >
                    {checkOuts.length}
                </Badge>
            )}
        </TabsTrigger>
    </TabsList>
)
