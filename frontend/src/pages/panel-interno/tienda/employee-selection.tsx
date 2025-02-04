import { useNavigate } from 'react-router-dom'

import { Loader2 } from 'lucide-react'

import { useGlobalPrivateConfig } from '@/shared/hooks/use-global-config'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export default function EmployeeSelection() {
    const navigate = useNavigate()
    const { data: config, loading: isLoading } = useGlobalPrivateConfig()

    const handleEmployeeSelect = (employee: { id: string; name: string }) => {
        // Guardar el empleado seleccionado en sessionStorage
        sessionStorage.setItem('selectedEmployee', JSON.stringify(employee))
        // Navegar a la página de la tienda
        navigate('/panel-interno/tienda/store')
    }

    // Mostrar pantalla de carga mientras se obtienen los datos
    if (isLoading) {
        return (
            <div className='container mx-auto flex min-h-[60vh] items-center justify-center p-6'>
                <div className='space-y-4 text-center'>
                    <Loader2 className='mx-auto h-8 w-8 animate-spin text-primary' />
                    <p className='text-muted-foreground'>Cargando empleados...</p>
                </div>
            </div>
        )
    }

    // Si no hay empleados registrados, mostrar mensaje
    if (!config?.employees || config.employees.length === 0) {
        return (
            <div className='container mx-auto p-6'>
                <Card>
                    <CardHeader>
                        <CardTitle>No hay empleados registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='mb-4 text-muted-foreground'>
                            Por favor, registre empleados en la sección de configuración antes de acceder a la tienda.
                        </p>
                        <Button onClick={() => navigate('/panel-interno/setup')}>Ir a Configuración</Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className='container mx-auto p-6'>
            <Card>
                <CardHeader>
                    <CardTitle>Seleccionar Empleado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                        {config.employees.map(employee => (
                            <Button
                                key={employee.id}
                                variant='outline'
                                className='h-24 text-lg'
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
