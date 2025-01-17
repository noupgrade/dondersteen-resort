'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { DatePicker } from '@/shared/ui/date-picker'
import {
    startOfDay,
    startOfWeek,
    startOfMonth,
    startOfYear,
    addDays,
    addWeeks,
    addMonths,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    format,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// Mock data generator functions
const generateDailyData = (selectedDate: Date) => {
    // Get the selected day and the next 11 days
    const start = startOfDay(selectedDate)
    const end = addDays(start, 11)

    return eachDayOfInterval({ start, end }).map(date => ({
        name: format(date, 'dd MMM', { locale: es }),
        fullDate: date,
        hotel: Math.floor(Math.random() * 5000),
        peluqueria: Math.floor(Math.random() * 3000),
        tienda: Math.floor(Math.random() * 2000)
    }))
}

const generateWeeklyData = (selectedDate: Date) => {
    // Get the week of the selected date and the next 11 weeks
    const start = startOfWeek(selectedDate, { locale: es })
    const end = addWeeks(start, 11)

    return eachWeekOfInterval(
        { start, end },
        { locale: es }
    ).map(weekStart => ({
        name: `${format(weekStart, 'dd MMM', { locale: es })} - ${format(addDays(weekStart, 6), 'dd MMM', { locale: es })}`,
        fullDate: weekStart,
        hotel: Math.floor(Math.random() * 20000),
        peluqueria: Math.floor(Math.random() * 15000),
        tienda: Math.floor(Math.random() * 10000)
    }))
}

const generateMonthlyData = (selectedDate: Date) => {
    // Get the month of the selected date and the next 11 months
    const start = startOfMonth(selectedDate)
    const end = addMonths(start, 11)

    return eachMonthOfInterval(
        { start, end }
    ).map(monthStart => ({
        name: format(monthStart, 'MMM yyyy', { locale: es }),
        fullDate: monthStart,
        hotel: Math.floor(Math.random() * 80000),
        peluqueria: Math.floor(Math.random() * 60000),
        tienda: Math.floor(Math.random() * 40000)
    }))
}

export default function BillingPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('daily')
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period)
    }

    const getPeriodLabel = () => {
        const start = selectedDate
        switch (selectedPeriod) {
            case 'daily':
                return `Del ${format(start, 'dd MMM', { locale: es })} al ${format(addDays(start, 11), 'dd MMM', { locale: es })}`
            case 'weekly':
                const weekStart = startOfWeek(start, { locale: es })
                return `Del ${format(weekStart, 'dd MMM', { locale: es })} al ${format(addWeeks(weekStart, 11), 'dd MMM', { locale: es })}`
            case 'monthly':
                const monthStart = startOfMonth(start)
                return `De ${format(monthStart, 'MMMM yyyy', { locale: es })} a ${format(addMonths(monthStart, 11), 'MMMM yyyy', { locale: es })}`
            default:
                return ''
        }
    }

    const getData = () => {
        switch (selectedPeriod) {
            case 'daily':
                return generateDailyData(selectedDate)
            case 'weekly':
                return generateWeeklyData(selectedDate)
            case 'monthly':
                return generateMonthlyData(selectedDate)
            default:
                return []
        }
    }

    const data = getData()
    const totalHotel = data.reduce((sum, item) => sum + item.hotel, 0)
    const totalPeluqueria = data.reduce((sum, item) => sum + item.peluqueria, 0)
    const totalTienda = data.reduce((sum, item) => sum + item.tienda, 0)
    const totalGeneral = totalHotel + totalPeluqueria + totalTienda

    return (
        <div className='container mx-auto p-6 space-y-6'>
            <div className='flex items-center justify-between'>
                <h1 className='text-3xl font-bold'>Facturación</h1>
            </div>

            <div className='grid grid-cols-4 gap-4'>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium text-muted-foreground'>
                            Total General
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{totalGeneral.toLocaleString('es-ES')}€</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium text-muted-foreground'>
                            Hotel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{totalHotel.toLocaleString('es-ES')}€</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium text-muted-foreground'>
                            Peluquería
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{totalPeluqueria.toLocaleString('es-ES')}€</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-sm font-medium text-muted-foreground'>
                            Tienda
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='text-2xl font-bold'>{totalTienda.toLocaleString('es-ES')}€</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <div className='flex items-center justify-between'>
                        <div className='space-y-1'>
                            <CardTitle>Estadísticas de Facturación</CardTitle>
                            <p className='text-sm text-muted-foreground'>{getPeriodLabel()}</p>
                        </div>
                        <div className='flex items-center gap-4'>
                            <DatePicker
                                locale={es}
                                selected={selectedDate}
                                onChange={(date) => date && setSelectedDate(date)}
                                dateFormat='dd/MM/yyyy'
                                placeholderText='Seleccionar fecha'
                            />
                            <Tabs value={selectedPeriod} onValueChange={handlePeriodChange}>
                                <TabsList>
                                    <TabsTrigger value='daily'>Diario</TabsTrigger>
                                    <TabsTrigger value='weekly'>Semanal</TabsTrigger>
                                    <TabsTrigger value='monthly'>Mensual</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='h-[400px]'>
                        <ResponsiveContainer width='100%' height='100%'>
                            <BarChart
                                data={data}
                                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                            >
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis
                                    dataKey='name'
                                    angle={-45}
                                    textAnchor="end"
                                    height={70}
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => `${value.toLocaleString('es-ES')}€`}
                                />
                                <Tooltip
                                    formatter={(value: number) => `${value.toLocaleString('es-ES')}€`}
                                />
                                <Legend
                                    layout="horizontal"
                                    verticalAlign="top"
                                    align="center"
                                    wrapperStyle={{
                                        paddingBottom: "20px",
                                    }}
                                />
                                <Bar dataKey='hotel' name='Hotel' fill='#4B6BFB' />
                                <Bar dataKey='peluqueria' name='Peluquería' fill='#10B981' />
                                <Bar dataKey='tienda' name='Tienda' fill='#F59E0B' />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 