import { format, addDays, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { useReservation } from '@/components/ReservationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { PawPrint, DollarSign, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/styles/class-merge'

export default function MobilePanelInterno() {
    const { reservations } = useReservation()
    const [selectedDate, setSelectedDate] = useState(new Date())

    const dailyStats = useMemo(() => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd')
        const hotelReservations = reservations.filter(r =>
            r.type === 'hotel' &&
            r.status === 'confirmed' &&
            new Date(r.checkInDate) <= new Date(dateStr) &&
            new Date(r.checkOutDate) >= new Date(dateStr)
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

        const dogsStaying = hotelReservations.flatMap(reservation => {
            if (reservation.type === 'hotel') {
                return reservation.pets.map(pet => ({
                    ...pet,
                    roomNumber: pet.roomNumber,
                    clientName: reservation.client.name,
                    checkOutDate: reservation.checkOutDate,
                    checkInDate: reservation.checkInDate
                }))
            }
            return []
        }).sort((a, b) => {
            if (a.roomNumber && b.roomNumber) {
                return a.roomNumber.localeCompare(b.roomNumber)
            }
            return 0
        })

        return {
            totalDogs,
            totalRevenue,
            dogsStaying
        }
    }, [reservations, selectedDate])

    const handlePreviousDay = () => {
        setSelectedDate(prev => subDays(prev, 1))
    }

    const handleNextDay = () => {
        setSelectedDate(prev => addDays(prev, 1))
    }

    const handleToday = () => {
        setSelectedDate(new Date())
    }

    const isToday = useMemo(() => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const selected = format(selectedDate, 'yyyy-MM-dd')
        return today === selected
    }, [selectedDate])

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            <div className="p-4 space-y-6 pb-8">
                {/* Header Section */}
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-clip-text bg-gradient-to-r text-primary">
                            Panel de Control
                        </h1>
                        {!isToday && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleToday}
                                className="border-primary/20 hover:border-primary/40"
                            >
                                <Calendar className="h-4 w-4 mr-2 text-primary" />
                                Hoy
                            </Button>
                        )}
                    </div>

                    {/* Date Navigation */}
                    <div className="flex items-center justify-between bg-card p-3 rounded-xl shadow-sm border border-border/50">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePreviousDay}
                            className="hover:bg-primary/10 hover:text-primary"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-lg font-medium">
                            {format(selectedDate, "d 'de' MMMM", { locale: es })}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextDay}
                            className="hover:bg-primary/10 hover:text-primary"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">
                                Perros
                            </CardTitle>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <PawPrint className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{dailyStats.totalDogs}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/10 shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-primary">
                                Facturación
                            </CardTitle>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{dailyStats.totalRevenue}€</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Dogs List */}
                <div className="space-y-3">
                    <div className="text-lg font-medium text-primary pl-1">
                        Perros Hospedados
                    </div>
                    <div className="space-y-3">
                        {dailyStats.dogsStaying.map((dog, index) => {
                            const isNewCheckIn = dog.checkInDate === format(selectedDate, 'yyyy-MM-dd')
                            const isCheckOut = dog.checkOutDate === format(selectedDate, 'yyyy-MM-dd')

                            return (
                                <div
                                    key={`${dog.name}-${index}`}
                                    className={cn(
                                        "flex items-start justify-between rounded-xl p-4 transition-colors bg-card/50 backdrop-blur-sm shadow-sm border",
                                        isNewCheckIn && "bg-emerald-500/10 border-emerald-500/20",
                                        isCheckOut && "bg-amber-500/10 border-amber-500/20",
                                        !isNewCheckIn && !isCheckOut && "border-border/50 hover:bg-muted/50"
                                    )}
                                >
                                    <div>
                                        <div className="font-medium flex items-center gap-2">
                                            {dog.name}
                                            {isNewCheckIn && (
                                                <span className="text-xs bg-emerald-500/20 text-emerald-700 px-2 py-0.5 rounded-full">
                                                    Nuevo
                                                </span>
                                            )}
                                            {isCheckOut && (
                                                <span className="text-xs bg-amber-500/20 text-amber-700 px-2 py-0.5 rounded-full">
                                                    Sale hoy
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{dog.breed}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{dog.clientName}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium text-primary">{dog.roomNumber || 'Sin hab.'}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            Sale: {format(new Date(dog.checkOutDate), 'dd/MM')}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        {dailyStats.dogsStaying.length === 0 && (
                            <div className="text-center text-muted-foreground py-8 bg-card/50 backdrop-blur-sm rounded-xl border border-border/50">
                                No hay perros hospedados en esta fecha
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}