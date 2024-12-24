import { Route, Routes } from 'react-router-dom'

import { LandingPage } from '@/pages/landing/LandingPage'

export const RoutingComponent = () => (
    <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='*' element={<div>404 - Page not found</div>} />
    </Routes>
)