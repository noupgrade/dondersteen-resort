import { useDocument } from '@/shared/firebase/hooks/useDocument'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { useState, useEffect } from 'react'
import { FSDocument } from '@/shared/firebase/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

interface GlobalConfig extends FSDocument {
    highSeasonPrice: number
    standardRoomCapacity: number // Máximo de mascotas por habitación estándar
    maxPetsPerBooking: number // Máximo de mascotas por reserva
    cancellationHours: number // Horas antes para permitir cancelación sin cargo
    standardCheckInTime: string // Hora estándar de check-in
    standardCheckOutTime: string // Hora estándar de check-out
}

export default function ConfiguracionPage() {
    const { document: config, setDocument } = useDocument<GlobalConfig>({
        collectionName: 'configs',
        id: 'global_configs'
    })
    const [price, setPrice] = useState<string>('')
    const [roomCapacity, setRoomCapacity] = useState<string>('')
    const [maxPets, setMaxPets] = useState<string>('')
    const [cancellationTime, setCancellationTime] = useState<string>('')
    const [checkInTime, setCheckInTime] = useState<string>('')
    const [checkOutTime, setCheckOutTime] = useState<string>('')

    useEffect(() => {
        if (config) {
            setPrice(config.highSeasonPrice?.toString() ?? '')
            setRoomCapacity(config.standardRoomCapacity?.toString() ?? '')
            setMaxPets(config.maxPetsPerBooking?.toString() ?? '')
            setCancellationTime(config.cancellationHours?.toString() ?? '')
            setCheckInTime(config.standardCheckInTime ?? '')
            setCheckOutTime(config.standardCheckOutTime ?? '')
        }
    }, [config])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        await setDocument({
            highSeasonPrice: parseFloat(price),
            standardRoomCapacity: parseInt(roomCapacity),
            maxPetsPerBooking: parseInt(maxPets),
            cancellationHours: parseInt(cancellationTime),
            standardCheckInTime: checkInTime,
            standardCheckOutTime: checkOutTime
        })
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Configuración</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Precios y Capacidad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="highSeasonPrice" className="block text-sm font-medium text-gray-700 mb-1">
                                    Precio temporada alta (€)
                                </label>
                                <Input
                                    id="highSeasonPrice"
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    placeholder="Introduce el precio"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="roomCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                                    Capacidad máxima por habitación
                                </label>
                                <Input
                                    id="roomCapacity"
                                    type="number"
                                    value={roomCapacity}
                                    onChange={(e) => setRoomCapacity(e.target.value)}
                                    min="1"
                                    max="5"
                                    placeholder="Mascotas por habitación"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="maxPets" className="block text-sm font-medium text-gray-700 mb-1">
                                    Máximo de mascotas por reserva
                                </label>
                                <Input
                                    id="maxPets"
                                    type="number"
                                    value={maxPets}
                                    onChange={(e) => setMaxPets(e.target.value)}
                                    min="1"
                                    max="10"
                                    placeholder="Mascotas por reserva"
                                    className="w-full"
                                />
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Horarios y Políticas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora estándar de check-in
                                </label>
                                <Input
                                    id="checkInTime"
                                    type="time"
                                    value={checkInTime}
                                    onChange={(e) => setCheckInTime(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    Hora estándar de check-out
                                </label>
                                <Input
                                    id="checkOutTime"
                                    type="time"
                                    value={checkOutTime}
                                    onChange={(e) => setCheckOutTime(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label htmlFor="cancellationTime" className="block text-sm font-medium text-gray-700 mb-1">
                                    Horas mínimas para cancelación sin cargo
                                </label>
                                <Input
                                    id="cancellationTime"
                                    type="number"
                                    value={cancellationTime}
                                    onChange={(e) => setCancellationTime(e.target.value)}
                                    min="0"
                                    max="72"
                                    placeholder="Horas antes de check-in"
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Guardar cambios
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 