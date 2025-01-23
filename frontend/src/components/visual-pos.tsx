import { useEffect, useState, useMemo } from 'react'

import { Minus, Plus, Search, ShoppingCart } from 'lucide-react'

import { useProductContext } from '@/components/ProductContext'
import { useReservation } from '@/components/ReservationContext'
import { GenericProductModal } from '@/components/generic-product-modal'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/shared/auth'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'
import { Separator } from '@/shared/ui/separator'

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
        products: [
            {
                id: 'prod_1',
                name: 'Champú Premium',
                quantity: 2,
                price: 15.99,
                isGeneric: false
            },
            {
                id: 'generic_1',
                name: 'Corte de uñas',
                quantity: 1,
                price: 10.00,
                isGeneric: true
            }
        ]
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
        products: []
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
        products: []
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
    const { user } = useAuth()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedReservation, setSelectedReservation] = useState<any | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const { toast } = useToast()

    // Obtener el empleado seleccionado del sessionStorage
    const selectedEmployee = JSON.parse(sessionStorage.getItem('selectedEmployee') || '{}')

    const filteredProducts = selectedCategory
        ? products.filter(product => product.category === selectedCategory)
        : products

    // Obtener productos previamente agregados a la reserva
    const existingProducts = useMemo(() => {
        if (!selectedReservation) return []

        // Asegurarnos de que products existe y es un array
        const products = selectedReservation.products || []
        console.log('Reserva seleccionada:', {
            id: selectedReservation.id,
            client: selectedReservation.client.name,
            products: products
        })

        return products
    }, [selectedReservation])

    // Combinar productos existentes con el carrito actual para el conteo
    const productCount = useMemo(() => {
        const counts: { [key: string]: number } = {}

        // Contar productos existentes
        existingProducts.forEach((product: any) => {
            console.log('Procesando producto existente:', product)
            const productId = product.id || product.productId
            if (productId && product.quantity) {
                counts[productId] = (counts[productId] || 0) + product.quantity
                console.log(`Contador actualizado para ${productId}:`, counts[productId])
            }
        })

        // Añadir productos del carrito actual
        cart.forEach(item => {
            if (!item.isGeneric && item.product.id) {
                counts[item.product.id] = (counts[item.product.id] || 0) + item.quantity
            }
        })

        console.log('Conteo final de productos:', counts)
        return counts
    }, [existingProducts, cart])

    // Efecto para monitorear cambios en la reserva seleccionada
    useEffect(() => {
        if (selectedReservation) {
            console.log('Reserva seleccionada actualizada:', {
                id: selectedReservation.id,
                products: selectedReservation.products
            })
        }
    }, [selectedReservation])

    const addToCart = (product: any, isGeneric: boolean = false) => {
        if (!selectedReservation) {
            toast({
                title: 'Error',
                description: 'Por favor, selecciona una reserva antes de añadir productos',
                variant: 'destructive'
            })
            return
        }

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
        if (selectedReservation && cart.length > 0) {
            const totalPrice = getTotalPrice()
            const newSales = cart.map(item => ({
                productId: item.isGeneric ? 'generic' : item.product.id,
                productName: item.product.name,
                price: item.product.price * item.quantity,
                clientName: selectedReservation.client.name,
                reservationId: selectedReservation.id,
                userId: user?.uid || '',
                userName: user?.displayName || 'Usuario desconocido',
                employeeId: selectedEmployee.id || '',
                employeeName: selectedEmployee.name || 'Empleado desconocido'
            }))

            newSales.forEach(sale => {
                addSale(sale)
            })

            // Asegurarnos de que los productos existentes se mantienen
            const updatedProducts = [
                ...(selectedReservation.products || []),
                ...cart.map(item => ({
                    id: item.isGeneric ? 'generic' : item.product.id,
                    productId: item.isGeneric ? 'generic' : item.product.id, // Añadir ambos formatos
                    name: item.product.name,
                    quantity: item.quantity,
                    price: item.product.price,
                    isGeneric: item.isGeneric,
                })),
            ]

            const updatedReservation = {
                ...selectedReservation,
                products: updatedProducts,
                totalPrice: (selectedReservation.totalPrice || 0) + totalPrice,
            }

            console.log('Actualizando reserva con:', updatedReservation)
            updateReservation(selectedReservation.id, updatedReservation)

            setCart([])
            setSelectedReservation(null)
            toast({
                title: 'Productos agregados',
                description: `Se han agregado ${cart.length} productos a la reserva de ${selectedReservation.client.name} por un total de ${totalPrice.toFixed(2)} €`,
            })
        }
    }

    const filteredReservations = mockReservations.filter(r => {
        const searchLower = searchQuery.toLowerCase()
        return (
            r.client.name.toLowerCase().includes(searchLower) ||
            r.pet.name.toLowerCase().includes(searchLower) ||
            r.pet.breed.toLowerCase().includes(searchLower)
        )
    })

    return (
        <div className='flex gap-6 h-full'>
            {/* Panel izquierdo: Búsqueda y productos */}
            <div className='flex-1'>
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
                                        className={`cursor-pointer rounded-md p-2 transition-colors hover:bg-gray-50 ${selectedReservation?.id === reservation.id ? 'bg-blue-50' : ''
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
                <Card className={!selectedReservation ? 'opacity-50 pointer-events-none mt-6' : 'mt-6'}>
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
                            {filteredProducts.map(product => {
                                const count = productCount[product.id] || 0
                                return (
                                    <Card
                                        key={product.id}
                                        className='cursor-pointer transition-shadow hover:shadow-md relative'
                                        onClick={() => addToCart(product)}
                                    >
                                        <CardContent className='flex h-full flex-col items-center justify-center p-4'>
                                            <h3 className='text-center font-bold'>{product.name}</h3>
                                            <p className='mt-2 text-lg font-semibold'>{product.price.toFixed(2)} €</p>
                                            {count > 0 && (
                                                <Badge
                                                    variant="secondary"
                                                    className="absolute top-2 right-2 bg-blue-100 text-blue-700 font-bold"
                                                >
                                                    {count}
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Panel derecho: Carrito y productos existentes */}
            <div className='w-[300px]'>
                <Card className='h-full'>
                    <CardHeader className='border-b'>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='flex items-center'>
                                <ShoppingCart className='mr-2' />
                                Resumen del pedido
                            </CardTitle>
                            {selectedReservation && (
                                <p className='text-sm text-gray-600'>{selectedReservation.client.name}</p>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className='p-4 space-y-4'>
                        {/* Productos existentes */}
                        {existingProducts.length > 0 && (
                            <div className='space-y-2'>
                                <h3 className='font-medium text-sm text-muted-foreground'>Productos existentes</h3>
                                {existingProducts.map((item: any, index: number) => (
                                    <div key={`existing-${index}`} className='rounded-lg bg-muted/50 p-3'>
                                        <div className='flex justify-between items-center'>
                                            <div>
                                                <span className='font-medium'>
                                                    {item.isGeneric ? `Producto Genérico: ${item.name}` : item.name}
                                                </span>
                                                <p className='text-sm text-muted-foreground'>
                                                    {(item.price * item.quantity).toFixed(2)} €
                                                </p>
                                            </div>
                                            <span className='text-sm font-medium'>x{item.quantity}</span>
                                        </div>
                                    </div>
                                ))}
                                <Separator className='my-4' />
                            </div>
                        )}

                        {/* Carrito actual */}
                        {cart.map((item, index) => (
                            <div key={index} className='rounded-lg bg-gray-50 p-3'>
                                <div className='flex items-center justify-between'>
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
                            </div>
                        ))}
                    </CardContent>

                    {cart.length > 0 && (
                        <div className='border-t p-4 space-y-4'>
                            <div className='flex justify-between'>
                                <span className='text-lg font-bold'>Total:</span>
                                <span className='text-lg font-bold'>{getTotalPrice().toFixed(2)} €</span>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className='w-full bg-green-600 hover:bg-green-700'>
                                        Confirmar Pedido
                                    </Button>
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
                                        <AlertDialogAction onClick={handleConfirmProducts}>
                                            Confirmar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
