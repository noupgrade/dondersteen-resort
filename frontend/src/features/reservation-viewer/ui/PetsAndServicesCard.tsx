import { PawPrint, Plus, Trash2, Truck } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { type HotelReservation, type Pet } from '@monorepo/functions/src/types/reservations'
import { type AdditionalService, type HairdressingServiceType } from '@monorepo/functions/src/types/services'

import { getServicesByPet, getTransportService } from '../model/services'

interface PetsAndServicesCardProps {
    reservation: HotelReservation
    isEditMode: boolean
    onPetsChange: (pets: Pet[]) => void
    onAddService: (petIndex: number) => void
    onRemoveService: (index: number) => void
    onUpdateService: (index: number, updatedService: AdditionalService) => void
}

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono',
}

export function PetsAndServicesCard({
    reservation,
    isEditMode,
    onPetsChange,
    onAddService,
    onRemoveService,
    onUpdateService,
}: PetsAndServicesCardProps) {
    const transportService = getTransportService(reservation.additionalServices)
    const servicesByPet = getServicesByPet(reservation.additionalServices)

    const renderPets = () => {
        return (
            <div className='space-y-4'>
                {reservation.pets.map((pet, petIndex) => (
                    <div key={pet.id || petIndex} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <span>Mascota {petIndex + 1}:</span>
                            <div className='flex items-center justify-end gap-2'>
                                {isEditMode ? (
                                    <>
                                        <Input
                                            value={pet.name}
                                            onChange={e => {
                                                const newPets = [...reservation.pets]
                                                newPets[petIndex] = { ...pet, name: e.target.value }
                                                onPetsChange(newPets)
                                            }}
                                            className='w-48'
                                        />
                                        <Button
                                            variant='destructive'
                                            size='icon'
                                            onClick={() => {
                                                const newPets = reservation.pets.filter((_, i) => i !== petIndex)
                                                onPetsChange(newPets)
                                            }}
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </>
                                ) : (
                                    <span>{pet.name}</span>
                                )}
                            </div>
                        </div>
                        <div className='space-y-2 pl-4'>
                            {reservation.additionalServices
                                .filter(service => service.petIndex === petIndex)
                                .map((service, serviceIndex) => (
                                    <div key={serviceIndex} className='flex items-center justify-between'>
                                        <span>Servicio:</span>
                                        <div className='flex items-center justify-end gap-2'>
                                            {isEditMode ? (
                                                <>
                                                    <Input
                                                        value={service.services?.join(', ') || ''}
                                                        onChange={e => {
                                                            const updatedService = {
                                                                ...service,
                                                                services: e.target.value
                                                                    ? e.target.value.split(',').map(s => s.trim())
                                                                    : [],
                                                            }
                                                            onUpdateService(serviceIndex, updatedService)
                                                        }}
                                                        className='w-48'
                                                    />
                                                    <Button
                                                        variant='destructive'
                                                        size='icon'
                                                        onClick={() => onRemoveService(serviceIndex)}
                                                    >
                                                        <Trash2 className='h-4 w-4' />
                                                    </Button>
                                                </>
                                            ) : (
                                                <span>{service.services?.join(', ') || '-'}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            {isEditMode && (
                                <Button variant='outline' size='sm' onClick={() => onAddService(petIndex)}>
                                    <Plus className='mr-2 h-4 w-4' />
                                    Añadir Servicio
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
                {isEditMode && (
                    <Button
                        variant='outline'
                        onClick={() => {
                            const newPet: Pet = {
                                name: '',
                                breed: '',
                                weight: 0,
                                size: 'pequeño',
                                sex: 'M',
                                isNeutered: false,
                            }
                            onPetsChange([...reservation.pets, newPet])
                        }}
                    >
                        <Plus className='mr-2 h-4 w-4' />
                        Añadir Mascota
                    </Button>
                )}
            </div>
        )
    }

    const renderServices = () => {
        return (
            <div className='space-y-6'>
                {/* Transporte si existe */}
                {transportService && (
                    <div className='space-y-2'>
                        <h4 className='font-medium'>Transporte</h4>
                        <div className='flex items-center gap-2 text-sm'>
                            <Truck className='h-4 w-4 text-gray-500' />
                            <span>{transportService.text}</span>
                        </div>
                    </div>
                )}

                {/* Servicios por mascota */}
                {Object.entries(servicesByPet).map(([petIndex, services]) => {
                    const pet = reservation.type === 'peluqueria' ? reservation.pet : reservation.pets[Number(petIndex)]

                    return (
                        <div key={petIndex} className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <h5 className='text-sm font-medium text-gray-500'>Servicios para {pet.name}</h5>
                                {isEditMode && (
                                    <Button variant='outline' size='sm' onClick={() => onAddService(Number(petIndex))}>
                                        <Plus className='mr-2 h-4 w-4' />
                                        Añadir Servicio
                                    </Button>
                                )}
                            </div>
                            <div className='grid gap-4'>
                                {services.map((service, index) => (
                                    <div key={index} className='grid grid-cols-[1fr_2fr_auto_auto] items-center gap-4'>
                                        <div className='text-sm'>
                                            {isEditMode ? (
                                                <Select
                                                    value={service.type}
                                                    onValueChange={value =>
                                                        onUpdateService(index, {
                                                            ...service,
                                                            type: value as typeof service.type,
                                                        })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value='hairdressing'>Peluquería</SelectItem>
                                                        <SelectItem value='special_care'>
                                                            Cuidados Especiales
                                                        </SelectItem>
                                                        <SelectItem value='special_food'>Comida Especial</SelectItem>
                                                        <SelectItem value='medication'>Medicación</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : service.type === 'hairdressing' ? (
                                                'Peluquería'
                                            ) : service.type === 'special_care' ? (
                                                'Cuidados Especiales'
                                            ) : service.type === 'special_food' ? (
                                                'Comida Especial'
                                            ) : service.type === 'medication' ? (
                                                'Medicación'
                                            ) : (
                                                service.type
                                            )}
                                        </div>
                                        <div className='text-sm'>
                                            {service.type === 'hairdressing' ? (
                                                isEditMode ? (
                                                    <Select
                                                        value={service.services?.[0] || 'bath_and_brush'}
                                                        onValueChange={value =>
                                                            onUpdateService(index, {
                                                                ...service,
                                                                services: [value as HairdressingServiceType],
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value='bath_and_brush'>
                                                                Baño y cepillado
                                                            </SelectItem>
                                                            <SelectItem value='bath_and_trim'>Baño y corte</SelectItem>
                                                            <SelectItem value='stripping'>Stripping</SelectItem>
                                                            <SelectItem value='deshedding'>Deslanado</SelectItem>
                                                            <SelectItem value='brushing'>Cepillado</SelectItem>
                                                            <SelectItem value='spa'>Spa</SelectItem>
                                                            <SelectItem value='spa_ozone'>Spa con ozono</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    service.services
                                                        ?.map(s => serviceTypeLabels[s as HairdressingServiceType])
                                                        .join(', ')
                                                )
                                            ) : isEditMode ? (
                                                <Input
                                                    value={service.comment || ''}
                                                    onChange={e =>
                                                        onUpdateService(index, {
                                                            ...service,
                                                            comment: e.target.value,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                service.comment || '-'
                                            )}
                                        </div>
                                        <div className='whitespace-nowrap text-right'>
                                            {isEditMode ? (
                                                <Input
                                                    type='number'
                                                    value={service.price || 30}
                                                    onChange={e =>
                                                        onUpdateService(index, {
                                                            ...service,
                                                            price: Number(e.target.value),
                                                        })
                                                    }
                                                    className='w-24 text-right'
                                                />
                                            ) : (
                                                <span>€{(service.price || 30).toFixed(2)}</span>
                                            )}
                                        </div>
                                        {isEditMode && (
                                            <div className='flex justify-end'>
                                                <Button
                                                    variant='destructive'
                                                    size='sm'
                                                    onClick={() => onRemoveService(index)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className='flex items-center gap-2 text-base font-medium'>
                    <PawPrint className='h-4 w-4' />
                    Mascotas y Servicios
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
                {renderPets()}
                <Separator />
                {renderServices()}
            </CardContent>
        </Card>
    )
}
