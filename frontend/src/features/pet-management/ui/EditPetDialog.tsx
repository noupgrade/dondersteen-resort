import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Pet } from '@/components/ReservationContext'
import { AdditionalServices } from '@/components/additional-services'
import { AdditionalService } from '@/shared/types/additional-services'

const translations = {
    editPet: { es: 'Editar Mascota', en: 'Edit Pet' },
    name: { es: 'Nombre', en: 'Name' },
    breed: { es: 'Raza', en: 'Breed' },
    weight: { es: 'Peso', en: 'Weight' },
    size: { es: 'Tamaño', en: 'Size' },
    sex: { es: 'Sexo', en: 'Sex' },
    save: { es: 'Guardar', en: 'Save' },
    male: { es: 'Macho', en: 'Male' },
    female: { es: 'Hembra', en: 'Female' },
    small: { es: 'Pequeño', en: 'Small' },
    medium: { es: 'Mediano', en: 'Medium' },
    large: { es: 'Grande', en: 'Large' },
    neutered: { es: 'Castrado/Esterilizado', en: 'Neutered/Spayed' },
    yes: { es: 'Sí', en: 'Yes' },
    no: { es: 'No', en: 'No' }
} as const

const SIZES = ['pequeño', 'mediano', 'grande'] as const
type PetSize = typeof SIZES[number]

interface EditPetDialogProps {
    pet: Pet
    isOpen: boolean
    onClose: () => void
    onSave: (pet: Pet) => void
    language: 'es' | 'en'
}

export function EditPetDialog({ pet, isOpen, onClose, onSave, language }: EditPetDialogProps) {
    const t = (key: keyof typeof translations) => translations[key][language]

    const [editedPet, setEditedPet] = useState<Pet>({ ...pet })

    useEffect(() => {
        const weight = editedPet.weight
        let size: PetSize = 'pequeño'
        if (weight <= 10) size = 'pequeño'
        else if (weight <= 20) size = 'mediano'
        else size = 'grande'
        setEditedPet(prev => ({ ...prev, size }))
    }, [editedPet.weight])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(editedPet)
        onClose()
    }

    const handleServiceChange = (services: AdditionalService[]) => {
        setEditedPet(prev => ({ ...prev, additionalServices: services }))
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] w-[95vw] max-w-[500px] p-0">
                <form onSubmit={handleSubmit} className="h-full flex flex-col max-h-[90vh]">
                    <DialogHeader className="px-4 py-2 border-b shrink-0">
                        <DialogTitle className="text-base font-medium">
                            {t('editPet')}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">
                        <div className="px-4 py-3 space-y-4">
                            <div>
                                <label className="text-sm font-medium">{t('name')}</label>
                                <Input
                                    value={editedPet.name}
                                    onChange={e => setEditedPet(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">{t('breed')}</label>
                                <Input
                                    value={editedPet.breed}
                                    onChange={e => setEditedPet(prev => ({ ...prev, breed: e.target.value }))}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">{t('weight')} (kg)</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={editedPet.weight}
                                        onChange={e => setEditedPet(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">{t('size')}</label>
                                    <Select
                                        value={editedPet.size}
                                        onValueChange={(value: PetSize) => setEditedPet(prev => ({ ...prev, size: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SIZES.map(size => (
                                                <SelectItem key={size} value={size}>
                                                    {t(size === 'pequeño' ? 'small' : size === 'mediano' ? 'medium' : 'large')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">{t('sex')}</label>
                                <Select
                                    value={editedPet.sex || 'M'}
                                    onValueChange={(value: 'M' | 'F') => setEditedPet(prev => ({ ...prev, sex: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="M">{t('male')}</SelectItem>
                                        <SelectItem value="F">{t('female')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">{t('neutered')}</label>
                                <Select
                                    value={editedPet.isNeutered ? 'yes' : 'no'}
                                    onValueChange={(value: 'yes' | 'no') => setEditedPet(prev => ({ ...prev, isNeutered: value === 'yes' }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="yes">{t('yes')}</SelectItem>
                                        <SelectItem value="no">{t('no')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pb-4">
                                <AdditionalServices
                                    onServiceChange={handleServiceChange}
                                    petCount={1}
                                    initialServices={editedPet.additionalServices || []}
                                    hideDriverService
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t shrink-0">
                        <Button type="submit" className="w-full">
                            {t('save')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 