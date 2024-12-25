import { useState } from 'react'
import { useForm } from 'react-hook-form'

import * as z from 'zod'

import { useProductContext } from '@/components/ProductContext'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'

const assignmentSchema = z.object({
    productId: z.string().optional(),
    customProductName: z.string().optional(),
    customProductPrice: z.number().optional(),
    quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
})

export function ProductAssignment() {
    const { products } = useProductContext()
    const [isCustomProduct, setIsCustomProduct] = useState(false)

    const form = useForm<z.infer<typeof assignmentSchema>>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            productId: '',
            customProductName: '',
            customProductPrice: 0,
            quantity: 1,
        },
    })

    function onSubmit(values: z.infer<typeof assignmentSchema>) {
        console.log(values)
        // Here you would typically call a function to add the product to the reservation
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <div className='flex items-center space-x-2'>
                    <input
                        type='checkbox'
                        id='customProduct'
                        checked={isCustomProduct}
                        onChange={e => setIsCustomProduct(e.target.checked)}
                    />
                    <label htmlFor='customProduct'>Producto personalizado</label>
                </div>

                {isCustomProduct ? (
                    <>
                        <FormField
                            control={form.control}
                            name='customProductName'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del producto</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name='customProductPrice'
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Precio</FormLabel>
                                    <FormControl>
                                        <Input
                                            type='number'
                                            step='0.01'
                                            {...field}
                                            onChange={e => field.onChange(parseFloat(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                ) : (
                    <FormField
                        control={form.control}
                        name='productId'
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Producto</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Selecciona un producto' />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {products.map(product => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name} - {product.price.toFixed(2)} €
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}

                <FormField
                    control={form.control}
                    name='quantity'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cantidad</FormLabel>
                            <FormControl>
                                <Input
                                    type='number'
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type='submit'>Añadir a la Reserva</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción añadirá el producto seleccionado a la reserva.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={form.handleSubmit(onSubmit)}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </form>
        </Form>
    )
}
