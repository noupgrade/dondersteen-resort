import { useState } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
    Calendar,
    Clock,
    Euro,
    Camera,
    X,
    Save,
    Hotel,
    Users,
    Trash2
} from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Badge } from '@/shared/ui/badge'
import { HairSalonReservation } from '@/components/ReservationContext'
import { cn } from '@/shared/lib/styles/class-merge'
import { HairdressingServiceType } from '@/shared/types/additional-services'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { DatePicker } from '@/shared/ui/date-picker'

interface HairSalonReservationModalProps {
    reservation: HairSalonReservation
    isOpen: boolean
    onClose: () => void
    onSave: (updatedReservation: HairSalonReservation) => void
    onDelete?: (reservation: HairSalonReservation) => void
}

const getServiceLabel = (service: HairdressingServiceType) => {
    switch (service) {
        case 'bath_and_brush':
            return 'Baño y cepillado'
        case 'bath_and_trim':
            return 'Baño y corte'
        case 'stripping':
            return 'Stripping'
        case 'deshedding':
            return 'Deslanado'
        case 'brushing':
            return 'Cepillado'
        case 'spa':
            return 'Spa'
        case 'spa_ozone':
            return 'Spa con ozono'
        default:
            return service
    }
}

const durationOptions = Array.from({ length: 12 }, (_, i) => (i + 1) * 15)

export function HairSalonReservationModal({ 
    reservation,
    isOpen,
    onClose,
    onSave,
    onDelete
}: HairSalonReservationModalProps) {
    const [duration, setDuration] = useState(reservation.duration?.toString() || '60')
    const [price, setPrice] = useState(reservation.precioEstimado?.toString() || '')
    const [resultImage, setResultImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(reservation.date))

    // Find the hairdressing service and get its services array
    const hairdressingService = reservation.additionalServices.find(service => 
        typeof service === 'object' && service.type === 'hairdressing'
    )
    const services = hairdressingService?.services as HairdressingServiceType[] || []

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setResultImage(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleSave = () => {
        const updatedReservation = {
            ...reservation,
            date: format(selectedDate, 'yyyy-MM-dd'),
            duration: parseInt(duration),
            precioEstimado: parseFloat(price),
            resultImage: resultImage ? URL.createObjectURL(resultImage) : undefined
        }
        onSave(updatedReservation)
        onClose()
    }

    const handleDelete = () => {
        if (onDelete) {
            onDelete(reservation)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[60%]">
                <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                        <DialogTitle>Detalles de la Cita</DialogTitle>
                        <Badge 
                            variant="outline" 
                            className={cn(
                                "ml-2",
                                reservation.source === 'hotel' ? "bg-emerald-50 text-emerald-700" : "bg-violet-50 text-violet-700"
                            )}
                        >
                            <div className="flex items-center gap-1.5">
                                {reservation.source === 'hotel' ? (
                                    <Hotel className="h-3 w-3" />
                                ) : (
                                    <Users className="h-3 w-3" />
                                )}
                                {reservation.source === 'hotel' ? 'Hotel' : 'Externo'}
                            </div>
                        </Badge>
                    </div>
                    <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDelete}
                        className="flex items-center gap-1.5"
                    >
                        <Trash2 className="h-4 w-4" />
                        Eliminar Cita
                    </Button>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Client and Pet Info */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-lg">{reservation.pet.name}</h3>
                                <p className="text-sm text-muted-foreground">{reservation.pet.breed}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{reservation.client.name}</p>
                                <p className="text-sm text-muted-foreground">{reservation.client.phone}</p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Fecha</Label>
                                <DatePicker
                                    date={selectedDate}
                                    onSelect={(date) => date && setSelectedDate(date)}
                                />
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{reservation.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* Services */}
                    {services.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {services.map((service, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className="shadow-sm bg-gray-100/80 text-gray-700"
                                >
                                    {getServiceLabel(service)}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Duration and Price */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">Duración (minutos)</Label>
                            <Select value={duration} onValueChange={setDuration}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona la duración" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[200px]">
                                    {durationOptions.map((mins) => (
                                        <SelectItem key={mins} value={mins.toString()}>
                                            {mins} minutos
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Precio (€)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Result Image */}
                    <div className="space-y-4">
                        <Label>Foto del Resultado</Label>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => document.getElementById('image-upload')?.click()}
                                className="flex items-center gap-2"
                            >
                                <Camera className="h-4 w-4" />
                                Subir Foto
                            </Button>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>
                        {previewUrl && (
                            <div className="relative w-48 h-48">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-md"
                                />
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2"
                                    onClick={() => {
                                        setResultImage(null)
                                        setPreviewUrl(null)
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 