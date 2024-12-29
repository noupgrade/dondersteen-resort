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

type Client = {
    id: string
    name: string
    phone: string
    email: string
    address: string
    accumulatedSpending: number
    classification: 'Rango 1' | 'Rango 2' | 'Rango 3' | 'NEW'
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
    reservations: {
        id: string
        checkIn: string
        checkOut: string
        pets: string[]
        additionalServices: string[]
        totalPrice: number
        paymentMethod: string
    }[]
}

export default function ClientDetailsPage() {
    const params = useParams()
    const navigate = useNavigate()
    const [client, setClient] = useState<Client | null>(null)
    const [internalNotes, setInternalNotes] = useState('')
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        // Simular la carga de datos del cliente desde el backend
        const mockClient: Client = {
            id: params.id as string,
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
                {
                    id: 'res1',
                    checkIn: '2023-12-15',
                    checkOut: '2023-12-20',
                    pets: ['Rocky'],
                    additionalServices: ['Baño', 'Paseo extra'],
                    totalPrice: 250,
                    paymentMethod: 'Tarjeta de crédito',
                },
                {
                    id: 'res2',
                    checkIn: '2023-11-01',
                    checkOut: '2023-11-03',
                    pets: ['Rocky', 'Nacho'],
                    additionalServices: ['Cepillado'],
                    totalPrice: 180,
                    paymentMethod: 'Efectivo',
                },
            ],
        }
        setClient(mockClient)
        setInternalNotes(mockClient.internalNotes)
    }, [params.id])

    const handleSaveNotes = () => {
        if (client) {
            setClient({ ...client, internalNotes })
            // Aquí iría la lógica para guardar en el backend
            alert('Notas guardadas correctamente')
        }
    }

    const handleEditToggle = () => {
        if (isEditing) {
            // Aquí iría la lógica para guardar los cambios
            console.log('Guardando cambios:', client)
        }
        setIsEditing(!isEditing)
    }

    if (!client) return <div>Cargando...</div>

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <Button variant='outline' onClick={() => navigate(-1)}>
                <ChevronLeft className='mr-2 h-4 w-4' /> Volver
            </Button>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
                <div className='space-y-6 lg:col-span-2'>
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center justify-between'>
                                <span>{client.name}</span>
                                <Badge>{client.classification}</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-2'>
                                <div>
                                    <strong>Teléfono:</strong>
                                    {isEditing ? (
                                        <Input
                                            value={client.phone}
                                            onChange={e => setClient({ ...client, phone: e.target.value })}
                                        />
                                    ) : (
                                        <span> {client.phone}</span>
                                    )}
                                </div>
                                <div>
                                    <strong>Email:</strong>
                                    {isEditing ? (
                                        <Input
                                            value={client.email}
                                            onChange={e => setClient({ ...client, email: e.target.value })}
                                        />
                                    ) : (
                                        <span> {client.email}</span>
                                    )}
                                </div>
                                <div>
                                    <strong>Dirección:</strong>
                                    {isEditing ? (
                                        <Input
                                            value={client.address}
                                            onChange={e => setClient({ ...client, address: e.target.value })}
                                        />
                                    ) : (
                                        <span> {client.address}</span>
                                    )}
                                </div>
                                <p>
                                    <strong>Gasto acumulado:</strong> {client.accumulatedSpending.toFixed(2)} €
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Notas Internas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} rows={4} />
                            <Button onClick={handleSaveNotes} className='mt-2'>
                                <Save className='mr-2 h-4 w-4' /> Guardar Notas
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mascotas Asociadas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className='h-[300px]'>
                                {client.pets.map(pet => (
                                    <div key={pet.id} className='mb-4 rounded-lg border p-4'>
                                        <h4 className='font-semibold'>{pet.name}</h4>
                                        <p>
                                            <strong>Raza:</strong> {pet.breed}
                                        </p>
                                        <p>
                                            <strong>Tamaño:</strong> {pet.size}
                                        </p>
                                        <p>
                                            <strong>Edad:</strong> {pet.age} años
                                        </p>
                                        {pet.medication && (
                                            <p>
                                                <strong>Medicación:</strong> {pet.medication}
                                            </p>
                                        )}
                                        {pet.specialFood && (
                                            <p>
                                                <strong>Comida especial:</strong> {pet.specialFood}
                                            </p>
                                        )}
                                        <Textarea
                                            className='mt-2'
                                            placeholder='Observaciones'
                                            value={pet.observations || ''}
                                            onChange={e => {
                                                const updatedPets = client.pets.map(p =>
                                                    p.id === pet.id ? { ...p, observations: e.target.value } : p,
                                                )
                                                setClient({ ...client, pets: updatedPets })
                                            }}
                                        />
                                    </div>
                                ))}
                            </ScrollArea>
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
                                        <TableHead>Fecha de Entrada</TableHead>
                                        <TableHead>Fecha de Salida</TableHead>
                                        <TableHead>Mascotas</TableHead>
                                        <TableHead>Servicios Adicionales</TableHead>
                                        <TableHead>Precio Total</TableHead>
                                        <TableHead>Método de Pago</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {client.reservations.map(reservation => (
                                        <TableRow key={reservation.id}>
                                            <TableCell>{reservation.checkIn}</TableCell>
                                            <TableCell>{reservation.checkOut}</TableCell>
                                            <TableCell>{reservation.pets.join(', ')}</TableCell>
                                            <TableCell>{reservation.additionalServices.join(', ')}</TableCell>
                                            <TableCell>{reservation.totalPrice.toFixed(2)} €</TableCell>
                                            <TableCell>{reservation.paymentMethod}</TableCell>
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
                                {isEditing ? 'Guardar Cambios' : 'Editar Información'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
