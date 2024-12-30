import { Ban, CalendarDays, DollarSign } from 'lucide-react'
import { Card } from '@/shared/ui/card'
import { AvailabilityStats } from '../types'

interface AvailabilityStatsProps {
    stats: AvailabilityStats
}

export function AvailabilityStatsDisplay({ stats }: AvailabilityStatsProps) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <Card className='p-4 hover:bg-accent/5 transition-colors'>
                <div className='flex items-stretch gap-4'>
                    <div className='rounded-lg bg-red-100 aspect-square flex items-center justify-center min-w-[3.5rem]'>
                        <Ban className='h-5 w-5 text-red-600' />
                    </div>
                    <div className='flex flex-col justify-center'>
                        <p className='text-sm font-medium text-muted-foreground'>Días Bloqueados</p>
                        <p className='text-2xl font-bold'>{stats.blockedCount}</p>
                    </div>
                </div>
            </Card>

            <Card className='p-4 hover:bg-accent/5 transition-colors'>
                <div className='flex items-stretch gap-4'>
                    <div className='rounded-lg bg-amber-100 aspect-square flex items-center justify-center min-w-[3.5rem]'>
                        <CalendarDays className='h-5 w-5 text-amber-600' />
                    </div>
                    <div className='flex flex-col justify-center'>
                        <p className='text-sm font-medium text-muted-foreground'>Días Festivos</p>
                        <p className='text-2xl font-bold'>{stats.holidaysCount}</p>
                    </div>
                </div>
            </Card>

            <Card className='p-4 hover:bg-accent/5 transition-colors'>
                <div className='flex items-stretch gap-4'>
                    <div className='rounded-lg bg-green-100 aspect-square flex items-center justify-center min-w-[3.5rem]'>
                        <DollarSign className='h-5 w-5 text-green-600' />
                    </div>
                    <div className='flex flex-col justify-center'>
                        <p className='text-sm font-medium text-muted-foreground'>Temporadas Altas</p>
                        <p className='text-2xl font-bold'>{stats.highSeasonCount}</p>
                    </div>
                </div>
            </Card>
        </div>
    )
} 