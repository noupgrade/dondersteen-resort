export interface User {
    id: string
    email?: string | null
    name?: string | null
    phone?: string | null
    avatar?: string | null
    type?: string | null
}

export interface Dict {
    [key: string]: any
}

export interface TrackingService {
    init?: () => void
    identify?: (id: string) => void
    setUser?: (user: User) => void
    trackPageView?: (...properties: any[]) => void
    trackLinks?: (...properties: any[]) => void
    trackEvent?: (...properties: any[]) => void
    captureException?: (...properties: any[]) => void
}
