import { useState } from 'react'

import { Home, Mail, Pencil, Phone, User } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

const translations = {
    clientDetails: { es: 'Detalles del Cliente', en: 'Client Details' },
    name: { es: 'Nombre', en: 'Name' },
    phone: { es: 'Teléfono', en: 'Phone' },
    email: { es: 'Correo Electrónico', en: 'Email' },
    address: { es: 'Dirección Recogida', en: 'Pickup Address' },
    editDetails: { es: 'Editar Datos', en: 'Edit Details' },
    save: { es: 'Guardar', en: 'Save' },
    cancel: { es: 'Cancelar', en: 'Cancel' },
}

type ClientDetailsCardProps = {
    client: {
        name: string
        phone: string
        email: string
        address: string
    }
    language: 'es' | 'en'
}

type TranslationKey = keyof typeof translations

export function ClientDetailsCard({ client, language }: ClientDetailsCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editedClient, setEditedClient] = useState(client)

    const t = (key: TranslationKey): string => {
        return translations[key][language]
    }

    const handleSave = () => {
        // Logic to save the edited client details
        console.log('Saving edited client details', editedClient)
        setIsEditDialogOpen(false)
    }

    type ClientKey = keyof typeof client

    return (
        <Card className='bg-gray-50 shadow-md transition-shadow hover:shadow-lg w-full'>
            <CardContent className='p-3 sm:p-4'>
                <h3 className='mb-3 sm:mb-4 text-lg sm:text-xl font-bold text-blue-600'>{t('clientDetails')}</h3>

                <div className='space-y-2 sm:space-y-3 text-sm'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                        <div className='flex items-center gap-1.5 sm:gap-2'>
                            <User className='h-4 w-4 text-blue-500 shrink-0' />
                            <span className='font-semibold'>{t('name')}:</span>
                        </div>
                        <span className='pl-5 sm:pl-0'>{client.name}</span>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                        <div className='flex items-center gap-1.5 sm:gap-2'>
                            <Phone className='h-4 w-4 text-blue-500 shrink-0' />
                            <span className='font-semibold'>{t('phone')}:</span>
                        </div>
                        <span className='pl-5 sm:pl-0'>{client.phone}</span>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2'>
                        <div className='flex items-center gap-1.5 sm:gap-2'>
                            <Mail className='h-4 w-4 text-blue-500 shrink-0' />
                            <span className='font-semibold'>{t('email')}:</span>
                        </div>
                        <span className='pl-5 sm:pl-0 break-all'>{client.email}</span>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2'>
                        <div className='flex items-center gap-1.5 sm:gap-2'>
                            <Home className='h-4 w-4 text-blue-500 shrink-0' />
                            <span className='font-semibold'>{t('address')}:</span>
                        </div>
                        <span className='pl-5 sm:pl-0'>{client.address}</span>
                    </div>
                </div>

                <div className='mt-4 sm:mt-6'>
                    <Button
                        onClick={() => setIsEditDialogOpen(true)}
                        size='sm'
                        className='w-full bg-blue-500 text-white hover:bg-blue-600'
                    >
                        <Pencil className='mr-1 h-4 w-4' />
                        {t('editDetails')}
                    </Button>
                </div>
            </CardContent>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className='w-[95vw] max-w-[425px] p-4 sm:p-6'>
                    <DialogHeader>
                        <DialogTitle>{t('editDetails')}</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-3 sm:gap-4 py-3 sm:py-4'>
                        {(Object.keys(client) as ClientKey[]).map((key) => (
                            <div key={key} className='grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4'>
                                <Label htmlFor={key} className='sm:text-right'>
                                    {t(key as TranslationKey)}
                                </Label>
                                <Input
                                    id={key}
                                    value={editedClient[key]}
                                    onChange={e => setEditedClient({ ...editedClient, [key]: e.target.value })}
                                    className='sm:col-span-3'
                                />
                            </div>
                        ))}
                    </div>
                    <div className='flex flex-col gap-2'>
                        <Button className='w-full' onClick={handleSave}>{t('save')}</Button>
                        <Button className='w-full' variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
