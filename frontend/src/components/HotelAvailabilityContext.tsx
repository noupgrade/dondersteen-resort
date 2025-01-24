'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useDocument } from '@/shared/firebase/hooks/useDocument'
import { FSDocument } from '@/shared/firebase/types'
import { getDay, format, addYears } from 'date-fns'

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
    holidaysYearsAdded: number[] // Años para los que ya se han añadido los festivos
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
    holidaysYearsAdded: []
}

const DEFAULT_HOLIDAYS = [
    { day: 1, month: 1, name: 'Año Nuevo (Cap d\'Any)' },
    { day: 6, month: 1, name: 'Reyes (Epifanía del Señor)' },
    { day: 1, month: 5, name: 'Fiesta del Trabajo (Festa del Treball)' },
    { day: 15, month: 8, name: 'Asunción de la Virgen (L\'Assumpció)' },
    { day: 11, month: 9, name: 'Diada Nacional de Cataluña (Diada Nacional de Catalunya)' },
    { day: 24, month: 9, name: 'Mare de Déu de la Mercè' },
    { day: 12, month: 10, name: 'Fiesta Nacional de España (Fiesta Nacional d\'Espanya)' },
    { day: 1, month: 11, name: 'Todos los Santos (Tots Sants)' },
    { day: 6, month: 12, name: 'Día de la Constitución Española (Dia de la Constitució)' },
    { day: 8, month: 12, name: 'Inmaculada Concepción (La Immaculada Concepció)' },
    { day: 25, month: 12, name: 'Navidad (Nadal)' },
    { day: 26, month: 12, name: 'San Esteban (Sant Esteve)' }
]

export function HotelAvailabilityProvider({ children }: { children: ReactNode }) {
    const { document: data, setDocument: setData, isLoading } = useDocument({
        collectionName: 'configs',
        id: 'hotel-availability',
        defaultValue: defaultData,
    })
    console.log(data)

    const ensureDefaultHolidays = () => {
        if (!data) return

        const currentYear = new Date().getFullYear()
        const nextYear = currentYear + 1

        // Verificar qué años necesitan festivos
        const needsCurrentYear = !data.holidaysYearsAdded?.includes(currentYear)
        const needsNextYear = !data.holidaysYearsAdded?.includes(nextYear)

        if (!needsCurrentYear && !needsNextYear) return

        let newHolidays = [...(data.holidays || [])]
        let yearsToAdd = []

        // Añadir festivos para el año actual si no existen
        if (needsCurrentYear) {
            const currentYearHolidays = DEFAULT_HOLIDAYS.map(holiday => ({
                startDate: format(new Date(currentYear, holiday.month - 1, holiday.day), 'yyyy-MM-dd'),
                endDate: format(new Date(currentYear, holiday.month - 1, holiday.day), 'yyyy-MM-dd'),
                name: holiday.name
            }))
            newHolidays = [...newHolidays, ...currentYearHolidays]
            yearsToAdd.push(currentYear)
        }

        // Añadir festivos para el año siguiente si no existen
        if (needsNextYear) {
            const nextYearHolidays = DEFAULT_HOLIDAYS.map(holiday => ({
                startDate: format(new Date(nextYear, holiday.month - 1, holiday.day), 'yyyy-MM-dd'),
                endDate: format(new Date(nextYear, holiday.month - 1, holiday.day), 'yyyy-MM-dd'),
                name: holiday.name
            }))
            newHolidays = [...newHolidays, ...nextYearHolidays]
            yearsToAdd.push(nextYear)
        }

        // Actualizar la base de datos con los nuevos festivos y años
        if (yearsToAdd.length > 0) {
            setData({
                ...data,
                holidays: newHolidays,
                holidaysYearsAdded: [...(data.holidaysYearsAdded || []), ...yearsToAdd]
            })
        }
    }

    useEffect(() => {
        if (!isLoading) {
            ensureDefaultHolidays()
        }
    }, [isLoading])

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