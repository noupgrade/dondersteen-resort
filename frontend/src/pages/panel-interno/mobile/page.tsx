import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo } from 'react'
import { useReservation } from '@/components/ReservationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PawPrint, DollarSign } from 'lucide-react'

export default function MobilePanelInterno() {
    const { reservations } = useReservation()

    const dailyStats = useMemo(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const hotelReservations = reservations.filter(r =>
            r.type === 'hotel' &&
            r.status === 'confirmed' &&
            new Date(r.checkInDate) <= new Date(today) &&
            new Date(r.checkOutDate) >= new Date(today)
        )

        const totalDogs = hotelReservations.reduce((acc, curr) => {
            if (curr.type === 'hotel') {
                return acc + curr.pets.length
            }
            return acc
        }, 0)

        const totalRevenue = hotelReservations.reduce((acc, curr) => {
            return acc + curr.totalPrice
        }, 0)

        return {
            totalDogs,
            totalRevenue
        }
    }, [reservations])

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">Panel de Control</h1>
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Perros Hoy
                        </CardTitle>
                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dailyStats.totalDogs}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Facturación Hoy
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{dailyStats.totalRevenue}€</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 