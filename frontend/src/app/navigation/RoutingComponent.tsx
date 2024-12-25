import { Route, Routes } from 'react-router-dom'

import { ReservationProvider } from '@/components/ReservationContext'

import BookingPage from '../booking/BookingPage'
import Home from '../page'
import PanelInternoLayout from '../panel-interno/layout'
import PanelInterno from '../panel-interno/page'
import PeluqueriaPage from '../panel-interno/peluqueria/page'
import TiendaPage from '../panel-interno/tienda/page'
import PlanningPage from '../panel-interno/planning/page'
import ClientesPage from '../panel-interno/clientes/page'
import PeluqueriaBookingPage from '../peluqueria-booking/PeluqueriaBooking'
import PerfilClientesPage from '../perfil-clientes/PerfilClientesPage'

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
        <Route
            path='/perfil-clientes'
            element={
                <ReservationProvider>
                    <PerfilClientesPage />
                </ReservationProvider>
            }
        />
        <Route path='/panel-interno*' element={<PanelInternoLayout>
            <Routes>
                <Route index element={<PanelInterno />} />
                <Route path='/peluqueria' element={<PeluqueriaPage />} />
                <Route path='tienda' element={<TiendaPage />} />
                <Route path='/planning' element={<PlanningPage />} />
                <Route path='clientes' element={<ClientesPage />} />
                <Route path='clientes/:id' element={<ClientesPage />} />
                <Route path='reservas/:id' element={<PanelInterno />} />
            </Routes>
        </PanelInternoLayout>} />
        <Route path='*' element={<div>404 - Page not found</div>} />
    </Routes>
)
