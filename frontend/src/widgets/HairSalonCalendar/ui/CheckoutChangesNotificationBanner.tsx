import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar, AlertTriangle } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { HairdressingServiceType } from '@/shared/types/additional-services'

export interface CheckoutChange {
    id: string
    petName: string
    clientName: string
    roomNumber: string
    currentDate: string
    currentTime: string
    newDate: string
    newTime: string
    timestamp: string
    services: HairdressingServiceType[]
    reservationId: string
}

interface CheckoutChangesNotificationBannerProps {
    changes: CheckoutChange[]
    onViewChange: (change: CheckoutChange) => void
}

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono'
}

const serviceTypeColors: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'bg-blue-50 text-blue-700 border-blue-200',
    bath_and_trim: 'bg-green-50 text-green-700 border-green-200',
    stripping: 'bg-purple-50 text-purple-700 border-purple-200',
    deshedding: 'bg-orange-50 text-orange-700 border-orange-200',
    brushing: 'bg-pink-50 text-pink-700 border-pink-200',
    spa: 'bg-teal-50 text-teal-700 border-teal-200',
    spa_ozone: 'bg-indigo-50 text-indigo-700 border-indigo-200'
}

export function CheckoutChangesNotificationBanner({ changes, onViewChange }: CheckoutChangesNotificationBannerProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    if (changes.length === 0) return null

    return (
        <div className="w-full bg-yellow-50 border-b border-yellow-200">
            {/* Banner comprimido - Clickeable */}
            <div 
                className="container mx-auto px-4 py-2 cursor-pointer hover:bg-yellow-100/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                            {changes.length === 1 
                                ? 'Hay un cambio de checkout pendiente de revisar'
                                : 'Hay ' + changes.length + ' cambios de checkout pendientes de revisar'
                            }
                        </span>
                    </div>
                </div>
            </div>

            {/* Contenido expandido */}
            <div className={cn(
                "container mx-auto overflow-hidden transition-all duration-200 ease-in-out",
                isExpanded ? "max-h-[400px] py-3" : "max-h-0"
            )}>
                <div className="space-y-2 px-4">
                    {changes.map((change) => (
                        <div
                            key={change.id}
                            className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50/50 p-3 hover:bg-yellow-100/50"
                        >
                            <div className="space-y-2">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-yellow-900">{change.petName}</div>
                                        <div className="flex gap-1">
                                            {change.services.map((service, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] px-1.5 py-0 border-[1.5px] whitespace-nowrap",
                                                        serviceTypeColors[service]
                                                    )}
                                                >
                                                    {serviceTypeLabels[service]}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-sm text-yellow-700">
                                        {change.clientName} · Habitación {change.roomNumber}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1 text-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-yellow-800">
                                            <Clock className="h-4 w-4" />
                                            <span>Actual: {change.currentTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-yellow-800">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(change.currentDate), "d 'de' MMMM", { locale: es })}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 font-medium text-yellow-900">
                                            <Clock className="h-4 w-4" />
                                            <span>Nuevo: {change.newTime}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 font-medium text-yellow-900">
                                            <Calendar className="h-4 w-4" />
                                            <span>{format(new Date(change.newDate), "d 'de' MMMM", { locale: es })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button 
                                variant="outline"
                                size="sm"
                                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-900"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onViewChange(change)
                                }}
                            >
                                Revisar cambio
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
} 