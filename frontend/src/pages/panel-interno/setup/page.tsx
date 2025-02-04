import { useCallback, useEffect, useState } from 'react'

import { HotelAvailabilityCalendar } from '@/components/hotel-availability-calendar'
import { useHotelPricingConfig } from '@/shared/hooks/use-hotel-pricing-config'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

import { EmployeesManagement } from './components/employees-management'
import { HolidayDialog } from './disponibilidad/components/dialogs/holiday-dialog'
import { ManageDatesDialog } from './disponibilidad/components/dialogs/manage-dates-dialog'
import { useAvailabilityDialogs } from './disponibilidad/hooks/use-availability-dialogs'
import { useAvailabilityOperations } from './disponibilidad/hooks/use-availability-operations'
import { DateRange } from './disponibilidad/types'

export default function SetupPage() {
    // Estados para la configuración general
    const [generalConfig, setGeneralConfig] = useState({
        // Horarios
        hotelOpenTime: '09:00',
        hotelCloseTime: '20:00',
        groomingOpenTime: '09:00',
        groomingCloseTime: '19:00',
    })

    const {
        config: hotelPricing,
        updateConfig: updateHotelPricing,
        loading: hotelPricingLoading,
    } = useHotelPricingConfig()

    // Estados para servicios de peluquería
    const [groomingServices, setGroomingServices] = useState({
        bathAndBrush: { name: 'Baño y cepillado', minPrice: 25, maxPrice: 30 },
        bathAndCut: { name: 'Baño y corte', minPrice: 35, maxPrice: 40 },
        stripping: { name: 'Stripping', minPrice: 40, maxPrice: 45 },
        knots: { name: 'Nudos', minPrice: 12, maxPrice: 15 },
        shedding: { name: 'Deslanado (Extracción muda)', minPrice: 20, maxPrice: 25 },
        brushing: { name: 'Cepillado', minPrice: 15, maxPrice: 20 },
        spa: { name: 'Spa', minPrice: 30, maxPrice: 35 },
        spaOzone: { name: 'Spa + Ozono', minPrice: 40, maxPrice: 45 },
        extremelyDirty: { name: 'Extremadamente sucio', minPrice: 35, maxPrice: 45 },
    })

    // Estados para plantillas de correo
    const [emailTemplates, setEmailTemplates] = useState({
        es: {
            groomingRequestConfirmation: '',
            hotelRequestConfirmation: '',
            groomingBookingConfirmation: '',
            hotelBookingConfirmation: '',
            bookingModification: '',
            groomingProposal: '',
        },
        en: {
            groomingRequestConfirmation: '',
            hotelRequestConfirmation: '',
            groomingBookingConfirmation: '',
            hotelBookingConfirmation: '',
            bookingModification: '',
            groomingProposal: '',
        },
    })

    // Estados para usuarios y roles
    const [users, setUsers] = useState([
        { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' },
        { id: 2, name: 'Staff', email: 'staff@example.com', role: 'staff' },
    ])

    // Hooks para el calendario de disponibilidad
    const {
        isBlockDateDialogOpen,
        isHolidayDialogOpen,
        selectedRange,
        handleDialogOpenChange,
        handleHolidayDialogOpenChange,
        openHolidayDialog,
        setSelectedRange,
    } = useAvailabilityDialogs()

    const {
        handleBlockDates,
        handleAddHolidays,
        handleAddHighSeason,
        handleRemoveSpecialConditions,
        getSelectedDatesStatus,
        getStats,
        isLoading,
    } = useAvailabilityOperations()

    const handleDateRangeSelect = useCallback(
        (range: DateRange) => {
            setSelectedRange(range)
            if (range.from && range.to) {
                handleDialogOpenChange(true)
            }
        },
        [setSelectedRange, handleDialogOpenChange],
    )

    const handleGeneralConfigSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log('Guardando configuración general:', generalConfig)
    }

    const handleHighSeasonClick = () => {
        if (handleAddHighSeason(selectedRange)) {
            handleDialogOpenChange(false)
        }
    }

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [originalConfig, setOriginalConfig] = useState<{
        generalConfig: typeof generalConfig
        groomingServices: typeof groomingServices
        emailTemplates: typeof emailTemplates
    } | null>(null)

    // Guardar el estado inicial cuando se carga el componente
    useEffect(() => {
        setOriginalConfig({
            generalConfig,
            groomingServices,
            emailTemplates,
        })
    }, []) // Dependencias vacías para que solo se ejecute al montar el componente

    // Función para detectar cambios
    useEffect(() => {
        if (originalConfig) {
            const hasGeneralChanges = JSON.stringify(originalConfig.generalConfig) !== JSON.stringify(generalConfig)
            const hasGroomingChanges =
                JSON.stringify(originalConfig.groomingServices) !== JSON.stringify(groomingServices)
            const hasTemplateChanges = JSON.stringify(originalConfig.emailTemplates) !== JSON.stringify(emailTemplates)

            setHasUnsavedChanges(hasGeneralChanges || hasGroomingChanges || hasTemplateChanges)
        }
    }, [generalConfig, groomingServices, emailTemplates, originalConfig])

    const handleSave = async () => {
        // TODO: Implementar la lógica de guardado
        console.log('Guardando cambios...')
        setOriginalConfig({
            generalConfig,
            groomingServices,
            emailTemplates,
        })
        setHasUnsavedChanges(false)
    }

    const handleCancel = () => {
        // Restaurar al estado original
        if (originalConfig) {
            setGeneralConfig(originalConfig.generalConfig)
            setGroomingServices(originalConfig.groomingServices)
            setEmailTemplates(originalConfig.emailTemplates)
            setHasUnsavedChanges(false)
        }
    }

    if (hotelPricingLoading) {
        return (
            <div className='container mx-auto p-6'>
                <div className='flex h-[60vh] items-center justify-center'>
                    <div className='space-y-4 text-center'>
                        <div className='mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary'></div>
                        <p className='text-muted-foreground'>Cargando configuración...</p>
                    </div>
                </div>
            </div>
        )
    }

    const dateStatus = selectedRange.from && selectedRange.to ? getSelectedDatesStatus(selectedRange) : null
    const hasSpecialConditions = dateStatus
        ? dateStatus.hasBlocked || dateStatus.hasHolidays || dateStatus.hasHighSeason
        : false

    return (
        <div className='container mx-auto p-6 pb-24'>
            <h1 className='mb-6 text-3xl font-bold'>Configuración</h1>

            <Tabs defaultValue='general' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-3 gap-4 bg-transparent p-0'>
                    <TabsTrigger
                        value='general'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Configuración General
                    </TabsTrigger>
                    <TabsTrigger
                        value='calendar'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Calendario
                    </TabsTrigger>
                    <TabsTrigger
                        value='employees'
                        className='relative flex items-center justify-center gap-2 border bg-white shadow-sm hover:bg-gray-50/80 data-[state=active]:border-[#4B6BFB] data-[state=active]:bg-[#4B6BFB] data-[state=active]:text-white'
                    >
                        Empleados
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='general'>
                    <div className='grid gap-6 md:grid-cols-2'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Horarios</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label>Hotel - Hora de Apertura</Label>
                                        <Input
                                            type='time'
                                            value={generalConfig.hotelOpenTime}
                                            onChange={e =>
                                                setGeneralConfig({
                                                    ...generalConfig,
                                                    hotelOpenTime: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Hotel - Hora de Cierre</Label>
                                        <Input
                                            type='time'
                                            value={generalConfig.hotelCloseTime}
                                            onChange={e =>
                                                setGeneralConfig({
                                                    ...generalConfig,
                                                    hotelCloseTime: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Peluquería - Hora de Apertura</Label>
                                        <Input
                                            type='time'
                                            value={generalConfig.groomingOpenTime}
                                            onChange={e =>
                                                setGeneralConfig({
                                                    ...generalConfig,
                                                    groomingOpenTime: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Peluquería - Hora de Cierre</Label>
                                        <Input
                                            type='time'
                                            value={generalConfig.groomingCloseTime}
                                            onChange={e =>
                                                setGeneralConfig({
                                                    ...generalConfig,
                                                    groomingCloseTime: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Precios Base Hotel</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className='grid grid-cols-2 gap-x-8'>
                                    <div className='space-y-4'>
                                        <div className='space-y-2'>
                                            <Label>Perro Pequeño (por día)</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.smallDogPrice}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            smallDogPrice: Number(e.target.value),
                                                        })
                                                    }
                                                    className='w-24'
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label>Perro Mediano (por día)</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.mediumDogPrice}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            mediumDogPrice: Number(e.target.value),
                                                        })
                                                    }
                                                    className='w-24'
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label>Perro Grande (por día)</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.largeDogPrice}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            largeDogPrice: Number(e.target.value),
                                                        })
                                                    }
                                                    className='w-24'
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label>Precio Guardería (por día)</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.daycarePrice}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            daycarePrice: Number(e.target.value),
                                                        })
                                                    }
                                                    className='w-24'
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label>Incremento Temporada Alta</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.highSeasonIncrease}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            highSeasonIncrease: Number(e.target.value),
                                                        })
                                                    }
                                                    className='w-24'
                                                />
                                                <span>%</span>
                                            </div>
                                        </div>
                                        <div className='space-y-2'>
                                            <Label>IVA</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.iva}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            iva: Number(e.target.value),
                                                        })
                                                    }
                                                    className='w-24'
                                                />
                                                <span>%</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='space-y-4'>
                                        <h3 className='mb-4 font-semibold'>Descuentos</h3>
                                        <div className='space-y-4'>
                                            <div className='space-y-2'>
                                                <Label>Perros VIP</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.vipDogDiscount}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                vipDogDiscount: Number(e.target.value),
                                                            })
                                                        }
                                                        className='w-24'
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>Perro de Trabajador</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.employeeDogDiscount}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                employeeDogDiscount: Number(e.target.value),
                                                            })
                                                        }
                                                        className='w-24'
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>2 Perros Pequeños</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.twoPetsDiscount}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                twoPetsDiscount: Number(e.target.value),
                                                            })
                                                        }
                                                        className='w-24'
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label>3 Perros Pequeños</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.threePetsDiscount}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                threePetsDiscount: Number(e.target.value),
                                                            })
                                                        }
                                                        className='w-24'
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Servicios Adicionales Hotel</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className='space-y-6'>
                                    <div>
                                        <h3 className='mb-4 font-semibold'>Servicio de Transporte</h3>
                                        <div className='grid grid-cols-3 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Recogida</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.driver.pickup.price}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                driver: {
                                                                    ...hotelPricing?.driver,
                                                                    pickup: {
                                                                        ...hotelPricing?.driver.pickup,
                                                                        price: Number(e.target.value),
                                                                    },
                                                                },
                                                            })
                                                        }
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Entrega</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.driver.delivery.price}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                driver: {
                                                                    ...hotelPricing?.driver,
                                                                    delivery: {
                                                                        ...hotelPricing?.driver.delivery,
                                                                        price: Number(e.target.value),
                                                                    },
                                                                },
                                                            })
                                                        }
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Completo</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.driver.complete.price}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                driver: {
                                                                    ...hotelPricing?.driver,
                                                                    complete: {
                                                                        ...hotelPricing?.driver.complete,
                                                                        price: Number(e.target.value),
                                                                    },
                                                                },
                                                            })
                                                        }
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='mb-4 font-semibold'>Comida Especial</h3>
                                        <div className='space-y-2'>
                                            <Label className='text-sm text-gray-500'>Precio por día</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.specialFood.price}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            specialFood: {
                                                                ...hotelPricing?.specialFood,
                                                                price: Number(e.target.value),
                                                            },
                                                        })
                                                    }
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='mb-4 font-semibold'>Medicación</h3>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Una vez al día</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.medication.once.price}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                medication: {
                                                                    ...hotelPricing?.medication,
                                                                    once: {
                                                                        ...hotelPricing?.medication.once,
                                                                        price: Number(e.target.value),
                                                                    },
                                                                },
                                                            })
                                                        }
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Varias veces al día</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelPricing?.medication.multiple.price}
                                                        onChange={e =>
                                                            updateHotelPricing({
                                                                medication: {
                                                                    ...hotelPricing?.medication,
                                                                    multiple: {
                                                                        ...hotelPricing?.medication.multiple,
                                                                        price: Number(e.target.value),
                                                                    },
                                                                },
                                                            })
                                                        }
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='mb-4 font-semibold'>Curas</h3>
                                        <div className='space-y-2'>
                                            <Label className='text-sm text-gray-500'>Precio por día</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.healing.price}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            healing: {
                                                                ...hotelPricing?.healing,
                                                                price: Number(e.target.value),
                                                            },
                                                        })
                                                    }
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='mb-4 font-semibold'>Recogida fuera de horario</h3>
                                        <div className='space-y-2'>
                                            <Label className='text-sm text-gray-500'>Precio</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelPricing?.outOfHours.price}
                                                    onChange={e =>
                                                        updateHotelPricing({
                                                            outOfHours: {
                                                                ...hotelPricing?.outOfHours,
                                                                price: Number(e.target.value),
                                                            },
                                                        })
                                                    }
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Servicios de Peluquería</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className='grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4'>
                                    {Object.entries(groomingServices).map(([key, service]) => (
                                        <div key={key} className='space-y-2 rounded-lg border bg-card p-4'>
                                            <Label>{service.name}</Label>
                                            <div className='flex items-center gap-2'>
                                                <div className='flex flex-1 items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={service.minPrice}
                                                        onChange={e =>
                                                            setGroomingServices({
                                                                ...groomingServices,
                                                                [key]: {
                                                                    ...service,
                                                                    minPrice: Number(e.target.value),
                                                                },
                                                            })
                                                        }
                                                        className='w-24'
                                                    />
                                                    <span>€ -</span>
                                                    <Input
                                                        type='number'
                                                        value={service.maxPrice}
                                                        onChange={e =>
                                                            setGroomingServices({
                                                                ...groomingServices,
                                                                [key]: {
                                                                    ...service,
                                                                    maxPrice: Number(e.target.value),
                                                                },
                                                            })
                                                        }
                                                        className='w-24'
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='calendar'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Gestión de Disponibilidad</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-6'>
                                <HotelAvailabilityCalendar onDateSelect={handleDateRangeSelect} />

                                <div className='flex flex-wrap justify-center gap-4'>
                                    <Badge variant='outline' className='py-1'>
                                        <div className='mr-2 h-3 w-3 rounded-full bg-red-500' />
                                        Bloqueado
                                    </Badge>
                                    <Badge variant='outline' className='py-1'>
                                        <div className='mr-2 h-3 w-3 rounded-full bg-amber-500' />
                                        Festivo
                                    </Badge>
                                    <Badge variant='outline' className='py-1'>
                                        <div className='mr-2 h-3 w-3 rounded-full bg-green-500' />
                                        Temporada Alta
                                    </Badge>
                                </div>

                                {selectedRange.from && selectedRange.to && (
                                    <div className='space-y-4'>
                                        <div className='flex flex-wrap gap-4'>
                                            <Button
                                                variant='outline'
                                                onClick={() => handleDialogOpenChange(true)}
                                                disabled={dateStatus?.hasBlocked}
                                            >
                                                Bloquear fechas
                                            </Button>
                                            <Button
                                                variant='outline'
                                                onClick={openHolidayDialog}
                                                disabled={dateStatus?.hasHolidays}
                                            >
                                                Marcar como festivo
                                            </Button>
                                            <Button
                                                variant='outline'
                                                onClick={() => handleAddHighSeason(selectedRange)}
                                                disabled={dateStatus?.hasHighSeason}
                                            >
                                                Marcar como temporada alta
                                            </Button>
                                            {hasSpecialConditions && (
                                                <Button
                                                    variant='destructive'
                                                    onClick={() => handleRemoveSpecialConditions(selectedRange)}
                                                >
                                                    Eliminar condiciones especiales
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value='employees'>
                    <EmployeesManagement />
                </TabsContent>
            </Tabs>

            {/* Botones flotantes */}
            {hasUnsavedChanges && (
                <div className='fixed bottom-8 left-0 right-0 mx-auto flex w-fit gap-4 rounded-lg border bg-white p-4 shadow-lg'>
                    <Button variant='outline' onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>Guardar cambios</Button>
                </div>
            )}

            <ManageDatesDialog
                open={isBlockDateDialogOpen}
                onOpenChange={handleDialogOpenChange}
                selectedRange={selectedRange}
                onBlockDates={() => handleBlockDates(selectedRange)}
                onOpenHolidayDialog={openHolidayDialog}
                onHighSeasonClick={() => handleAddHighSeason(selectedRange)}
                onRemoveSpecialConditions={() => handleRemoveSpecialConditions(selectedRange)}
                hasSpecialConditions={hasSpecialConditions}
            />

            <HolidayDialog
                open={isHolidayDialogOpen}
                onOpenChange={handleHolidayDialogOpenChange}
                selectedRange={selectedRange}
                onSubmit={holidayName => handleAddHolidays(selectedRange, holidayName)}
            />
        </div>
    )
}
