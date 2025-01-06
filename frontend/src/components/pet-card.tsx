import { useState } from 'react'

import { CircleDot, MessageCircle, PawPrintIcon, Pencil, Pill, Trash2, User2, X } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/ui/dialog'
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

type Pet = {
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

type PetCardProps = {
    pet: Pet
    language: 'es' | 'en'
}

type TranslationKey = keyof typeof translations

export function PetCard({ pet, language }: PetCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [editedPet, setEditedPet] = useState<Pet>(pet)

    const t = (key: TranslationKey): string => {
        return translations[key][language]
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

    type EditablePetKey = Exclude<keyof Pet, 'id'>

    return (
        <Card className='bg-gray-50 shadow-md transition-shadow hover:shadow-lg w-full'>
            <CardContent className='p-3 sm:p-4'>
                <h3 className='mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-blue-600'>{pet.name}</h3>

                <div className='grid grid-cols-1 gap-3 sm:gap-4 text-sm'>
                    <div className='space-y-2 sm:space-y-3'>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <PawPrintIcon className='h-4 w-4 text-blue-500 shrink-0' />
                                <span className='font-semibold'>
                                    {t('breed')} / {t('age')}:
                                </span>
                            </div>
                            <span className='pl-5 sm:pl-0'>
                                {pet.breed} | {pet.age} {t('years')}
                            </span>
                        </div>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <User2 className='h-4 w-4 text-blue-500 shrink-0' />
                                <span className='font-semibold'>
                                    {t('gender')} / {t('food')}:
                                </span>
                            </div>
                            <span className='pl-5 sm:pl-0'>
                                {pet.gender} | {pet.food}
                            </span>
                        </div>
                    </div>

                    <div className='space-y-2 sm:space-y-3'>
                        <div className='flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <Pill className='h-4 w-4 text-red-500 shrink-0' />
                                <span className='font-semibold'>{t('medication')}:</span>
                            </div>
                            <span className='pl-5 sm:pl-0'>{pet.medication || 'N/A'}</span>
                        </div>
                        <div className='flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <CircleDot className='h-4 w-4 text-purple-500 shrink-0' />
                                <span className='font-semibold'>{t('habits')}:</span>
                            </div>
                            <span className='pl-5 sm:pl-0'>{pet.habits}</span>
                        </div>
                        <div className='flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <CircleDot className='h-4 w-4 text-yellow-500 shrink-0' />
                                <span className='font-semibold'>{t('personality')}:</span>
                            </div>
                            <span className='pl-5 sm:pl-0'>{pet.personality}</span>
                        </div>
                        <div className='flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2'>
                            <div className='flex items-center gap-1.5 sm:gap-2'>
                                <MessageCircle className='h-4 w-4 text-gray-500 shrink-0' />
                                <span className='font-semibold'>{t('comments')}:</span>
                            </div>
                            <span className='pl-5 sm:pl-0'>{pet.comments}</span>
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

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="w-[95vw] max-w-[425px] p-3">
                    <DialogHeader className="pb-2">
                        <DialogTitle className="text-base font-medium flex items-center justify-between">
                            {t('editPet')}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="h-6 w-6 p-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-2 py-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">{t('name')}</Label>
                                <Input
                                    value={editedPet.name}
                                    onChange={e => setEditedPet({ ...editedPet, name: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">{t('breed')}</Label>
                                <Input
                                    value={editedPet.breed}
                                    onChange={e => setEditedPet({ ...editedPet, breed: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">{t('age')}</Label>
                                <Input
                                    type="number"
                                    value={editedPet.age}
                                    onChange={e => setEditedPet({ ...editedPet, age: parseInt(e.target.value) })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">{t('gender')}</Label>
                                <Input
                                    value={editedPet.gender}
                                    onChange={e => setEditedPet({ ...editedPet, gender: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs">{t('food')}</Label>
                                <Input
                                    value={editedPet.food}
                                    onChange={e => setEditedPet({ ...editedPet, food: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                            <div>
                                <Label className="text-xs">{t('medication')}</Label>
                                <Input
                                    value={editedPet.medication}
                                    onChange={e => setEditedPet({ ...editedPet, medication: e.target.value })}
                                    className="h-8 text-sm"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs">{t('habits')}</Label>
                            <Textarea
                                value={editedPet.habits}
                                onChange={e => setEditedPet({ ...editedPet, habits: e.target.value })}
                                className="min-h-[40px] text-sm resize-none"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">{t('personality')}</Label>
                            <Textarea
                                value={editedPet.personality}
                                onChange={e => setEditedPet({ ...editedPet, personality: e.target.value })}
                                className="min-h-[40px] text-sm resize-none"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">{t('comments')}</Label>
                            <Textarea
                                value={editedPet.comments}
                                onChange={e => setEditedPet({ ...editedPet, comments: e.target.value })}
                                className="min-h-[40px] text-sm resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex gap-2 pt-2">
                        <Button
                            onClick={handleSave}
                            className="flex-1 h-8 text-xs font-medium"
                        >
                            {t('save')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
