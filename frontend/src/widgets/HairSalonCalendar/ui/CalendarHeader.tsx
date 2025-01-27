import { addDays, addWeeks, format, startOfWeek, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarDays, Calendar as CalendarIcon, CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { useCalendarStore } from '../model/store'

export function CalendarHeader() {
    const { view, setView, selectedDate, setSelectedDate } = useCalendarStore()

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (view === 'week') {
            setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1))
        } else {
            setSelectedDate(direction === 'prev' ? addDays(selectedDate, -1) : addDays(selectedDate, 1))
        }
    }

    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => setView(view === 'day' ? 'week' : 'day')}
                    className="flex items-center gap-2"
                >
                    {view === 'day' ? (
                        <>
                            <CalendarDays className="h-4 w-4" />
                            <span>Vista diaria</span>
                        </>
                    ) : (
                        <>
                            <CalendarRange className="h-4 w-4" />
                            <span>Vista semanal</span>
                        </>
                    )}
                </Button>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleNavigate('prev')}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="flex items-center gap-2 w-[180px] justify-start text-left font-normal"
                            >
                                <CalendarIcon className="h-4 w-4" />
                                {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && setSelectedDate(date)}
                                initialFocus
                                footer={
                                    <Button
                                        variant="outline"
                                        className="w-full mt-2 bg-primary/5 hover:bg-primary/10 border-primary/10 hover:border-primary/20 text-primary"
                                        onClick={() => {
                                            setSelectedDate(new Date())
                                        }}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Ir a hoy
                                    </Button>
                                }
                            />
                        </PopoverContent>
                    </Popover>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleNavigate('next')}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
} 