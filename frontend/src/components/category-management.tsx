import { useState } from 'react'

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
} from '@/shared/ui/alert-dialog'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function CategoryManagement() {
    const { categories, addCategory, updateCategory, deleteCategory } = useProductContext()
    const [newCategoryName, setNewCategoryName] = useState('')
    const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null)

    const handleAddCategory = () => {
        if (newCategoryName.trim()) {
            addCategory({ name: newCategoryName.trim() })
            setNewCategoryName('')
        }
    }

    const handleUpdateCategory = () => {
        if (editingCategory && editingCategory.name.trim()) {
            updateCategory(editingCategory.id, { name: editingCategory.name.trim() })
            setEditingCategory(null)
        }
    }

    return (
        <div className='space-y-4'>
            <div className='flex gap-2'>
                <Input
                    placeholder='Nueva categoría'
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    className='max-w-xs'
                />
                <Button onClick={handleAddCategory}>Añadir Categoría</Button>
            </div>
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre de la Categoría</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map(category => (
                            <TableRow key={category.id}>
                                <TableCell>{category.name}</TableCell>
                                <TableCell>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant='outline' className='mr-2'>
                                                Editar
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Editar Categoría</DialogTitle>
                                            </DialogHeader>
                                            <Input
                                                value={editingCategory?.name || category.name}
                                                onChange={e =>
                                                    setEditingCategory({ id: category.id, name: e.target.value })
                                                }
                                            />
                                            <Button onClick={handleUpdateCategory}>Guardar Cambios</Button>
                                        </DialogContent>
                                    </Dialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant='destructive'>Eliminar</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente la
                                                    categoría.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteCategory(category.id)}>
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
        </div>
    )
}
