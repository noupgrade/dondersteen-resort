'use client'

import { useState } from 'react'

import { Pencil, Plus, Search, Trash2 } from 'lucide-react'

import { ProductForm } from '@/components/product-form'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from '@/components/ui/use-toast'
import { useProductContext } from '@/context/ProductContext'

export function ProductList() {
    const { products, categories, deleteProduct, addCategory, deleteCategory } = useProductContext()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [editingProduct, setEditingProduct] = useState<string | null>(null)
    const [newCategoryName, setNewCategoryName] = useState('')
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const filteredProducts = products.filter(
        product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (selectedCategory === 'all' || product.category === selectedCategory),
    )

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory({ name: newCategoryName.trim() })
            setNewCategoryName('')
        }
    }

    const handleDeleteProduct = (productId: string) => {
        deleteProduct(productId)
        toast({
            title: 'Producto eliminado',
            description: 'El producto ha sido eliminado correctamente.',
        })
    }

    return (
        <div className='space-y-6'>
            <div className='flex flex-col gap-4 sm:flex-row'>
                <div className='flex flex-1 flex-col gap-4 sm:flex-row'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
                        <Input
                            placeholder='Buscar productos...'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className='w-[200px]'>
                            <SelectValue placeholder='Todas las categorías' />
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
                    <Dialog>
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
                        <DialogContent className='sm:max-w-[425px]'>
                            <DialogHeader>
                                <DialogTitle>Gestionar Categorías</DialogTitle>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <div className='flex gap-2'>
                                    <Input
                                        placeholder='Nueva categoría'
                                        value={newCategoryName}
                                        onChange={e => setNewCategoryName(e.target.value)}
                                    />
                                    <Button onClick={handleAddCategory}>Añadir</Button>
                                </div>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.map(category => (
                                            <TableRow key={category.id}>
                                                <TableCell>{category.name}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant='outline'
                                                        size='sm'
                                                        className='mr-2'
                                                        onClick={() => setEditingCategory(category)}
                                                    >
                                                        Editar
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant='outline' size='sm'>
                                                                Eliminar
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Esto eliminará
                                                                    permanentemente la categoría.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => deleteCategory(category.id)}
                                                                >
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className='overflow-hidden rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-gray-100'>
                            <TableHead className='font-bold'>Nombre</TableHead>
                            <TableHead className='font-bold'>Precio</TableHead>
                            <TableHead className='font-bold'>Categoría</TableHead>
                            <TableHead className='font-bold'>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product, index) => (
                            <TableRow key={product.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <TableCell className='font-medium'>{product.name}</TableCell>
                                <TableCell>{product.price.toFixed(2)} €</TableCell>
                                <TableCell>{product.category || 'N/A'}</TableCell>
                                <TableCell>
                                    <div className='flex space-x-2'>
                                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    size='sm'
                                                    onClick={() => {
                                                        setEditingProduct(product.id)
                                                        setIsEditDialogOpen(true)
                                                    }}
                                                >
                                                    <Pencil className='mr-1 h-4 w-4' />
                                                    Editar
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Editar Producto</DialogTitle>
                                                </DialogHeader>
                                                <ProductForm
                                                    productId={editingProduct}
                                                    onClose={() => {
                                                        setEditingProduct(null)
                                                        setIsEditDialogOpen(false)
                                                    }}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant='outline' size='sm'>
                                                    <Trash2 className='mr-1 h-4 w-4' />
                                                    Eliminar
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Esta acción no se puede deshacer. Esto eliminará permanentemente
                                                        el producto.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
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
