import { useState, useEffect } from 'react'
import { Bell, Calendar, Clock } from 'lucide-react'
import { format, addHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/shared/ui/dialog"
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Badge } from '@/shared/ui/badge'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { cn } from '@/lib/utils'

export interface Notification {
    id: string
    petName: string
    reservationId: string
    currentDate?: string
    currentTime?: string
    newDate: string
    newTime: string
    timestamp: string
    read: boolean
    readTimestamp?: string // Timestamp de cuando se leyó la notificación
    message: string
}

interface NotificationBellProps {
    notifications: Notification[]
    onMarkAsRead: (id: string) => void
    onNotificationClick: (notification: Notification) => void
    onUpdateReservation?: (reservationId: string, newDate: string, newTime: string) => void
    onRemoveNotification?: (id: string) => void
}

export function NotificationBell({ 
    notifications,
    onMarkAsRead,
    onNotificationClick,
    onUpdateReservation,
    onRemoveNotification
}: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [newDate, setNewDate] = useState('')
    const [newTime, setNewTime] = useState('')
    const navigate = useNavigate()

    const unreadCount = notifications.filter(n => !n.read).length

    // Comprobar notificaciones expiradas
    useEffect(() => {
        const now = new Date()
        notifications.forEach(notification => {
            if (notification.read && notification.readTimestamp) {
                const readTime = new Date(notification.readTimestamp)
                const timeDiff = now.getTime() - readTime.getTime()
                const hoursDiff = timeDiff / (1000 * 60 * 60)

                if (hoursDiff >= 24 && onRemoveNotification) {
                    onRemoveNotification(notification.id)
                }
            }
        })
    }, [notifications, onRemoveNotification])

    const handleNotificationClick = (notification: Notification) => {
        // Marcar como leída con timestamp
        onMarkAsRead(notification.id)
        setSelectedNotification(notification)
        setIsDetailsOpen(true)
        setIsOpen(false)
        // Inicializar con la fecha actual
        setNewDate(format(new Date(), 'yyyy-MM-dd'))
        setNewTime(notification.newTime)
    }

    const handleUpdateReservation = () => {
        if (selectedNotification && onUpdateReservation && newDate && newTime) {
            onUpdateReservation(selectedNotification.reservationId, newDate, newTime)
            if (onRemoveNotification) {
                onRemoveNotification(selectedNotification.id)
            }
            setIsDetailsOpen(false)
            setSelectedNotification(null)
            setNewDate('')
            setNewTime('')
        }
    }

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        className="relative h-12 w-12"
                    >
                        <Bell className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <Badge 
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    className="w-80 p-0" 
                    align="end"
                >
                    <div className="p-4 border-b">
                        <h4 className="text-sm font-semibold">Notificaciones</h4>
                    </div>
                    <ScrollArea className="max-h-[400px]">
                        {notifications.length > 0 ? (
                            <div className="divide-y">
                                {notifications.map((notification) => (
                                    <button
                                        key={notification.id}
                                        className={cn(
                                            "w-full text-left p-4 hover:bg-muted transition-colors",
                                            !notification.read && "bg-muted/50"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {notification.petName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(new Date(notification.timestamp), 'dd MMM yyyy HH:mm', { locale: es })}
                                            </p>
                                            {notification.read && notification.readTimestamp && (
                                                <p className="text-xs text-muted-foreground/70">
                                                    Se eliminará {format(addHours(new Date(notification.readTimestamp), 24), 'dd MMM yyyy HH:mm', { locale: es })}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No hay notificaciones
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Cambio en la reserva de {selectedNotification?.petName}</DialogTitle>
                    </DialogHeader>
                    
                    {selectedNotification && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Información actual */}
                                <div className="rounded-lg bg-muted p-4 space-y-2 border-2 border-dashed">
                                    <h4 className="text-sm font-semibold text-muted-foreground">Cita actual</h4>
                                    {selectedNotification.currentDate && selectedNotification.currentTime ? (
                                        <>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <span>{format(new Date(selectedNotification.currentDate), 'dd MMM yyyy', { locale: es })}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <span>{selectedNotification.currentTime}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">Sin cita programada</p>
                                    )}
                                </div>

                                {/* Información del cambio */}
                                <div className="rounded-lg bg-muted p-4 space-y-2 border-2 border-primary">
                                    <h4 className="text-sm font-semibold text-primary">Nueva fecha y hora</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <span className="text-primary font-medium">
                                            {format(new Date(selectedNotification.newDate), 'dd MMM yyyy', { locale: es })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="text-primary font-medium">{selectedNotification.newTime}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="rounded-lg bg-muted/50 p-4">
                                    <h4 className="text-sm font-semibold mb-3">Ajustar cita de peluquería</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Nueva fecha</Label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="date"
                                                    value={newDate}
                                                    onChange={(e) => setNewDate(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Nueva hora</Label>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="time"
                                                    value={newTime}
                                                    onChange={(e) => setNewTime(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsDetailsOpen(false)
                            setSelectedNotification(null)
                            setNewDate('')
                            setNewTime('')
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleUpdateReservation}>
                            Actualizar cita
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
} 