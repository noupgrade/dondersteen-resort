import { eachDayOfInterval, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Ban, CalendarDays, DollarSign, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'

import { useHotelAvailability } from '@/components/HotelAvailabilityContext'
import { HotelAvailabilityCalendar } from '@/components/hotel-availability-calendar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { useToast } from '@/shared/ui/use-toast'

interface DateRange {
    from: Date | null
    to: Date | null
}

export default function DisponibilidadPage() {
    const {
        blockedDates,
        holidays,
        highSeasonPeriods,
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
    } = useHotelAvailability()

    const { toast } = useToast()
    const [selectedRange, setSelectedRange] = useState<DateRange>({ from: null, to: null })
    const [isBlockDateDialogOpen, setIsBlockDateDialogOpen] = useState(false)
    const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false)
    const [isHighSeasonDialogOpen, setIsHighSeasonDialogOpen] = useState(false)
    const [holidayName, setHolidayName] = useState('')
    const [seasonPrice, setSeasonPrice] = useState<string>('')

    const handleDateRangeSelect = useCallback((range: DateRange) => {
        setSelectedRange(range)
        if (range.from && range.to) {
            setIsBlockDateDialogOpen(true)
        }
    }, [])

    const handleBlockDates = () => {
        if (selectedRange.from && selectedRange.to) {
            const dates = eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to })
            dates.forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd')
                if (!isDateBlocked(dateStr)) {
                    addBlockedDate(dateStr)
                }
            })
            setIsBlockDateDialogOpen(false)
            toast({
                title: 'Fechas bloqueadas',
                description: 'Las fechas han sido bloqueadas correctamente.',
            })
        }
    }

    const handleAddHolidays = () => {
        if (selectedRange.from && selectedRange.to && holidayName) {
            const dates = eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to })
            dates.forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd')
                if (!isHoliday(dateStr)) {
                    addHoliday(dateStr, holidayName)
                }
            })
            setHolidayName('')
            setIsHolidayDialogOpen(false)
            toast({
                title: 'Festivos añadidos',
                description: 'Los días festivos han sido añadidos correctamente.',
            })
        }
    }

    const handleAddHighSeason = () => {
        if (selectedRange.from && selectedRange.to && seasonPrice) {
            const startDateStr = format(selectedRange.from, 'yyyy-MM-dd')
            const endDateStr = format(selectedRange.to, 'yyyy-MM-dd')
            addHighSeasonPeriod(startDateStr, endDateStr, parseFloat(seasonPrice))
            setSeasonPrice('')
            setIsHighSeasonDialogOpen(false)
            toast({
                title: 'Temporada alta añadida',
                description: 'El periodo de temporada alta ha sido añadido correctamente.',
            })
        }
    }

    const handleDialogOpenChange = (open: boolean) => {
        setIsBlockDateDialogOpen(open)
        if (!open) {
            setSelectedRange({ from: new Date(), to: null })
        }
    }

    const handleHolidayDialogOpenChange = (open: boolean) => {
        setIsHolidayDialogOpen(open)
        if (!open) {
            setSelectedRange({ from: new Date(), to: null })
        }
    }

    const handleHighSeasonDialogOpenChange = (open: boolean) => {
        setIsHighSeasonDialogOpen(open)
        if (!open) {
            setSelectedRange({ from: new Date(), to: null })
        }
    }

    const handleRemoveSpecialConditions = () => {
        if (selectedRange.from && selectedRange.to) {
            const dates = eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to })

            // Eliminar bloqueos y festivos
            dates.forEach(date => {
                const dateStr = format(date, 'yyyy-MM-dd')
                if (isDateBlocked(dateStr)) {
                    removeBlockedDate(dateStr)
                }
                if (isHoliday(dateStr)) {
                    removeHoliday(dateStr)
                }
            })

            // Manejar periodos de temporada alta
            const affectedPeriods = new Set(
                dates.flatMap(date => {
                    const dateStr = format(date, 'yyyy-MM-dd')
                    return highSeasonPeriods.filter(
                        p => new Date(dateStr) >= new Date(p.startDate) &&
                            new Date(dateStr) <= new Date(p.endDate)
                    )
                })
            )

            affectedPeriods.forEach(period => {
                removeHighSeasonPeriod(period.startDate, period.endDate)
            })

            setIsBlockDateDialogOpen(false)
            toast({
                title: 'Condiciones especiales eliminadas',
                description: 'Se han eliminado todas las condiciones especiales de las fechas seleccionadas.',
            })
        }
    }

    const getSelectedDatesStatus = () => {
        if (!selectedRange.from || !selectedRange.to) return null

        const dates = eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to })
        let hasBlocked = false
        let hasHolidays = false
        let hasHighSeason = false

        dates.forEach(date => {
            const dateStr = format(date, 'yyyy-MM-dd')
            if (isDateBlocked(dateStr)) hasBlocked = true
            if (isHoliday(dateStr)) hasHolidays = true
            if (getHighSeasonPrice(dateStr)) hasHighSeason = true
        })

        return { hasBlocked, hasHolidays, hasHighSeason }
    }

    if (isLoading) {
        return (
            <div className='container mx-auto p-6'>
                <div className='flex items-center justify-center h-[60vh]'>
                    <div className='text-center space-y-4'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                        <p className='text-muted-foreground'>Cargando disponibilidad...</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold'>Gestión de Disponibilidad</h1>
                <div className='flex gap-4'>
                    <Button onClick={() => setIsHighSeasonDialogOpen(true)}>
                        <DollarSign className='mr-2 h-4 w-4' />
                        Añadir Temporada Alta
                    </Button>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <Card>
                    <CardHeader>
                        <div className='flex items-center space-x-2'>
                            <Ban className='h-5 w-5 text-red-500' />
                            <CardTitle className='text-lg'>Días Bloqueados</CardTitle>
                        </div>
                        <CardDescription>Días no disponibles para reservas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{blockedDates.length}</div>
                        <p className='text-sm text-muted-foreground'>días bloqueados en total</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center space-x-2'>
                            <CalendarDays className='h-5 w-5 text-amber-500' />
                            <CardTitle className='text-lg'>Días Festivos</CardTitle>
                        </div>
                        <CardDescription>Fechas festivas marcadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{holidays.length}</div>
                        <p className='text-sm text-muted-foreground'>días festivos configurados</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className='flex items-center space-x-2'>
                            <DollarSign className='h-5 w-5 text-green-500' />
                            <CardTitle className='text-lg'>Temporada Alta</CardTitle>
                        </div>
                        <CardDescription>Periodos de temporada alta</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{highSeasonPeriods.length}</div>
                        <p className='text-sm text-muted-foreground'>periodos configurados</p>
                    </CardContent>
                </Card>
            </div>

            <HotelAvailabilityCalendar onDateSelect={handleDateRangeSelect} />

            <div className='flex flex-wrap justify-center gap-4'>
                <Badge variant='outline' className='py-1'>
                    <div className='mr-2 h-3 w-3 rounded-full bg-red-500' />
                    Bloqueado
                </Badge>
                <Badge variant='outline' className='py-1'>
                    <div className='mr-2 h-3 w-3 rounded-full bg-amber-500' />
                    Festivo
                </Badge>
                <Badge variant='outline' className='py-1'>
                    <div className='mr-2 h-3 w-3 rounded-full bg-green-500' />
                    Temporada Alta
                </Badge>
            </div>

            {/* Block Date Dialog */}
            <Dialog open={isBlockDateDialogOpen} onOpenChange={handleDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Gestionar Fechas</DialogTitle>
                        <DialogDescription>
                            {selectedRange.from && selectedRange.to && (
                                <div className='mt-2 text-sm'>
                                    {format(selectedRange.from, "d 'de' MMMM", { locale: es })} - {format(selectedRange.to, "d 'de' MMMM", { locale: es })}
                                    <br />
                                    {eachDayOfInterval({ start: selectedRange.from, end: selectedRange.to }).length} días seleccionados
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <Button onClick={handleBlockDates} className='w-full'>
                            <Ban className='mr-2 h-4 w-4' />
                            Bloquear Fechas
                        </Button>
                        <Button onClick={() => setIsHolidayDialogOpen(true)} variant='outline' className='w-full'>
                            <CalendarDays className='mr-2 h-4 w-4' />
                            Marcar como Festivos
                        </Button>
                        <Button onClick={() => setIsHighSeasonDialogOpen(true)} variant='outline' className='w-full'>
                            <DollarSign className='mr-2 h-4 w-4' />
                            Marcar como Temporada Alta
                        </Button>
                        {selectedRange.from && selectedRange.to && getSelectedDatesStatus() && (
                            <>
                                <div className='relative'>
                                    <div className='absolute inset-0 flex items-center'>
                                        <span className='w-full border-t' />
                                    </div>
                                    <div className='relative flex justify-center text-xs uppercase'>
                                        <span className='bg-background px-2 text-muted-foreground'>
                                            Eliminar condiciones
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleRemoveSpecialConditions}
                                    variant='destructive'
                                    className='w-full'
                                >
                                    <Trash2 className='mr-2 h-4 w-4' />
                                    Eliminar Condiciones Especiales
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Holiday Dialog */}
            <Dialog open={isHolidayDialogOpen} onOpenChange={handleHolidayDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Días Festivos</DialogTitle>
                        <DialogDescription>
                            Introduce el nombre de los días festivos
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='space-y-2'>
                            <Label>Nombre del festivo</Label>
                            <Input
                                value={holidayName}
                                onChange={(e) => setHolidayName(e.target.value)}
                                placeholder='Ej: Navidad'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleAddHolidays} disabled={!holidayName}>
                            Añadir Festivos
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* High Season Dialog */}
            <Dialog open={isHighSeasonDialogOpen} onOpenChange={handleHighSeasonDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Añadir Temporada Alta</DialogTitle>
                        <DialogDescription>
                            Define el precio de la temporada alta
                        </DialogDescription>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        <div className='space-y-2'>
                            <Label>Precio por noche (€)</Label>
                            <div className='relative'>
                                <DollarSign className='absolute left-3 top-2.5 h-5 w-5 text-muted-foreground' />
                                <Input
                                    type='number'
                                    className='pl-10'
                                    placeholder='0.00'
                                    value={seasonPrice}
                                    onChange={(e) => setSeasonPrice(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleAddHighSeason}
                            disabled={!seasonPrice}
                        >
                            Añadir Temporada Alta
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 