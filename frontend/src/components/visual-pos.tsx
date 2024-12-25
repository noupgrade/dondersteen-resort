import { useEffect, useState } from 'react'

import { Check, Minus, Plus, Search, ShoppingCart } from 'lucide-react'

import { useReservation } from '@/components/ReservationContext'
import { GenericProductModal } from '@/components/generic-product-modal'
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
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { useProductContext } from '@/components/ProductContext'

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
    const [reservationSearch, setReservationSearch] = useState('')

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

    const filteredReservations = reservations.filter(
        r => r.client.name.toLowerCase().includes(reservationSearch.toLowerCase()) || r.id.includes(reservationSearch),
    )

    useEffect(() => {
        console.log('Reservations updated:', reservations)
    }, [reservations])

    return (
        <div className='mx-auto flex h-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8'>
            {/* Client Selection */}
            <div className='mb-4 w-full'>
                <div className='relative'>
                    <Search className='absolute left-2 top-1/2 -translate-y-1/2 transform text-gray-400' />
                    <Input
                        placeholder='Buscar reserva por cliente o ID'
                        value={reservationSearch}
                        onChange={e => setReservationSearch(e.target.value)}
                        className='w-full pl-10'
                    />
                </div>
                {reservationSearch && (
                    <div className='mt-2 max-h-40 overflow-y-auto rounded-md border bg-white shadow-lg'>
                        {filteredReservations.map(reservation => (
                            <Button
                                key={reservation.id}
                                variant={selectedReservation?.id === reservation.id ? 'default' : 'ghost'}
                                className='w-full justify-start text-left'
                                onClick={() => setSelectedReservation(reservation)}
                            >
                                {reservation.client.name} - {reservation.id}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Categories and Products */}
            <div className='flex-grow overflow-hidden'>
                <div className='mb-4 flex touch-pan-x flex-wrap gap-2 pb-2'>
                    <Button
                        variant={selectedCategory === null ? 'default' : 'outline'}
                        onClick={() => setSelectedCategory(null)}
                        className='whitespace-nowrap px-4 py-2 text-base sm:px-6 sm:py-3 sm:text-lg'
                    >
                        Todos
                    </Button>
                    {categories.map(category => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.name ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(category.name)}
                            className='whitespace-nowrap px-4 py-2 text-base sm:px-6 sm:py-3 sm:text-lg'
                        >
                            {categoryIcons[category.name] || '📦'} {category.name}
                        </Button>
                    ))}
                    <GenericProductModal
                        onAddToCart={product => addToCart(product, true)}
                        className='whitespace-nowrap border-2 border-primary px-6 py-3 text-lg'
                    />
                </div>

                <div className='grid max-h-[calc(100vh-350px)] touch-pan-y grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
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
            </div>

            {/* Cart */}
            <Card className='mt-4 lg:mx-auto lg:max-w-md'>
                <CardContent className='p-4'>
                    <h3 className='mb-4 flex items-center font-bold'>
                        <ShoppingCart className='mr-2' />
                        Carrito
                    </h3>
                    <div className='max-h-40 overflow-y-auto'>
                        {cart.map((item, index) => (
                            <div
                                key={index}
                                className='mb-4 flex flex-col items-start justify-between sm:mb-2 sm:flex-row sm:items-center'
                            >
                                <span className='font-medium'>
                                    {item.isGeneric ? `Producto Genérico: ${item.product.name}` : item.product.name}
                                </span>
                                <div className='flex items-center'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 sm:h-10 sm:w-10'
                                        onClick={() => updateQuantity(index, item.quantity - 1)}
                                    >
                                        <Minus className='h-4 w-4' />
                                    </Button>
                                    <span className='mx-2'>{item.quantity}</span>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        className='h-8 w-8 sm:h-10 sm:w-10'
                                        onClick={() => updateQuantity(index, item.quantity + 1)}
                                    >
                                        <Plus className='h-4 w-4' />
                                    </Button>
                                    <span className='ml-4 font-semibold'>
                                        {(item.product.price * item.quantity).toFixed(2)} €
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='mt-4 text-right text-xl font-bold'>Total: {getTotalPrice().toFixed(2)} €</div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                className='mt-4 w-full bg-green-500 py-3 text-lg text-white hover:bg-green-600'
                                disabled={!selectedReservation || cart.length === 0}
                            >
                                <Check className='mr-2 h-4 w-4' />
                                Confirmar Productos
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Confirmar la compra?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción añadirá los productos seleccionados a la reserva y registrará la venta.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => {
                                        console.log('Confirm button clicked')
                                        handleConfirmProducts()
                                    }}
                                >
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    )
}
