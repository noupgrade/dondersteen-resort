import { HotelReservationsCalendarWidget } from '@/widgets/HotelReservationsCalendar/ui/HotelReservationsCalendarWidget'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui/tabs'
import { PendingRequests } from '@/components/pending-requests'

export default function HotelInternalPanelPage() {
    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Panel de Hotel</h1>
            <Tabs defaultValue="calendar" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="calendar">Calendario</TabsTrigger>
                    <TabsTrigger value="pending">Solicitudes Pendientes</TabsTrigger>
                    <TabsTrigger value="floor-plan">Plano del Hotel</TabsTrigger>
                </TabsList>
                <TabsContent value="calendar" className="space-y-4">
                    <HotelReservationsCalendarWidget />
                </TabsContent>
                <TabsContent value="pending" className="space-y-4">
                    <PendingRequests />
                </TabsContent>
                <TabsContent value="floor-plan" className="space-y-4">
                    {/* TODO: Implementar el plano del hotel */}
                    <div className="text-muted-foreground">
                        El plano del hotel estará disponible próximamente
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
} 