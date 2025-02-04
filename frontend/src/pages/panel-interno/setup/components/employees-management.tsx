import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { X } from 'lucide-react'
import { useDocument } from '@/shared/firebase/hooks/useDocument'

interface Employee {
    id: string
    name: string
}

export function EmployeesManagement() {
    const [newEmployeeName, setNewEmployeeName] = useState('')
    const { document: config, setDocument } = useDocument<{ employees?: Employee[] }>({
        collectionName: 'configs',
        id: 'global_configs'
    })

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmployeeName.trim()) return

        const newEmployee: Employee = {
            id: crypto.randomUUID(),
            name: newEmployeeName.trim()
        }

        await setDocument({
            ...config,
            employees: [...(config?.employees || []), newEmployee]
        })
        setNewEmployeeName('')
    }

    const handleRemoveEmployee = async (id: string) => {
        await setDocument({
            ...config,
            employees: (config?.employees || []).filter(emp => emp.id !== id)
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestión de Empleados</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleAddEmployee} className="flex gap-2 mb-4">
                    <Input
                        value={newEmployeeName}
                        onChange={(e) => setNewEmployeeName(e.target.value)}
                        placeholder="Nombre del empleado"
                        className="flex-1"
                    />
                    <Button type="submit">Añadir</Button>
                </form>

                <div className="space-y-2">
                    {config?.employees?.map((employee) => (
                        <div
                            key={employee.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                            <span>{employee.name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveEmployee(employee.id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    {(!config?.employees || config.employees.length === 0) && (
                        <p className="text-muted-foreground text-center py-4">
                            No hay empleados registrados
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
} 