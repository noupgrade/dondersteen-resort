import { Search } from 'lucide-react'

import { Input } from '@/shared/ui/input.tsx'

type SearchBarProps = {
    value: string
    onChange: (value: string) => void
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
    <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
            <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
            <Input
                placeholder='Buscar por nombre del cliente o mascota...'
                value={value}
                onChange={e => onChange(e.target.value)}
                className='pl-8'
            />
        </div>
    </div>
)
