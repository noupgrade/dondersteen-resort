import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { Heart, Pill, Scissors, Truck, UtensilsCrossed } from 'lucide-react'

import { useServices } from '@/hooks/use-services'
import { AdditionalService, HairdressingServiceType } from '@/shared/types/additional-services'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

const HOURS = Array.from({ length: 24 }, (_, hour) => `${hour.toString().padStart(2, '0')}:00`)

const HAIRDRESSING_SERVICES = [
    { value: 'bath_and_brush', label: 'Baño y cepillado' },
    { value: 'bath_and_trim', label: 'Baño y arreglo (corte)' },
    { value: 'stripping', label: 'Stripping' },
    { value: 'deshedding', label: 'Desalanado (extraccion muda)' },
    { value: 'brushing', label: 'Cepillado' },
    { value: 'spa', label: 'Spa' },
    { value: 'spa_ozone', label: 'Spa+ozono' },
    { value: 'knots', label: 'Nudos' },
    { value: 'extremely_dirty', label: 'Extremadamente sucio' },
] as const

type TimeSelectionProps = {
    label: string
    value: string
    onValueChange: (value: string) => void
}

function TimeSelection({ label, value, onValueChange }: TimeSelectionProps) {
    const { t } = useTranslation()
    const isOutOfHours = (time: string) => {
        const hour = parseInt(time.split(':')[0], 10)
        return hour < 8 || hour >= 19
    }

    return (
        <div className='space-y-2'>
            <Label>{label}</Label>
            <Select value={value || ''} onValueChange={onValueChange}>
                <SelectTrigger className='w-fit'>
                    <SelectValue placeholder={t('booking.step3.generalServices.selectTime')} />
                </SelectTrigger>
                <SelectContent>
                    {HOURS.map(hour => (
                        <SelectItem key={hour} value={hour} className={isOutOfHours(hour) ? 'text-yellow-500' : ''}>
                            {hour}
                            {isOutOfHours(hour) ? t('booking.step3.generalServices.outOfHours') : ''}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

type DriverServiceProps = {
    driverService: ReturnType<typeof useServices>['getDriverService'] extends (...args: any[]) => infer R ? R : never
    addOrUpdateDriverService: (
        serviceType: 'pickup' | 'dropoff' | 'both',
        pickupTime?: string,
        dropoffTime?: string,
        isOutOfHours?: boolean,
    ) => void
    removeDriverService: () => void
}

function DriverService({ driverService, addOrUpdateDriverService, removeDriverService }: DriverServiceProps) {
    const { t } = useTranslation()
    const isOutOfHours = (time: string) => {
        const hour = parseInt(time.split(':')[0], 10)
        return hour < 8 || hour >= 19
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-base'>{t('booking.step3.generalServices.title')}</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                <div className='flex items-center space-x-2'>
                    <Checkbox
                        id='transport'
                        checked={!!driverService}
                        onCheckedChange={checked => {
                            if (checked) {
                                addOrUpdateDriverService('both')
                            } else {
                                removeDriverService()
                            }
                        }}
                    />
                    <Label htmlFor='transport' className='flex items-center'>
                        <Truck className='mr-2 h-4 w-4' />
                        {t('booking.step3.generalServices.driver')}
                    </Label>
                </div>
                {driverService && (
                    <div className='ml-6 space-y-4'>
                        <div className='space-y-2'>
                            <Label>{t('booking.step3.generalServices.serviceType')}</Label>
                            <Select
                                value={driverService.serviceType}
                                onValueChange={value => {
                                    addOrUpdateDriverService(
                                        value as 'pickup' | 'dropoff' | 'both',
                                        driverService.pickupTime,
                                        driverService.dropoffTime,
                                        driverService.isOutOfHours,
                                    )
                                }}
                            >
                                <SelectTrigger className='w-fit'>
                                    <SelectValue placeholder={t('booking.step3.generalServices.selectType')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='pickup'>
                                        {t('booking.step3.generalServices.pickupOnly')}
                                    </SelectItem>
                                    <SelectItem value='dropoff'>
                                        {t('booking.step3.generalServices.dropoffOnly')}
                                    </SelectItem>
                                    <SelectItem value='both'>{t('booking.step3.generalServices.both')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {(driverService.serviceType === 'pickup' || driverService.serviceType === 'both') && (
                            <TimeSelection
                                label={t('booking.step3.generalServices.pickupTime')}
                                value={driverService.pickupTime || ''}
                                onValueChange={value => {
                                    const isOutOfHoursTime = isOutOfHours(value)
                                    addOrUpdateDriverService(
                                        driverService.serviceType,
                                        value,
                                        driverService.dropoffTime,
                                        isOutOfHoursTime,
                                    )
                                }}
                            />
                        )}

                        {(driverService.serviceType === 'dropoff' || driverService.serviceType === 'both') && (
                            <TimeSelection
                                label={t('booking.step3.generalServices.dropoffTime')}
                                value={driverService.dropoffTime || ''}
                                onValueChange={value => {
                                    const isOutOfHoursTime = isOutOfHours(value)
                                    addOrUpdateDriverService(
                                        driverService.serviceType,
                                        driverService.pickupTime,
                                        value,
                                        isOutOfHoursTime,
                                    )
                                }}
                            />
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

type SpecialFoodServiceProps = {
    index: number
    service: ReturnType<typeof useServices>['getSpecialFoodService'] extends (...args: any[]) => infer R ? R : never
    addOrUpdateService: (index: number, foodType: 'refrigerated' | 'frozen') => void
    removeService: (index: number) => void
}

function SpecialFoodService({ index, service, addOrUpdateService, removeService }: SpecialFoodServiceProps) {
    const { t } = useTranslation()

    return (
        <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
                <Checkbox
                    id={`customFood_${index}`}
                    checked={!!service}
                    onCheckedChange={checked => {
                        if (checked) {
                            addOrUpdateService(index, 'refrigerated')
                        } else {
                            removeService(index)
                        }
                    }}
                />
                <Label htmlFor={`customFood_${index}`} className='flex items-center'>
                    <UtensilsCrossed className='mr-2 h-4 w-4' />
                    {t('booking.step3.petServices.specialFood.title')}
                </Label>
            </div>
            {service && (
                <div className='ml-6'>
                    <Select
                        value={service.foodType}
                        onValueChange={value => {
                            addOrUpdateService(index, value as 'refrigerated' | 'frozen')
                        }}
                    >
                        <SelectTrigger className='w-fit'>
                            <SelectValue placeholder={t('booking.step3.petServices.specialFood.selectType')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='refrigerated'>
                                {t('booking.step3.petServices.specialFood.refrigerated')}
                            </SelectItem>
                            <SelectItem value='frozen'>{t('booking.step3.petServices.specialFood.frozen')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    )
}

type MedicationServiceProps = {
    index: number
    service: ReturnType<typeof useServices>['getMedicationService'] extends (...args: any[]) => infer R ? R : never
    addOrUpdateService: (index: number, comment?: string, frequency?: 'single' | 'multiple') => void
    removeService: (index: number) => void
}

function MedicationService({ index, service, addOrUpdateService, removeService }: MedicationServiceProps) {
    const { t } = useTranslation()

    return (
        <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
                <Checkbox
                    id={`medication_${index}`}
                    checked={!!service}
                    onCheckedChange={checked => {
                        if (checked) {
                            addOrUpdateService(index)
                        } else {
                            removeService(index)
                        }
                    }}
                />
                <Label htmlFor={`medication_${index}`} className='flex items-center'>
                    <Pill className='mr-2 h-4 w-4' />
                    {t('booking.step3.petServices.medication.title')}
                </Label>
            </div>
            {service && (
                <div className='ml-6 space-y-4'>
                    <div className='space-y-2'>
                        <Select
                            value={service.frequency || 'single'}
                            onValueChange={value => {
                                addOrUpdateService(index, service.comment, value as 'single' | 'multiple')
                            }}
                        >
                            <SelectTrigger className='w-fit'>
                                <SelectValue placeholder={t('booking.step3.petServices.medication.selectFrequency')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='single'>
                                    {t('booking.step3.petServices.medication.onceDaily')}
                                </SelectItem>
                                <SelectItem value='multiple'>
                                    {t('booking.step3.petServices.medication.multipleTimes')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Textarea
                            id={`medication_comment_${index}`}
                            value={service.comment || ''}
                            onChange={e => addOrUpdateService(index, e.target.value, service.frequency || 'single')}
                            placeholder={t('booking.step3.petServices.medication.placeholder')}
                            className='mt-2'
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

type SpecialCareServiceProps = {
    index: number
    service: ReturnType<typeof useServices>['getSpecialCareService'] extends (...args: any[]) => infer R ? R : never
    addOrUpdateService: (index: number, comment?: string) => void
    removeService: (index: number) => void
}

function SpecialCareService({ index, service, addOrUpdateService, removeService }: SpecialCareServiceProps) {
    const { t } = useTranslation()

    return (
        <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
                <Checkbox
                    id={`specialCare_${index}`}
                    checked={!!service}
                    onCheckedChange={checked => {
                        if (checked) {
                            addOrUpdateService(index)
                        } else {
                            removeService(index)
                        }
                    }}
                />
                <Label htmlFor={`specialCare_${index}`} className='flex items-center'>
                    <Heart className='mr-2 h-4 w-4' />
                    {t('booking.step3.petServices.specialCare.title')}
                </Label>
            </div>
            {service && (
                <div className='ml-6'>
                    <Textarea
                        id={`specialCare_comment_${index}`}
                        value={service.comment || ''}
                        onChange={e => addOrUpdateService(index, e.target.value)}
                        placeholder={t('booking.step3.petServices.specialCare.instructions')}
                        className='mt-2'
                    />
                </div>
            )}
        </div>
    )
}

type HairdressingServiceProps = {
    index: number
    service: ReturnType<typeof useServices>['getHairdressingService'] extends (...args: any[]) => infer R ? R : never
    addOrUpdateService: (index: number, services: HairdressingServiceType[]) => void
    removeService: (index: number) => void
}

function HairdressingService({ index, service, addOrUpdateService, removeService }: HairdressingServiceProps) {
    const { t } = useTranslation()

    const HAIRDRESSING_SERVICES = [
        { value: 'bath_and_brush', translationKey: 'booking.step3.petServices.hairdressing.bathAndBrush' },
        { value: 'bath_and_trim', translationKey: 'booking.step3.petServices.hairdressing.bathAndTrim' },
        { value: 'stripping', translationKey: 'booking.step3.petServices.hairdressing.stripping' },
        { value: 'deshedding', translationKey: 'booking.step3.petServices.hairdressing.deshedding' },
        { value: 'brushing', translationKey: 'booking.step3.petServices.hairdressing.brushing' },
        { value: 'spa', translationKey: 'booking.step3.petServices.hairdressing.spa' },
        { value: 'spa_ozone', translationKey: 'booking.step3.petServices.hairdressing.spaOzone' },
        { value: 'knots', translationKey: 'booking.step3.petServices.hairdressing.knots' },
        { value: 'extremely_dirty', translationKey: 'booking.step3.petServices.hairdressing.extremelyDirty' },
    ] as const

    return (
        <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
                <Checkbox
                    id={`hairdressing_${index}`}
                    checked={!!service}
                    onCheckedChange={checked => {
                        if (checked) {
                            addOrUpdateService(index, [])
                        } else {
                            removeService(index)
                        }
                    }}
                />
                <Label htmlFor={`hairdressing_${index}`} className='flex items-center'>
                    <Scissors className='mr-2 h-4 w-4' />
                    {t('booking.step3.petServices.hairdressing.title')}
                </Label>
            </div>
            {service && (
                <div className='ml-6 space-y-2'>
                    {HAIRDRESSING_SERVICES.map(hairdressingService => (
                        <div key={hairdressingService.value} className='flex items-center space-x-2'>
                            <Checkbox
                                id={`hairdressing_${index}_${hairdressingService.value}`}
                                checked={service.services.includes(
                                    hairdressingService.value as HairdressingServiceType,
                                )}
                                onCheckedChange={checked => {
                                    const currentServices = service.services || []
                                    const newServices = checked
                                        ? [...currentServices, hairdressingService.value as HairdressingServiceType]
                                        : currentServices.filter(s => s !== hairdressingService.value)
                                    addOrUpdateService(index, newServices)
                                }}
                            />
                            <Label htmlFor={`hairdressing_${index}_${hairdressingService.value}`}>
                                {t(hairdressingService.translationKey)}
                            </Label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

type PetServicesCardProps = {
    index: number
    petName: string
    services: ReturnType<typeof useServices>
    groomingUnavailable?: boolean
}

function PetServicesCard({ index, petName, services, groomingUnavailable }: PetServicesCardProps) {
    const { t } = useTranslation()

    return (
        <Card>
            <CardHeader>
                <CardTitle className='text-base'>
                    {t('booking.step3.petServices.title', {
                        petName: petName || t('booking.step3.petServices.defaultPetName', { number: index + 1 }),
                    })}
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                <SpecialFoodService
                    index={index}
                    service={services.getSpecialFoodService(index)}
                    addOrUpdateService={services.addOrUpdateSpecialFoodService}
                    removeService={services.removeSpecialFoodService}
                />

                <MedicationService
                    index={index}
                    service={services.getMedicationService(index)}
                    addOrUpdateService={services.addOrUpdateMedicationService}
                    removeService={services.removeMedicationService}
                />

                <SpecialCareService
                    index={index}
                    service={services.getSpecialCareService(index)}
                    addOrUpdateService={services.addOrUpdateSpecialCareService}
                    removeService={services.removeSpecialCareService}
                />

                {!groomingUnavailable && (
                    <HairdressingService
                        index={index}
                        service={services.getHairdressingService(index)}
                        addOrUpdateService={services.addOrUpdateHairdressingService}
                        removeService={services.removeHairdressingService}
                    />
                )}
            </CardContent>
        </Card>
    )
}

export function AdditionalServices({
    onServiceChange,
    initialServices = [],
    petCount,
    groomingUnavailable,
    hideDriverService,
    petNames = [],
}: {
    onServiceChange: (services: AdditionalService[]) => void
    initialServices?: AdditionalService[]
    petCount: number
    groomingUnavailable?: boolean
    hideDriverService?: boolean
    petNames?: string[]
}) {
    const services = useServices(initialServices)

    useEffect(() => {
        onServiceChange(services.services)
    }, [services.services, onServiceChange])

    return (
        <div className='space-y-8'>
            {!hideDriverService && (
                <DriverService
                    driverService={services.getDriverService()}
                    addOrUpdateDriverService={services.addOrUpdateDriverService}
                    removeDriverService={services.removeDriverService}
                />
            )}

            {Array.from({ length: petCount }).map((_, index) => (
                <PetServicesCard
                    key={index}
                    index={index}
                    petName={petNames[index]}
                    services={services}
                    groomingUnavailable={groomingUnavailable}
                />
            ))}
        </div>
    )
}
