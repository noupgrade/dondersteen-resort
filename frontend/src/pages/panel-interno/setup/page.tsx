import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { Textarea } from '@/shared/ui/textarea'
import { HotelAvailabilityCalendar } from '@/components/hotel-availability-calendar'
import { useAvailabilityDialogs } from './disponibilidad/hooks/use-availability-dialogs'
import { useAvailabilityOperations } from './disponibilidad/hooks/use-availability-operations'
import { ManageDatesDialog } from './disponibilidad/components/dialogs/manage-dates-dialog'
import { HolidayDialog } from './disponibilidad/components/dialogs/holiday-dialog'
import { DateRange } from './disponibilidad/types'

export default function SetupPage() {
    // Estados para la configuración general
    const [generalConfig, setGeneralConfig] = useState({
        // Horarios
        hotelOpenTime: '09:00',
        hotelCloseTime: '20:00',
        groomingOpenTime: '09:00',
        groomingCloseTime: '19:00',
        // Precios base hotel
        smallDogPrice: 25,
        mediumDogPrice: 30,
        largeDogPrice: 35,
        daycarePrice: 20,
        highSeasonIncrease: 10,
        iva: 21,
    })

    // Estados para servicios adicionales de hotel
    const [hotelServices, setHotelServices] = useState({
        driver: {
            pickup: { name: 'Recogida', price: 15 },
            delivery: { name: 'Entrega', price: 15 },
            complete: { name: 'Completo', price: 25 },
        },
        specialFood: { name: 'Comida especial', price: 5 },
        medication: {
            once: { name: 'Una vez al día', price: 3 },
            multiple: { name: 'Varias veces al día', price: 5 },
        },
        healing: { name: 'Curas', price: 5 },
        outOfHours: { name: 'Recogida fuera de horario', price: 10 },
    })

    // Estados para servicios de peluquería
    const [groomingServices, setGroomingServices] = useState({
        bathAndBrush: { name: 'Baño y cepillado', price: 30 },
        bathAndCut: { name: 'Baño y corte', price: 40 },
        stripping: { name: 'Stripping', price: 45 },
        knots: { name: 'Nudos', price: 15 },
        shedding: { name: 'Deslanado (Extracción muda)', price: 25 },
        brushing: { name: 'Cepillado', price: 20 },
        spa: { name: 'Spa', price: 35 },
        spaOzone: { name: 'Spa + Ozono', price: 45 },
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
        }
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
        [setSelectedRange, handleDialogOpenChange]
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
        hotelServices: typeof hotelServices
        groomingServices: typeof groomingServices
        emailTemplates: typeof emailTemplates
    } | null>(null)

    // Guardar el estado inicial cuando se carga el componente
    useEffect(() => {
        setOriginalConfig({
            generalConfig,
            hotelServices,
            groomingServices,
            emailTemplates
        })
    }, []) // Dependencias vacías para que solo se ejecute al montar el componente

    // Función para detectar cambios
    useEffect(() => {
        if (originalConfig) {
            const hasGeneralChanges = JSON.stringify(originalConfig.generalConfig) !== JSON.stringify(generalConfig)
            const hasHotelChanges = JSON.stringify(originalConfig.hotelServices) !== JSON.stringify(hotelServices)
            const hasGroomingChanges = JSON.stringify(originalConfig.groomingServices) !== JSON.stringify(groomingServices)
            const hasTemplateChanges = JSON.stringify(originalConfig.emailTemplates) !== JSON.stringify(emailTemplates)

            setHasUnsavedChanges(hasGeneralChanges || hasHotelChanges || hasGroomingChanges || hasTemplateChanges)
        }
    }, [generalConfig, hotelServices, groomingServices, emailTemplates, originalConfig])

    const handleSave = async () => {
        // TODO: Implementar la lógica de guardado
        console.log('Guardando cambios...')
        setOriginalConfig({
            generalConfig,
            hotelServices,
            groomingServices,
            emailTemplates
        })
        setHasUnsavedChanges(false)
    }

    const handleCancel = () => {
        // Restaurar al estado original
        if (originalConfig) {
            setGeneralConfig(originalConfig.generalConfig)
            setHotelServices(originalConfig.hotelServices)
            setGroomingServices(originalConfig.groomingServices)
            setEmailTemplates(originalConfig.emailTemplates)
            setHasUnsavedChanges(false)
        }
    }

    if (isLoading) {
        return (
            <div className='container mx-auto p-6'>
                <div className='flex items-center justify-center h-[60vh]'>
                    <div className='text-center space-y-4'>
                        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
                        <p className='text-muted-foreground'>Cargando disponibilidad...</p>
                    </div>
                </div>
            </div>
        )
    }

    const dateStatus = selectedRange.from && selectedRange.to ? getSelectedDatesStatus(selectedRange) : null
    const hasSpecialConditions = dateStatus ? dateStatus.hasBlocked || dateStatus.hasHolidays || dateStatus.hasHighSeason : false

    return (
        <div className='container mx-auto p-6 pb-24'>
            <h1 className='text-3xl font-bold mb-6'>Configuración</h1>

            <Tabs defaultValue='general' className='space-y-6'>
                <TabsList className='grid w-full grid-cols-2 gap-4 bg-transparent p-0'>
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
                                            onChange={(e) => setGeneralConfig({
                                                ...generalConfig,
                                                hotelOpenTime: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Hotel - Hora de Cierre</Label>
                                        <Input
                                            type='time'
                                            value={generalConfig.hotelCloseTime}
                                            onChange={(e) => setGeneralConfig({
                                                ...generalConfig,
                                                hotelCloseTime: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Peluquería - Hora de Apertura</Label>
                                        <Input
                                            type='time'
                                            value={generalConfig.groomingOpenTime}
                                            onChange={(e) => setGeneralConfig({
                                                ...generalConfig,
                                                groomingOpenTime: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Peluquería - Hora de Cierre</Label>
                                        <Input
                                            type='time'
                                            value={generalConfig.groomingCloseTime}
                                            onChange={(e) => setGeneralConfig({
                                                ...generalConfig,
                                                groomingCloseTime: e.target.value
                                            })}
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
                                <form className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label>Perro Pequeño (por día)</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={generalConfig.smallDogPrice}
                                                onChange={(e) => setGeneralConfig({
                                                    ...generalConfig,
                                                    smallDogPrice: Number(e.target.value)
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Perro Mediano (por día)</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={generalConfig.mediumDogPrice}
                                                onChange={(e) => setGeneralConfig({
                                                    ...generalConfig,
                                                    mediumDogPrice: Number(e.target.value)
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Perro Grande (por día)</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={generalConfig.largeDogPrice}
                                                onChange={(e) => setGeneralConfig({
                                                    ...generalConfig,
                                                    largeDogPrice: Number(e.target.value)
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Precio Guardería (por día)</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={generalConfig.daycarePrice}
                                                onChange={(e) => setGeneralConfig({
                                                    ...generalConfig,
                                                    daycarePrice: Number(e.target.value)
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Incremento Temporada Alta </Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={generalConfig.highSeasonIncrease}
                                                onChange={(e) => setGeneralConfig({
                                                    ...generalConfig,
                                                    highSeasonIncrease: Number(e.target.value)
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>IVA (%)</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={generalConfig.iva}
                                                onChange={(e) => setGeneralConfig({
                                                    ...generalConfig,
                                                    iva: Number(e.target.value)
                                                })}
                                            />
                                            <span>%</span>
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
                                        <h3 className='font-semibold mb-4'>Servicio de Transporte</h3>
                                        <div className='grid grid-cols-3 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Recogida</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelServices.driver.pickup.price}
                                                        onChange={(e) => setHotelServices({
                                                            ...hotelServices,
                                                            driver: {
                                                                ...hotelServices.driver,
                                                                pickup: {
                                                                    ...hotelServices.driver.pickup,
                                                                    price: Number(e.target.value)
                                                                }
                                                            }
                                                        })}
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Entrega</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelServices.driver.delivery.price}
                                                        onChange={(e) => setHotelServices({
                                                            ...hotelServices,
                                                            driver: {
                                                                ...hotelServices.driver,
                                                                delivery: {
                                                                    ...hotelServices.driver.delivery,
                                                                    price: Number(e.target.value)
                                                                }
                                                            }
                                                        })}
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Completo</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelServices.driver.complete.price}
                                                        onChange={(e) => setHotelServices({
                                                            ...hotelServices,
                                                            driver: {
                                                                ...hotelServices.driver,
                                                                complete: {
                                                                    ...hotelServices.driver.complete,
                                                                    price: Number(e.target.value)
                                                                }
                                                            }
                                                        })}
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='font-semibold mb-4'>Comida Especial</h3>
                                        <div className='space-y-2'>
                                            <Label className='text-sm text-gray-500'>Precio por día</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelServices.specialFood.price}
                                                    onChange={(e) => setHotelServices({
                                                        ...hotelServices,
                                                        specialFood: {
                                                            ...hotelServices.specialFood,
                                                            price: Number(e.target.value)
                                                        }
                                                    })}
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='font-semibold mb-4'>Medicación</h3>
                                        <div className='grid grid-cols-2 gap-4'>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Una vez al día</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelServices.medication.once.price}
                                                        onChange={(e) => setHotelServices({
                                                            ...hotelServices,
                                                            medication: {
                                                                ...hotelServices.medication,
                                                                once: {
                                                                    ...hotelServices.medication.once,
                                                                    price: Number(e.target.value)
                                                                }
                                                            }
                                                        })}
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                            <div className='space-y-2'>
                                                <Label className='text-sm text-gray-500'>Varias veces al día</Label>
                                                <div className='flex items-center gap-2'>
                                                    <Input
                                                        type='number'
                                                        value={hotelServices.medication.multiple.price}
                                                        onChange={(e) => setHotelServices({
                                                            ...hotelServices,
                                                            medication: {
                                                                ...hotelServices.medication,
                                                                multiple: {
                                                                    ...hotelServices.medication.multiple,
                                                                    price: Number(e.target.value)
                                                                }
                                                            }
                                                        })}
                                                    />
                                                    <span>€</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='font-semibold mb-4'>Curas</h3>
                                        <div className='space-y-2'>
                                            <Label className='text-sm text-gray-500'>Precio por día</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelServices.healing.price}
                                                    onChange={(e) => setHotelServices({
                                                        ...hotelServices,
                                                        healing: {
                                                            ...hotelServices.healing,
                                                            price: Number(e.target.value)
                                                        }
                                                    })}
                                                />
                                                <span>€</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className='font-semibold mb-4'>Recogida fuera de horario</h3>
                                        <div className='space-y-2'>
                                            <Label className='text-sm text-gray-500'>Precio</Label>
                                            <div className='flex items-center gap-2'>
                                                <Input
                                                    type='number'
                                                    value={hotelServices.outOfHours.price}
                                                    onChange={(e) => setHotelServices({
                                                        ...hotelServices,
                                                        outOfHours: {
                                                            ...hotelServices.outOfHours,
                                                            price: Number(e.target.value)
                                                        }
                                                    })}
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
                                <form className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label>Baño y cepillado</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.bathAndBrush.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    bathAndBrush: {
                                                        ...groomingServices.bathAndBrush,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Baño y corte</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.bathAndCut.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    bathAndCut: {
                                                        ...groomingServices.bathAndCut,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Stripping</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.stripping.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    stripping: {
                                                        ...groomingServices.stripping,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Nudos</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.knots.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    knots: {
                                                        ...groomingServices.knots,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Deslanado</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.shedding.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    shedding: {
                                                        ...groomingServices.shedding,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Cepillado</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.brushing.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    brushing: {
                                                        ...groomingServices.brushing,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Spa</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.spa.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    spa: {
                                                        ...groomingServices.spa,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Spa + Ozono</Label>
                                        <div className='flex items-center gap-2'>
                                            <Input
                                                type='number'
                                                value={groomingServices.spaOzone.price}
                                                onChange={(e) => setGroomingServices({
                                                    ...groomingServices,
                                                    spaOzone: {
                                                        ...groomingServices.spaOzone,
                                                        price: Number(e.target.value)
                                                    }
                                                })}
                                            />
                                            <span>€</span>
                                        </div>
                                    </div>
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
            </Tabs>

            {/* Botones flotantes */}
            {hasUnsavedChanges && (
                <div className='fixed bottom-8 left-0 right-0 mx-auto w-fit flex gap-4 bg-white p-4 rounded-lg shadow-lg border'>
                    <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSave}>
                        Guardar cambios
                    </Button>
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
                onSubmit={(holidayName) => handleAddHolidays(selectedRange, holidayName)}
            />
        </div>
    )
} 