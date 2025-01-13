import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { PawPrint, Pencil, Trash2, User2 } from 'lucide-react'
import { useState } from 'react'
import { Pet } from './ReservationContext'
import { EditPetDialog } from '@/features/pet-management/ui/EditPetDialog'

const translations = {
    breed: { es: 'Raza', en: 'Breed' },
    weight: { es: 'Peso', en: 'Weight' },
    size: { es: 'Tamaño', en: 'Size' },
    sex: { es: 'Sexo', en: 'Sex' },
    edit: { es: 'Editar', en: 'Edit' },
    delete: { es: 'Eliminar', en: 'Delete' },
    pequeño: { es: 'Pequeño', en: 'Small' },
    mediano: { es: 'Mediano', en: 'Medium' },
    grande: { es: 'Grande', en: 'Large' },
    kg: { es: 'kg', en: 'kg' },
    male: { es: 'Macho', en: 'Male' },
    female: { es: 'Hembra', en: 'Female' },
    editPet: { es: 'Editar Mascota', en: 'Edit Pet' },
    deletePet: { es: 'Eliminar Mascota', en: 'Delete Pet' },
    confirmDelete: {
        es: '¿Estás seguro de que quieres eliminar esta mascota?',
        en: 'Are you sure you want to delete this pet?'
    },
    yes: { es: 'Sí', en: 'Yes' },
    no: { es: 'No', en: 'No' }
} as const

interface PetCardProps {
    pet: Pet
    language: 'es' | 'en'
    onSave?: (pet: Pet) => void
    onDelete?: () => void
}

export const PetCard = ({ pet, language, onSave, onDelete }: PetCardProps) => {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

    const t = (key: keyof typeof translations) => translations[key][language]

    const translateSize = (size: Pet['size']) => {
        return t(size)
    }

    const translateSex = (sex: 'M' | 'F') => {
        return sex === 'M' ? t('male') : t('female')
    }

    const handleSave = (editedPet: Pet) => {
        onSave?.(editedPet)
    }

    const handleDelete = () => {
        onDelete?.()
        setIsDeleteDialogOpen(false)
    }

    return (
        <Card className='bg-gray-50 shadow-md transition-shadow hover:shadow-lg w-full'>
            <CardContent className='p-3 sm:p-4'>
                <h3 className='mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-blue-600'>{pet.name}</h3>

                <div className='grid grid-cols-1 gap-3 sm:gap-4 text-sm'>
                    <div className='space-y-2 sm:space-y-3'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <PawPrint className='h-4 w-4 text-blue-500 shrink-0' />
                                <span className='font-semibold'>
                                    {t('breed')} / {t('size')}:
                                </span>
                            </div>
                            <span className='pl-5 sm:pl-0'>
                                {pet.breed} | {translateSize(pet.size)}
                            </span>
                        </div>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <User2 className='h-4 w-4 text-blue-500 shrink-0' />
                                <span className='font-semibold'>
                                    {t('sex')} / {t('weight')}:
                                </span>
                            </div>
                            <span className='pl-5 sm:pl-0'>
                                {translateSex(pet.sex || 'M')} | {pet.weight} {t('kg')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='mt-4 sm:mt-6 flex flex-col gap-2'>
                    <Button
                        onClick={() => setIsEditDialogOpen(true)}
                        size='sm'
                        className='w-full bg-blue-500 text-white hover:bg-blue-600'
                    >
                        <Pencil className='mr-1 h-4 w-4' />
                        {t('editPet')}
                    </Button>
                    <Button
                        variant='destructive'
                        size='sm'
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className='w-full'
                    >
                        <Trash2 className='mr-1 h-4 w-4' />
                        {t('deletePet')}
                    </Button>
                </div>
            </CardContent>

            <EditPetDialog
                pet={pet}
                isOpen={isEditDialogOpen}
                onClose={() => setIsEditDialogOpen(false)}
                onSave={handleSave}
                language={language}
            />

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className='w-[95vw] max-w-[425px] p-4 sm:p-6'>
                    <DialogHeader>
                        <DialogTitle>{t('deletePet')}</DialogTitle>
                    </DialogHeader>
                    <p className='py-2'>{t('confirmDelete')}</p>
                    <div className='mt-4 flex flex-col gap-2'>
                        <Button className='w-full' variant='destructive' onClick={handleDelete}>
                            {t('yes')}
                        </Button>
                        <Button className='w-full' variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
                            {t('no')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
