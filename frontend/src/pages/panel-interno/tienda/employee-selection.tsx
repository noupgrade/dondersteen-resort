import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { useDocument } from '@/shared/firebase/hooks/useDocument'
import { Loader2 } from 'lucide-react'

interface Employee {
    id: string
    name: string
}

export default function EmployeeSelection() {
    const navigate = useNavigate()
    const { document: config, isLoading } = useDocument<{ employees?: Employee[] }>({
        collectionName: 'configs',
        id: 'global_configs'
    })

    const handleEmployeeSelect = (employee: Employee) => {
        // Guardar el empleado seleccionado en sessionStorage
        sessionStorage.setItem('selectedEmployee', JSON.stringify(employee))
        // Navegar a la página de la tienda
        navigate('/panel-interno/tienda/store')
    }

    // Mostrar pantalla de carga mientras se obtienen los datos
    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Cargando empleados...</p>
                </div>
            </div>
        )
    }

    // Si no hay empleados registrados, mostrar mensaje
    if (!config?.employees || config.employees.length === 0) {
        return (
            <div className="container mx-auto p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>No hay empleados registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Por favor, registre empleados en la sección de configuración antes de acceder a la tienda.
                        </p>
                        <Button onClick={() => navigate('/panel-interno/setup')}>
                            Ir a Configuración
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Empleado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {config.employees.map((employee) => (
                            <Button
                                key={employee.id}
                                variant="outline"
                                className="h-24 text-lg"
                                onClick={() => handleEmployeeSelect(employee)}
                            >
                                {employee.name}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 