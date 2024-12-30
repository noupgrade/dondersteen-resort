export interface DateRange {
    from: Date | null
    to: Date | null
}

export interface AvailabilityStats {
    blockedCount: number
    holidaysCount: number
    highSeasonCount: number
} 