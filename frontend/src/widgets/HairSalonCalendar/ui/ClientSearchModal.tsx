import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Button } from '@/shared/ui/button'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

interface Client {
    id: string
    name: string
    pets: Array<{
        id: string
        name: string
        breed?: string
    }>
}

interface ClientSearchModalProps {
    isOpen: boolean
    onClose: () => void
    selectedDate: string
    selectedTime: string
}

export function ClientSearchModal({ isOpen, onClose, selectedDate, selectedTime }: ClientSearchModalProps) {
    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)
    const [selectedPetId, setSelectedPetId] = useState<string>('')

    // TODO: Replace with real API call
    const mockClients: Client[] = [
        {
            id: '1',
            name: 'John Doe',
            pets: [
                { id: 'pet1', name: 'Max', breed: 'Golden Retriever' },
                { id: 'pet2', name: 'Luna', breed: 'Poodle' }
            ]
        },
        {
            id: '2',
            name: 'Jane Smith',
            pets: [
                { id: 'pet3', name: 'Rocky', breed: 'German Shepherd' }
            ]
        }
    ]

    const filteredClients = mockClients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleClientSelect = (client: Client) => {
        setSelectedClient(client)
        // Reset pet selection when changing client
        setSelectedPetId('')
    }

    const handleNewClient = () => {
        navigate(`/peluqueria-booking?date=${selectedDate}&time=${selectedTime}`)
        onClose()
    }

    const handleContinue = () => {
        if (selectedClient) {
            const params = new URLSearchParams()
            
            params.set('userId', selectedClient.id)
            params.set('date', selectedDate)
            params.set('time', selectedTime)
            
            if (selectedPetId) {
                // Asegurarnos de que estamos usando el ID correcto de la mascota
                const selectedPet = selectedClient.pets.find(pet => pet.id === selectedPetId)
                if (selectedPet) {
                    params.set('petId', selectedPet.id)
                }
            }

            const url = `/peluqueria-booking?${params.toString()}`
            console.log('Selected Pet:', selectedClient.pets.find(pet => pet.id === selectedPetId))
            console.log('URL constructed:', url)
            console.log('All params:', Object.fromEntries(params.entries()))

            navigate(url)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Buscar Cliente</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <ScrollArea className="h-[300px] rounded-md border p-4">
                        <div className="space-y-2">
                            {filteredClients.map((client) => (
                                <div
                                    key={client.id}
                                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                        selectedClient?.id === client.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted'
                                    }`}
                                    onClick={() => handleClientSelect(client)}
                                >
                                    <div className="font-medium">{client.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {client.pets.length} {client.pets.length === 1 ? 'mascota' : 'mascotas'}
                                    </div>
                                </div>
                            ))}
                            {filteredClients.length === 0 && (
                                <div className="text-center text-muted-foreground py-4">
                                    No se encontraron clientes
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {selectedClient && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Seleccionar Mascota</label>
                            <Select 
                                value={selectedPetId} 
                                onValueChange={setSelectedPetId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una mascota" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedClient.pets.map((pet) => (
                                        <SelectItem key={pet.id} value={pet.id}>
                                            {pet.name} {pet.breed ? `(${pet.breed})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex justify-between gap-2">
                        <Button variant="outline" onClick={handleNewClient}>
                            Cliente Nuevo
                        </Button>
                        <Button onClick={handleContinue} disabled={!selectedClient}>
                            Continuar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 