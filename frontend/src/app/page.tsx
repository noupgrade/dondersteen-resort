import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function Home() {
    return (
        <div className='container flex min-h-screen flex-col items-center justify-center gap-8 py-8'>
            <h1 className='text-4xl font-bold text-[#343a40]'>Dondersteen Resort</h1>
            <Card className='grid w-full max-w-2xl gap-6 p-8'>
                <Link href='/panel-interno' className='w-full'>
                    <Button className='w-full bg-[#db073d] py-8 text-xl hover:bg-[#db073d]/90' size='lg'>
                        Panel de Control Interno
                    </Button>
                </Link>
                <Link href='/booking' className='w-full'>
                    <Button className='w-full bg-[#2d6a4f] py-8 text-xl hover:bg-[#2d6a4f]/90' size='lg'>
                        Sistema de Booking Externo
                    </Button>
                </Link>
                <Link href='/peluqueria-booking' className='w-full'>
                    <Button className='w-full bg-[#4B6BFB] py-8 text-xl hover:bg-[#4B6BFB]/90' size='lg'>
                        Sistema de Reservas Peluquería
                    </Button>
                </Link>
                <Link href='/perfil-clientes' className='w-full'>
                    <Button className='w-full bg-[#3B82F6] py-8 text-xl hover:bg-[#3B82F6]/90' size='lg'>
                        Perfil de Cliente / Client Profile
                    </Button>
                </Link>
            </Card>
        </div>
    )
}
