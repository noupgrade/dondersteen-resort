import { useEffect, useState } from 'react'

import { PillIcon, Scissors, Stethoscope, Truck, UtensilsCrossed } from 'lucide-react'

import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type AdditionalServicesProps = {
    onServiceChange: (services: any) => void
    petCount: number
    groomingUnavailable: boolean
    currentServices: Record<string, boolean | string>
}

export function AdditionalServices({
    onServiceChange,
    petCount,
    groomingUnavailable,
    currentServices,
}: AdditionalServicesProps) {
    const [services, setServices] = useState<Record<string, boolean | string>>(currentServices)

    useEffect(() => {
        const initialServices: Record<string, boolean | string> = {
            ...currentServices,
            transport: currentServices.transport || false,
        }
        for (let i = 0; i < petCount; i++) {
            initialServices[`medication_${i}`] = currentServices[`medication_${i}`] || false
            initialServices[`medication_frequency_${i}`] = currentServices[`medication_frequency_${i}`] || 'once'
            initialServices[`specialCare_${i}`] = currentServices[`specialCare_${i}`] || false
            initialServices[`customFood_${i}`] = currentServices[`customFood_${i}`] || false
            initialServices[`customFoodDetails_${i}`] = currentServices[`customFoodDetails_${i}`] || ''
            initialServices[`grooming_${i}`] = currentServices[`grooming_${i}`] || false
            initialServices[`groomingService_${i}`] = currentServices[`groomingService_${i}`] || 'basic'
        }
        setServices(initialServices)
    }, [petCount, currentServices])

    const handleServiceChange = (service: string, checked: boolean | string) => {
        const newServices = { ...services, [service]: checked }
        setServices(newServices)
        onServiceChange(newServices)
    }

    const handleInputChange = (service: string, value: string) => {
        const newServices = { ...services, [service]: value }
        setServices(newServices)
        onServiceChange(newServices)
    }

    return (
        <div className='space-y-8'>
            <div className='space-y-4 rounded-lg border p-4'>
                <h3 className='font-semibold'>Servicios generales</h3>
                <div className='flex items-center space-x-2'>
                    <Checkbox
                        id='transport'
                        checked={services.transport as boolean}
                        onCheckedChange={checked => handleServiceChange('transport', checked as boolean)}
                    />
                    <Label htmlFor='transport' className='flex items-center'>
                        <Truck className='mr-2 h-4 w-4' />
                        Transporte (recogida y entrega) (20€)
                    </Label>
                </div>
            </div>
            {Array.from({ length: petCount }).map((_, index) => (
                <div key={index} className='space-y-4 rounded-lg border p-4'>
                    <h3 className='font-semibold'>Servicios para Mascota {index + 1}</h3>
                    <div className='space-y-2'>
                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id={`medication_${index}`}
                                checked={services[`medication_${index}`] as boolean}
                                onCheckedChange={checked =>
                                    handleServiceChange(`medication_${index}`, checked as boolean)
                                }
                            />
                            <Label htmlFor={`medication_${index}`} className='flex items-center'>
                                <PillIcon className='mr-2 h-4 w-4' />
                                Medicación
                            </Label>
                        </div>
                        {services[`medication_${index}`] && (
                            <Select
                                onValueChange={value => handleServiceChange(`medication_frequency_${index}`, value)}
                                defaultValue={services[`medication_frequency_${index}`] as string}
                            >
                                <SelectTrigger className='w-[180px]'>
                                    <SelectValue placeholder='Selecciona la frecuencia' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='once'>1 vez al día (2,50€/día)</SelectItem>
                                    <SelectItem value='multiple'>Varias veces al día (3,50€/día)</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox
                            id={`specialCare_${index}`}
                            checked={services[`specialCare_${index}`] as boolean}
                            onCheckedChange={checked => handleServiceChange(`specialCare_${index}`, checked as boolean)}
                        />
                        <Label htmlFor={`specialCare_${index}`} className='flex items-center'>
                            <Stethoscope className='mr-2 h-4 w-4' />
                            Curas Especiales (3€/día)
                        </Label>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <Checkbox
                            id={`customFood_${index}`}
                            checked={services[`customFood_${index}`] as boolean}
                            onCheckedChange={checked => handleServiceChange(`customFood_${index}`, checked as boolean)}
                        />
                        <Label htmlFor={`customFood_${index}`} className='flex items-center'>
                            <UtensilsCrossed className='mr-2 h-4 w-4' />
                            Comida personalizada (2€/día)
                        </Label>
                    </div>
                    {services[`customFood_${index}`] && (
                        <div className='ml-6 mt-2'>
                            <Label htmlFor={`customFoodDetails_${index}`}>
                                Describe las necesidades alimenticias de tu mascota
                            </Label>
                            <Input
                                id={`customFoodDetails_${index}`}
                                placeholder='Detalles de la comida personalizada'
                                value={services[`customFoodDetails_${index}`] as string}
                                onChange={e => handleInputChange(`customFoodDetails_${index}`, e.target.value)}
                            />
                        </div>
                    )}
                    {!groomingUnavailable && (
                        <div className='flex items-center space-x-2'>
                            <Checkbox
                                id={`grooming_${index}`}
                                checked={services[`grooming_${index}`] as boolean}
                                onCheckedChange={checked =>
                                    handleServiceChange(`grooming_${index}`, checked as boolean)
                                }
                            />
                            <Label htmlFor={`grooming_${index}`} className='flex items-center'>
                                <Scissors className='mr-2 h-4 w-4' />
                                Servicio de peluquería el último día
                            </Label>
                        </div>
                    )}
                    {!groomingUnavailable && services[`grooming_${index}`] && (
                        <Select onValueChange={value => handleServiceChange(`groomingService_${index}`, value)}>
                            <SelectTrigger className='w-[250px]'>
                                <SelectValue placeholder='Seleccione un servicio' />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='bano_especial'>Baño especial</SelectItem>
                                <SelectItem value='corte'>Corte</SelectItem>
                                <SelectItem value='deslanado'>Deslanado</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
            ))}
        </div>
    )
}
