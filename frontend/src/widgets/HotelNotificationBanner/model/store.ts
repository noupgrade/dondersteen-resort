import { create } from 'zustand'

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

interface HotelNotificationStore {
    notifications: HotelNotification[]
    addNotification: (notification: Omit<HotelNotification, 'id' | 'timestamp'>) => void
    dismissNotification: (id: string) => void
}

export const useHotelNotificationStore = create<HotelNotificationStore>((set) => ({
    notifications: [],
    addNotification: (notification) => set((state) => ({
        notifications: [
            ...state.notifications,
            {
                ...notification,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString()
            }
        ]
    })),
    dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
    }))
})) 