'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Client = {
    id: string
    name: string
    phone: string
    email: string
    activeReservations: number
    totalSpent: number
    classification: 'NEW' | 'Rango 1' | 'Rango 2' | 'Rango 3'
    status: 'Activo' | 'Sin Reservas'
}

type ClientDetailsProps = {
    client: Client
}

export function ClientDetails({ client }: ClientDetailsProps) {
    // Datos de ejemplo para las pestañas
    const pets = [
        { name: 'Max', breed: 'Labrador', age: 5, specialConditions: 'Alergia al pollo' },
        { name: 'Luna', breed: 'Gato Siamés', age: 3, specialConditions: 'Ninguna' },
    ]

    const reservations = [
        { id: '1', date: '2023-12-01', service: 'Peluquería', status: 'Completada' },
        { id: '2', date: '2023-12-15', service: 'Alojamiento', status: 'Pendiente' },
    ]

    return (
        <Tabs defaultValue='general'>
            <TabsList className='w-full'>
                <TabsTrigger value='general'>General</TabsTrigger>
                <TabsTrigger value='pets'>Mascotas</TabsTrigger>
                <TabsTrigger value='reservations'>Reservas</TabsTrigger>
            </TabsList>
            <TabsContent value='general'>
                <Card>
                    <CardHeader>
                        <CardTitle>Información General</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='space-y-2'>
                            <p>
                                <strong>Nombre:</strong> {client.name}
                            </p>
                            <p>
                                <strong>Teléfono:</strong> {client.phone}
                            </p>
                            <p>
                                <strong>Email:</strong> {client.email}
                            </p>
                            <p>
                                <strong>Clasificación:</strong> <Badge>{client.classification}</Badge>
                            </p>
                            <p>
                                <strong>Estado:</strong> {client.status}
                            </p>
                            <p>
                                <strong>Gasto Total:</strong>{' '}
                                {client.totalSpent.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value='pets'>
                <Card>
                    <CardHeader>
                        <CardTitle>Mascotas Asociadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className='h-[200px]'>
                            {pets.map((pet, index) => (
                                <div key={index} className='mb-4'>
                                    <h4 className='font-semibold'>{pet.name}</h4>
                                    <p className='text-sm text-gray-600'>Raza: {pet.breed}</p>
                                    <p className='text-sm text-gray-600'>Edad: {pet.age} años</p>
                                    <p className='text-sm text-gray-600'>
                                        Condiciones especiales: {pet.specialConditions}
                                    </p>
                                    {index < pets.length - 1 && <Separator className='my-2' />}
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value='reservations'>
                <Card>
                    <CardHeader>
                        <CardTitle>Historial de Reservas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className='h-[200px]'>
                            {reservations.map((reservation, index) => (
                                <div key={reservation.id} className='mb-4'>
                                    <div className='flex items-center justify-between'>
                                        <h4 className='font-semibold'>{reservation.date}</h4>
                                        <Badge variant={reservation.status === 'Completada' ? 'secondary' : 'outline'}>
                                            {reservation.status}
                                        </Badge>
                                    </div>
                                    <p className='text-sm text-gray-600'>{reservation.service}</p>
                                    {index < reservations.length - 1 && <Separator className='my-2' />}
                                </div>
                            ))}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
