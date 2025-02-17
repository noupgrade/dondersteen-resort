import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button.tsx'
import { Card } from '@/shared/ui/card.tsx'

export default function Home() {
    return (
        <div className='container mx-auto flex min-h-screen flex-col items-center justify-center gap-6 px-4 py-6 sm:gap-10 sm:py-8 md:px-6'>
            <h1 className='text-center text-2xl font-bold text-[#343a40] sm:text-4xl md:text-5xl'>
                Dondersteen Resort
            </h1>
            <Card className='grid w-full max-w-2xl gap-3 p-4 sm:gap-4 sm:p-6 md:gap-5 md:p-8'>
                <Link to='/panel-interno' className='w-full'>
                    <Button
                        className='w-full bg-[#db073d] py-3 text-base hover:bg-[#db073d]/90 sm:py-6 sm:text-lg md:py-8 md:text-xl'
                        size='lg'
                    >
                        Panel de Control Interno
                    </Button>
                </Link>
                <Link to='/booking' className='w-full'>
                    <Button
                        className='w-full bg-[#2d6a4f] py-3 text-base hover:bg-[#2d6a4f]/90 sm:py-6 sm:text-lg md:py-8 md:text-xl'
                        size='lg'
                    >
                        Sistema de Booking Externo
                    </Button>
                </Link>
                <Link to='/peluqueria-booking' className='w-full'>
                    <Button
                        className='w-full bg-[#4B6BFB] py-3 text-base hover:bg-[#4B6BFB]/90 sm:py-6 sm:text-lg md:py-8 md:text-xl'
                        size='lg'
                    >
                        Sistema de Reservas Peluquería
                    </Button>
                </Link>
                <Link to='/perfil-clientes' className='w-full'>
                    <Button
                        className='w-full bg-[#3B82F6] py-3 text-base hover:bg-[#3B82F6]/90 sm:py-6 sm:text-lg md:py-8 md:text-xl'
                        size='lg'
                    >
                        Perfil de Cliente / Client Profile
                    </Button>
                </Link>
            </Card>
        </div>
    )
}
