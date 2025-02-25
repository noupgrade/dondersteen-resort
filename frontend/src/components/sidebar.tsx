import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import {
    Euro,
    Home,
    LayoutGrid,
    PanelLeft,
    PanelLeftClose,
    Scissors,
    Settings,
    ShoppingCart,
    Users,
} from 'lucide-react'

const Sidebar = () => {
    const location = useLocation()
    const [isOpen, setIsOpen] = useState(true)

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'
    }

    return (
        <div
            className={`relative flex h-full ${isOpen ? 'w-64' : 'w-16'} flex-col border-r bg-white transition-all duration-300`}
        >
            <div className='flex h-16 items-center justify-between border-b px-4'>
                {isOpen ? (
                    <div className='flex items-center gap-2'>
                        <img src='/dondersteen-logo.png' alt='Dondersteen Logo' className='w-full object-contain p-4' />
                    </div>
                ) : (
                    <img src='/dondersteen-logo.png' alt='Dondersteen Logo' className='h-8 w-8 object-contain' />
                )}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className='rounded p-1 hover:bg-gray-100'
                    aria-label={isOpen ? 'Cerrar sidebar' : 'Abrir sidebar'}
                >
                    {isOpen ? (
                        <PanelLeftClose className='h-5 w-5 text-gray-600' />
                    ) : (
                        <PanelLeft className='h-5 w-5 text-gray-600' />
                    )}
                </button>
            </div>
            <nav className='flex-grow'>
                <ul className='space-y-2 py-4'>
                    <li>
                        <Link
                            to='/panel-interno'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno')}`}
                            title='Hotel'
                        >
                            <Home className='h-5 w-5' />
                            {isOpen && <span className='ml-3'>Hotel</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to='/panel-interno/planning'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/planning')}`}
                            title='Planning'
                        >
                            <LayoutGrid className='h-5 w-5' />
                            {isOpen && <span className='ml-3'>Planning</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to='/panel-interno/peluqueria'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/peluqueria')}`}
                            title='Peluquería'
                        >
                            <Scissors className='h-5 w-5' />
                            {isOpen && <span className='ml-3'>Peluquería</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to='/panel-interno/clientes'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/clientes')}`}
                            title='Clientes'
                        >
                            <Users className='h-5 w-5' />
                            {isOpen && <span className='ml-3'>Clientes</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to='/panel-interno/tienda'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/tienda')}`}
                            title='Tienda'
                        >
                            <ShoppingCart className='h-5 w-5' />
                            {isOpen && <span className='ml-3'>Tienda</span>}
                        </Link>
                    </li>
                    <li>
                        <Link
                            to='/panel-interno/facturacion'
                            className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/facturacion')}`}
                            title='Facturación'
                        >
                            <Euro className='h-5 w-5' />
                            {isOpen && <span className='ml-3'>Facturación</span>}
                        </Link>
                    </li>
                </ul>
            </nav>
            <div className='mt-auto border-t'>
                <Link
                    to='/panel-interno/setup'
                    className={`flex items-center px-4 py-2 text-sm ${isActive('/panel-interno/setup')}`}
                    title='Configuración'
                >
                    <Settings className='h-5 w-5' />
                    {isOpen && <span className='ml-3'>Configuración</span>}
                </Link>
            </div>
        </div>
    )
}

export default Sidebar
