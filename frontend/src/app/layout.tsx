import { Suspense } from 'react'

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { CustomLoading } from '@/components/custom-loading'
import { ReservationProvider } from '@/context/ReservationContext'

import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Dondersteen Resort',
    description: 'Sistema de reservas para Dondersteen Resort',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang='es'>
            <body className={inter.className}>
                <ReservationProvider>
                    <main className='flex min-h-screen flex-col bg-gray-100'>
                        <Suspense fallback={<CustomLoading />}>{children}</Suspense>
                    </main>
                </ReservationProvider>
            </body>
        </html>
    )
}
