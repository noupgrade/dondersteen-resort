import { ProductProvider } from '@/components/ProductContext.tsx'
import { ReservationProvider } from '@/components/ReservationContext.tsx'
import Sidebar from '@/components/sidebar.tsx'

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
