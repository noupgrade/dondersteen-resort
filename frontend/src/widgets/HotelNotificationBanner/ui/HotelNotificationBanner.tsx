import { X } from 'lucide-react'

import { Button } from '@/shared/ui/button'

interface HotelNotification {
    id: string
    type: 'rejected_checkout_change'
    message: string
    timestamp: string
    metadata?: {
        clientName?: string
        petName?: string
        roomNumber?: string
        currentDate?: string
        currentTime?: string
    }
}

interface HotelNotificationBannerProps {
    notifications: HotelNotification[]
    onDismiss: (id: string) => void
}

export function HotelNotificationBanner({ notifications, onDismiss }: HotelNotificationBannerProps) {
    if (notifications.length === 0) return null

    return (
        <div className="mb-6 space-y-4">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className="relative rounded-lg border bg-destructive/10 p-4 text-destructive"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <p className="font-medium">
                                {notification.type === 'rejected_checkout_change' && 'Cambio de checkout rechazado'}
                            </p>
                            <p className="text-sm text-destructive/80">
                                {notification.message}
                            </p>
                            {notification.metadata && (
                                <div className="mt-2 text-sm text-destructive/70">
                                    {notification.metadata.clientName && (
                                        <p>Cliente: {notification.metadata.clientName}</p>
                                    )}
                                    {notification.metadata.petName && (
                                        <p>Mascota: {notification.metadata.petName}</p>
                                    )}
                                    {notification.metadata.roomNumber && (
                                        <p>Habitación: {notification.metadata.roomNumber}</p>
                                    )}
                                    {notification.metadata.currentDate && notification.metadata.currentTime && (
                                        <p>Fecha y hora original: {notification.metadata.currentDate} {notification.metadata.currentTime}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/20 hover:text-destructive"
                            onClick={() => onDismiss(notification.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    )
} 