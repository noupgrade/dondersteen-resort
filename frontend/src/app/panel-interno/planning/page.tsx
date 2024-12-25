import { useReservation } from '@/components/ReservationContext'
import { DailyNeedsList } from '@/components/daily-needs-list'
import { HotelFloorPlan } from '@/components/hotel-floor-plan'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function PlanningPage() {
    const { reservations } = useReservation()

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
                <TabsList>
                    <TabsTrigger value='daily-needs'>Necesidades Diarias</TabsTrigger>
                    <TabsTrigger value='hotel1'>Hotel 1</TabsTrigger>
                    <TabsTrigger value='hotel2'>Hotel 2</TabsTrigger>
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
