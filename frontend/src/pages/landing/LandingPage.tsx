import React from 'react'

import { BookingCTA } from './components/BookingCTA'
import { Features } from './components/Features'
import { Header } from './components/Header'

export const LandingPage = () => {
    return (
        <div className='min-h-screen bg-gradient-to-b from-background to-water'>
            <div className='container mx-auto px-4 py-16'>
                <Header />
                <Features />
                <BookingCTA />
            </div>
        </div>
    )
}