import { useTranslation } from 'react-i18next'

import { format, isValid } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import { Bed, Clock } from 'lucide-react'

import { PetFormData } from '@/features/booking/types/booking.types'
import { useHotelPricingConfig } from '@/shared/hooks/use-hotel-pricing-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ServiceItem } from '@/shared/ui/service-item'
import { formatCurrency } from '@/shared/utils/format'
import { calculateNights, calculateTotalPrice } from '@/shared/utils/pricing'
import { AdditionalService } from '@monorepo/functions/src/types/services'

interface BookingSummaryProps {
    dates: {
        from: Date
        to: Date
    } | null
    pets: PetFormData[]
    services: AdditionalService[]
}

export function BookingSummary({ dates, pets, services }: BookingSummaryProps) {
    const { t, i18n } = useTranslation()
    const { config } = useHotelPricingConfig()
    const dateLocale = i18n.language === 'es' ? es : enUS
    const nights = calculateNights(dates)
    const priceBreakdown = calculateTotalPrice(dates, pets, services)
    const hasMultiplePets = pets.length > 1

    // Group services by pet
    const driverService = services.find(s => s.type === 'driver')
    const servicesByPet = pets.map((pet, index) => ({
        pet,
        services: services.filter(s => s.petIndex === index && s.type !== 'driver'),
        breakdown: priceBreakdown.petsBreakdown[index],
    }))

    const getDriverPrice = () => {
        if (!config || !driverService) return 0
        switch (driverService.serviceType) {
            case 'pickup':
                return config.driver.pickup.price
            case 'dropoff':
                return config.driver.delivery.price
            case 'both':
                return config.driver.complete.price
            default:
                return 0
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('booking.summary.title')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                {/* Dates */}
                {dates && isValid(dates.from) && isValid(dates.to) && (
                    <div>
                        <div className='space-y-2 text-muted-foreground'>
                            <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4' />
                                <p>
                                    {t('booking.summary.dates.checkIn', {
                                        date: format(dates.from, 'PPP', { locale: dateLocale }),
                                    })}
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Clock className='h-4 w-4' />
                                <p>
                                    {t('booking.summary.dates.checkOut', {
                                        date: format(dates.to, 'PPP', { locale: dateLocale }),
                                    })}
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Bed className='h-4 w-4' />
                                <p className='text-sm'>
                                    {nights === 0
                                        ? t('booking.summary.dates.daycare')
                                        : t('booking.summary.dates.nights', { nights })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Driver Service */}
                {driverService && (
                    <div>
                        <h3 className='mb-2 font-medium'>{t('booking.summary.transport.title')}</h3>
                        <div className='flex flex-col gap-1'>
                            <div className='flex items-center justify-between'>
                                <ServiceItem service={driverService} />
                                <span className='text-sm text-yellow-600'>
                                    {t('booking.summary.transport.fromPrice', 'Desde {{price}}€', {
                                        price: getDriverPrice(),
                                    })}
                                </span>
                            </div>
                            <p className='text-xs italic text-muted-foreground'>
                                {t('booking.summary.transport.priceNote')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Pets and their services */}
                {servicesByPet.map(({ pet, services, breakdown }, index) => (
                    <div key={index}>
                        <h3 className='mb-2 font-medium'>
                            {pet.name && pet.breed ? `${pet.name} (${pet.breed})` : ''}
                        </h3>
                        <div className='space-y-2 pl-4'>
                            <div className='flex items-center justify-between text-sm text-muted-foreground'>
                                <div className='flex items-center gap-2'>
                                    <Bed className='h-4 w-4' />
                                    <span>
                                        {nights === 0
                                            ? t('booking.summary.pet.daycare')
                                            : t('booking.summary.pet.stay', {
                                                  size: t(`booking.step1.petFields.sizes.${pet.size}`, pet.size),
                                              })}
                                    </span>
                                </div>
                                <span>{formatCurrency(breakdown.basePrice)}</span>
                            </div>
                            {services.map((service, serviceIndex) => (
                                <div key={serviceIndex} className='flex items-center justify-between gap-2'>
                                    <ServiceItem service={service} />
                                    <span className='text-sm text-muted-foreground'>
                                        {formatCurrency(
                                            breakdown.services.find(s => s.name === service.type)?.price ?? 0,
                                        )}
                                    </span>
                                </div>
                            ))}
                            <div className='flex items-center justify-between pt-1 font-medium'>
                                <span>{t('booking.summary.subtotal')}</span>
                                <span>{formatCurrency(breakdown.subtotal)}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Total */}
                <div className='space-y-2 border-t pt-4'>
                    {hasMultiplePets && (
                        <div className='flex justify-between text-sm text-green-600'>
                            <span>{t('booking.summary.multiPetDiscount')}</span>
                            <span>{t('booking.summary.multiPetDiscountValue')}</span>
                        </div>
                    )}
                    <div className='flex flex-col gap-1'>
                        <div className='flex justify-between'>
                            <span className='font-medium'>{t('booking.summary.total')}</span>
                            <span className='font-semibold'>{formatCurrency(priceBreakdown.total)}</span>
                        </div>
                        {driverService && (
                            <span className='text-right text-sm text-yellow-600'>
                                {t('booking.summary.driverServiceNote')}
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
