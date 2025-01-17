import { useState } from 'react'

import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { useProductContext } from '@/components/ProductContext'
import { ProductForm } from '@/components/product-form'
import { useToast } from '@/hooks/use-toast'
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
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

// Colores suaves por categoría
const categoryColors: { [key: string]: string } = {
    Juguetes: 'bg-pink-50 hover:bg-pink-100',
    Alimentos: 'bg-green-50 hover:bg-green-100',
    Accesorios: 'bg-blue-50 hover:bg-blue-100',
    default: 'bg-gray-50 hover:bg-gray-100'
}

export function ProductList() {
    const { products, categories, deleteProduct, addCategory, deleteCategory, updateCategory } = useProductContext()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [editingProduct, setEditingProduct] = useState<string>('')
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryVat, setNewCategoryVat] = useState('')
    const [editingCategoryId, setEditingCategoryId] = useState<string>('')
    const [editingCategoryName, setEditingCategoryName] = useState('')
    const [editingCategoryVat, setEditingCategoryVat] = useState('')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const { toast } = useToast()

    const filteredProducts = products.filter(
        product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === 'all' || product.category === selectedCategory),
    )

    const handleAddCategory = () => {
        if (newCategoryName.trim() && newCategoryVat.trim()) {
            const vat = parseInt(newCategoryVat)
            if (isNaN(vat) || vat < 0 || vat > 100) {
                toast({
                    title: 'Error',
                    description: 'El IVA debe ser un número entre 0 y 100',
                    variant: 'destructive',
                    duration: 3000
                })
                return
            }
            addCategory({ name: newCategoryName.trim(), vat })
            setNewCategoryName('')
            setNewCategoryVat('')
            toast({
                title: 'Categoría añadida',
                description: 'La nueva categoría ha sido creada correctamente',
                variant: 'success',
                duration: 3000
            })
        }
    }

    const handleDeleteProduct = (productId: string) => {
        deleteProduct(productId)
        toast({
            title: 'Producto eliminado',
            description: 'El producto ha sido eliminado correctamente',
            variant: 'success',
            duration: 3000
        })
    }

    const getColorByCategory = (category?: string): string => {
        if (!category) return categoryColors.default
        return categoryColors[category] || categoryColors.default
    }

    const handleEditCategory = (category: { id: string; name: string; vat: number }) => {
        setEditingCategoryId(category.id)
        setEditingCategoryName(category.name)
        setEditingCategoryVat(category.vat.toString())
    }

    const handleSaveCategory = () => {
        const vat = parseInt(editingCategoryVat)
        if (isNaN(vat) || vat < 0 || vat > 100) {
            toast({
                title: 'Error',
                description: 'El IVA debe ser un número entre 0 y 100',
                variant: 'destructive',
                duration: 3000
            })
            return
        }

        if (!editingCategoryName.trim()) {
            toast({
                title: 'Error',
                description: 'El nombre de la categoría no puede estar vacío',
                variant: 'destructive',
                duration: 3000
            })
            return
        }

        updateCategory(editingCategoryId, {
            name: editingCategoryName.trim(),
            vat
        })
        setEditingCategoryId('')
        setEditingCategoryName('')
        setEditingCategoryVat('')
        toast({
            title: 'Categoría actualizada',
            description: 'La categoría ha sido actualizada correctamente',
            variant: 'success',
            duration: 3000
        })
    }

    const handleCancelEdit = () => {
        setEditingCategoryId('')
        setEditingCategoryName('')
        setEditingCategoryVat('')
    }

    return (
        <div className='space-y-6'>
            <div className='flex flex-col gap-4 sm:flex-row'>
                <div className='flex flex-1 items-center gap-2'>
                    <Input
                        placeholder='Buscar productos...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='max-w-sm'
                    />
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className='w-[180px]'>
                            <SelectValue placeholder='Categoría' />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>Todas las categorías</SelectItem>
                            {categories.map(category => (
                                <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex gap-2'>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant='outline'>
                                <Plus className='mr-2 h-4 w-4' />
                                Nuevo Producto
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Nuevo Producto</DialogTitle>
                            </DialogHeader>
                            <ProductForm onClose={() => setIsEditDialogOpen(false)} />
                        </DialogContent>
                    </Dialog>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant='outline'>Gestionar Categorías</Button>
                        </DialogTrigger>
                        <DialogContent className='sm:max-w-[625px]'>
                            <DialogHeader>
                                <DialogTitle>Gestionar Categorías</DialogTitle>
                            </DialogHeader>
                            <div className='grid gap-4 py-4'>
                                <div className='space-y-2'>
                                    <div className='flex items-center gap-2'>
                                        <Input
                                            placeholder='Nueva categoría'
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                        />
                                        <Input
                                            type='number'
                                            placeholder='% IVA'
                                            min='0'
                                            max='100'
                                            step='1'
                                            className='w-36'
                                            value={newCategoryVat}
                                            onChange={e => setNewCategoryVat(e.target.value)}
                                        />
                                        <Button onClick={handleAddCategory}>Añadir</Button>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    {categories.map(category => (
                                        <div
                                            key={category.id}
                                            className='flex items-center justify-between rounded-lg bg-gray-50 p-2'
                                        >
                                            {editingCategoryId === category.id ? (
                                                <div className='flex flex-1 items-center gap-2'>
                                                    <Input
                                                        value={editingCategoryName}
                                                        onChange={e => setEditingCategoryName(e.target.value)}
                                                        placeholder='Nombre de la categoría'
                                                    />
                                                    <Input
                                                        type='number'
                                                        value={editingCategoryVat}
                                                        onChange={e => setEditingCategoryVat(e.target.value)}
                                                        placeholder='% IVA'
                                                        min='0'
                                                        max='100'
                                                        step='1'
                                                        className='w-36'
                                                    />
                                                    <div className='flex gap-1'>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={handleSaveCategory}
                                                        >
                                                            Guardar
                                                        </Button>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={handleCancelEdit}
                                                        >
                                                            Cancelar
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className='flex items-center gap-2'>
                                                        <span>{category.name}</span>
                                                        <span className='text-sm text-muted-foreground'>
                                                            ({category.vat}% IVA)
                                                        </span>
                                                    </div>
                                                    <div className='flex gap-1'>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => handleEditCategory(category)}
                                                        >
                                                            <Pencil className='h-4 w-4' />
                                                        </Button>
                                                        <Button
                                                            variant='ghost'
                                                            size='sm'
                                                            onClick={() => deleteCategory(category.id)}
                                                        >
                                                            <Trash2 className='h-4 w-4' />
                                                        </Button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Categoría</TableHead>
                            <TableHead className='text-right'>Precio</TableHead>
                            <TableHead className='text-right'>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map(product => (
                            <TableRow
                                key={product.id}
                                className={`${getColorByCategory(product.category)} transition-colors`}
                            >
                                <TableCell className='font-medium'>{product.name}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className='text-right'>{product.price.toFixed(2)} €</TableCell>
                                <TableCell className='text-right'>
                                    <div className='flex justify-end gap-2'>
                                        <Dialog open={editingProduct !== ''} onOpenChange={(open) => !open && setEditingProduct('')}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => setEditingProduct(product.id)}
                                                >
                                                    <Pencil className='h-4 w-4' />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Editar Producto</DialogTitle>
                                                </DialogHeader>
                                                <ProductForm
                                                    productId={editingProduct}
                                                    onClose={() => setEditingProduct('')}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant='ghost' size='sm'>
                                                    <Trash2 className='h-4 w-4' />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                    >
                                                        Eliminar
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
