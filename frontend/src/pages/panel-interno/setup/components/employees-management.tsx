import { useState } from 'react'

import { X } from 'lucide-react'

import { useDocument } from '@/shared/firebase/hooks/useDocument'
import { GlobalPrivateConfig } from '@/shared/hooks/use-global-config'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

export function EmployeesManagement() {
    const [newEmployeeName, setNewEmployeeName] = useState('')
    const { document: config, setDocument } = useDocument<GlobalPrivateConfig>({
        collectionName: 'configs',
        id: 'global_configs_private',
    })

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmployeeName.trim()) return

        const newEmployee = {
            id: crypto.randomUUID(),
            name: newEmployeeName.trim(),
        }

        await setDocument({
            ...config,
            employees: [...(config?.employees || []), newEmployee],
        })
        setNewEmployeeName('')
    }

    const handleRemoveEmployee = async (id: string) => {
        await setDocument({
            ...config,
            employees: (config?.employees || []).filter(emp => emp.id !== id),
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestión de Empleados</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddEmployee} className='mb-4 flex gap-2'>
                    <Input
                        value={newEmployeeName}
                        onChange={e => setNewEmployeeName(e.target.value)}
                        placeholder='Nombre del empleado'
                        className='flex-1'
                    />
                    <Button type='submit'>Añadir</Button>
                </form>

                <div className='space-y-2'>
                    {config?.employees?.map(employee => (
                        <div key={employee.id} className='flex items-center justify-between rounded-md bg-gray-50 p-2'>
                            <span>{employee.name}</span>
                            <Button variant='ghost' size='icon' onClick={() => handleRemoveEmployee(employee.id)}>
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                    ))}
                    {(!config?.employees || config.employees.length === 0) && (
                        <p className='py-4 text-center text-muted-foreground'>No hay empleados registrados</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
