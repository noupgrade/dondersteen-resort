import { cn } from '@/shared/lib/styles/class-merge'
import { Badge } from '@/shared/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { Pet } from '@monorepo/functions/src/types/reservations'

interface PetsPopupProps {
    isOpen: boolean
    onClose: () => void
    pets: Pet[]
}

const SIZE_ORDER = {
    grande: 0,
    mediano: 1,
    pequeño: 2,
}

const SIZE_STYLES = {
    grande: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
    mediano: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
    pequeño: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
}

export function PetsPopup({ isOpen, onClose, pets }: PetsPopupProps) {
    const sortedPets = [...pets].sort((a, b) => SIZE_ORDER[a.size] - SIZE_ORDER[b.size])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='max-h-[90vh] w-[500px] max-w-[95vw]'>
                <DialogHeader>
                    <DialogTitle>Mascotas</DialogTitle>
                </DialogHeader>
                <ScrollArea className='max-h-[calc(90vh-120px)]'>
                    <div className='space-y-4 pr-4'>
                        {sortedPets.map(pet => (
                            <div key={pet.id} className='flex flex-col space-y-2 rounded-lg border p-4'>
                                <div className='flex items-center justify-between'>
                                    <h3 className='font-medium'>{pet.name}</h3>
                                    <Badge variant='outline' className={cn('capitalize', SIZE_STYLES[pet.size])}>
                                        {pet.size}
                                    </Badge>
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                    <p>Raza: {pet.breed}</p>
                                    <p>Peso: {pet.weight}kg</p>
                                    {pet.sex && <p>Sexo: {pet.sex === 'M' ? 'Macho' : 'Hembra'}</p>}
                                    {pet.isNeutered !== undefined && (
                                        <p>Esterilizado: {pet.isNeutered ? 'Sí' : 'No'}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
