'use client'

import { useForm } from 'react-hook-form'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon, PlusCircle } from 'lucide-react'
import * as z from 'zod'

import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
    petName: z.string().min(1, 'El nombre es requerido'),
    ownerName: z.string().min(1, 'El nombre del dueño es requerido'),
    breed: z.string().min(1, 'La raza es requerida'),
    size: z.string().min(1, 'El tamaño es requerido'),
    character: z.string().min(1, 'El carácter es requerido'),
    specialNeeds: z.string().optional(),
    phone: z.string().min(1, 'El teléfono es requerido'),
    checkIn: z.date({
        required_error: 'La fecha de entrada es requerida',
    }),
    checkOut: z.date({
        required_error: 'La fecha de salida es requerida',
    }),
})

export function NuevaEntradaDialog() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            petName: '',
            ownerName: '',
            breed: '',
            size: '',
            character: '',
            specialNeeds: '',
            phone: '',
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className='bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90'>
                    <PlusCircle className='mr-2 h-4 w-4' /> Nueva Reserva
                </Button>
            </DialogTrigger>
            <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
                <DialogHeader>
                    <DialogTitle>Nueva Entrada</DialogTitle>
                    <DialogDescription>Ingresa los datos para registrar una nueva entrada</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        <FormField
                            control={form.control}
                            name='petName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre de la Mascota</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Nombre' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='ownerName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Dueño</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Nombre completo' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='phone'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teléfono de Contacto</FormLabel>
                                    <FormControl>
                                        <Input placeholder='+34 ' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='breed'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Raza</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Raza' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='size'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tamaño</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Selecciona el tamaño' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='small'>Pequeño</SelectItem>
                                            <SelectItem value='medium'>Mediano</SelectItem>
                                            <SelectItem value='large'>Grande</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='character'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Carácter</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Selecciona el carácter' />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value='calm'>Tranquilo</SelectItem>
                                            <SelectItem value='active'>Activo</SelectItem>
                                            <SelectItem value='shy'>Tímido</SelectItem>
                                            <SelectItem value='social'>Sociable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='specialNeeds'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Necesidades Especiales</FormLabel>
                                    <FormControl>
                                        <Input placeholder='Medicamentos, alergias, etc.' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='checkIn'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <FormLabel>Fecha de Entrada</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    className={`w-full justify-start text-left font-normal ${
                                                        !field.value && 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {field.value ? (
                                                        format(field.value, 'PPP', { locale: es })
                                                    ) : (
                                                        <span>Selecciona una fecha</span>
                                                    )}
                                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={date => date < new Date() || date < new Date('1900-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name='checkOut'
                            render={({ field }) => (
                                <FormItem className='flex flex-col'>
                                    <FormLabel>Fecha de Salida</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant='outline'
                                                    className={`w-full justify-start text-left font-normal ${
                                                        !field.value && 'text-muted-foreground'
                                                    }`}
                                                >
                                                    {field.value ? (
                                                        format(field.value, 'PPP', { locale: es })
                                                    ) : (
                                                        <span>Selecciona una fecha</span>
                                                    )}
                                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className='w-auto p-0' align='start'>
                                            <Calendar
                                                mode='single'
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={date => date < new Date() || date < new Date('1900-01-01')}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type='submit' className='w-full bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90'>
                            Registrar Entrada
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
