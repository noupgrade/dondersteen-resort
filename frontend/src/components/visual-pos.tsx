import { useEffect, useState } from 'react'

import { Minus, Plus, Search, ShoppingCart } from 'lucide-react'

import { useProductContext } from '@/components/ProductContext'
import { useReservation } from '@/components/ReservationContext'
import { GenericProductModal } from '@/components/generic-product-modal'
import { toast } from '@/hooks/use-toast'
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
import { Card, CardContent } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'

// Mock data for testing
const mockReservations = [
    {
        id: 'RES001',
        client: {
            id: 'CLI001',
            name: 'Juan Pérez',
        },
        pet: {
            name: 'Luna',
            breed: 'Golden Retriever',
        },
        date: '2024-01-20',
        totalPrice: 50,
    },
    {
        id: 'RES002',
        client: {
            id: 'CLI002',
            name: 'María García',
        },
        pet: {
            name: 'Rocky',
            breed: 'Pastor Alemán',
        },
        date: '2024-01-21',
        totalPrice: 75,
    },
    {
        id: 'RES003',
        client: {
            id: 'CLI003',
            name: 'Ana Martínez',
        },
        pet: {
            name: 'Milo',
            breed: 'Yorkshire Terrier',
        },
        date: '2024-01-22',
        totalPrice: 60,
    },
]

const categoryIcons: { [key: string]: string } = {
    Juguetes: '🧸',
    Alimentos: '🥗',
    Accesorios: '🎀',
}

type CartItem = {
    product: any
    quantity: number
    isGeneric?: boolean
}

export function VisualPOS() {
    const { products, categories, addSale } = useProductContext()
    const { reservations, updateReservation } = useReservation()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedReservation, setSelectedReservation] = useState<any | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    const filteredProducts = selectedCategory
        ? products.filter(product => product.category === selectedCategory)
        : products

    const addToCart = (product: any, isGeneric: boolean = false) => {
        const existingItem = cart.find(item =>
            isGeneric ? item.isGeneric && item.product.name === product.name : item.product.id === product.id,
        )
        if (existingItem) {
            setCart(
                cart.map(item =>
                    (isGeneric ? item.isGeneric && item.product.name === product.name : item.product.id === product.id)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            )
        } else {
            setCart([...cart, { product, quantity: 1, isGeneric }])
        }
    }

    const removeFromCart = (index: number) => {
        setCart(cart.filter((_, i) => i !== index))
    }

    const updateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity === 0) {
            removeFromCart(index)
        } else {
            setCart(cart.map((item, i) => (i === index ? { ...item, quantity: newQuantity } : item)))
        }
    }

    const getTotalPrice = () => {
        return cart.reduce((total, item) => total + item.product.price * item.quantity, 0)
    }

    const handleConfirmProducts = () => {
        console.log('handleConfirmProducts called')
        console.log('Selected Reservation:', selectedReservation)
        console.log('Cart:', cart)
        if (selectedReservation && cart.length > 0) {
            const totalPrice = getTotalPrice()
            const newSales = cart.map(item => ({
                date: new Date().toISOString(),
                productId: item.isGeneric ? 'generic' : item.product.id,
                productName: item.product.name,
                price: item.product.price * item.quantity,
                clientName: selectedReservation.client.name,
                reservationId: selectedReservation.id,
            }))

            console.log('New sales to be added:', newSales)

            // Agregar nuevas ventas
            newSales.forEach(sale => {
                console.log('Adding sale:', sale)
                addSale(sale)
            })

            // Actualizar la reserva con los nuevos productos
            const updatedReservation = {
                ...selectedReservation,
                products: [
                    ...(selectedReservation.products || []),
                    ...cart.map(item => ({
                        id: item.isGeneric ? 'generic' : item.product.id,
                        name: item.product.name,
                        quantity: item.quantity,
                        price: item.product.price,
                        isGeneric: item.isGeneric,
                    })),
                ],
                totalPrice: (selectedReservation.totalPrice || 0) + totalPrice,
            }

            console.log('Updating reservation:', updatedReservation)
            updateReservation(selectedReservation.id, updatedReservation)

            setCart([])
            toast({
                title: 'Productos agregados',
                description: `Se han agregado ${cart.length} productos a la reserva de ${selectedReservation.client.name} por un total de ${totalPrice.toFixed(2)} €.`,
            })

            // Forzar una actualización del estado de las reservaciones
            setTimeout(() => {
                console.log('Current reservation state after update:', reservations)
            }, 0)
        } else {
            console.log('Cannot confirm products:', { selectedReservation, cartLength: cart.length })
            console.error('Error: No se puede confirmar la compra')
            toast({
                title: 'Error',
                description: 'Por favor, selecciona una reserva y agrega productos al carrito antes de confirmar.',
                variant: 'destructive',
            })
        }
    }

    console.log('Current reservation state:', reservations)

    const filteredReservations = mockReservations.filter(r => {
        const searchLower = searchQuery.toLowerCase()
        return (
            r.client.name.toLowerCase().includes(searchLower) ||
            r.pet.name.toLowerCase().includes(searchLower) ||
            r.pet.breed.toLowerCase().includes(searchLower)
        )
    })

    useEffect(() => {
        console.log('Reservations updated:', reservations)
    }, [reservations])

    return (
        <div className='mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8'>
            {/* Card 1: Búsqueda y selección de reserva */}
            <Card>
                <CardContent className='p-6'>
                    <h2 className='mb-4 text-xl font-semibold'>Búsqueda y selección de reserva</h2>
                    <div className='relative'>
                        <Search className='absolute left-2 top-1/2 -translate-y-1/2 transform text-gray-400' />
                        <Input
                            placeholder='Buscar por cliente o mascota...'
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className='w-full pl-10'
                        />
                    </div>

                    {searchQuery && (
                        <div className='mt-4 rounded-md border bg-white p-2 shadow-sm'>
                            {filteredReservations.map(reservation => (
                                <div
                                    key={reservation.id}
                                    className={`cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-50 ${
                                        selectedReservation?.id === reservation.id ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => {
                                        setSelectedReservation(reservation)
                                        setSearchQuery('')
                                    }}
                                >
                                    <div className='flex flex-col items-start'>
                                        <span className='font-medium'>{reservation.client.name}</span>
                                        <span className='text-sm text-gray-600'>
                                            Mascota: {reservation.pet.name} • {reservation.pet.breed}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {selectedReservation && (
                        <div className='mt-4 rounded-lg bg-gray-50 p-4'>
                            <h3 className='font-medium'>Reserva seleccionada:</h3>
                            <p className='text-sm text-gray-600'>
                                Cliente: {selectedReservation.client.name}
                                <br />
                                Mascota: {selectedReservation.pet.name} ({selectedReservation.pet.breed})
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Card 2: Selección y filtrado de productos */}
            <Card>
                <CardContent className='p-6'>
                    <div className='mb-6 flex items-center justify-between'>
                        <h2 className='text-xl font-semibold'>Productos</h2>
                        <GenericProductModal onAddToCart={product => addToCart(product, true)} />
                    </div>

                    <div className='mb-6 flex flex-wrap gap-2'>
                        <Button
                            variant={selectedCategory === null ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(null)}
                            className='whitespace-nowrap px-4 py-2 text-base'
                        >
                            Todos
                        </Button>
                        {categories.map(category => (
                            <Button
                                key={category.id}
                                variant={selectedCategory === category.name ? 'default' : 'outline'}
                                onClick={() => setSelectedCategory(category.name)}
                                className='whitespace-nowrap px-4 py-2 text-base'
                            >
                                {categoryIcons[category.name] || '📦'} {category.name}
                            </Button>
                        ))}
                    </div>

                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'>
                        {filteredProducts.map(product => (
                            <Card
                                key={product.id}
                                className='cursor-pointer transition-shadow hover:shadow-md'
                                onClick={() => addToCart(product)}
                            >
                                <CardContent className='flex h-full flex-col items-center justify-center p-4'>
                                    <h3 className='text-center font-bold'>{product.name}</h3>
                                    <p className='mt-2 text-lg font-semibold'>{product.price.toFixed(2)} €</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Card 3: Resumen del pedido */}
            <Card>
                <CardContent className='p-6'>
                    <div className='flex items-center justify-between'>
                        <h2 className='flex items-center text-xl font-semibold'>
                            <ShoppingCart className='mr-2' />
                            Resumen del pedido
                        </h2>
                        {selectedReservation && (
                            <p className='text-sm text-gray-600'>Cliente: {selectedReservation.client.name}</p>
                        )}
                    </div>

                    <div className='mt-4 space-y-4'>
                        {cart.map((item, index) => (
                            <div key={index} className='flex items-center justify-between rounded-lg bg-gray-50 p-3'>
                                <div className='flex-1'>
                                    <span className='font-medium'>
                                        {item.isGeneric ? `Producto Genérico: ${item.product.name}` : item.product.name}
                                    </span>
                                    <p className='text-sm text-gray-600'>
                                        {(item.product.price * item.quantity).toFixed(2)} €
                                    </p>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                    >
                                        <Minus className='h-4 w-4' />
                                    </Button>
                                    <span className='w-8 text-center'>{item.quantity}</span>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                    >
                                        <Plus className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {cart.length > 0 && (
                        <div className='mt-6 flex flex-col gap-4'>
                            <div className='flex justify-between border-t pt-4'>
                                <span className='text-lg font-bold'>Total:</span>
                                <span className='text-lg font-bold'>{getTotalPrice().toFixed(2)} €</span>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className='w-full bg-green-600 hover:bg-green-700'>Confirmar Pedido</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Confirmar pedido?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Esta acción agregará los productos seleccionados a la reserva.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleConfirmProducts}>Confirmar</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
