'use client'

import { useEffect, useState } from 'react'

import { format } from 'date-fns'
import { Calendar, PawPrintIcon as Paw, X } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { SPECIAL_CONDITIONS } from '@/shared/types/special-conditions'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Textarea } from '@/shared/ui/textarea'

interface Room {
    id: string
    number: string
}

interface RoomDetailsModalProps {
    room: Room
    onClose: () => void
}

interface PetInfo {
    id: string
    name: string
    breed: string
    size: string
    checkInDate: string
    checkOutDate: string
    conditions: string[]
    medication?: string
    specialFood?: string
    observations: string
    roomNumber?: string
}

const sizeOptions = ['pequeño', 'mediano', 'grande', 'extra grande']
const conditionOptions = SPECIAL_CONDITIONS.map(condition => ({
    value: condition.symbol,
    label: condition.label,
    icon: condition.symbol,
}))

export function RoomDetailsModal({ room, onClose }: RoomDetailsModalProps) {
    const { reservations, updateReservation } = useReservation()
    const [petInfo, setPetInfo] = useState<PetInfo[]>([])
    const [availableRooms, setAvailableRooms] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState<string>('')
    const [newRoom, setNewRoom] = useState<string>('')
    const [syncError, setSyncError] = useState<string>('')
    const [availablePets, setAvailablePets] = useState<PetInfo[]>([])

    useEffect(() => {
        // Get all pets that are in this room
        const petsInRoom = reservations.flatMap(r =>
            r.pets
                .filter(pet => pet.roomNumber === room.number)
                .map(pet => ({
                    id: `${r.id}-${pet.name}`,
                    name: pet.name,
                    breed: pet.breed,
                    size: pet.size,
                    checkInDate: r.checkInDate,
                    checkOutDate: r.checkOutDate,
                    conditions: [],
                    medication: pet.medication || '',
                    specialFood: pet.specialFood || '',
                    observations: pet.observations || '',
                    roomNumber: pet.roomNumber,
                })),
        )

        setPetInfo(petsInRoom)
        setActiveTab(petsInRoom.length > 0 ? petsInRoom[0].id : '')

        // Get all rooms that have pets assigned
        const occupiedRooms = [...new Set(reservations.flatMap(r => r.pets.map(p => p.roomNumber)))].filter(
            r => r && r !== room.number,
        )
        setAvailableRooms(occupiedRooms)

        const allPets = reservations.flatMap(r =>
            r.pets.map(pet => ({
                ...pet,
                id: `${r.id}-${pet.name}`,
                checkInDate: r.checkInDate,
                checkOutDate: r.checkOutDate,
            })),
        )

        const sortedPets = allPets.sort((a, b) => {
            if (!a.roomNumber && b.roomNumber) return -1
            if (a.roomNumber && !b.roomNumber) return 1
            return 0
        })

        setAvailablePets(sortedPets)
    }, [room.number, reservations])

    const handleSave = () => {
        try {
            petInfo.forEach(pet => {
                const [reservationId] = pet.id.split('-')
                const reservation = reservations.find(r => r.id === reservationId)
                if (reservation) {
                    const updatedPets =
                        reservation.pets?.map(p =>
                            p.name === pet.name
                                ? {
                                      ...p,
                                      ...pet,
                                      roomNumber: pet.roomNumber,
                                      medication: pet.conditions.includes('medication') ? pet.medication : undefined,
                                      specialFood: pet.conditions.includes('specialFood') ? pet.specialFood : undefined,
                                  }
                                : p,
                        ) || []

                    updateReservation(reservationId, {
                        pets: updatedPets,
                    })
                }
            })
            setSyncError('')
            onClose()
        } catch (error) {
            console.error('Error saving changes:', error)
            setSyncError('Error al sincronizar los cambios. Por favor, inténtelo de nuevo.')
        }
    }

    const handleAddPet = (petId: string) => {
        const selectedPet = availablePets.find(p => p.id === petId)
        if (selectedPet) {
            const [reservationId] = petId.split('-')
            const reservation = reservations.find(r => r.id === reservationId)
            if (reservation) {
                const updatedPets = reservation.pets.map(p =>
                    p.name === selectedPet.name ? { ...p, roomNumber: room.number } : p,
                )
                updateReservation(reservationId, {
                    pets: updatedPets,
                })

                const newPet: PetInfo = {
                    ...selectedPet,
                    conditions: [],
                    roomNumber: room.number,
                }
                setPetInfo(prevInfo => [...prevInfo, newPet])
                setActiveTab(newPet.id)
            }
        }
    }

    const handleChangePetRoom = (value: string) => {
        setNewRoom(value)
    }

    const handleConditionChange = (petId: string, conditions: string[]) => {
        setPetInfo(prevInfo => prevInfo.map(pet => (pet.id === petId ? { ...pet, conditions } : pet)))
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                <DialogHeader className='flex flex-row items-center justify-between'>
                    <DialogTitle className='text-2xl font-semibold text-gray-900'>Habitación {room.number}</DialogTitle>
                    <Button variant='ghost' size='icon' onClick={onClose}>
                        <X className='h-4 w-4' />
                    </Button>
                </DialogHeader>
                <DialogDescription>Gestiona los detalles de las mascotas en esta habitación.</DialogDescription>
                <Separator className='my-4' />
                <div className='py-4'>
                    {petInfo.length === 0 ? (
                        <Alert>
                            <AlertDescription>No hay mascotas asignadas a esta habitación.</AlertDescription>
                        </Alert>
                    ) : (
                        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
                            <div className='mb-6 flex items-center space-x-4'>
                                <TabsList className='rounded-lg bg-gray-100 p-1'>
                                    {petInfo.map(pet => (
                                        <TabsTrigger
                                            key={pet.id}
                                            value={pet.id}
                                            className='rounded-md px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow'
                                        >
                                            <Paw className='mr-2 h-4 w-4' />
                                            {pet.name}
                                            {pet.conditions.map(condition => {
                                                const conditionIcon = conditionOptions.find(
                                                    opt => opt.value === condition,
                                                )?.icon
                                                return (
                                                    conditionIcon && (
                                                        <Badge key={condition} variant='secondary' className='ml-1'>
                                                            {conditionIcon}
                                                        </Badge>
                                                    )
                                                )
                                            })}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <Select onValueChange={handleAddPet}>
                                    <SelectTrigger className='w-[200px]'>
                                        <SelectValue placeholder='Añadir mascota' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availablePets.map(pet => (
                                            <SelectItem key={pet.id} value={pet.id}>
                                                {pet.name} {pet.roomNumber ? `(${pet.roomNumber})` : '(Sin asignar)'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {petInfo.map(pet => (
                                <TabsContent key={pet.id} value={pet.id} className='mt-4'>
                                    <div className='space-y-6'>
                                        <div className='grid grid-cols-2 gap-6'>
                                            <div>
                                                <label className='mb-1 block text-sm font-medium text-gray-700'>
                                                    Raza
                                                </label>
                                                <Input
                                                    value={pet.breed}
                                                    onChange={e =>
                                                        setPetInfo(prev =>
                                                            prev.map(p =>
                                                                p.id === pet.id ? { ...p, breed: e.target.value } : p,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <label className='mb-1 block text-sm font-medium text-gray-700'>
                                                    Tamaño
                                                </label>
                                                <Select
                                                    value={pet.size}
                                                    onValueChange={value =>
                                                        setPetInfo(prev =>
                                                            prev.map(p =>
                                                                p.id === pet.id ? { ...p, size: value } : p,
                                                            ),
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Selecciona el tamaño' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sizeOptions.map(size => (
                                                            <SelectItem key={size} value={size}>
                                                                {size.charAt(0).toUpperCase() + size.slice(1)}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center space-x-2'>
                                                <Calendar className='h-5 w-5 text-gray-400' />
                                                <span className='text-sm text-gray-600'>
                                                    {format(new Date(pet.checkInDate), 'dd/MM/yyyy')} -{' '}
                                                    {format(new Date(pet.checkOutDate), 'dd/MM/yyyy')}
                                                </span>
                                            </div>
                                            <Select onValueChange={handleChangePetRoom}>
                                                <SelectTrigger className='w-[200px]'>
                                                    <SelectValue placeholder='Cambiar habitación' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableRooms.map(room => (
                                                        <SelectItem key={room} value={room}>
                                                            {room}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Separator />
                                        <div>
                                            <label className='mb-2 block text-sm font-medium text-gray-700'>
                                                Condiciones Especiales
                                            </label>
                                            <div className='flex flex-wrap gap-2'>
                                                {conditionOptions.map(condition => (
                                                    <Badge
                                                        key={condition.value}
                                                        variant={
                                                            pet.conditions.includes(condition.value)
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        className='cursor-pointer px-2 py-1 text-sm'
                                                        onClick={() => {
                                                            const newConditions = pet.conditions.includes(
                                                                condition.value,
                                                            )
                                                                ? pet.conditions.filter(c => c !== condition.value)
                                                                : [...pet.conditions, condition.value]
                                                            handleConditionChange(pet.id, newConditions)
                                                        }}
                                                    >
                                                        {condition.icon} {condition.label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {pet.conditions.includes('medication') && (
                                            <div>
                                                <label className='mb-1 block text-sm font-medium text-gray-700'>
                                                    Especifica la medicación
                                                </label>
                                                <Input
                                                    value={pet.medication}
                                                    onChange={e =>
                                                        setPetInfo(prev =>
                                                            prev.map(p =>
                                                                p.id === pet.id
                                                                    ? { ...p, medication: e.target.value }
                                                                    : p,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                        {pet.conditions.includes('specialFood') && (
                                            <div>
                                                <label className='mb-1 block text-sm font-medium text-gray-700'>
                                                    Especifica la comida personalizada
                                                </label>
                                                <Input
                                                    value={pet.specialFood}
                                                    onChange={e =>
                                                        setPetInfo(prev =>
                                                            prev.map(p =>
                                                                p.id === pet.id
                                                                    ? { ...p, specialFood: e.target.value }
                                                                    : p,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <label className='mb-1 block text-sm font-medium text-gray-700'>
                                                Observaciones
                                            </label>
                                            <Textarea
                                                value={pet.observations}
                                                onChange={e =>
                                                    setPetInfo(prev =>
                                                        prev.map(p =>
                                                            p.id === pet.id
                                                                ? { ...p, observations: e.target.value }
                                                                : p,
                                                        ),
                                                    )
                                                }
                                                rows={4}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </div>
                {syncError && (
                    <Alert variant='destructive'>
                        <AlertDescription>{syncError}</AlertDescription>
                    </Alert>
                )}
                <DialogFooter className='mt-6 flex justify-end'>
                    <Button
                        onClick={handleSave}
                        className='rounded-md bg-blue-500 px-6 py-3 text-lg text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    >
                        Guardar Cambios
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
