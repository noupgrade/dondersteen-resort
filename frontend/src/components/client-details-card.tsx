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

export function ClientDetailsCard({ client, language }: ClientDetailsCardProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editedClient, setEditedClient] = useState(client)

    const t = (key: string): string => {
        return translations[key]?.[language] || key
    }

    const handleSave = () => {
        // Logic to save the edited client details
        console.log('Saving edited client details', editedClient)
        setIsEditDialogOpen(false)
    }

    return (
        <Card className='bg-gray-50 shadow-md transition-shadow hover:shadow-lg'>
            <CardContent className='p-4'>
                <h3 className='mb-3 text-xl font-bold text-blue-600'>{t('clientDetails')}</h3>

                <div className='space-y-2 text-sm'>
                    <div className='flex items-center'>
                        <User className='mr-2 h-4 w-4 text-blue-500' />
                        <span className='mr-2 font-semibold'>{t('name')}:</span>
                        <span>{client.name}</span>
                    </div>
                    <div className='flex items-center'>
                        <Phone className='mr-2 h-4 w-4 text-blue-500' />
                        <span className='mr-2 font-semibold'>{t('phone')}:</span>
                        <span>{client.phone}</span>
                    </div>
                    <div className='flex items-center'>
                        <Mail className='mr-2 h-4 w-4 text-blue-500' />
                        <span className='mr-2 font-semibold'>{t('email')}:</span>
                        <span>{client.email}</span>
                    </div>
                    <div className='flex items-center'>
                        <Home className='mr-2 h-4 w-4 text-blue-500' />
                        <span className='mr-2 font-semibold'>{t('address')}:</span>
                        <span>{client.address}</span>
                    </div>
                </div>

                <div className='mt-4'>
                    <Button
                        onClick={() => setIsEditDialogOpen(true)}
                        size='sm'
                        className='bg-blue-500 text-white hover:bg-blue-600'
                    >
                        <Pencil className='mr-1 h-4 w-4' />
                        {t('editDetails')}
                    </Button>
                </div>
            </CardContent>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className='sm:max-w-[425px]'>
                    <DialogHeader>
                        <DialogTitle>{t('editDetails')}</DialogTitle>
                    </DialogHeader>
                    <div className='grid gap-4 py-4'>
                        {Object.entries(client).map(([key]) => (
                            <div key={key} className='grid grid-cols-4 items-center gap-4'>
                                <Label htmlFor={key} className='text-right'>
                                    {t(key)}
                                </Label>
                                <Input
                                    id={key}
                                    value={editedClient[key]}
                                    onChange={e => setEditedClient({ ...editedClient, [key]: e.target.value })}
                                    className='col-span-3'
                                />
                            </div>
                        ))}
                    </div>
                    <div className='flex justify-end space-x-2'>
                        <Button variant='outline' onClick={() => setIsEditDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleSave}>{t('save')}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
