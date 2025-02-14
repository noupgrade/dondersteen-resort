import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'

import { BookingFormData } from '../../types/booking.types'

interface ConfirmationStepProps {
    form: UseFormReturn<BookingFormData>
}

export function ConfirmationStep({ form }: ConfirmationStepProps) {
    const { t } = useTranslation()

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('booking.step4.title', 'Paso 4: Confirmación')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <FormField
                            control={form.control}
                            name='clientName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('booking.step4.clientName.label', 'Nombre')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('booking.step4.clientName.placeholder', 'Tu nombre')}
                                            {...field}
                                        />
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
                                    <FormLabel>{t('booking.step4.clientLastName.label', 'Apellidos')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t('booking.step4.clientLastName.placeholder', 'Tus apellidos')}
                                            {...field}
                                        />
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
                                    <FormLabel>{t('booking.step4.clientEmail.label', 'Email')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='email'
                                            placeholder={t('booking.step4.clientEmail.placeholder', 'tu@email.com')}
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
                                    <FormLabel>{t('booking.step4.clientPhone.label', 'Teléfono')}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='tel'
                                            placeholder={t('booking.step4.clientPhone.placeholder', '666777888')}
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
