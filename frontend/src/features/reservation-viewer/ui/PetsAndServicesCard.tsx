import { PawPrint, Plus, Truck } from 'lucide-react'
import { type HairSalonReservation, type HotelReservation, type HotelBudget } from '@/components/ReservationContext'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { type AdditionalService, type HairdressingServiceType } from '@/shared/types/additional-services'
import { getServicesByPet, getTransportService } from '../model/services'

interface PetsAndServicesCardProps {
    reservation: HairSalonReservation | HotelReservation | HotelBudget
    isEditMode: boolean
    serviceBasePrice?: number
    onServiceAdd?: (petIndex: number) => void
    onServiceRemove?: (index: number) => void
    onServiceUpdate?: (index: number, service: AdditionalService) => void
}

const serviceTypeLabels: Record<HairdressingServiceType, string> = {
    bath_and_brush: 'Baño y cepillado',
    bath_and_trim: 'Baño y corte',
    stripping: 'Stripping',
    deshedding: 'Deslanado',
    brushing: 'Cepillado',
    spa: 'Spa',
    spa_ozone: 'Spa con ozono'
}

export function PetsAndServicesCard({
    reservation,
    isEditMode,
    serviceBasePrice = 30,
    onServiceAdd,
    onServiceRemove,
    onServiceUpdate
}: PetsAndServicesCardProps) {
    const transportService = getTransportService(reservation.additionalServices)
    const servicesByPet = getServicesByPet(reservation.additionalServices)

    const renderPets = () => {
        if (reservation.type === 'hotel' || reservation.type === 'hotel-budget') {
            return reservation.pets.map((pet, index) => (
                <div key={index} className="flex gap-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium mb-2">
                            <PawPrint className="h-4 w-4 text-gray-500" />
                            {pet.name} ({pet.breed})
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Tamaño:</span>
                                {isEditMode ? (
                                    <Input
                                        value={pet.size}
                                        onChange={(e) => {
                                            // Handle size change
                                        }}
                                        className="h-8 w-32 mt-1"
                                    />
                                ) : (
                                    <div className="mt-1">{pet.size}</div>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">Peso:</span>
                                {isEditMode ? (
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input
                                            type="number"
                                            value={pet.weight}
                                            onChange={(e) => {
                                                // Handle weight change
                                            }}
                                            className="h-8 w-24"
                                        />
                                        <span>kg</span>
                                    </div>
                                ) : (
                                    <div className="mt-1">{pet.weight} kg</div>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">Sexo:</span>
                                {isEditMode ? (
                                    <Input
                                        value={pet.sex}
                                        onChange={(e) => {
                                            // Handle sex change
                                        }}
                                        className="h-8 w-24 mt-1"
                                    />
                                ) : (
                                    <div className="mt-1">{pet.sex === 'M' ? 'Macho' : 'Hembra'}</div>
                                )}
                            </div>
                            <div>
                                <span className="font-medium">Estado:</span>
                                {isEditMode ? (
                                    <Select
                                        value={pet.isNeutered ? 'yes' : 'no'}
                                        onValueChange={(value: 'yes' | 'no') => {
                                            // Handle neutered status change
                                        }}
                                    >
                                        <SelectTrigger className="h-8 w-32 mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="yes">Castrado/a</SelectItem>
                                            <SelectItem value="no">No castrado/a</SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="mt-1">{pet.isNeutered ? 'Castrado/a' : 'No castrado/a'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))
        } else {
            const pet = reservation.pet
            return (
                <div className="flex gap-8 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 font-medium mb-2">
                            <PawPrint className="h-4 w-4 text-gray-500" />
                            {pet.name} ({pet.breed})
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <span className="font-medium">Tamaño:</span>
                                <div className="mt-1">{pet.size}</div>
                            </div>
                            {pet.weight && (
                                <div>
                                    <span className="font-medium">Peso:</span>
                                    <div className="mt-1">{pet.weight} kg</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )
        }
    }

    const renderServices = () => {
        return (
            <div className="space-y-6">
                {/* Transporte si existe */}
                {transportService && (
                    <div className="space-y-2">
                        <h4 className="font-medium">Transporte</h4>
                        <div className="flex items-center gap-2 text-sm">
                            <Truck className="h-4 w-4 text-gray-500" />
                            <span>{transportService.text}</span>
                        </div>
                    </div>
                )}

                {/* Servicios por mascota */}
                {Object.entries(servicesByPet).map(([petIndex, services]) => {
                    const pet = reservation.type === 'peluqueria'
                        ? reservation.pet
                        : reservation.pets[Number(petIndex)]

                    return (
                        <div key={petIndex} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-medium text-gray-500">Servicios para {pet.name}</h5>
                                {isEditMode && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onServiceAdd?.(Number(petIndex))}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir Servicio
                                    </Button>
                                )}
                            </div>
                            <div className="grid gap-4">
                                {services.map((service, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_2fr_auto_auto] gap-4 items-center">
                                        <div className="text-sm">
                                            {isEditMode ? (
                                                <Select
                                                    value={service.type}
                                                    onValueChange={(value) => onServiceUpdate?.(index, {
                                                        ...service,
                                                        type: value as typeof service.type
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="hairdressing">Peluquería</SelectItem>
                                                        <SelectItem value="special_care">Cuidados Especiales</SelectItem>
                                                        <SelectItem value="special_food">Comida Especial</SelectItem>
                                                        <SelectItem value="medication">Medicación</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                service.type === 'hairdressing' ? 'Peluquería' :
                                                    service.type === 'special_care' ? 'Cuidados Especiales' :
                                                        service.type === 'special_food' ? 'Comida Especial' :
                                                            service.type === 'medication' ? 'Medicación' :
                                                                service.type
                                            )}
                                        </div>
                                        <div className="text-sm">
                                            {service.type === 'hairdressing' ? (
                                                isEditMode ? (
                                                    <Select
                                                        value={service.services?.[0] || 'bath_and_brush'}
                                                        onValueChange={(value) => onServiceUpdate?.(index, {
                                                            ...service,
                                                            services: [value as HairdressingServiceType]
                                                        })}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="bath_and_brush">Baño y cepillado</SelectItem>
                                                            <SelectItem value="bath_and_trim">Baño y corte</SelectItem>
                                                            <SelectItem value="stripping">Stripping</SelectItem>
                                                            <SelectItem value="deshedding">Deslanado</SelectItem>
                                                            <SelectItem value="brushing">Cepillado</SelectItem>
                                                            <SelectItem value="spa">Spa</SelectItem>
                                                            <SelectItem value="spa_ozone">Spa con ozono</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    service.services?.map(s => serviceTypeLabels[s as HairdressingServiceType]).join(', ')
                                                )
                                            ) : (
                                                isEditMode ? (
                                                    <Input
                                                        value={service.comment || ''}
                                                        onChange={(e) => onServiceUpdate?.(index, {
                                                            ...service,
                                                            comment: e.target.value
                                                        })}
                                                    />
                                                ) : (
                                                    service.comment || '-'
                                                )
                                            )}
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                            {isEditMode ? (
                                                <Input
                                                    type="number"
                                                    value={service.price || serviceBasePrice}
                                                    onChange={(e) => onServiceUpdate?.(index, {
                                                        ...service,
                                                        price: Number(e.target.value)
                                                    })}
                                                    className="w-24 text-right"
                                                />
                                            ) : (
                                                <span>€{(service.price || serviceBasePrice).toFixed(2)}</span>
                                            )}
                                        </div>
                                        {isEditMode && (
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => onServiceRemove?.(index)}
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
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <PawPrint className="h-4 w-4" />
                    Mascotas y Servicios
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderPets()}
                <Separator />
                {renderServices()}
            </CardContent>
        </Card>
    )
} 