'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useDocument } from '@/shared/firebase/hooks/useDocument'
import { FSDocument } from '@/shared/firebase/types'
import { getDay } from 'date-fns'

interface BlockedDate {
    startDate: string
    endDate: string
}

interface Holiday {
    startDate: string
    endDate: string
    name: string
}

interface HighSeasonPeriod {
    startDate: string
    endDate: string
}

interface HotelAvailabilityData extends FSDocument {
    blockedDates: BlockedDate[]
    holidays: Holiday[]
    highSeasonPeriods: HighSeasonPeriod[]
}

interface HotelAvailabilityContextType {
    blockedDates: BlockedDate[]
    holidays: Holiday[]
    highSeasonPeriods: HighSeasonPeriod[]
    addBlockedDate: (startDate: string, endDate: string) => void
    removeBlockedDate: (startDate: string, endDate: string) => void
    addHoliday: (startDate: string, endDate: string, name: string) => void
    removeHoliday: (startDate: string, endDate: string) => void
    addHighSeasonPeriod: (startDate: string, endDate: string) => void
    removeHighSeasonPeriod: (startDate: string, endDate: string) => void
    isDateBlocked: (date: string) => boolean
    isHoliday: (date: string) => boolean
    isHighSeason: (date: string) => boolean
    isWeekend: (date: string) => boolean
    isLoading: boolean
}

const HotelAvailabilityContext = createContext<HotelAvailabilityContextType | null>(null)

const defaultData: HotelAvailabilityData = {
    id: 'hotel-availability',
    blockedDates: [],
    holidays: [],
    highSeasonPeriods: [],
}

export function HotelAvailabilityProvider({ children }: { children: ReactNode }) {
    const { document: data, setDocument: setData, isLoading } = useDocument({
        collectionName: 'configs',
        id: 'hotel-availability',
        defaultValue: defaultData,
    })
    console.log(data)

    const addBlockedDate = (startDate: string, endDate: string) => {
        setData({
            blockedDates: [...data.blockedDates, { startDate, endDate }],
        })
    }

    const removeBlockedDate = (startDate: string, endDate: string) => {
        setData({
            blockedDates: data.blockedDates.filter(
                d => d.startDate !== startDate || d.endDate !== endDate
            ),
        })
    }

    const addHoliday = (startDate: string, endDate: string, name: string) => {
        setData({
            holidays: [...data.holidays, { startDate, endDate, name }],
        })
    }

    const removeHoliday = (startDate: string, endDate: string) => {
        setData({
            holidays: data.holidays.filter(
                h => h.startDate !== startDate || h.endDate !== endDate
            ),
        })
    }

    const addHighSeasonPeriod = (startDate: string, endDate: string) => {
        setData({
            highSeasonPeriods: [...data.highSeasonPeriods, { startDate, endDate }],
        })
    }

    const removeHighSeasonPeriod = (startDate: string, endDate: string) => {
        setData({
            highSeasonPeriods: data.highSeasonPeriods.filter(
                p => p.startDate !== startDate || p.endDate !== endDate
            ),
        })
    }

    const isDateBlocked = (date: string) => {
        return data.blockedDates.some(
            d => new Date(date) >= new Date(d.startDate) && new Date(date) <= new Date(d.endDate)
        )
    }

    const isHoliday = (date: string) => {
        return data.holidays.some(
            h => new Date(date) >= new Date(h.startDate) && new Date(date) <= new Date(h.endDate)
        )
    }

    const isHighSeason = (date: string) => {
        return data.highSeasonPeriods.some(
            p => new Date(date) >= new Date(p.startDate) && new Date(date) <= new Date(p.endDate)
        )
    }

    const isWeekend = (date: string) => {
        const day = getDay(new Date(date))
        return day === 0 // 0 is Sunday
    }

    return (
        <HotelAvailabilityContext.Provider
            value={{
                blockedDates: data.blockedDates,
                holidays: data.holidays,
                highSeasonPeriods: data.highSeasonPeriods,
                addBlockedDate,
                removeBlockedDate,
                addHoliday,
                removeHoliday,
                addHighSeasonPeriod,
                removeHighSeasonPeriod,
                isDateBlocked,
                isHoliday,
                isHighSeason,
                isWeekend,
                isLoading,
            }}
        >
            {children}
        </HotelAvailabilityContext.Provider>
    )
}

export function useHotelAvailability() {
    const context = useContext(HotelAvailabilityContext)
    if (!context) {
        throw new Error('useHotelAvailability must be used within a HotelAvailabilityProvider')
    }
    return context
} 