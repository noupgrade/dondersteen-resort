import { useMemo, useState } from 'react'

import { SliderOption } from '@monorepo/functions/src/types/feedback'
import Slider, { SliderProps } from '@mui/material/Slider'
import { Mark } from '@mui/material/Slider/useSlider.types'

import './options-slider.css'

interface Props extends Omit<SliderProps, 'marks' | 'value' | 'onChangeCommitted'> {
    options: SliderOption[]
    onChangeCommitted: (committedOption: SliderOption) => void
    value?: string
}

export const OptionsSlider = ({ options, value, onChangeCommitted, ...props }: Props) => {
    const adaptedOptions: Mark[] = useMemo(
        () =>
            options.map(({ label }, i) => {
                if (i === 0) return { label, value: 0 }
                if (i === options.length - 1) return { label, value: 100 }
                return { label, value: Math.round((100 / (options.length - 1)) * i) }
            }),
        [options],
    )

    const adaptedValue = useMemo(() => {
        const selectedOption = options.find(option => option.value === value)
        return adaptedOptions.find(option => option.label === selectedOption?.label)?.value
    }, [adaptedOptions, options, value])

    const [positionValue, setPositionValue] = useState(adaptedValue ?? 0)

    const handleChange = (position: number | number[]) => {
        const selectedOption = adaptedOptions.find(option => option.value === position)
        if (!selectedOption) return

        setPositionValue(selectedOption.value)
    }

    const handleChangeCommited = (position: number | number[]) => {
        const selectedOption = adaptedOptions.find(option => option.value === position)
        const committedOption = options.find(option => option.label === selectedOption?.label)

        if (committedOption) onChangeCommitted(committedOption)
    }

    return (
        <Slider
            id='options-slider'
            aria-label='Custom marks'
            defaultValue={0}
            step={null}
            valueLabelDisplay='off'
            marks={adaptedOptions}
            onChange={(_, value) => handleChange(value)}
            value={positionValue}
            onChangeCommitted={(_, value) => handleChangeCommited(value)}
            {...props}
        />
    )
}
