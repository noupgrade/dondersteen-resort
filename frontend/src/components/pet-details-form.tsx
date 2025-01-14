'use client'

import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type PetDetailsFormProps = {
    form: UseFormReturn<any>
    petIndex: number
    onRemove: () => void
}

export function PetDetailsForm({ form, petIndex, onRemove }: PetDetailsFormProps) {
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name?.startsWith(`pets.${petIndex}.weight`)) {
                const weight = parseFloat(value.pets[petIndex].weight)
                let size = ''
                if (weight <= 10) size = 'pequeño'
                else if (weight <= 20) size = 'mediano'
                else if (weight <= 40) size = 'grande'
                else size = 'extra-grande'
                form.setValue(`pets.${petIndex}.size`, size)
            }
        })
        return () => subscription.unsubscribe()
    }, [form, petIndex])

    const petName = form.watch(`pets.${petIndex}.name`)

    return (
        <Card className='mb-6 bg-slate-50'>
            <CardHeader>
                <h3 className='text-lg font-semibold'>
                    Mascota {petIndex + 1}
                    {petName ? ` - ${petName}` : ''}
                </h3>
            </CardHeader>
            <CardContent className='space-y-4'>
                <FormField
                    control={form.control}
                    name={`pets.${petIndex}.name`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder='Nombre de la mascota' {...field} />
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
                            <FormLabel>Raza</FormLabel>
                            <FormControl>
                                <Input placeholder='Raza' {...field} />
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
                            <FormLabel>Peso (kg)</FormLabel>
                            <FormControl>
                                <Input type='number' step='0.1' placeholder='Peso' {...field} />
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
                            <FormLabel>Tamaño</FormLabel>
                            <FormControl>
                                <Input readOnly {...field} />
                            </FormControl>
                            <p className='text-sm text-muted-foreground'>
                                {field.value === 'pequeño' && 'Precio: 32€/día'}
                                {field.value === 'mediano' && 'Precio: 35€/día'}
                                {field.value === 'grande' && 'Precio: 39€/día'}
                                {field.value === 'extra-grande' && 'Precio: 45€/día'}
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
                            <FormLabel>Edad</FormLabel>
                            <FormControl>
                                <Input type='number' placeholder='Edad' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name={`pets.${petIndex}.personality`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Personalidad y hábitos</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder='Por favor, infórmanos sobre la personalidad y los hábitos de tu mascota en detalle para que podamos ayudar a tu mascota a adaptarse al nuevo entorno sin problemas.'
                                    className='min-h-[100px]'
                                    {...field}
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
                            <FormLabel>Castrado/Esterilizado</FormLabel>
                            <FormControl>
                                <Select
                                    value={field.value ? 'yes' : 'no'}
                                    onValueChange={(value: 'yes' | 'no') => field.onChange(value === 'yes')}
                                >
                                    <SelectTrigger className={`${field.value ? 'bg-green-50' : 'bg-amber-50'}`}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">Sí</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {petIndex > 0 && (
                    <Button type='button' variant='destructive' size='sm' onClick={onRemove} className='mt-2'>
                        Eliminar mascota
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
