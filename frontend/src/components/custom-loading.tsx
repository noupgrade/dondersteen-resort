import { Loader2 } from 'lucide-react'

export function CustomLoading() {
    return (
        <div className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-r from-green-400 to-blue-500'>
            <div className='mb-4 text-4xl font-bold text-white'>Dondersteen Resort</div>
            <Loader2 className='h-12 w-12 animate-spin text-white' />
            <p className='mt-4 text-xl text-white'>Cargando, por favor espere...</p>
        </div>
    )
}
