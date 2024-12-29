import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Plus } from 'lucide-react'
import * as z from 'zod'

import { useProductContext } from '@/components/ProductContext'
import { useToast } from '@/hooks/use-toast'
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
    const { addProduct, updateProduct, getProductById, categories, addCategory } = useProductContext()
    const [newCategoryName, setNewCategoryName] = useState('')
    const [isAddingCategory, setIsAddingCategory] = useState(false)
    const { toast } = useToast() // TODO TOAST IS NOT WORKING

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

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory({ name: newCategoryName.trim() })
            form.setValue('category', newCategoryName.trim())
            setNewCategoryName('')
            setIsAddingCategory(false)
            toast({
                title: 'Categoría añadida',
                description: 'La nueva categoría ha sido creada correctamente',
                variant: 'success',
                duration: 3000
            })
        }
    }

    function onSubmit(values: z.infer<typeof productSchema>) {
        const isUpdate = Boolean(productId)

        if (isUpdate && productId) {
            updateProduct(productId, values)
        } else {
            addProduct(values)
        }

        toast({
            title: `Producto ${isUpdate ? 'actualizado' : 'añadido'}`,
            description: `El producto ha sido ${isUpdate ? 'actualizado' : 'añadido'} correctamente`,
            variant: 'success',
            duration: 3000
        })

        if (onClose) onClose()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <FormField
                    control={form.control}
                    name='name'
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
                    name='price'
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Precio</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        inputMode="decimal"
                                        step="0.01"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                        className="pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                                        €
                                    </span>
                                </div>
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
                            <div className="flex gap-2">
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Selecciona una categoría' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(category => (
                                                <SelectItem key={category.id} value={category.name}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setIsAddingCategory(true)}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isAddingCategory && (
                    <div className="space-y-2">
                        <FormLabel>Nueva categoría</FormLabel>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nombre de la categoría"
                                value={newCategoryName}
                                onChange={e => setNewCategoryName(e.target.value)}
                            />
                            <Button
                                type="button"
                                onClick={handleAddCategory}
                                disabled={!newCategoryName.trim()}
                            >
                                Añadir
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    setIsAddingCategory(false)
                                    setNewCategoryName('')
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}

                <Button type='submit'>
                    {productId ? 'Actualizar Producto' : 'Crear Producto'}
                </Button>
            </form>
        </Form>
    )
}
