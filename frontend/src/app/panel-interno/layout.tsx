import Sidebar from '@/components/sidebar'
import { ProductProvider } from '@/context/ProductContext'
import { ReservationProvider } from '@/context/ReservationContext'

export default function PanelInternoLayout({ children }: { children: React.ReactNode }) {
    return (
        <ReservationProvider>
            <ProductProvider>
                <div className='flex h-screen bg-gray-100'>
                    <Sidebar />
                    <div className='flex-1 overflow-auto'>{children}</div>
                </div>
            </ProductProvider>
        </ReservationProvider>
    )
}
