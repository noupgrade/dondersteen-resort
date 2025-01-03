import { UseFormReturn } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { BookingFormData } from '../../types/booking.types'

interface ConfirmationStepProps {
    form: UseFormReturn<BookingFormData>
}

export function ConfirmationStep({ form }: ConfirmationStepProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Paso 4: Confirmación</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='clientName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Tu nombre' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='clientLastName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Apellidos</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Tus apellidos' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='clientEmail'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='email'
                                            placeholder='tu@email.com'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='clientPhone'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='tel'
                                            placeholder='666777888'
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
} 