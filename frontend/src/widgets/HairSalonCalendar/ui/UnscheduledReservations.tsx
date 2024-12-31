import { DraggableReservation } from './DraggableReservation'
import { useCalendarStore } from '../model/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

interface UnscheduledReservationsProps {
    className?: string
}

export function UnscheduledReservations({ className }: UnscheduledReservationsProps) {
    const { unscheduledReservations, view, selectedDate } = useCalendarStore()

    // Filtrar las citas según la vista actual
    const filteredReservations = unscheduledReservations.filter(reservation => {
        // Solo mostrar citas confirmadas que tienen fecha pero no hora
        if (reservation.status !== 'confirmed' || !reservation.date || reservation.time) {
            return false
        }

        if (view === 'day') {
            // Para vista diaria, mostrar solo las citas del día seleccionado
            return reservation.date === format(selectedDate, 'yyyy-MM-dd')
        } else {
            // Para vista semanal, mostrar las citas de la semana seleccionada
            const weekStart = startOfWeek(selectedDate, { locale: es })
            const weekDates = Array.from({ length: 7 }, (_, i) => 
                format(addDays(weekStart, i), 'yyyy-MM-dd')
            )
            return weekDates.includes(reservation.date)
        }
    })

    if (filteredReservations.length === 0) {
        return null
    }

    return (
        <Card className={className}>
            <CardHeader className="py-4">
                <CardTitle className="text-lg">
                    Citas confirmadas sin hora asignada {view === 'day' ? 'para hoy' : 'esta semana'}
                </CardTitle>
            </CardHeader>
            <CardContent className="py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                    {filteredReservations.map((reservation) => (
                        <DraggableReservation
                            key={reservation.id}
                            reservation={reservation}
                            date={reservation.date}
                            time=""
                            className="bg-gray-50 hover:bg-gray-100"
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    )
} 