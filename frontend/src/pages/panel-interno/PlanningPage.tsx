import { useHotelReservations } from '@/components/ReservationContext.tsx'
import { DailyNeedsList } from '@/components/daily-needs-list.tsx'
import { HotelFloorPlan } from '@/components/hotel-floor-plan.tsx'
import { Card } from '@/shared/ui/card.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs.tsx'

export default function PlanningPage() {
    const { reservations } = useHotelReservations()

    const hotel1Reservations = reservations.filter(
        r => r.roomNumber.startsWith('HAB.') && parseInt(r.roomNumber.split('.')[1]) <= 21,
    )
    const hotel2Reservations = reservations.filter(
        r => r.roomNumber.startsWith('HAB.') && parseInt(r.roomNumber.split('.')[1]) >= 25,
    )

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold'>Planning</h1>
            </div>

            <Tabs defaultValue='daily-needs' className='space-y-4'>
                <TabsList className='grid w-full grid-cols-3 gap-4 bg-transparent p-0'>
                    <TabsTrigger 
                        value='daily-needs'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Necesidades Diarias
                    </TabsTrigger>
                    <TabsTrigger 
                        value='hotel1'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Hotel 1
                    </TabsTrigger>
                    <TabsTrigger 
                        value='hotel2'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Hotel 2
                    </TabsTrigger>
                </TabsList>
                <TabsContent value='daily-needs'>
                    <Card className='p-6'>
                        <DailyNeedsList />
                    </Card>
                </TabsContent>
                <TabsContent value='hotel1'>
                    <Card className='p-6'>
                        <HotelFloorPlan hotelNumber={1} reservations={hotel1Reservations} />
                    </Card>
                </TabsContent>
                <TabsContent value='hotel2'>
                    <Card className='p-6'>
                        <HotelFloorPlan hotelNumber={2} reservations={hotel2Reservations} />
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
