import { Home, LayoutGrid, Scissors, Users } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar = () => {
    const pathname = usePathname()

    const isActive = (path: string) => {
        return pathname === path ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
    }

    return (
        <div className='flex h-full w-64 flex-col border-r bg-white'>
            <div className='flex h-16 items-center justify-center border-b'>
                <span className='text-lg font-semibold'>Dondersteen</span>
            </div>
            <nav className='flex-grow'>
                <ul className='space-y-2 py-4'>
                    <li>
                        <Link
                            href='/panel-interno'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno')}`}
                        >
                            <Home className='mr-3 h-5 w-5' />
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link
                            href='/panel-interno/planning'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/planning')}`}
                        >
                            <LayoutGrid className='mr-3 h-5 w-5' />
                            Planning
                        </Link>
                    </li>
                    <li>
                        <Link
                            href='/panel-interno/peluqueria'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/peluqueria')}`}
                        >
                            <Scissors className='mr-3 h-5 w-5' />
                            Peluquería
                        </Link>
                    </li>
                    <li>
                        <Link
                            href='/panel-interno/clientes'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/clientes')}`}
                        >
                            <Users className='mr-3 h-5 w-5' />
                            Clientes
                        </Link>
                    </li>
                </ul>
            </nav>
        </div>
    )
}

export default Sidebar
