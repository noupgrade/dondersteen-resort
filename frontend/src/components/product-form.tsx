import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import * as z from 'zod'

import { useProductContext } from '@/components/ProductContext'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/shared/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'

const productSchema = z.object({
    name: z.string().min(1, 'El nombre es requerido'),
    price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
    category: z.string().min(1, 'La categoría es requerida'),
})

type ProductFormProps = {
    productId?: string
    onClose?: () => void
}

export function ProductForm({ productId, onClose }: ProductFormProps) {
    const { addProduct, updateProduct, getProductById, categories } = useProductContext()

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            price: 0,
            category: '',
        },
    })

    useEffect(() => {
        if (productId) {
            const product = getProductById(productId)
            if (product) {
                form.reset({
                    name: product.name,
                    price: product.price,
                    category: product.category || '',
                })
            }
        }
    }, [productId, getProductById, form])

    function onSubmit(values: z.infer<typeof productSchema>) {
        if (productId) {
            updateProduct(productId, values)
            toast({
                title: 'Producto actualizado',
                description: 'El producto ha sido actualizado correctamente.',
            })
        } else {
            addProduct(values)
            toast({
                title: 'Producto añadido',
                description: 'El nuevo producto ha sido añadido correctamente.',
            })
        }
        if (onClose) onClose()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                                <Input placeholder='Nombre del producto' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name='price'
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
                <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Categoría</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Selecciona una categoría' />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.name}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type='submit'>Guardar Cambios</Button>
            </form>
        </Form>
    )
}
