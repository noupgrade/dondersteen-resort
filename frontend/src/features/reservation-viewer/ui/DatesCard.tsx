import { format } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'

import { type HairSalonReservation, type HotelReservation, type HotelBudget } from '@/components/ReservationContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { DatePicker } from '@/shared/ui/date-picker'
import { Input } from '@/shared/ui/input'

interface DatesCardProps {
    reservation: HairSalonReservation | HotelReservation | HotelBudget
    isEditMode: boolean
    onUpdate: (updatedReservation: HairSalonReservation | HotelReservation | HotelBudget) => void
}

export function DatesCard({ reservation, isEditMode, onUpdate }: DatesCardProps) {
    const formatDate = (date?: string) => {
        if (!date) return ''
        return format(new Date(date), 'dd MMM yyyy')
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Fechas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {(reservation.type === 'hotel' || reservation.type === 'hotel-budget') ? (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="w-4">
                                <Calendar className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="w-16">Entrada:</span>
                            {isEditMode ? (
                                <div className="flex items-center gap-4">
                                    <DatePicker
                                        date={reservation.checkInDate ? new Date(reservation.checkInDate) : new Date()}
                                        onSelect={(date) => date && onUpdate({
                                            ...reservation,
                                            checkInDate: date.toISOString().split('T')[0]
                                        })}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <Input
                                            value={reservation.checkInTime}
                                            onChange={(e) => onUpdate({
                                                ...reservation,
                                                checkInTime: e.target.value
                                            })}
                                            className="h-8 w-24"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span>{formatDate(reservation.checkInDate)}</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span>{reservation.checkInTime}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-4">
                                <Calendar className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="w-16">Salida:</span>
                            {isEditMode ? (
                                <div className="flex items-center gap-4">
                                    <DatePicker
                                        date={reservation.checkOutDate ? new Date(reservation.checkOutDate) : new Date()}
                                        onSelect={(date) => date && onUpdate({
                                            ...reservation,
                                            checkOutDate: date.toISOString().split('T')[0]
                                        })}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <Input
                                            value={reservation.checkOutTime || '12:00'}
                                            onChange={(e) => onUpdate({
                                                ...reservation,
                                                checkOutTime: e.target.value
                                            })}
                                            className="h-8 w-24"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <span>{formatDate(reservation.checkOutDate)}</span>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <span>{reservation.checkOutTime || '12:00'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <DatePicker
                            date={reservation.date ? new Date(reservation.date) : new Date()}
                            onSelect={(date) => date && onUpdate({
                                ...reservation,
                                date: date.toISOString().split('T')[0]
                            })}
                            disabled={!isEditMode}
                        />
                        <Clock className="h-4 w-4 text-gray-500 ml-2" />
                        <Input
                            value={reservation.time}
                            onChange={(e) => onUpdate({
                                ...reservation,
                                time: e.target.value
                            })}
                            className="h-8 w-24"
                            disabled={!isEditMode}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 