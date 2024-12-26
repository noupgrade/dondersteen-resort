import { useState } from 'react'

import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type GenericProductModalProps = {
    onAddToCart: (product: { name: string; price: number }) => void
}

export function GenericProductModal({ onAddToCart }: GenericProductModalProps) {
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [error, setError] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const handleAddToCart = () => {
        if (!name.trim()) {
            setError('Por favor, introduce un nombre para el producto.')
            return
        }

        const parsedPrice = parseFloat(price)
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            setError('Por favor, introduce un precio válido y positivo.')
            return
        }

        onAddToCart({ name, price: parsedPrice })
        setName('')
        setPrice('')
        setError('')
        setIsOpen(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className='bg-green-600 text-white hover:bg-green-700'>Producto Genérico</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Producto Genérico</DialogTitle>
                </DialogHeader>
                <div className='space-y-4'>
                    <div>
                        <Label htmlFor='name'>Nombre del Producto</Label>
                        <Input
                            id='name'
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder='Nombre del producto'
                        />
                    </div>
                    <div>
                        <Label htmlFor='price'>Precio (€)</Label>
                        <Input
                            id='price'
                            type='number'
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            placeholder='0.00'
                            step='0.01'
                            min='0'
                        />
                    </div>
                    {error && (
                        <Alert variant='destructive'>
                            <AlertCircle className='h-4 w-4' />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <div className='flex justify-end space-x-2'>
                        <Button variant='outline' onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAddToCart}>Añadir al Carrito</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
