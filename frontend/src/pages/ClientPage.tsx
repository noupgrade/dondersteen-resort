import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ChevronLeft, Download, Save } from 'lucide-react'

import { Badge } from '@/shared/ui/badge.tsx'
import { Button } from '@/shared/ui/button.tsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card.tsx'
import { Input } from '@/shared/ui/input.tsx'
import { ScrollArea } from '@/shared/ui/scroll-area.tsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table.tsx'
import { Textarea } from '@/shared/ui/textarea.tsx'
import { ReservationViewer } from '@/features/reservation-viewer/ui/ReservationViewer'
import { type HairSalonReservation, type HotelReservation } from '@/components/ReservationContext'

type MockClient = {
    id: string
    name: string
    phone: string
    email: string
    address: string
    accumulatedSpending: number
    classification: 'Rango 1' | 'Rango 2' | 'Rango 3'
    internalNotes: string
    pets: {
        id: string
        name: string
        breed: string
        size: string
        age: number
        medication?: string
        specialFood?: string
        observations?: string
    }[]
    reservations: (HotelReservation | HairSalonReservation)[]
}

const mockHotelReservation1: HotelReservation = {
    id: 'res1',
    type: 'hotel',
    checkInDate: '2023-12-15',
    checkInTime: '14:00',
    checkOutDate: '2023-12-20',
    checkOutTime: '12:00',
    client: {
        name: 'María García',
        phone: '+34 123 456 789',
        email: 'maria@example.com'
    },
    pets: [
        {
            name: 'Rocky',
            breed: 'Labrador',
            size: 'grande',
            weight: 30,
            sex: 'M'
        }
    ],
    additionalServices: [
        {
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_brush']
        },
        {
            type: 'special_care',
            petIndex: 0,
            comment: 'Paseo extra'
        }
    ],
    shopProducts: [
        {
            id: 'prod1',
            name: 'Royal Canin Maxi Adult',
            quantity: 2,
            unitPrice: 15.99,
            totalPrice: 31.98
        },
        {
            id: 'prod2',
            name: 'Collar antiparasitario',
            quantity: 1,
            unitPrice: 25.50,
            totalPrice: 25.50
        }
    ],
    status: 'confirmed',
    totalPrice: 250,
    paymentStatus: 'Pagado'
}

const mockHotelReservation2: HotelReservation = {
    id: 'res2',
    type: 'hotel',
    checkInDate: '2023-11-01',
    checkInTime: '14:00',
    checkOutDate: '2023-11-03',
    checkOutTime: '12:00',
    client: {
        name: 'María García',
        phone: '+34 123 456 789',
        email: 'maria@example.com'
    },
    pets: [
        {
            name: 'Rocky',
            breed: 'Labrador',
            size: 'grande',
            weight: 30,
            sex: 'M'
        },
        {
            name: 'Nacho',
            breed: 'Gato Siamés',
            size: 'pequeño',
            weight: 4,
            sex: 'M'
        }
    ],
    additionalServices: [
        {
            type: 'hairdressing',
            petIndex: 0,
            services: ['brushing']
        }
    ],
    shopProducts: [],
    status: 'confirmed',
    totalPrice: 180,
    paymentStatus: 'Pagado'
}

const mockHairSalonReservation1: HairSalonReservation = {
    id: 'res5',
    type: 'peluqueria',
    date: '2023-12-05',
    time: '10:00',
    client: {
        name: 'María García',
        phone: '+34 123 456 789',
        email: 'maria@example.com'
    },
    pet: {
        id: '1',
        name: 'Rocky',
        breed: 'Labrador',
        size: 'grande',
        weight: 30
    },
    additionalServices: [
        {
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_brush', 'deshedding']
        }
    ],
    shopProducts: [
        {
            id: 'prod5',
            name: 'Champú especial',
            quantity: 1,
            unitPrice: 15.99,
            totalPrice: 15.99
        }
    ],
    status: 'confirmed',
    totalPrice: 75,
    paymentStatus: 'Pagado',
    source: 'hotel'
}

const mockHairSalonReservation2: HairSalonReservation = {
    id: 'res6',
    type: 'peluqueria',
    date: '2023-11-20',
    time: '16:00',
    client: {
        name: 'María García',
        phone: '+34 123 456 789',
        email: 'maria@example.com'
    },
    pet: {
        id: '2',
        name: 'Nacho',
        breed: 'Gato Siamés',
        size: 'pequeño',
        weight: 4
    },
    additionalServices: [
        {
            type: 'hairdressing',
            petIndex: 0,
            services: ['bath_and_brush']
        }
    ],
    shopProducts: [],
    status: 'confirmed',
    totalPrice: 35,
    paymentStatus: 'Pagado',
    source: 'external'
}

const MOCK_CLIENTS: Record<string, MockClient> = {
    '1': {
        id: '1',
        name: 'María García',
        phone: '+34 123 456 789',
        email: 'maria@example.com',
        address: 'Calle Principal 123, 28001 Madrid',
        accumulatedSpending: 1500,
        classification: 'Rango 2',
        internalNotes: 'Cliente frecuente, prefiere habitaciones tranquilas.',
        pets: [
            {
                id: '1',
                name: 'Rocky',
                breed: 'Labrador',
                size: 'Grande',
                age: 5,
                medication: 'Antiinflamatorios cada 12 horas',
                specialFood: 'Dieta hipoalergénica',
                observations: 'Juguetón, necesita mucho ejercicio',
            },
            {
                id: '2',
                name: 'Nacho',
                breed: 'Gato Siamés',
                size: 'Mediano',
                age: 3,
                observations: 'Tímido con extraños',
            },
        ],
        reservations: [
            mockHotelReservation1,
            mockHotelReservation2,
            mockHairSalonReservation1,
            mockHairSalonReservation2
        ]
    },
    '2': {
        id: '2',
        name: 'Juan Pérez',
        phone: '+34 987 654 321',
        email: 'juan@example.com',
        address: 'Avenida Libertad 45, 28002 Madrid',
        accumulatedSpending: 800,
        classification: 'Rango 1',
        internalNotes: 'Prefiere horarios de mañana.',
        pets: [
            {
                id: '3',
                name: 'Luna',
                breed: 'Yorkshire',
                size: 'Pequeño',
                age: 2,
                observations: 'Muy activa',
            }
        ],
        reservations: [
            {
                id: 'res3',
                type: 'hotel',
                checkInDate: '2023-12-01',
                checkInTime: '10:00',
                checkOutDate: '2023-12-05',
                checkOutTime: '12:00',
                client: {
                    name: 'Juan Pérez',
                    phone: '+34 987 654 321',
                    email: 'juan@example.com'
                },
                pets: [
                    {
                        name: 'Luna',
                        breed: 'Yorkshire',
                        size: 'pequeño',
                        weight: 3,
                        sex: 'F'
                    }
                ],
                additionalServices: [
                    {
                        type: 'hairdressing',
                        petIndex: 0,
                        services: ['bath_and_trim']
                    }
                ],
                shopProducts: [
                    {
                        id: 'prod3',
                        name: 'Royal Canin Mini Adult',
                        quantity: 1,
                        unitPrice: 12.99,
                        totalPrice: 12.99
                    }
                ],
                status: 'confirmed',
                totalPrice: 200,
                paymentStatus: 'Pagado'
            }
        ]
    },
    '3': {
        id: '3',
        name: 'Ana Martínez',
        phone: '+34 555 123 456',
        email: 'ana@example.com',
        address: 'Plaza Mayor 8, 28003 Madrid',
        accumulatedSpending: 2500,
        classification: 'Rango 3',
        internalNotes: 'Cliente VIP, muy exigente con la limpieza.',
        pets: [
            {
                id: '4',
                name: 'Max',
                breed: 'Golden Retriever',
                size: 'Grande',
                age: 4,
                medication: 'Vitaminas diarias',
                observations: 'Muy sociable'
            },
            {
                id: '5',
                name: 'Bella',
                breed: 'Persa',
                size: 'Mediano',
                age: 6,
                specialFood: 'Dieta sin cereales',
                observations: 'Necesita cepillado diario'
            }
        ],
        reservations: [
            {
                id: 'res4',
                type: 'hotel',
                checkInDate: '2023-12-10',
                checkInTime: '15:00',
                checkOutDate: '2023-12-18',
                checkOutTime: '12:00',
                client: {
                    name: 'Ana Martínez',
                    phone: '+34 555 123 456',
                    email: 'ana@example.com'
                },
                pets: [
                    {
                        name: 'Max',
                        breed: 'Golden Retriever',
                        size: 'grande',
                        weight: 35,
                        sex: 'M'
                    },
                    {
                        name: 'Bella',
                        breed: 'Persa',
                        size: 'mediano',
                        weight: 5,
                        sex: 'F'
                    }
                ],
                additionalServices: [
                    {
                        type: 'hairdressing',
                        petIndex: 0,
                        services: ['bath_and_brush', 'spa']
                    },
                    {
                        type: 'special_food',
                        petIndex: 1,
                        foodType: 'refrigerated'
                    }
                ],
                shopProducts: [
                    {
                        id: 'prod4',
                        name: 'Premium Cat Food',
                        quantity: 2,
                        unitPrice: 20.50,
                        totalPrice: 41.00
                    }
                ],
                status: 'confirmed',
                totalPrice: 450,
                paymentStatus: 'Pagado'
            }
        ]
    }
} as const

type Client = MockClient

export default function ClientDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [client, setClient] = useState<MockClient | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [selectedReservation, setSelectedReservation] = useState<HotelReservation | HairSalonReservation | null>(null)

    useEffect(() => {
        if (id && MOCK_CLIENTS[id]) {
            setClient(MOCK_CLIENTS[id])
        }
    }, [id])

    if (!client) {
        return <div>Cliente no encontrado</div>
    }

    const handleEditToggle = () => {
        if (isEditing) {
            // Aquí iría la lógica para guardar los cambios en el backend
            setIsEditing(false)
        } else {
            setIsEditing(true)
        }
    }

    const handlePetChange = (petId: string, field: keyof MockClient['pets'][0], value: string | number) => {
        if (!client) return

        const updatedPets = client.pets.map(pet =>
            pet.id === petId ? { ...pet, [field]: value } : pet
        )

        setClient({ ...client, pets: updatedPets })
    }

    return (
        <div className='container mx-auto p-6'>
            <div className='mb-6 flex items-center justify-between'>
                <div className='flex items-center gap-4'>
                    <Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
                        <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <h1 className='text-3xl font-bold'>{client.name}</h1>
                    <Badge>{client.classification}</Badge>
                </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-3'>
                <div className='space-y-6 lg:col-span-2'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Cliente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-4'>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Nombre</label>
                                    {isEditing ? (
                                        <Input
                                            value={client.name}
                                            onChange={e => setClient({ ...client, name: e.target.value })}
                                        />
                                    ) : (
                                        <p>{client.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Teléfono</label>
                                    {isEditing ? (
                                        <Input
                                            value={client.phone}
                                            onChange={e => setClient({ ...client, phone: e.target.value })}
                                        />
                                    ) : (
                                        <p>{client.phone}</p>
                                    )}
                                </div>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Email</label>
                                    {isEditing ? (
                                        <Input
                                            value={client.email}
                                            onChange={e => setClient({ ...client, email: e.target.value })}
                                        />
                                    ) : (
                                        <p>{client.email}</p>
                                    )}
                                </div>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Dirección</label>
                                    {isEditing ? (
                                        <Input
                                            value={client.address}
                                            onChange={e => setClient({ ...client, address: e.target.value })}
                                        />
                                    ) : (
                                        <p>{client.address}</p>
                                    )}
                                </div>
                                <div>
                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Notas Internas</label>
                                    {isEditing ? (
                                        <Textarea
                                            value={client.internalNotes}
                                            onChange={e => setClient({ ...client, internalNotes: e.target.value })}
                                        />
                                    ) : (
                                        <p>{client.internalNotes}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mascotas Asociadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='grid gap-6'>
                                {client.pets.map(pet => (
                                    <div key={pet.id} className='overflow-hidden rounded-lg border bg-card'>
                                        <div className='border-b bg-muted/50 px-4 py-3'>
                                            <h3 className='text-lg font-semibold'>{pet.name}</h3>
                                        </div>
                                        <div className='bg-background p-4'>
                                            <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
                                                <div>
                                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Raza</label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={pet.breed}
                                                            onChange={e => handlePetChange(pet.id, 'breed', e.target.value)}
                                                        />
                                                    ) : (
                                                        <p>{pet.breed}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Edad</label>
                                                    {isEditing ? (
                                                        <Input
                                                            type='number'
                                                            value={pet.age}
                                                            onChange={e => handlePetChange(pet.id, 'age', parseInt(e.target.value))}
                                                        />
                                                    ) : (
                                                        <p>{pet.age} años</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Tamaño</label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={pet.size}
                                                            onChange={e => handlePetChange(pet.id, 'size', e.target.value)}
                                                        />
                                                    ) : (
                                                        <p>{pet.size}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Medicación</label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={pet.medication || ''}
                                                            onChange={e => handlePetChange(pet.id, 'medication', e.target.value)}
                                                            placeholder='Sin medicación'
                                                        />
                                                    ) : (
                                                        <p>{pet.medication || 'Sin medicación'}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Comida Especial</label>
                                                    {isEditing ? (
                                                        <Input
                                                            value={pet.specialFood || ''}
                                                            onChange={e => handlePetChange(pet.id, 'specialFood', e.target.value)}
                                                            placeholder='Sin comida especial'
                                                        />
                                                    ) : (
                                                        <p>{pet.specialFood || 'Sin comida especial'}</p>
                                                    )}
                                                </div>
                                                <div className='col-span-2'>
                                                    <label className='mb-1 block text-sm font-medium text-gray-700'>Observaciones</label>
                                                    {isEditing ? (
                                                        <Textarea
                                                            value={pet.observations || ''}
                                                            onChange={e => handlePetChange(pet.id, 'observations', e.target.value)}
                                                            placeholder='Sin observaciones'
                                                        />
                                                    ) : (
                                                        <p>{pet.observations || 'Sin observaciones'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center justify-between'>
                                <span>Histórico de Reservas</span>
                                <Button variant='outline'>
                                    <Download className='mr-2 h-4 w-4' /> Descargar Histórico
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fecha</TableHead>
                                        <TableHead>Mascota(s)</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead className='text-right'>Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {client.reservations.map(reservation => (
                                        <TableRow
                                            key={reservation.id}
                                            className='cursor-pointer hover:bg-gray-50'
                                            onClick={() => setSelectedReservation(reservation)}
                                        >
                                            <TableCell>
                                                {reservation.type === 'hotel'
                                                    ? `${reservation.checkInDate} - ${reservation.checkOutDate}`
                                                    : reservation.date}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.type === 'hotel'
                                                    ? reservation.pets.map(pet => pet.name).join(', ')
                                                    : reservation.pet.name}
                                            </TableCell>
                                            <TableCell>
                                                {reservation.type === 'hotel' ? 'Hotel' : 'Peluquería'}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                €{reservation.totalPrice.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className='space-y-6 lg:col-span-1'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Acciones Adicionales</CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-2'>
                            <Button className='w-full' asChild>
                                <Link to='/booking'>Nueva Reserva</Link>
                            </Button>
                            <Button className='w-full' variant='outline' onClick={handleEditToggle}>
                                {isEditing ? (
                                    <>
                                        <Save className='mr-2 h-4 w-4' />
                                        Guardar Cambios
                                    </>
                                ) : (
                                    'Editar Información'
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {selectedReservation && (
                <ReservationViewer
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                    isOpen={!!selectedReservation}
                />
            )}
        </div>
    )
}
