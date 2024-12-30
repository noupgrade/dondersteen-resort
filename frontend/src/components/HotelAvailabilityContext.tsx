'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useDocument } from '@/shared/firebase/hooks/useDocument'
import { FSDocument } from '@/shared/firebase/types'

interface BlockedDate {
    date: string
}

interface Holiday {
    date: string
    name: string
}

interface HighSeasonPeriod {
    startDate: string
    endDate: string
    price: number
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
    addBlockedDate: (date: string) => void
    removeBlockedDate: (date: string) => void
    addHoliday: (date: string, name: string) => void
    removeHoliday: (date: string) => void
    addHighSeasonPeriod: (startDate: string, endDate: string, price: number) => void
    removeHighSeasonPeriod: (startDate: string, endDate: string) => void
    isDateBlocked: (date: string) => boolean
    isHoliday: (date: string) => boolean
    getHighSeasonPrice: (date: string) => number | null
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

    const addBlockedDate = (date: string) => {
        setData({
            blockedDates: [...data.blockedDates, { date }],
        })
    }

    const removeBlockedDate = (date: string) => {
        setData({
            blockedDates: data.blockedDates.filter(d => d.date !== date),
        })
    }

    const addHoliday = (date: string, name: string) => {
        setData({
            holidays: [...data.holidays, { date, name }],
        })
    }

    const removeHoliday = (date: string) => {
        setData({
            holidays: data.holidays.filter(h => h.date !== date),
        })
    }

    const addHighSeasonPeriod = (startDate: string, endDate: string, price: number) => {
        setData({
            highSeasonPeriods: [...data.highSeasonPeriods, { startDate, endDate, price }],
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
        return data.blockedDates.some(d => d.date === date)
    }

    const isHoliday = (date: string) => {
        return data.holidays.some(h => h.date === date)
    }

    const getHighSeasonPrice = (date: string) => {
        const period = data.highSeasonPeriods.find(
            p => new Date(date) >= new Date(p.startDate) && new Date(date) <= new Date(p.endDate)
        )
        return period ? period.price : null
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
                getHighSeasonPrice,
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