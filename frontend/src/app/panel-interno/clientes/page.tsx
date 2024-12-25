'use client'

import { useEffect, useState } from 'react'

import { Search } from 'lucide-react'

import { ClientCard } from '@/components/client-card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Client = {
    id: string
    name: string
    phone: string
    email: string
    pets: string[]
    activeReservations: number
    lastReservationDate: string
    classification: 'Rango 1' | 'Rango 2' | 'Rango 3' | 'NEW'
    totalSpent: number
}

export default function ClientesPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [classificationFilter, setClassificationFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [clients, setClients] = useState<Client[]>([])

    useEffect(() => {
        // Simular la carga de clientes desde el backend
        const mockClients: Client[] = [
            {
                id: '1',
                name: 'María García',
                phone: '+34 123 456 789',
                email: 'maria@example.com',
                pets: ['Rocky', 'Nacho'],
                activeReservations: 2,
                lastReservationDate: '2023-12-15',
                classification: 'Rango 2',
                totalSpent: 1500,
            },
            {
                id: '2',
                name: 'Juan Pérez',
                phone: '+34 987 654 321',
                email: 'juan@example.com',
                pets: ['Luna'],
                activeReservations: 0,
                lastReservationDate: '2023-11-20',
                classification: 'NEW',
                totalSpent: 300,
            },
            {
                id: '3',
                name: 'Ana Martínez',
                phone: '+34 555 123 456',
                email: 'ana@example.com',
                pets: ['Max', 'Bella'],
                activeReservations: 1,
                lastReservationDate: '2023-12-10',
                classification: 'Rango 1',
                totalSpent: 800,
            },
            // Añadir más clientes aquí...
        ]
        setClients(mockClients)
    }, [])

    const filteredClients = clients.filter(
        client =>
            (client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (classificationFilter === 'all' || client.classification === classificationFilter) &&
            (statusFilter === 'all' ||
                (statusFilter === 'active' && client.activeReservations > 0) ||
                (statusFilter === 'inactive' && client.activeReservations === 0)),
    )

    const activeClients = filteredClients.filter(client => client.activeReservations > 0)
    const allClients = filteredClients

    return (
        <div className='container mx-auto space-y-6 p-6'>
            <h1 className='text-3xl font-bold'>Gestión de Clientes</h1>

            <div className='flex flex-wrap items-center justify-between gap-4'>
                <div className='min-w-[300px] flex-1'>
                    <div className='relative'>
                        <Search className='absolute left-2 top-1/2 -translate-y-1/2 transform text-gray-400' />
                        <Input
                            type='text'
                            placeholder='Buscar por nombre, teléfono o email'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                </div>
                <div className='flex gap-4'>
                    <Select value={classificationFilter} onValueChange={setClassificationFilter}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Clasificación' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>Todas</SelectItem>
                            <SelectItem value='NEW'>NEW</SelectItem>
                            <SelectItem value='Rango 1'>Rango 1</SelectItem>
                            <SelectItem value='Rango 2'>Rango 2</SelectItem>
                            <SelectItem value='Rango 3'>Rango 3</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Estado' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>Todos</SelectItem>
                            <SelectItem value='active'>Con reservas activas</SelectItem>
                            <SelectItem value='inactive'>Sin reservas activas</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='space-y-8'>
                <div>
                    <h2 className='mb-4 text-2xl font-semibold'>Clientes con Reservas Activas</h2>
                    <div className='space-y-4'>
                        {activeClients.map(client => (
                            <ClientCard key={client.id} client={client} />
                        ))}
                    </div>
                </div>

                <div>
                    <h2 className='mb-4 text-2xl font-semibold'>Todos los Clientes</h2>
                    <div className='space-y-4'>
                        {allClients.map(client => (
                            <ClientCard key={client.id} client={client} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
