import { useState } from 'react'

import { CircleDot, MessageCircle, PawPrintIcon, Pencil, Pill, Trash2, User2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'

const translations = {
    name: { es: 'Nombre', en: 'Name' },
    breed: { es: 'Raza', en: 'Breed' },
    age: { es: 'Edad', en: 'Age' },
    gender: { es: 'Género', en: 'Gender' },
    food: { es: 'Alimentación', en: 'Food' },
    medication: { es: 'Medicación', en: 'Medication' },
    habits: { es: 'Hábitos', en: 'Habits' },
    personality: { es: 'Personalidad', en: 'Personality' },
    comments: { es: 'Comentarios', en: 'Comments' },
    editPet: { es: 'Editar Mascota', en: 'Edit Pet' },
    deletePet: { es: 'Eliminar Mascota', en: 'Delete Pet' },
    save: { es: 'Guardar', en: 'Save' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
    confirmDelete: {
        es: '¿Estás seguro de que quieres eliminar esta mascota?',
        en: 'Are you sure you want to delete this pet?',
    },
    yes: { es: 'Sí', en: 'Yes' },
    no: { es: 'No', en: 'No' },
    years: { es: 'años', en: 'years' },
}

type PetCardProps = {
    pet: {
        id: number
        name: string
        breed: string
        age: number
        gender: string
        food: string
        medication: string
        habits: string
        personality: string
        comments: string
    }
    language: 'es' | 'en'
}

export function PetCard({ pet, language }: PetCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editedPet, setEditedPet] = useState(pet)

    const t = (key: string): string => {
        return translations[key]?.[language] || key
    }

    const handleSave = () => {
        // Logic to save the edited pet
        console.log('Saving edited pet', editedPet)
        setIsEditDialogOpen(false)
    }

    const handleDelete = () => {
        // Logic to delete the pet
        console.log('Deleting pet', pet.id)
        setIsDeleteDialogOpen(false)
    }

    return (
        <Card className='bg-gray-50 shadow-md transition-shadow hover:shadow-lg'>
            <CardContent className='p-4'>
                <h3 className='mb-3 text-xl font-bold text-blue-600'>{pet.name}</h3>

                <div className='grid grid-cols-1 gap-3 text-sm md:grid-cols-2'>
                    <div className='space-y-2'>
                        <div className='flex items-center'>
                            <PawPrintIcon className='mr-2 h-4 w-4 text-blue-500' />
                            <span>
                                {pet.breed} | {pet.age} {t('years')}
                            </span>
                        </div>
                        <div className='flex items-center'>
                            <User2 className='mr-2 h-4 w-4 text-blue-500' />
                            <span>
                                {pet.gender} | {pet.food}
                            </span>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <div className='flex items-start'>
                            <Pill className='mr-2 mt-1 h-4 w-4 text-red-500' />
                            <span>{pet.medication || 'N/A'}</span>
                        </div>
                        <div className='flex items-start'>
                            <CircleDot className='mr-2 mt-1 h-4 w-4 text-purple-500' />
                            <span>{pet.habits}</span>
                        </div>
                        <div className='flex items-start'>
                            <CircleDot className='mr-2 mt-1 h-4 w-4 text-yellow-500' />
                            <span>{pet.personality}</span>
                        </div>
                        <div className='flex items-start'>
                            <MessageCircle className='mr-2 mt-1 h-4 w-4 text-gray-500' />
                            <span>{pet.comments}</span>
                        </div>
                    </div>
                </div>

                <div className='mt-4 flex justify-end space-x-2'>
                    <Button
                        onClick={() => setIsEditDialogOpen(true)}
                        size='sm'
                        className='bg-blue-500 text-white hover:bg-blue-600'
                    >
                        <Pencil className='mr-1 h-4 w-4' />
                        {t('editPet')}
                    </Button>
                    <Button variant='destructive' size='sm' onClick={() => setIsDeleteDialogOpen(true)}>
                        <Trash2 className='mr-1 h-4 w-4' />
                        {t('deletePet')}
                    </Button>
                </div>
            </CardContent>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>{t('editPet')}</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        {Object.entries(pet).map(
                            ([key]) =>
                                key !== 'id' && (
                                    <div key={key} className='grid grid-cols-4 items-center gap-4'>
                                        <Label htmlFor={key} className='text-right'>
                                            {t(key)}
                                        </Label>
                                        {key === 'comments' || key === 'habits' || key === 'personality' ? (
                                            <Textarea
                                                id={key}
                                                value={editedPet[key]}
                                                onChange={e => setEditedPet({ ...editedPet, [key]: e.target.value })}
                                                className='col-span-3'
                                            />
                                        ) : (
                                            <Input
                                                id={key}
                                                value={editedPet[key]}
                                                onChange={e => setEditedPet({ ...editedPet, [key]: e.target.value })}
                                                className='col-span-3'
                                            />
                                        )}
                                    </div>
                                ),
                        )}
                    </div>
                    <div className='flex justify-end space-x-2'>
                        <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleSave}>{t('save')}</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deletePet')}</DialogTitle>
                    </DialogHeader>
                    <p>{t('confirmDelete')}</p>
                    <div className='mt-4 flex justify-end space-x-2'>
                        <Button variant='outline' onClick={() => setIsDeleteDialogOpen(false)}>
                            {t('no')}
                        </Button>
                        <Button variant='destructive' onClick={handleDelete}>
                            {t('yes')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
