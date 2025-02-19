import { useHotelReservations } from '@/components/ReservationContext'
import { DailyNeedsList } from '@/components/daily-needs-list'
import { HotelFloorPlan } from '@/components/hotel-floor-plan'
import { SpecialConditionsLegend } from '@/components/special-conditions-legend'
import { Card } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export default function PlanningPage() {
    const { reservations } = useHotelReservations()

    const hotel1Reservations = reservations.filter(
        r => r.roomNumber?.startsWith('HAB.') && parseInt(r.roomNumber.split('.')[1]) <= 21,
    )
    const hotel2Reservations = reservations.filter(
        r => r.roomNumber?.startsWith('HAB.') && parseInt(r.roomNumber.split('.')[1]) >= 25,
    )

    return (
        <div className='h-screen flex flex-col p-4 gap-2'>
            <div className='flex items-center justify-between'>
                <h1 className='text-2xl font-bold'>Planning</h1>
            </div>

            <Tabs defaultValue='daily-needs' className='flex-1 flex flex-col min-h-0'>
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

                <TabsContent value='daily-needs' className='flex-1 mt-2'>
                    <Card className='p-4 h-full'>
                        <DailyNeedsList />
                    </Card>
                </TabsContent>
                <TabsContent value='hotel1' className='flex-1 mt-2'>
                    <Card className='p-4 h-full flex flex-col gap-2'>
                        <SpecialConditionsLegend />
                        <div className='flex-1 min-h-0'>
                            <HotelFloorPlan hotelNumber={1} reservations={hotel1Reservations} />
                        </div>
                    </Card>
                </TabsContent>
                <TabsContent value='hotel2' className='flex-1 mt-2'>
                    <Card className='p-4 h-full flex flex-col gap-2'>
                        <SpecialConditionsLegend />
                        <div className='flex-1 min-h-0'>
                            <HotelFloorPlan hotelNumber={2} reservations={hotel2Reservations} />
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
