import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'

import BookingPage from '../booking/BookingPage'
import Home from '../page'
import PeluqueriaBookingPage from '../peluqueria-booking/PeluqueriaBooking'

export const RoutingComponent = () => (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route
            path='/booking'
            element={
                <ReservationProvider>
                    <BookingPage />
                </ReservationProvider>
            }
        />
        <Route
            path='/peluqueria-booking'
            element={
                <ReservationProvider>
                    <PeluqueriaBookingPage />
                </ReservationProvider>
            }
        />
        <Route path='*' element={<div>404 - Page not found</div>} />
    </Routes>
)
