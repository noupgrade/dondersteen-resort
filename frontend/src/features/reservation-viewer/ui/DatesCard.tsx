import { type HotelReservation } from '@/shared/types/reservations'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DatePicker } from '@/shared/ui/date-picker'
import { Input } from '@/shared/ui/input'
import { Calendar, Clock } from 'lucide-react'

interface DatesCardProps {
    reservation: HotelReservation
    isEditMode: boolean
    onDatesChange: (dates: {
        checkInDate?: string
        checkInTime?: string
        checkOutDate?: string
        checkOutTime?: string
    }) => void
}

export function DatesCard({ reservation, isEditMode, onDatesChange }: DatesCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Fechas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Check-in:
                        </span>
                        <div className="flex items-center gap-2 justify-end">
                            {isEditMode ? (
                                <>
                                    <DatePicker
                                        date={new Date(reservation.checkInDate)}
                                        onSelect={(date) => onDatesChange({ checkInDate: date.toISOString() })}
                                    />
                                    <Input
                                        type="time"
                                        value={reservation.checkInTime}
                                        onChange={(e) => onDatesChange({ checkInTime: e.target.value })}
                                        className="w-24"
                                    />
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>{new Date(reservation.checkInDate).toLocaleDateString()}</span>
                                    <Clock className="h-4 w-4" />
                                    <span>{reservation.checkInTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Check-out:
                        </span>
                        <div className="flex items-center gap-2 justify-end">
                            {isEditMode ? (
                                <>
                                    <DatePicker
                                        date={new Date(reservation.checkOutDate)}
                                        onSelect={(date) => onDatesChange({ checkOutDate: date.toISOString() })}
                                    />
                                    <Input
                                        type="time"
                                        value={reservation.checkOutTime}
                                        onChange={(e) => onDatesChange({ checkOutTime: e.target.value })}
                                        className="w-24"
                                    />
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>{new Date(reservation.checkOutDate).toLocaleDateString()}</span>
                                    <Clock className="h-4 w-4" />
                                    <span>{reservation.checkOutTime}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 