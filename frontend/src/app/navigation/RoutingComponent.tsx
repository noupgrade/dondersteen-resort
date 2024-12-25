import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'

import BookingPage from '../booking/BookingPage'

export const RoutingComponent = () => (
    <Routes>
        <Route
            path='/'
            element={
                <ReservationProvider>
                    <BookingPage />
                </ReservationProvider>
            }
        />
        <Route path='*' element={<div>404 - Page not found</div>} />
    </Routes>
)
