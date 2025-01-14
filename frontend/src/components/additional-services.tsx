import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { Truck, Pill, Heart, Scissors, UtensilsCrossed } from 'lucide-react'
import { useEffect } from 'react'

import { useServices } from '@/hooks/use-services'
import { AdditionalService, HairdressingServiceType } from '@/shared/types/additional-services'

const HOURS = Array.from({ length: 24 }, (_, hour) =>
    `${hour.toString().padStart(2, '0')}:00`
)

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

export function AdditionalServices({
    onServiceChange,
    initialServices = [],
    petCount,
    groomingUnavailable,
    hideDriverService,
}: {
    onServiceChange: (services: AdditionalService[]) => void
    initialServices?: AdditionalService[]
    petCount: number
    groomingUnavailable?: boolean
    hideDriverService?: boolean
}) {
    const {
        services,
        addOrUpdateDriverService,
        removeDriverService,
        addOrUpdateSpecialFoodService,
        removeSpecialFoodService,
        addOrUpdateMedicationService,
        removeMedicationService,
        addOrUpdateSpecialCareService,
        removeSpecialCareService,
        addOrUpdateHairdressingService,
        removeHairdressingService,
        getDriverService,
        getSpecialFoodService,
        getMedicationService,
        getSpecialCareService,
        getHairdressingService,
    } = useServices(initialServices)

    useEffect(() => {
        onServiceChange(services)
    }, [services, onServiceChange])

    const isOutOfHours = (time: string) => {
        const hour = parseInt(time.split(':')[0], 10)
        return hour < 8 || hour >= 19
    }

    const driverService = getDriverService()

    return (
        <div className='space-y-8'>
            <div className='space-y-4 rounded-lg border p-4'>
                <h3 className='font-semibold'>Servicios Adicionales</h3>

                {/* Driver Service */}
                {!hideDriverService && (
                    <div className='space-y-4'>
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
                                Chofer
                            </Label>
                        </div>
                        {driverService && (
                            <div className='ml-6 space-y-4'>
                                <div className='space-y-2'>
                                    <Label>Tipo de servicio</Label>
                                    <Select
                                        value={driverService.serviceType}
                                        onValueChange={value => {
                                            addOrUpdateDriverService(
                                                value as 'pickup' | 'dropoff' | 'both',
                                                driverService.pickupTime,
                                                driverService.dropoffTime,
                                                driverService.isOutOfHours
                                            )
                                        }}
                                    >
                                        <SelectTrigger className='w-[180px]'>
                                            <SelectValue placeholder='Selecciona el tipo' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='pickup'>Solo recogida</SelectItem>
                                            <SelectItem value='dropoff'>Solo entrega</SelectItem>
                                            <SelectItem value='both'>Recogida y entrega</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {(driverService.serviceType === 'pickup' || driverService.serviceType === 'both') && (
                                    <div className='space-y-2'>
                                        <Label>Hora de recogida</Label>
                                        <Select
                                            value={driverService.pickupTime}
                                            onValueChange={value => {
                                                const isOutOfHoursTime = isOutOfHours(value)
                                                addOrUpdateDriverService(
                                                    driverService.serviceType,
                                                    value,
                                                    driverService.dropoffTime,
                                                    isOutOfHoursTime
                                                )
                                            }}
                                        >
                                            <SelectTrigger className='w-[180px]'>
                                                <SelectValue placeholder='Selecciona la hora' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HOURS.map(hour => (
                                                    <SelectItem
                                                        key={hour}
                                                        value={hour}
                                                        className={isOutOfHours(hour) ? 'text-yellow-500' : ''}
                                                    >
                                                        {hour}{isOutOfHours(hour) ? ' (Fuera de horario)' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {(driverService.serviceType === 'dropoff' || driverService.serviceType === 'both') && (
                                    <div className='space-y-2'>
                                        <Label>Hora de entrega</Label>
                                        <Select
                                            value={driverService.dropoffTime}
                                            onValueChange={value => {
                                                const isOutOfHoursTime = isOutOfHours(value)
                                                addOrUpdateDriverService(
                                                    driverService.serviceType,
                                                    driverService.pickupTime,
                                                    value,
                                                    isOutOfHoursTime
                                                )
                                            }}
                                        >
                                            <SelectTrigger className='w-[180px]'>
                                                <SelectValue placeholder='Selecciona la hora' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {HOURS.map(hour => (
                                                    <SelectItem
                                                        key={hour}
                                                        value={hour}
                                                        className={isOutOfHours(hour) ? 'text-yellow-500' : ''}
                                                    >
                                                        {hour}{isOutOfHours(hour) ? ' (Fuera de horario)' : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Per Pet Services */}
                {Array.from({ length: petCount }).map((_, index) => (
                    <div key={index} className='space-y-4'>
                        {petCount > 1 && (
                            <h4 className='font-medium'>Servicios para mascota {index + 1}</h4>
                        )}

                        {/* Special Food */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id={`customFood_${index}`}
                                    checked={!!getSpecialFoodService(index)}
                                    onCheckedChange={checked => {
                                        if (checked) {
                                            addOrUpdateSpecialFoodService(index, 'refrigerated')
                                        } else {
                                            removeSpecialFoodService(index)
                                        }
                                    }}
                                />
                                <Label htmlFor={`customFood_${index}`} className='flex items-center'>
                                    <UtensilsCrossed className='mr-2 h-4 w-4' />
                                    Comida especial
                                </Label>
                            </div>
                            {getSpecialFoodService(index) && (
                                <div className='ml-6'>
                                    <Label>Tipo de comida</Label>
                                    <Select
                                        value={getSpecialFoodService(index)?.foodType}
                                        onValueChange={value => {
                                            addOrUpdateSpecialFoodService(index, value as 'refrigerated' | 'frozen')
                                        }}
                                    >
                                        <SelectTrigger className='w-[180px]'>
                                            <SelectValue placeholder='Selecciona el tipo' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='refrigerated'>Refrigerada</SelectItem>
                                            <SelectItem value='frozen'>Congelada</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Medication */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id={`medication_${index}`}
                                    checked={!!getMedicationService(index)}
                                    onCheckedChange={checked => {
                                        if (checked) {
                                            addOrUpdateMedicationService(index)
                                        } else {
                                            removeMedicationService(index)
                                        }
                                    }}
                                />
                                <Label htmlFor={`medication_${index}`} className='flex items-center'>
                                    <Pill className='mr-2 h-4 w-4' />
                                    Medicación
                                </Label>
                            </div>
                            {getMedicationService(index) && (
                                <div className='ml-6'>
                                    <Label htmlFor={`medication_comment_${index}`}>Comentarios sobre la medicación</Label>
                                    <Textarea
                                        id={`medication_comment_${index}`}
                                        value={getMedicationService(index)?.comment || ''}
                                        onChange={e => addOrUpdateMedicationService(index, e.target.value)}
                                        placeholder='Detalles sobre la medicación...'
                                        className='mt-2'
                                    />
                                </div>
                            )}
                        </div>

                        {/* Special Care */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id={`specialCare_${index}`}
                                    checked={!!getSpecialCareService(index)}
                                    onCheckedChange={checked => {
                                        if (checked) {
                                            addOrUpdateSpecialCareService(index)
                                        } else {
                                            removeSpecialCareService(index)
                                        }
                                    }}
                                />
                                <Label htmlFor={`specialCare_${index}`} className='flex items-center'>
                                    <Heart className='mr-2 h-4 w-4' />
                                    Curas
                                </Label>
                            </div>
                            {getSpecialCareService(index) && (
                                <div className='ml-6'>
                                    <Label htmlFor={`specialCare_comment_${index}`}>Comentarios sobre las curas</Label>
                                    <Textarea
                                        id={`specialCare_comment_${index}`}
                                        value={getSpecialCareService(index)?.comment || ''}
                                        onChange={e => addOrUpdateSpecialCareService(index, e.target.value)}
                                        placeholder='Detalles sobre las curas necesarias...'
                                        className='mt-2'
                                    />
                                </div>
                            )}
                        </div>

                        {/* Hairdressing */}
                        {!groomingUnavailable && (
                            <div className='space-y-4'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id={`hairdressing_${index}`}
                                        checked={!!getHairdressingService(index)}
                                        onCheckedChange={checked => {
                                            if (checked) {
                                                addOrUpdateHairdressingService(index, [])
                                            } else {
                                                removeHairdressingService(index)
                                            }
                                        }}
                                    />
                                    <Label htmlFor={`hairdressing_${index}`} className='flex items-center'>
                                        <Scissors className='mr-2 h-4 w-4' />
                                        Peluquería
                                    </Label>
                                </div>
                                {getHairdressingService(index) && (
                                    <div className='ml-6 space-y-2'>
                                        {HAIRDRESSING_SERVICES.map(service => (
                                            <div key={service.value} className='flex items-center space-x-2'>
                                                <Checkbox
                                                    id={`hairdressing_${index}_${service.value}`}
                                                    checked={
                                                        getHairdressingService(index)?.services.includes(
                                                            service.value as HairdressingServiceType
                                                        )
                                                    }
                                                    onCheckedChange={checked => {
                                                        const currentServices = getHairdressingService(index)?.services || []
                                                        const newServices = checked
                                                            ? [...currentServices, service.value as HairdressingServiceType]
                                                            : currentServices.filter(s => s !== service.value)
                                                        addOrUpdateHairdressingService(index, newServices)
                                                    }}
                                                />
                                                <Label htmlFor={`hairdressing_${index}_${service.value}`}>
                                                    {service.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
