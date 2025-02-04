'use client'

import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { usePetPricing } from '@/shared/hooks/use-pet-pricing'
import { cn } from '@/shared/lib/utils'
import { PetSize } from '@/shared/types/pet.types'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

type PetDetailsFormProps = {
    form: UseFormReturn<any>
    petIndex: number
    onRemove: () => void
}

export function PetDetailsForm({ form, petIndex, onRemove }: PetDetailsFormProps) {
    const { t } = useTranslation()
    const { getSizeFromWeight, getPriceBySize } = usePetPricing()

    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name?.startsWith(`pets.${petIndex}.weight`)) {
                const weight = parseFloat(value.pets[petIndex].weight)
                const size = getSizeFromWeight(weight)
                form.setValue(`pets.${petIndex}.size`, size)
            }
        })
        return () => subscription.unsubscribe()
    }, [form, petIndex, getSizeFromWeight])

    const petName = form.watch(`pets.${petIndex}.name`)
    const size = form.watch(`pets.${petIndex}.size`) as PetSize | undefined

    return (
        <Card className='mb-6 bg-gradient-to-br from-slate-50 to-white shadow-sm transition-shadow duration-200 hover:shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                <h3 className='text-lg font-semibold text-slate-800'>
                    {t('booking.step1.petFields.title', 'Mascota {{number}}', { number: petIndex + 1 })}
                    {petName ? <span className='ml-1 text-primary'>- {petName}</span> : ''}
                </h3>
                {petIndex > 0 && (
                    <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={onRemove}
                        className='text-red-500 hover:bg-red-50 hover:text-red-700'
                    >
                        {t('booking.step1.removePet', 'Eliminar')}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <FormField
                        control={form.control}
                        name={`pets.${petIndex}.name`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-700'>
                                    {t('booking.step1.petFields.name', 'Nombre')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('booking.step1.petFields.name', 'Nombre')}
                                        {...field}
                                        className='bg-white focus:ring-2'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`pets.${petIndex}.breed`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-700'>
                                    {t('booking.step1.petFields.breed', 'Raza')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder={t('booking.step1.petFields.breed', 'Raza')}
                                        {...field}
                                        className='bg-white focus:ring-2'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`pets.${petIndex}.weight`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-700'>
                                    {t('booking.step1.petFields.weight', 'Peso (kg)')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='number'
                                        step='0.1'
                                        placeholder={t('booking.step1.petFields.weight', 'Peso (kg)')}
                                        {...field}
                                        className='bg-white focus:ring-2'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`pets.${petIndex}.size`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-700'>
                                    {t('booking.step1.petFields.size', 'Tamaño')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        readOnly
                                        value={t(`booking.step1.petFields.sizes.${field.value}`, field.value)}
                                        className={cn(
                                            'cursor-not-allowed bg-white',
                                            field.value === 'pequeño' && 'text-green-600',
                                            field.value === 'mediano' && 'text-blue-600',
                                            field.value === 'grande' && 'text-orange-600',
                                        )}
                                    />
                                </FormControl>
                                <p className='mt-1 text-sm text-muted-foreground'>
                                    {size &&
                                        t('booking.pricePerDay', '{{price}}€/día', { price: getPriceBySize(size) })}
                                </p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`pets.${petIndex}.age`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-700'>
                                    {t('booking.step1.petFields.age', 'Edad')}
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type='number'
                                        placeholder={t('booking.step1.petFields.age', 'Edad')}
                                        {...field}
                                        className='bg-white focus:ring-2'
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`pets.${petIndex}.isNeutered`}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className='text-slate-700'>
                                    {t('booking.step1.petFields.isNeutered', 'Castrado/Esterilizado')}
                                </FormLabel>
                                <FormControl>
                                    <Select
                                        value={field.value ? 'yes' : 'no'}
                                        onValueChange={(value: 'yes' | 'no') => field.onChange(value === 'yes')}
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                'border-2 bg-white',
                                                field.value ? 'border-green-200' : 'border-amber-200',
                                            )}
                                        >
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='yes'>
                                                {t('booking.step1.petFields.yes', 'Sí')}
                                            </SelectItem>
                                            <SelectItem value='no'>{t('booking.step1.petFields.no', 'No')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name={`pets.${petIndex}.personality`}
                    render={({ field }) => (
                        <FormItem className='mt-4'>
                            <FormLabel className='text-slate-700'>
                                {t('booking.step1.petFields.personality', 'Personalidad y hábitos')}
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder={t(
                                        'booking.step1.petFields.personalityPlaceholder',
                                        'Por favor, infórmanos sobre la personalidad y los hábitos de tu mascota en detalle para que podamos ayudar a tu mascota a adaptarse al nuevo entorno sin problemas.',
                                    )}
                                    className='min-h-[100px] resize-y bg-white focus:ring-2'
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    )
}
