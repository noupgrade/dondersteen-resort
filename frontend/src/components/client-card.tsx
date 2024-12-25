import { useNavigate } from 'react-router-dom'

import { Badge } from '@/shared/ui/badge'
import { Card, CardContent } from '@/shared/ui/card'

type Client = {
    id: string
    name: string
    phone: string
    email: string
    pets: string[]
    activeReservations: number
    lastReservationDate: string
    classification: 'NEW' | 'Rango 1' | 'Rango 2' | 'Rango 3'
    totalSpent: number
}

type ClientCardProps = {
    client: Client
}

export function ClientCard({ client }: ClientCardProps) {
    const navigate = useNavigate()
    const classificationColor = {
        NEW: 'bg-gray-200 text-gray-800',
        'Rango 1': 'bg-green-200 text-green-800',
        'Rango 2': 'bg-blue-200 text-blue-800',
        'Rango 3': 'bg-purple-200 text-purple-800',
    }[client.classification]

    return (
        <Card
            className='cursor-pointer transition-shadow hover:shadow-md'
            onClick={() => navigate(`/panel-interno/clientes/${client.id}`)}
        >
            <CardContent className='p-4'>
                <div className='mb-4 flex items-start justify-between'>
                    <div>
                        <h3 className='text-xl font-semibold'>{client.name}</h3>
                        <p className='text-sm text-gray-600'>{client.phone}</p>
                        <p className='text-sm text-gray-600'>{client.email}</p>
                    </div>
                    <Badge className={classificationColor}>{client.classification}</Badge>
                </div>
                <div className='mb-4'>
                    <p className='text-sm text-gray-600'>Mascotas: {client.pets.join(', ')}</p>
                </div>
                <div className='mb-4 flex items-center justify-between'>
                    <Badge variant='secondary'>
                        {client.activeReservations} reserva{client.activeReservations !== 1 && 's'} activa
                        {client.activeReservations !== 1 && 's'}
                    </Badge>
                    <span className='text-sm text-gray-500'>Última reserva: {client.lastReservationDate}</span>
                </div>
                <div className='text-right'>
                    <span className='text-sm font-medium'>
                        Total gastado:{' '}
                        {client.totalSpent.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
