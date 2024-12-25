import { useState } from 'react'

import { Download } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

// Datos mock para ejemplos
const mockDailyNeeds = [
    {
        roomNumber: 'HAB.1',
        petName: 'Max',
        medication: 'Antiinflamatorio 2 veces al día',
        specialCare: 'Curas en la pata derecha',
        feeding: 'Dieta blanda',
        allergies: 'Alergia al pollo',
        warnings: 'No le gusta que le toquen las orejas',
    },
    {
        roomNumber: 'HAB.3',
        petName: 'Luna',
        medication: '-',
        specialCare: '-',
        feeding: 'Pienso especial sin granos',
        allergies: '-',
        warnings: 'Tiende a escaparse',
    },
    {
        roomNumber: 'HAB.5',
        petName: 'Rocky',
        medication: 'Gotas para los ojos 3 veces al día',
        specialCare: 'Cepillado diario',
        feeding: 'Comida húmeda al mediodía',
        allergies: 'Intolerancia al gluten',
        warnings: 'Muy juguetón, necesita mucho ejercicio',
    },
]

export function DailyNeedsList() {
    const dailyNeeds = mockDailyNeeds
    const [searchTerm, setSearchTerm] = useState('')

    const filteredNeeds = dailyNeeds.filter(
        need =>
            need.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            need.petName.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    const handleExport = () => {
        // Crear el contenido CSV
        const headers = ['Habitación', 'Mascota', 'Medicación', 'Curas', 'Alimentación', 'Alergias', 'Advertencias']
        const rows = filteredNeeds.map(need => [
            need.roomNumber,
            need.petName,
            need.medication,
            need.specialCare,
            need.feeding,
            need.allergies,
            need.warnings,
        ])

        const csvContent = [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n')

        // Crear y descargar el archivo
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `necesidades_diarias_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className='space-y-6'>
            <CardHeader className='px-0'>
                <CardTitle className='text-2xl font-bold text-gray-900'>Indicaciones</CardTitle>
            </CardHeader>

            <div className='flex items-center justify-between gap-4'>
                <div className='relative flex-1'>
                    <Input
                        placeholder='Buscar por habitación o nombre de mascota'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='max-w-sm pl-4'
                    />
                </div>
                <Button variant='outline' size='sm' onClick={handleExport} className='whitespace-nowrap'>
                    <Download className='mr-2 h-4 w-4' />
                    Exportar
                </Button>
            </div>

            <div className='rounded-lg border bg-white'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-gray-50'>
                            <TableHead className='font-semibold text-gray-900'>Habitación</TableHead>
                            <TableHead className='font-semibold text-gray-900'>Mascota</TableHead>
                            <TableHead className='font-semibold text-gray-900'>Medicación</TableHead>
                            <TableHead className='font-semibold text-gray-900'>Curas</TableHead>
                            <TableHead className='font-semibold text-gray-900'>Alimentación</TableHead>
                            <TableHead className='font-semibold text-gray-900'>Alergias</TableHead>
                            <TableHead className='font-semibold text-gray-900'>Advertencias</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredNeeds.map((need, index) => (
                            <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <TableCell className='font-medium'>{need.roomNumber}</TableCell>
                                <TableCell>{need.petName}</TableCell>
                                <TableCell className={need.medication !== '-' ? 'text-blue-700' : 'text-gray-500'}>
                                    {need.medication}
                                </TableCell>
                                <TableCell className={need.specialCare !== '-' ? 'text-purple-700' : 'text-gray-500'}>
                                    {need.specialCare}
                                </TableCell>
                                <TableCell className='text-green-700'>{need.feeding}</TableCell>
                                <TableCell className={need.allergies !== '-' ? 'text-red-700' : 'text-gray-500'}>
                                    {need.allergies}
                                </TableCell>
                                <TableCell className='text-orange-700'>{need.warnings}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
