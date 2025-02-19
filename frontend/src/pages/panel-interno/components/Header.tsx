import { PlusCircle } from 'lucide-react'

import { Button } from '@/shared/ui/button.tsx'

type HeaderProps = {
    onNewBudget: () => void
    onNewReservation: () => void
}

export const Header = ({ onNewBudget, onNewReservation }: HeaderProps) => (
    <div className='flex items-center justify-between'>
        <h1 className='text-4xl font-bold text-[#101828]'>Hotel</h1>
        <div className='flex gap-2'>
            <Button className='bg-[#4B6BFB] text-white hover:bg-[#4B6BFB]/90' onClick={onNewBudget}>
                <PlusCircle className='mr-2 h-4 w-4' /> Nuevo Presupuesto
            </Button>
            <Button className='bg-dondersteen hover:bg-dondersteen/90 text-white' onClick={onNewReservation}>
                <PlusCircle className='mr-2 h-4 w-4' /> Nueva Reserva
            </Button>
        </div>
    </div>
)
