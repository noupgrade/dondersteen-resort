import { useState } from 'react'
import { DateRange } from '../types'

interface UseAvailabilityDialogsReturn {
    isBlockDateDialogOpen: boolean
    isHolidayDialogOpen: boolean
    isHighSeasonDialogOpen: boolean
    selectedRange: DateRange
    handleDialogOpenChange: (open: boolean) => void
    handleHolidayDialogOpenChange: (open: boolean) => void
    handleHighSeasonDialogOpenChange: (open: boolean) => void
    openHolidayDialog: () => void
    openHighSeasonDialog: () => void
    setSelectedRange: (range: DateRange) => void
}

export function useAvailabilityDialogs(): UseAvailabilityDialogsReturn {
    const [selectedRange, setSelectedRange] = useState<DateRange>({ from: null, to: null })
    const [isBlockDateDialogOpen, setIsBlockDateDialogOpen] = useState(false)
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false)
    const [isHighSeasonDialogOpen, setIsHighSeasonDialogOpen] = useState(false)

    const handleDialogOpenChange = (open: boolean) => {
        setIsBlockDateDialogOpen(open)
        if (!open && !isHolidayDialogOpen && !isHighSeasonDialogOpen) {
            setSelectedRange({ from: null, to: null })
        }
    }

    const handleHolidayDialogOpenChange = (open: boolean) => {
        setIsHolidayDialogOpen(open)
        if (!open) {
            setSelectedRange({ from: null, to: null })
            setIsBlockDateDialogOpen(false)
        }
    }

    const handleHighSeasonDialogOpenChange = (open: boolean) => {
        setIsHighSeasonDialogOpen(open)
        if (!open) {
            setSelectedRange({ from: null, to: null })
            setIsBlockDateDialogOpen(false)
        }
    }

    const openHolidayDialog = () => {
        setIsBlockDateDialogOpen(false)
        setIsHolidayDialogOpen(true)
    }

    const openHighSeasonDialog = () => {
        setIsBlockDateDialogOpen(false)
        setIsHighSeasonDialogOpen(true)
    }

    return {
        isBlockDateDialogOpen,
        isHolidayDialogOpen,
        isHighSeasonDialogOpen,
        selectedRange,
        handleDialogOpenChange,
        handleHolidayDialogOpenChange,
        handleHighSeasonDialogOpenChange,
        openHolidayDialog,
        openHighSeasonDialog,
        setSelectedRange,
    }
} 