import { forwardRef } from 'react'
import ReactDatePicker from 'react-datepicker'
import { es } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'

import { Button } from './button'
import { cn } from '@/shared/lib/styles/class-merge'

import 'react-datepicker/dist/react-datepicker.css'

export interface DatePickerProps {
    selected?: Date
    onSelect?: (date: Date) => void
    disabled?: (date: Date) => boolean
    minDate?: Date
    maxDate?: Date
    className?: string
}

export function DatePicker({
    selected,
    onSelect,
    disabled,
    minDate,
    maxDate,
    className,
}: DatePickerProps) {
    return (
        <div className={cn('grid gap-2', className)}>
            <ReactDatePicker
                selected={selected}
                onChange={onSelect}
                locale={es}
                dateFormat='dd/MM/yyyy'
                minDate={minDate}
                maxDate={maxDate}
                filterDate={disabled}
                customInput={<CustomInput />}
                showPopperArrow={false}
                popperClassName='react-datepicker-right'
                calendarClassName='!border-0 !p-0'
                wrapperClassName='!block'
            />
        </div>
    )
}

const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
    ({ value, onClick }, ref) => (
        <Button
            variant='outline'
            onClick={onClick}
            ref={ref}
            className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground'
            )}
        >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {value || 'Selecciona una fecha'}
        </Button>
    )
)
CustomInput.displayName = 'CustomInput' 