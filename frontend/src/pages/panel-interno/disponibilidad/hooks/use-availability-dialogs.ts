import { useState } from 'react'
import { DateRange } from '../types'

export function useAvailabilityDialogs() {
    const [isBlockDateDialogOpen, setIsBlockDateDialogOpen] = useState(false)
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false)
    const [selectedRange, setSelectedRange] = useState<DateRange>({ from: null, to: null })

    const handleDialogOpenChange = (open: boolean) => {
        setIsBlockDateDialogOpen(open)
        if (!open) {
            setSelectedRange({ from: null, to: null })
        }
    }

    const handleHolidayDialogOpenChange = (open: boolean) => {
        setIsHolidayDialogOpen(open)
        if (!open) {
            setSelectedRange({ from: null, to: null })
        }
    }

    const openHolidayDialog = () => {
        setIsBlockDateDialogOpen(false)
        setIsHolidayDialogOpen(true)
    }

    return {
        isBlockDateDialogOpen,
        isHolidayDialogOpen,
        selectedRange,
        handleDialogOpenChange,
        handleHolidayDialogOpenChange,
        openHolidayDialog,
        setSelectedRange,
    }
} 